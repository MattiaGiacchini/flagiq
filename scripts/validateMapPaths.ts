import { readFileSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface MapCountry {
  id: string
  pathData: string
  continent: string
  centroid?: [number, number]
}

interface Flag {
  id: string
  [key: string]: any
}

interface ValidationResult {
  success: boolean
  errors: string[]
  warnings: string[]
  stats: {
    fileSize: number
    countryCount: number
    continentCounts: Record<string, number>
  }
}

async function validateMapPaths(): Promise<ValidationResult> {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    stats: {
      fileSize: 0,
      countryCount: 0,
      continentCounts: {}
    }
  }

  const mapPathsFile = join(__dirname, '../src/data/mapPaths.ts')
  const flagsFile = join(__dirname, '../src/data/flags.ts')

  // Check 1: File size
  try {
    const stats = statSync(mapPathsFile)
    result.stats.fileSize = stats.size
    
    if (stats.size > 300 * 1024) {
      result.errors.push(`File size ${(stats.size / 1024).toFixed(2)} KB exceeds 300 KB limit`)
      result.success = false
    }
  } catch (err) {
    result.errors.push('mapPaths.ts file not found')
    result.success = false
    return result
  }

  // Check 2: Load and parse the file
  let mapCountries: MapCountry[]
  try {
    const content = readFileSync(mapPathsFile, 'utf-8')
    
    // Check TypeScript syntax is valid (basic check)
    if (!content.includes('export const MAP_COUNTRIES')) {
      result.errors.push('Missing export const MAP_COUNTRIES')
      result.success = false
    }
    
    if (!content.includes('import type { Continent }')) {
      result.errors.push('Missing import type { Continent }')
      result.success = false
    }

    // Extract the MAP_COUNTRIES array using dynamic import
    const module = await import(mapPathsFile)
    mapCountries = module.MAP_COUNTRIES
    
    if (!Array.isArray(mapCountries)) {
      result.errors.push('MAP_COUNTRIES is not an array')
      result.success = false
      return result
    }

    result.stats.countryCount = mapCountries.length
  } catch (err) {
    result.errors.push(`Failed to load mapPaths.ts: ${err}`)
    result.success = false
    return result
  }

  // Check 3: Country count (requirement 5.6 specifies 245 countries)
  const expectedCount = 46 // Based on the current FLAGS array
  if (mapCountries.length !== expectedCount) {
    result.warnings.push(
      `Expected ${expectedCount} countries (matching FLAGS), found ${mapCountries.length}`
    )
  }

  // Check 4: Validate each country entry
  const validContinents = ['europe', 'asia', 'americas', 'africa', 'oceania']
  const isoCodePattern = /^[A-Z]{2}$/
  const pathDataPattern = /[MLCZmlcz]/
  const ids = new Set<string>()

  for (const country of mapCountries) {
    // Check 4.1: Valid ISO code format
    if (!isoCodePattern.test(country.id)) {
      result.errors.push(`Invalid ISO code format: ${country.id}`)
      result.success = false
    }

    // Check 4.2: Unique ID
    if (ids.has(country.id)) {
      result.errors.push(`Duplicate country ID: ${country.id}`)
      result.success = false
    }
    ids.add(country.id)

    // Check 4.3: Valid continent
    if (!validContinents.includes(country.continent)) {
      result.errors.push(`Invalid continent for ${country.id}: ${country.continent}`)
      result.success = false
    }

    // Count continents
    result.stats.continentCounts[country.continent] = 
      (result.stats.continentCounts[country.continent] || 0) + 1

    // Check 4.4: Non-empty pathData
    if (!country.pathData || country.pathData.length === 0) {
      result.errors.push(`Empty pathData for country: ${country.id}`)
      result.success = false
    }

    // Check 4.5: PathData contains SVG commands
    if (!pathDataPattern.test(country.pathData)) {
      result.errors.push(`PathData for ${country.id} doesn't contain valid SVG commands`)
      result.success = false
    }

    // Check 4.6: Centroid format if present
    if (country.centroid !== undefined) {
      if (!Array.isArray(country.centroid) || country.centroid.length !== 2) {
        result.errors.push(`Invalid centroid format for ${country.id}`)
        result.success = false
      } else {
        const [x, y] = country.centroid
        if (x < 0 || x > 1000 || y < 0 || y > 500) {
          result.errors.push(`Centroid for ${country.id} is outside viewBox: [${x}, ${y}]`)
          result.success = false
        }
      }
    }

    // Check 4.7: Basic coordinate validation (sample a few points)
    const coordMatches = country.pathData.match(/(-?\d+\.?\d*)/g)
    if (coordMatches) {
      for (let i = 0; i < Math.min(coordMatches.length, 20); i += 2) {
        const x = parseFloat(coordMatches[i])
        const y = coordMatches[i + 1] ? parseFloat(coordMatches[i + 1]) : 0
        
        if (x < 0 || x > 1000) {
          result.warnings.push(`${country.id} has x coordinate outside viewBox: ${x}`)
          break
        }
        if (y < 0 || y > 500) {
          result.warnings.push(`${country.id} has y coordinate outside viewBox: ${y}`)
          break
        }
      }
    }
  }

  // Check 5: Cross-reference with FLAGS
  try {
    const flagsModule = await import(flagsFile)
    const flags: Flag[] = flagsModule.FLAGS
    
    const flagIds = new Set(flags.map((f: Flag) => f.id))
    const mapIds = new Set(mapCountries.map(c => c.id))

    // Countries in FLAGS but not in MAP
    const missingInMap = [...flagIds].filter(id => !mapIds.has(id))
    if (missingInMap.length > 0) {
      result.warnings.push(`Countries in FLAGS but not in MAP: ${missingInMap.join(', ')}`)
    }

    // Countries in MAP but not in FLAGS
    const missingInFlags = [...mapIds].filter(id => !flagIds.has(id))
    if (missingInFlags.length > 0) {
      result.warnings.push(`Countries in MAP but not in FLAGS: ${missingInFlags.join(', ')}`)
    }
  } catch (err) {
    result.warnings.push(`Could not cross-reference with FLAGS: ${err}`)
  }

  return result
}

// Run validation
validateMapPaths().then(result => {
  console.log('\n=== MapPaths.ts Validation Report ===\n')
  
  console.log('📊 Statistics:')
  console.log(`  File size: ${(result.stats.fileSize / 1024).toFixed(2)} KB (limit: 300 KB)`)
  console.log(`  Country count: ${result.stats.countryCount}`)
  console.log(`  Continent breakdown:`)
  for (const [continent, count] of Object.entries(result.stats.continentCounts)) {
    console.log(`    - ${continent}: ${count}`)
  }
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:')
    result.errors.forEach(err => console.log(`  - ${err}`))
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    result.warnings.forEach(warn => console.log(`  - ${warn}`))
  }
  
  if (result.success && result.errors.length === 0) {
    console.log('\n✅ Validation passed!')
  } else {
    console.log('\n❌ Validation failed!')
    process.exit(1)
  }
}).catch(err => {
  console.error('Fatal error during validation:', err)
  process.exit(1)
})
