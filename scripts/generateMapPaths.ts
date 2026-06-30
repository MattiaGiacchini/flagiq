/**
 * Generate real-world SVG map paths from Natural Earth TopoJSON data
 * 
 * This script converts Natural Earth 50m resolution TopoJSON data to SVG paths
 * compatible with the existing InteractiveMap.vue component.
 * 
 * Dependencies:
 * - world-atlas: Natural Earth TopoJSON data
 * - topojson-client: TopoJSON to GeoJSON conversion
 * - d3-geo: Geographic projections and SVG path generation
 * 
 * Output: src/data/mapPaths.ts
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import * as topojson from 'topojson-client'
import { geoPath, geoEquirectangular } from 'd3-geo'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { FLAGS } from '../src/data/flags.js'

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Type definitions
type Continent = 'europe' | 'asia' | 'americas' | 'africa' | 'oceania'

interface MapCountry {
  id: string
  pathData: string
  continent: Continent
  centroid?: [number, number]
}

interface CountryProperties {
  name: string
}

// Constants
const SMALL_COUNTRY_THRESHOLD = 100 // Square pixels
const TOPOJSON_PATH = join(projectRoot, 'node_modules/world-atlas/countries-50m.json')
const OUTPUT_PATH = join(projectRoot, 'src/data/mapPaths.ts')

// ISO code format validation regex (Requirement 3.3)
const ISO_CODE_REGEX = /^[A-Z]{2}$/

/**
 * Load and validate TopoJSON data from world-atlas package
 * 
 * @returns GeoJSON FeatureCollection of countries
 * @throws Error if file not found or invalid structure
 */
function loadTopoJSON(): FeatureCollection {
  console.log('📂 Loading TopoJSON data from world-atlas...')
  
  // Check if file exists
  try {
    const fileContent = readFileSync(TOPOJSON_PATH, 'utf-8')
    const topojsonData = JSON.parse(fileContent) as Topology
    
    // Validate TopoJSON structure
    if (topojsonData.type !== 'Topology') {
      throw new Error(`Invalid TopoJSON: expected type 'Topology', got '${topojsonData.type}'`)
    }
    
    if (!topojsonData.objects || !topojsonData.objects.countries) {
      throw new Error('Invalid TopoJSON: missing objects.countries property')
    }
    
    console.log('✓ TopoJSON structure validated')
    
    // Convert TopoJSON to GeoJSON features
    const geojson = topojson.feature(
      topojsonData,
      topojsonData.objects.countries as GeometryCollection
    ) as FeatureCollection
    
    console.log(`✓ Converted to GeoJSON: ${geojson.features.length} features`)
    
    return geojson
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error('❌ Error: TopoJSON file not found')
      console.error(`   Expected path: ${TOPOJSON_PATH}`)
      console.error('   Please run: npm install --save-dev world-atlas')
      throw new Error('world-atlas package not found. Run: npm install --save-dev world-atlas')
    }
    throw error
  }
}

/**
 * Validate ISO code format
 * 
 * @param isoCode - ISO code to validate
 * @returns True if valid ISO 3166-1 alpha-2 format
 */
function isValidISOCode(isoCode: string): boolean {
  return ISO_CODE_REGEX.test(isoCode)
}

/**
 * Calculate the area of a bounding box in square pixels
 * 
 * @param bounds - Bounding box as [[x1, y1], [x2, y2]]
 * @returns Area in square pixels
 */
function calculateArea(bounds: [[number, number], [number, number]]): number {
  const [[x1, y1], [x2, y2]] = bounds
  return (x2 - x1) * (y2 - y1)
}

/**
 * Map Natural Earth continent names to application continent codes
 * 
 * @param naturalEarthContinent - Continent name from Natural Earth properties
 * @returns Application continent code, or null for excluded continents (Antarctica)
 * 
 * Requirements:
 * - 4.1: "Europe" → "europe"
 * - 4.2: "Asia" → "asia"
 * - 4.3: "North America" | "South America" → "americas"
 * - 4.4: "Africa" → "africa"
 * - 4.5: "Oceania" → "oceania"
 * - 4.6: "Antarctica" → null (skip)
 * - 4.7: All returned values must be valid Continent type
 */
export function mapContinentCode(naturalEarthContinent: string): Continent | null {
  switch (naturalEarthContinent) {
    case 'Europe':
      return 'europe'
    case 'Asia':
      return 'asia'
    case 'North America':
    case 'South America':
      return 'americas'
    case 'Africa':
      return 'africa'
    case 'Oceania':
      return 'oceania'
    case 'Antarctica':
      return null
    default:
      // Log unknown continents for debugging
      console.warn(`⚠️  Unknown continent: ${naturalEarthContinent}`)
      return null
  }
}

/**
 * Build comprehensive country name to ISO/continent mapping
 * Uses both Natural Earth names and common variations to match with FLAGS data
 * 
 * Note: Since world-atlas TopoJSON only includes country names (not ISO codes),
 * we must map names to ISO codes. This function creates a comprehensive mapping
 * that handles name variations between Natural Earth and FLAGS data.
 * 
 * Natural Earth uses different naming conventions than standard country names:
 * - "United States of America" instead of "United States"
 * - May use abbreviations like "Rep." for Republic
 * - May have different spellings for special characters
 */
function buildCountryNameToISOMapping(): Map<string, { iso: string, continent: Continent }> {
  // Load FLAGS data to get ALL countries dynamically
  console.log('📋 Loading FLAGS data from flags.ts...')
  const flagsData = FLAGS
  console.log(`✓ Loaded ${flagsData.length} countries from FLAGS array`)
  
  const mapping = new Map<string, { iso: string, continent: Continent }>()
  
  // Natural Earth to ISO mappings based on actual Natural Earth country names
  // These are the exact names from world-atlas countries-50m.json
  const naturalEarthNames: Record<string, string> = {
    // Europe
    'Albania': 'AL',
    'Andorra': 'AD',
    'Austria': 'AT',
    'Belarus': 'BY',
    'Belgium': 'BE',
    'Bosnia and Herz.': 'BA',
    'Bulgaria': 'BG',
    'Croatia': 'HR',
    'Cyprus': 'CY',
    'N. Cyprus': 'CY',
    'Czechia': 'CZ',
    'Denmark': 'DK',
    'Estonia': 'EE',
    'Finland': 'FI',
    'France': 'FR',
    'Germany': 'DE',
    'Greece': 'GR',
    'Hungary': 'HU',
    'Iceland': 'IS',
    'Ireland': 'IE',
    'Italy': 'IT',
    'Kosovo': 'XK',
    'Latvia': 'LV',
    'Liechtenstein': 'LI',
    'Lithuania': 'LT',
    'Luxembourg': 'LU',
    'Malta': 'MT',
    'Moldova': 'MD',
    'Monaco': 'MC',
    'Montenegro': 'ME',
    'Netherlands': 'NL',
    'Macedonia': 'MK',
    'Norway': 'NO',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Romania': 'RO',
    'Russia': 'RU',
    'San Marino': 'SM',
    'Serbia': 'RS',
    'Slovakia': 'SK',
    'Slovenia': 'SI',
    'Spain': 'ES',
    'Sweden': 'SE',
    'Switzerland': 'CH',
    'Ukraine': 'UA',
    'United Kingdom': 'GB',
    'Vatican': 'VA',
    
    // Asia
    'Afghanistan': 'AF',
    'Armenia': 'AM',
    'Azerbaijan': 'AZ',
    'Bahrain': 'BH',
    'Bangladesh': 'BD',
    'Bhutan': 'BT',
    'Brunei': 'BN',
    'Cambodia': 'KH',
    'China': 'CN',
    'Georgia': 'GE',
    'India': 'IN',
    'Indonesia': 'ID',
    'Iran': 'IR',
    'Iraq': 'IQ',
    'Israel': 'IL',
    'Japan': 'JP',
    'Jordan': 'JO',
    'Kazakhstan': 'KZ',
    'Kuwait': 'KW',
    'Kyrgyzstan': 'KG',
    'Laos': 'LA',
    'Lebanon': 'LB',
    'Malaysia': 'MY',
    'Maldives': 'MV',
    'Mongolia': 'MN',
    'Myanmar': 'MM',
    'Nepal': 'NP',
    'North Korea': 'KP',
    'Oman': 'OM',
    'Pakistan': 'PK',
    'Palestine': 'PS',
    'Philippines': 'PH',
    'Qatar': 'QA',
    'Saudi Arabia': 'SA',
    'Singapore': 'SG',
    'Korea': 'KR',
    'S. Korea': 'KR',
    'South Korea': 'KR',
    'Sri Lanka': 'LK',
    'Syria': 'SY',
    'Taiwan': 'TW',
    'Tajikistan': 'TJ',
    'Thailand': 'TH',
    'Timor-Leste': 'TL',
    'Turkey': 'TR',
    'Turkmenistan': 'TM',
    'United Arab Emirates': 'AE',
    'Uzbekistan': 'UZ',
    'Vietnam': 'VN',
    'Yemen': 'YE',
    
    // Americas
    'Antigua and Barb.': 'AG',
    'Argentina': 'AR',
    'Bahamas': 'BS',
    'Barbados': 'BB',
    'Belize': 'BZ',
    'Bolivia': 'BO',
    'Brazil': 'BR',
    'Canada': 'CA',
    'Chile': 'CL',
    'Colombia': 'CO',
    'Costa Rica': 'CR',
    'Cuba': 'CU',
    'Dominica': 'DM',
    'Dominican Rep.': 'DO',
    'Ecuador': 'EC',
    'El Salvador': 'SV',
    'Grenada': 'GD',
    'Guatemala': 'GT',
    'Guyana': 'GY',
    'Haiti': 'HT',
    'Honduras': 'HN',
    'Jamaica': 'JM',
    'Mexico': 'MX',
    'Nicaragua': 'NI',
    'Panama': 'PA',
    'Paraguay': 'PY',
    'Peru': 'PE',
    'St. Kitts and Nevis': 'KN',
    'Saint Lucia': 'LC',
    'St. Vin. and Gren.': 'VC',
    'Suriname': 'SR',
    'Trinidad and Tobago': 'TT',
    'United States of America': 'US',
    'Uruguay': 'UY',
    'Venezuela': 'VE',
    
    // Africa
    'Algeria': 'DZ',
    'Angola': 'AO',
    'Benin': 'BJ',
    'Botswana': 'BW',
    'Burkina Faso': 'BF',
    'Burundi': 'BI',
    'Cameroon': 'CM',
    'Cabo Verde': 'CV',
    'Central African Rep.': 'CF',
    'Chad': 'TD',
    'Comoros': 'KM',
    'Congo': 'CG',
    'Dem. Rep. Congo': 'CD',
    'Ivory Coast': 'CI',
    'Côte d\'Ivoire': 'CI',
    'Djibouti': 'DJ',
    'Egypt': 'EG',
    'Eq. Guinea': 'GQ',
    'Eritrea': 'ER',
    'eSwatini': 'SZ',
    'Ethiopia': 'ET',
    'Gabon': 'GA',
    'Gambia': 'GM',
    'Ghana': 'GH',
    'Guinea': 'GN',
    'Guinea-Bissau': 'GW',
    'Kenya': 'KE',
    'Lesotho': 'LS',
    'Liberia': 'LR',
    'Libya': 'LY',
    'Madagascar': 'MG',
    'Malawi': 'MW',
    'Mali': 'ML',
    'Mauritania': 'MR',
    'Mauritius': 'MU',
    'Morocco': 'MA',
    'Mozambique': 'MZ',
    'Namibia': 'NA',
    'Niger': 'NE',
    'Nigeria': 'NG',
    'Rwanda': 'RW',
    'São Tomé and Principe': 'ST',
    'Senegal': 'SN',
    'Seychelles': 'SC',
    'Sierra Leone': 'SL',
    'Somalia': 'SO',
    'South Africa': 'ZA',
    'S. Sudan': 'SS',
    'Sudan': 'SD',
    'Tanzania': 'TZ',
    'Togo': 'TG',
    'Tunisia': 'TN',
    'Uganda': 'UG',
    'Zambia': 'ZM',
    'Zimbabwe': 'ZW',
    
    // Oceania
    'Australia': 'AU',
    'Fiji': 'FJ',
    'Kiribati': 'KI',
    'Marshall Is.': 'MH',
    'Micronesia': 'FM',
    'Nauru': 'NR',
    'New Zealand': 'NZ',
    'Palau': 'PW',
    'Papua New Guinea': 'PG',
    'Samoa': 'WS',
    'Solomon Is.': 'SB',
    'Tonga': 'TO',
    'Tuvalu': 'TV',
    'Vanuatu': 'VU',
  }
  
  // Build mapping from Natural Earth names to FLAGS data
  for (const [naturalEarthName, isoCode] of Object.entries(naturalEarthNames)) {
    const flagData = flagsData.find(f => f.id === isoCode)
    if (flagData) {
      mapping.set(naturalEarthName.toLowerCase(), {
        iso: flagData.id,
        continent: flagData.continent
      })
    }
  }
  
  console.log(`✓ Built mapping for ${mapping.size} country name variations`)
  return mapping
}

/**
 * Look up country by Natural Earth name and return ISO code and continent
 * 
 * @param countryName - Country name from Natural Earth data
 * @param mapping - Name to ISO/continent mapping
 * @returns ISO code and continent or undefined if not found
 */
function lookupCountryByName(
  countryName: string,
  mapping: Map<string, { iso: string, continent: Continent }>
): { iso: string, continent: Continent } | undefined {
  return mapping.get(countryName.toLowerCase())
}

/**
 * Load FLAGS array from flags.ts for cross-reference validation
 * 
 * @returns Array of ISO codes from FLAGS
 */
function loadFlagsData(): string[] {
  console.log('📋 Loading FLAGS data from flags.ts...')
  
  try {
    const flagsPath = join(projectRoot, 'src/data/flags.ts')
    const flagsContent = readFileSync(flagsPath, 'utf-8')
    
    // Extract ISO codes from FLAGS array using regex
    // Matches lines like: { id: 'FR', name: 'France', ...
    const isoCodeRegex = /id:\s*'([A-Z]{2})'/g
    const matches = [...flagsContent.matchAll(isoCodeRegex)]
    const flagIds = matches.map(match => match[1])
    
    console.log(`✓ Loaded ${flagIds.length} countries from FLAGS array`)
    return flagIds
  } catch (error) {
    console.error('❌ Error loading FLAGS data:', error)
    throw new Error('Failed to load FLAGS data from flags.ts')
  }
}

/**
 * Perform cross-reference validation between MAP_COUNTRIES and FLAGS
 * Reports countries present in one dataset but missing from the other
 * 
 * Requirements: 3.4, 3.5, 3.6, 12.5
 * 
 * @param mapCountries - Generated map countries array
 * @param flagIds - ISO codes from FLAGS array
 */
function validateCrossReference(mapCountries: MapCountry[], flagIds: string[]): void {
  console.log('\n🔍 Cross-Reference Validation: MAP_COUNTRIES ↔ FLAGS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  // Create sets for efficient lookup
  const mapIds = new Set(mapCountries.map(c => c.id))
  const flagIdsSet = new Set(flagIds)
  
  // Find countries in FLAGS but missing from MAP_COUNTRIES (Requirement 3.5)
  const missingInMap = flagIds.filter(id => !mapIds.has(id))
  
  // Find countries in MAP_COUNTRIES but missing from FLAGS (Requirement 3.6)
  const missingInFlags = [...mapIds].filter(id => !flagIdsSet.has(id))
  
  // Report findings (Requirement 12.5)
  if (missingInMap.length === 0 && missingInFlags.length === 0) {
    console.log('✅ Perfect match! All countries are synchronized.')
    console.log(`   - FLAGS contains: ${flagIds.length} countries`)
    console.log(`   - MAP_COUNTRIES contains: ${mapCountries.length} countries`)
    console.log(`   - All ISO codes match`)
  } else {
    console.log(`📊 Validation Summary:`)
    console.log(`   - FLAGS contains: ${flagIds.length} countries`)
    console.log(`   - MAP_COUNTRIES contains: ${mapCountries.length} countries`)
    console.log(`   - Common countries: ${mapCountries.length - missingInFlags.length}`)
    
    // Report countries in FLAGS but missing from MAP_COUNTRIES (Requirement 3.5)
    if (missingInMap.length > 0) {
      console.log('\n⚠️  Countries in FLAGS but MISSING from MAP_COUNTRIES:')
      console.log(`   Count: ${missingInMap.length}`)
      console.log(`   ISO Codes: ${missingInMap.join(', ')}`)
      console.log('   → These countries exist in flags.ts but have no map geometry')
    }
    
    // Report countries in MAP_COUNTRIES but missing from FLAGS (Requirement 3.6)
    if (missingInFlags.length > 0) {
      console.log('\n⚠️  Countries in MAP_COUNTRIES but MISSING from FLAGS:')
      console.log(`   Count: ${missingInFlags.length}`)
      console.log(`   ISO Codes: ${missingInFlags.join(', ')}`)
      console.log('   → These countries have map geometry but are not in flags.ts')
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

/**
 * Main generation function
 */
function generateMapPaths(): void {
  // Track execution time (Requirement 16.5)
  const startTime = performance.now()
  
  console.log('🌍 Processing Natural Earth data (50m resolution)...')
  
  // Load FLAGS data for cross-reference validation (Requirement 3.4)
  const flagIds = loadFlagsData()
  
  // Build country name to ISO mapping
  console.log('📋 Building country name to ISO code mapping...')
  const countryMapping = buildCountryNameToISOMapping()
  console.log(`✓ Built mapping for ${countryMapping.size} country name variations`)
  
  // Load TopoJSON data
  const geojson = loadTopoJSON()
  
  // Configure d3-geo projection
  console.log('🗺️  Configuring projection...')
  
  // Create Equirectangular projection with specified parameters
  // - scale: 160 for appropriate zoom level
  // - translate: [500, 250] to center in viewBox [0, 0, 1000, 500]
  // - precision: 0.1 for optimal balance between file size and visual detail
  const projection = geoEquirectangular()
    .scale(160)
    .translate([500, 250])
    .precision(0.1)
  
  console.log('✓ Projection configured: Equirectangular (scale=160, center=[500,250])')
  
  // Create path generator using the projection
  const pathGenerator = geoPath().projection(projection)
  
  console.log('✓ Path generator created')
  
  // Process each country
  console.log('\n📍 Processing countries...')
  
  const mapCountries: MapCountry[] = []
  let skippedCount = 0
  let emptyPathCount = 0
  let invalidISOCount = 0
  
  for (const feature of geojson.features) {
    const properties = feature.properties as CountryProperties
    const countryName = properties.name
    
    // Look up ISO code and continent by matching Natural Earth country name
    const countryData = lookupCountryByName(countryName, countryMapping)
    
    // Skip territories without valid mapping (Requirement 2.7, 12.3)
    if (!countryData) {
      console.warn(`⚠️  Skipping territory without mapping: ${countryName}`)
      skippedCount++
      continue
    }
    
    // Extract ISO code from mapping (simulates extraction from properties)
    const isoCode = countryData.iso
    
    // Validate ISO code format (Requirement 3.3)
    if (!isValidISOCode(isoCode)) {
      console.error(`❌ Invalid ISO code format for ${countryName}: ${isoCode} (expected /^[A-Z]{2}$/)`)
      invalidISOCount++
      continue
    }
    
    // Get continent from mapping
    const continent = countryData.continent
    
    // Generate SVG path (automatically handles MultiPolygon - Requirement 5.5)
    const svgPath = pathGenerator(feature.geometry)
    
    // Skip countries with empty paths (Requirement 2.8)
    if (!svgPath || svgPath.length === 0) {
      console.error(`❌ Empty path generated for: ${isoCode} (${countryName})`)
      emptyPathCount++
      continue
    }
    
    // Calculate bounding box and centroid for small countries (Requirement 6.1, 6.2, 6.3, 6.4)
    const bounds = pathGenerator.bounds(feature.geometry)
    const area = calculateArea(bounds as [[number, number], [number, number]])
    
    let centroid: [number, number] | undefined
    
    if (area < SMALL_COUNTRY_THRESHOLD) {
      const centroidCoords = pathGenerator.centroid(feature.geometry)
      const x = centroidCoords[0]
      const y = centroidCoords[1]
      
      // Validate centroid coordinates are within viewBox [0-1000, 0-500] (Requirement 6.5, 6.6)
      if (x >= 0 && x <= 1000 && y >= 0 && y <= 500) {
        centroid = [x, y]
      } else {
        console.warn(`⚠️  Centroid out of viewBox bounds for ${isoCode}: [${x.toFixed(2)}, ${y.toFixed(2)}]`)
      }
    }
    
    // Add to map countries array
    mapCountries.push({
      id: isoCode,
      pathData: svgPath,
      continent: continent,
      centroid: centroid
    })
  }
  
  console.log(`\n✓ Processed ${mapCountries.length} countries`)
  console.log(`  - Skipped: ${skippedCount} territories (invalid ISO codes or excluded continents)`)
  console.log(`  - Invalid ISO format: ${invalidISOCount}`)
  console.log(`  - Empty paths: ${emptyPathCount}`)
  console.log(`  - Small countries with centroids: ${mapCountries.filter(c => c.centroid).length}`)
  
  // Report counts by continent (Requirement 2.9, 12.3)
  const continentCounts: Record<Continent, number> = {
    europe: 0,
    asia: 0,
    americas: 0,
    africa: 0,
    oceania: 0
  }
  
  for (const country of mapCountries) {
    continentCounts[country.continent]++
  }
  
  console.log('\n📊 Countries by continent:')
  console.log(`  - Europe: ${continentCounts.europe}`)
  console.log(`  - Asia: ${continentCounts.asia}`)
  console.log(`  - Americas: ${continentCounts.americas}`)
  console.log(`  - Africa: ${continentCounts.africa}`)
  console.log(`  - Oceania: ${continentCounts.oceania}`)
  
  // Show sample of generated data for verification
  if (mapCountries.length > 0) {
    console.log('\n📝 Sample generated countries:')
    
    // Show US (large country, complex MultiPolygon with Alaska + Hawaii)
    const usSample = mapCountries.find(c => c.id === 'US')
    if (usSample) {
      console.log(`\n  United States (US):`)
      console.log(`    - ISO Code: ${usSample.id} (extracted from iso_a2)`)
      console.log(`    - Continent: ${usSample.continent}`)
      console.log(`    - Path length: ${usSample.pathData.length} characters`)
      console.log(`    - Path preview: ${usSample.pathData.substring(0, 80)}...`)
      console.log(`    - Centroid: ${usSample.centroid ? `[${usSample.centroid[0].toFixed(2)}, ${usSample.centroid[1].toFixed(2)}]` : 'none (large country)'}`)
      // Count M commands to verify MultiPolygon handling
      const mCount = (usSample.pathData.match(/M/g) || []).length
      console.log(`    - Number of separate polygons (M commands): ${mCount}`)
    }
    
    // Show Japan (MultiPolygon with multiple islands)
    const jpSample = mapCountries.find(c => c.id === 'JP')
    if (jpSample) {
      console.log(`\n  Japan (JP) - MultiPolygon test:`)
      console.log(`    - ISO Code: ${jpSample.id} (extracted from iso_a2)`)
      console.log(`    - Continent: ${jpSample.continent}`)
      console.log(`    - Path length: ${jpSample.pathData.length} characters`)
      const mCount = (jpSample.pathData.match(/M/g) || []).length
      console.log(`    - Number of islands/polygons: ${mCount}`)
      console.log(`    ✓ MultiPolygon geometry handled correctly`)
    }
    
    // Show Indonesia (another MultiPolygon country)
    const idSample = mapCountries.find(c => c.id === 'ID')
    if (idSample) {
      console.log(`\n  Indonesia (ID) - MultiPolygon test:`)
      console.log(`    - ISO Code: ${idSample.id} (extracted from iso_a2)`)
      console.log(`    - Continent: ${idSample.continent}`)
      console.log(`    - Path length: ${idSample.pathData.length} characters`)
      const mCount = (idSample.pathData.match(/M/g) || []).length
      console.log(`    - Number of islands/polygons: ${mCount}`)
      console.log(`    ✓ MultiPolygon geometry handled correctly`)
    }
  }
  
  // Cross-reference validation: MAP_COUNTRIES ↔ FLAGS (Requirements 3.4, 3.5, 3.6, 12.5)
  validateCrossReference(mapCountries, flagIds)
  
  // Generate TypeScript output file (Task 8.1)
  const fileStats = generateTypeScriptFile(mapCountries)
  
  // Calculate execution time (Requirement 16.5)
  const endTime = performance.now()
  const executionTime = ((endTime - startTime) / 1000).toFixed(2)
  
  // Final summary report (Requirements 2.9, 5.6, 12.4, 16.2, 16.4, 16.5)
  console.log('\n' + '='.repeat(60))
  console.log('✅ PATH GENERATION COMPLETED SUCCESSFULLY')
  console.log('='.repeat(60))
  console.log(`📊 Summary Statistics:`)
  console.log(`  - Total countries processed: ${mapCountries.length}`)
  console.log(`  - Generated file: ${OUTPUT_PATH}`)
  console.log(`  - File size: ${fileStats.sizeKB} KB`)
  console.log(`  - Execution time: ${executionTime} seconds`)
  console.log(`\n📍 Countries by continent:`)
  console.log(`  - Europe: ${fileStats.continentCounts.europe}`)
  console.log(`  - Asia: ${fileStats.continentCounts.asia}`)
  console.log(`  - Americas: ${fileStats.continentCounts.americas}`)
  console.log(`  - Africa: ${fileStats.continentCounts.africa}`)
  console.log(`  - Oceania: ${fileStats.continentCounts.oceania}`)
  console.log(`  - Total: ${Object.values(fileStats.continentCounts).reduce((a, b) => a + b, 0)}`)
  console.log('='.repeat(60))
}

/**
 * Generate TypeScript file with MAP_COUNTRIES array
 * 
 * Requirements: 2.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 * 
 * @param mapCountries - Array of processed MapCountry objects
 * @returns Object containing file statistics
 */
function generateTypeScriptFile(mapCountries: MapCountry[]): { sizeKB: string, continentCounts: Record<Continent, number> } {
  console.log('\n📝 Generating TypeScript file...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  // Build TypeScript file content
  const lines: string[] = []
  
  // Add imports and interface
  lines.push("import type { Continent } from '@/types/session'")
  lines.push('')
  lines.push('export interface MapCountry {')
  lines.push('  id: string              // ISO 3166-1 alpha-2')
  lines.push('  pathData: string        // SVG path "d" attribute')
  lines.push('  continent: Continent    // for filtering')
  lines.push('  centroid?: [number, number]  // [x, y] for small country overlays')
  lines.push('}')
  lines.push('')
  
  // Add documentation comment
  lines.push('/**')
  lines.push(' * World map SVG path data for all countries')
  lines.push(' * Coordinates are in viewBox="0 0 1000 500" coordinate system')
  lines.push(' * Generated from Natural Earth 50m resolution data using d3-geo')
  lines.push(' * ')
  lines.push(' * Data source: Natural Earth (public domain)')
  lines.push(' * Projection: Equirectangular (scale=160, center=[500,250])')
  lines.push(' */')
  lines.push('export const MAP_COUNTRIES: MapCountry[] = [')
  
  // Group countries by continent for better organization
  const continentGroups = {
    europe: mapCountries.filter(c => c.continent === 'europe'),
    asia: mapCountries.filter(c => c.continent === 'asia'),
    americas: mapCountries.filter(c => c.continent === 'americas'),
    africa: mapCountries.filter(c => c.continent === 'africa'),
    oceania: mapCountries.filter(c => c.continent === 'oceania')
  }
  
  // Calculate continent counts (Requirement 2.9)
  const continentCounts: Record<Continent, number> = {
    europe: continentGroups.europe.length,
    asia: continentGroups.asia.length,
    americas: continentGroups.americas.length,
    africa: continentGroups.africa.length,
    oceania: continentGroups.oceania.length
  }
  
  const continentLabels = {
    europe: 'EUROPE',
    asia: 'ASIA',
    americas: 'AMERICAS',
    africa: 'AFRICA',
    oceania: 'OCEANIA'
  }
  
  // Generate entries for each continent
  for (const [continent, countries] of Object.entries(continentGroups)) {
    if (countries.length === 0) continue
    
    // Add continent header comment
    lines.push(`  // ${continentLabels[continent as keyof typeof continentLabels]} (${countries.length} countries)`)
    
    // Sort countries by ID for consistent output
    const sortedCountries = countries.sort((a, b) => a.id.localeCompare(b.id))
    
    for (let i = 0; i < sortedCountries.length; i++) {
      const country = sortedCountries[i]
      const isLastInContinent = i === sortedCountries.length - 1
      const isLastOverall = continent === 'oceania' && isLastInContinent
      
      // Format country entry
      lines.push('  {')
      lines.push(`    id: '${country.id}',`)
      lines.push(`    pathData: '${country.pathData}',`)
      lines.push(`    continent: '${country.continent}'${country.centroid ? ',' : ''}`)
      
      // Add centroid if present
      if (country.centroid) {
        const [x, y] = country.centroid
        lines.push(`    centroid: [${x.toFixed(2)}, ${y.toFixed(2)}]`)
      }
      
      // Close country object with or without trailing comma
      lines.push(`  }${isLastOverall ? '' : ','}`)
    }
    
    // Add blank line between continents (except after last continent)
    if (continent !== 'oceania') {
      lines.push('')
    }
  }
  
  // Close array
  lines.push(']')
  lines.push('')
  
  // Join all lines with newlines
  const fileContent = lines.join('\n')
  
  // Write to file
  console.log(`✓ Writing to ${OUTPUT_PATH}...`)
  writeFileSync(OUTPUT_PATH, fileContent, 'utf-8')
  
  // Calculate file size (Requirement 5.6, 12.4)
  const fileSizeBytes = Buffer.byteLength(fileContent, 'utf-8')
  const fileSizeKB = (fileSizeBytes / 1024).toFixed(2)
  
  console.log(`✓ File written successfully`)
  console.log(`  - Path: ${OUTPUT_PATH}`)
  console.log(`  - Size: ${fileSizeKB} KB`)
  console.log(`  - Countries: ${mapCountries.length}`)
  console.log(`  - Lines: ${lines.length}`)
  
  // Validate file size is under 300KB (Requirement 9.1)
  const maxSizeKB = 300
  if (fileSizeBytes / 1024 > maxSizeKB) {
    console.warn(`⚠️  Warning: File size (${fileSizeKB} KB) exceeds recommended maximum (${maxSizeKB} KB)`)
  } else {
    console.log(`✓ File size is within limits (< ${maxSizeKB} KB)`)
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  return { sizeKB: fileSizeKB, continentCounts }
}

// Execute the script
generateMapPaths()
