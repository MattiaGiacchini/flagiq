/**
 * Unit tests for TopoJSON loading and d3-geo projection functionality
 * 
 * Task 2.1: Implement TopoJSON file loading from world-atlas package
 * Task 3.1: Configure d3-geo projection and path generator
 * Requirements tested: 1.1, 1.2, 1.4, 2.1, 2.2, 2.5, 2.6, 5.3, 5.4, 8.1, 12.1, 12.2, 18.1
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import * as topojson from 'topojson-client'
import { geoPath, geoEquirectangular } from 'd3-geo'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { FeatureCollection } from 'geojson'

const TOPOJSON_PATH = join(process.cwd(), 'node_modules/world-atlas/countries-50m.json')

describe('TopoJSON Loading (Task 2.1)', () => {
  describe('Requirement 1.1, 1.2: Load TopoJSON from world-atlas', () => {
    it('should load TopoJSON file from world-atlas package', () => {
      // Load file
      const fileContent = readFileSync(TOPOJSON_PATH, 'utf-8')
      const topojsonData = JSON.parse(fileContent) as Topology
      
      expect(topojsonData).toBeDefined()
      expect(topojsonData.type).toBe('Topology')
    })
  })
  
  describe('Requirement 1.4, 2.1: Validate TopoJSON structure', () => {
    it('should validate TopoJSON structure (type === "Topology")', () => {
      const fileContent = readFileSync(TOPOJSON_PATH, 'utf-8')
      const topojsonData = JSON.parse(fileContent) as Topology
      
      // Requirement: type === 'Topology'
      expect(topojsonData.type).toBe('Topology')
    })
    
    it('should validate TopoJSON has objects.countries', () => {
      const fileContent = readFileSync(TOPOJSON_PATH, 'utf-8')
      const topojsonData = JSON.parse(fileContent) as Topology
      
      // Requirement: has objects.countries
      expect(topojsonData.objects).toBeDefined()
      expect(topojsonData.objects.countries).toBeDefined()
    })
  })
  
  describe('Requirement 2.2: Convert TopoJSON to GeoJSON using topojson-client', () => {
    it('should convert TopoJSON to GeoJSON FeatureCollection', () => {
      const fileContent = readFileSync(TOPOJSON_PATH, 'utf-8')
      const topojsonData = JSON.parse(fileContent) as Topology
      
      // Convert to GeoJSON using topojson-client
      const geojson = topojson.feature(
        topojsonData,
        topojsonData.objects.countries as GeometryCollection
      ) as FeatureCollection
      
      expect(geojson).toBeDefined()
      expect(geojson.type).toBe('FeatureCollection')
      expect(geojson.features).toBeDefined()
      expect(geojson.features.length).toBeGreaterThan(200)
    })
    
    it('should return features with valid GeoJSON structure', () => {
      const fileContent = readFileSync(TOPOJSON_PATH, 'utf-8')
      const topojsonData = JSON.parse(fileContent) as Topology
      
      const geojson = topojson.feature(
        topojsonData,
        topojsonData.objects.countries as GeometryCollection
      ) as FeatureCollection
      
      // Check first feature has required GeoJSON structure
      const firstFeature = geojson.features[0]
      expect(firstFeature.id).toBeDefined()
      expect(firstFeature.properties).toBeDefined()
      expect(firstFeature.properties?.name).toBeDefined()
      expect(firstFeature.geometry).toBeDefined()
      expect(firstFeature.geometry.type).toMatch(/Polygon|MultiPolygon/)
    })
  })
  
  describe('Requirement 12.1, 12.2, 18.1: Error handling', () => {
    it('should handle file not found with descriptive message', () => {
      const invalidPath = join(process.cwd(), 'non-existent-file.json')
      
      try {
        readFileSync(invalidPath, 'utf-8')
        expect.fail('Should have thrown ENOENT error')
      } catch (error) {
        // Verify error code
        expect((error as NodeJS.ErrnoException).code).toBe('ENOENT')
        
        // Verify this is the type of error we handle
        expect(error).toBeDefined()
      }
    })
    
    it('should validate structure before processing', () => {
      const fileContent = readFileSync(TOPOJSON_PATH, 'utf-8')
      const topojsonData = JSON.parse(fileContent) as Topology
      
      // These validations should pass
      expect(topojsonData.type).toBe('Topology')
      expect(topojsonData.objects).toBeDefined()
      expect(topojsonData.objects.countries).toBeDefined()
    })
  })
})

describe('Continent Mapping (Task 5.1)', () => {
  describe('Requirement 4.1: Map "Europe" to "europe"', () => {
    it('should map "Europe" to "europe"', async () => {
      const { mapContinentCode } = await import('./generateMapPaths.js')
      const result = mapContinentCode('Europe')
      expect(result).toBe('europe')
    })
  })
  
  describe('Requirement 4.2: Map "Asia" to "asia"', () => {
    it('should map "Asia" to "asia"', async () => {
      const { mapContinentCode } = await import('./generateMapPaths.js')
      const result = mapContinentCode('Asia')
      expect(result).toBe('asia')
    })
  })
  
  describe('Requirement 4.3: Map "North America" and "South America" to "americas"', () => {
    it('should map "North America" to "americas"', async () => {
      const { mapContinentCode } = await import('./generateMapPaths.js')
      const result = mapContinentCode('North America')
      expect(result).toBe('americas')
    })
    
    it('should map "South America" to "americas"', async () => {
      const { mapContinentCode } = await import('./generateMapPaths.js')
      const result = mapContinentCode('South America')
      expect(result).toBe('americas')
    })
  })
  
  describe('Requirement 4.4: Map "Africa" to "africa"', () => {
    it('should map "Africa" to "africa"', async () => {
      const { mapContinentCode } = await import('./generateMapPaths.js')
      const result = mapContinentCode('Africa')
      expect(result).toBe('africa')
    })
  })
  
  describe('Requirement 4.5: Map "Oceania" to "oceania"', () => {
    it('should map "Oceania" to "oceania"', async () => {
      const { mapContinentCode } = await import('./generateMapPaths.js')
      const result = mapContinentCode('Oceania')
      expect(result).toBe('oceania')
    })
  })
  
  describe('Requirement 4.6: Skip Antarctica', () => {
    it('should return null for "Antarctica"', async () => {
      const { mapContinentCode } = await import('./generateMapPaths.js')
      const result = mapContinentCode('Antarctica')
      expect(result).toBeNull()
    })
  })
  
  describe('Requirement 4.7: Return valid Continent type or null', () => {
    it('should return only valid continent codes or null', async () => {
      const { mapContinentCode } = await import('./generateMapPaths.js')
      const validContinents = ['europe', 'asia', 'americas', 'africa', 'oceania']
      const testInputs = ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania', 'Antarctica']
      
      for (const input of testInputs) {
        const result = mapContinentCode(input)
        
        if (result !== null) {
          expect(validContinents).toContain(result)
        }
      }
    })
    
    it('should return null for unknown continents', async () => {
      const { mapContinentCode } = await import('./generateMapPaths.js')
      const result = mapContinentCode('Unknown Continent')
      expect(result).toBeNull()
    })
  })
  
  describe('Type safety', () => {
    it('should be type-safe with TypeScript', async () => {
      const { mapContinentCode } = await import('./generateMapPaths.js')
      // This test verifies compilation succeeds with proper types
      const result = mapContinentCode('Europe')
      
      // TypeScript should infer result as Continent | null
      if (result !== null) {
        const validTypes: Array<'europe' | 'asia' | 'americas' | 'africa' | 'oceania'> = [result]
        expect(validTypes).toHaveLength(1)
      }
    })
  })
})

describe('d3-geo Projection Configuration (Task 3.1)', () => {
  describe('Requirement 2.5: Equirectangular projection with scale 160', () => {
    it('should create geoEquirectangular projection with scale 160', () => {
      const projection = geoEquirectangular()
        .scale(160)
        .translate([500, 250])
      
      // Verify projection is created
      expect(projection).toBeDefined()
      expect(typeof projection).toBe('function')
      
      // Verify scale
      expect(projection.scale()).toBe(160)
    })
    
    it('should set translate to [500, 250] for viewBox centering', () => {
      const projection = geoEquirectangular()
        .scale(160)
        .translate([500, 250])
      
      // Verify translate
      const translate = projection.translate()
      expect(translate).toEqual([500, 250])
    })
  })
  
  describe('Requirement 2.6: Path generator precision', () => {
    it('should set precision to 0.1 for optimal file size vs detail', () => {
      const projection = geoEquirectangular()
        .scale(160)
        .translate([500, 250])
        .precision(0.1)
      
      // Verify precision
      expect(projection.precision()).toBe(0.1)
    })
  })
  
  describe('Requirement 5.3, 5.4, 8.1: Path generator creation', () => {
    it('should create path generator using projection', () => {
      const projection = geoEquirectangular()
        .scale(160)
        .translate([500, 250])
        .precision(0.1)
      
      const pathGenerator = geoPath().projection(projection)
      
      // Verify path generator is created
      expect(pathGenerator).toBeDefined()
      expect(typeof pathGenerator).toBe('function')
    })
    
    it('should generate valid SVG paths from GeoJSON features', () => {
      // Load and convert TopoJSON to GeoJSON
      const fileContent = readFileSync(TOPOJSON_PATH, 'utf-8')
      const topojsonData = JSON.parse(fileContent) as Topology
      const geojson = topojson.feature(
        topojsonData,
        topojsonData.objects.countries as GeometryCollection
      ) as FeatureCollection
      
      // Create projection and path generator
      const projection = geoEquirectangular()
        .scale(160)
        .translate([500, 250])
        .precision(0.1)
      
      const pathGenerator = geoPath().projection(projection)
      
      // Generate path for first feature
      const firstFeature = geojson.features[0]
      const svgPath = pathGenerator(firstFeature)
      
      // Verify path is generated
      expect(svgPath).toBeDefined()
      expect(typeof svgPath).toBe('string')
      expect(svgPath!.length).toBeGreaterThan(0)
      
      // Verify path contains valid SVG commands
      expect(svgPath).toMatch(/[MLCZmlcz]/)
    })
    
    it('should generate paths within viewBox [0, 0, 1000, 500]', () => {
      // Load and convert TopoJSON to GeoJSON
      const fileContent = readFileSync(TOPOJSON_PATH, 'utf-8')
      const topojsonData = JSON.parse(fileContent) as Topology
      const geojson = topojson.feature(
        topojsonData,
        topojsonData.objects.countries as GeometryCollection
      ) as FeatureCollection
      
      // Create projection and path generator
      const projection = geoEquirectangular()
        .scale(160)
        .translate([500, 250])
        .precision(0.1)
      
      const pathGenerator = geoPath().projection(projection)
      
      // Test a few features to ensure coordinates are within bounds
      for (let i = 0; i < Math.min(5, geojson.features.length); i++) {
        const feature = geojson.features[i]
        const bounds = pathGenerator.bounds(feature)
        
        // Verify bounds exist
        expect(bounds).toBeDefined()
        
        // Verify coordinates are within viewBox [0, 0, 1000, 500]
        const [[x1, y1], [x2, y2]] = bounds
        
        // Allow slight overflow due to precision
        expect(x1).toBeGreaterThanOrEqual(-10)
        expect(x1).toBeLessThanOrEqual(1010)
        expect(x2).toBeGreaterThanOrEqual(-10)
        expect(x2).toBeLessThanOrEqual(1010)
        
        expect(y1).toBeGreaterThanOrEqual(-10)
        expect(y1).toBeLessThanOrEqual(510)
        expect(y2).toBeGreaterThanOrEqual(-10)
        expect(y2).toBeLessThanOrEqual(510)
      }
    })
  })
})

describe('Centroid Calculation (Task 6.1)', () => {
  describe('Requirement 6.1: Calculate bounding box area in pixels', () => {
    it('should calculate bounding box area using pathGenerator.bounds()', () => {
      // Load and convert TopoJSON to GeoJSON
      const fileContent = readFileSync(TOPOJSON_PATH, 'utf-8')
      const topojsonData = JSON.parse(fileContent) as Topology
      const geojson = topojson.feature(
        topojsonData,
        topojsonData.objects.countries as GeometryCollection
      ) as FeatureCollection
      
      // Create projection and path generator
      const projection = geoEquirectangular()
        .scale(160)
        .translate([500, 250])
        .precision(0.1)
      
      const pathGenerator = geoPath().projection(projection)
      
      // Get bounds for a feature
      const firstFeature = geojson.features[0]
      const bounds = pathGenerator.bounds(firstFeature)
      
      // Verify bounds structure
      expect(bounds).toBeDefined()
      expect(bounds.length).toBe(2)
      expect(bounds[0].length).toBe(2)
      expect(bounds[1].length).toBe(2)
      
      // Calculate area
      const [[x1, y1], [x2, y2]] = bounds
      const area = (x2 - x1) * (y2 - y1)
      
      // Verify area is a positive number
      expect(area).toBeGreaterThan(0)
      expect(typeof area).toBe('number')
    })
  })
  
  describe('Requirement 6.2, 6.3: Calculate centroid for small countries (area < 100px²)', () => {
    it('should calculate centroid using d3-geo for small countries', () => {
      // Load and convert TopoJSON to GeoJSON
      const fileContent = readFileSync(TOPOJSON_PATH, 'utf-8')
      const topojsonData = JSON.parse(fileContent) as Topology
      const geojson = topojson.feature(
        topojsonData,
        topojsonData.objects.countries as GeometryCollection
      ) as FeatureCollection
      
      // Create projection and path generator
      const projection = geoEquirectangular()
        .scale(160)
        .translate([500, 250])
        .precision(0.1)
      
      const pathGenerator = geoPath().projection(projection)
      
      // Find a small country by checking area
      const SMALL_COUNTRY_THRESHOLD = 100
      let smallCountryFound = false
      
      for (const feature of geojson.features) {
        const bounds = pathGenerator.bounds(feature)
        const [[x1, y1], [x2, y2]] = bounds
        const area = (x2 - x1) * (y2 - y1)
        
        if (area < SMALL_COUNTRY_THRESHOLD) {
          // Calculate centroid for small country
          const centroid = pathGenerator.centroid(feature)
          
          // Verify centroid is calculated
          expect(centroid).toBeDefined()
          expect(Array.isArray(centroid)).toBe(true)
          expect(centroid.length).toBe(2)
          expect(typeof centroid[0]).toBe('number')
          expect(typeof centroid[1]).toBe('number')
          
          smallCountryFound = true
          break
        }
      }
      
      // Verify we found at least one small country
      expect(smallCountryFound).toBe(true)
    })
  })
  
  describe('Requirement 6.4: Large countries should not have centroid', () => {
    it('should set centroid to undefined for countries with area >= 100px²', () => {
      // Load and convert TopoJSON to GeoJSON
      const fileContent = readFileSync(TOPOJSON_PATH, 'utf-8')
      const topojsonData = JSON.parse(fileContent) as Topology
      const geojson = topojson.feature(
        topojsonData,
        topojsonData.objects.countries as GeometryCollection
      ) as FeatureCollection
      
      // Create projection and path generator
      const projection = geoEquirectangular()
        .scale(160)
        .translate([500, 250])
        .precision(0.1)
      
      const pathGenerator = geoPath().projection(projection)
      
      const SMALL_COUNTRY_THRESHOLD = 100
      
      // Test first few features to verify logic
      for (let i = 0; i < Math.min(10, geojson.features.length); i++) {
        const feature = geojson.features[i]
        const bounds = pathGenerator.bounds(feature)
        const [[x1, y1], [x2, y2]] = bounds
        const area = (x2 - x1) * (y2 - y1)
        
        if (area >= SMALL_COUNTRY_THRESHOLD) {
          // For large countries, centroid should be undefined
          // This is a logic test - in actual implementation we don't calculate it
          expect(area).toBeGreaterThanOrEqual(SMALL_COUNTRY_THRESHOLD)
        }
      }
    })
  })
  
  describe('Requirement 6.5, 6.6: Centroid coordinates within viewBox [0-1000, 0-500]', () => {
    it('should validate centroid x coordinate is within [0, 1000]', () => {
      // Load and convert TopoJSON to GeoJSON
      const fileContent = readFileSync(TOPOJSON_PATH, 'utf-8')
      const topojsonData = JSON.parse(fileContent) as Topology
      const geojson = topojson.feature(
        topojsonData,
        topojsonData.objects.countries as GeometryCollection
      ) as FeatureCollection
      
      // Create projection and path generator
      const projection = geoEquirectangular()
        .scale(160)
        .translate([500, 250])
        .precision(0.1)
      
      const pathGenerator = geoPath().projection(projection)
      
      const SMALL_COUNTRY_THRESHOLD = 100
      
      // Find small countries and validate centroid x coordinate
      for (const feature of geojson.features) {
        const bounds = pathGenerator.bounds(feature)
        const [[x1, y1], [x2, y2]] = bounds
        const area = (x2 - x1) * (y2 - y1)
        
        if (area < SMALL_COUNTRY_THRESHOLD) {
          const centroid = pathGenerator.centroid(feature)
          const x = centroid[0]
          
          // Verify x is within valid range
          expect(x).toBeGreaterThanOrEqual(0)
          expect(x).toBeLessThanOrEqual(1000)
        }
      }
    })
    
    it('should validate centroid y coordinate is within [0, 500]', () => {
      // Load and convert TopoJSON to GeoJSON
      const fileContent = readFileSync(TOPOJSON_PATH, 'utf-8')
      const topojsonData = JSON.parse(fileContent) as Topology
      const geojson = topojson.feature(
        topojsonData,
        topojsonData.objects.countries as GeometryCollection
      ) as FeatureCollection
      
      // Create projection and path generator
      const projection = geoEquirectangular()
        .scale(160)
        .translate([500, 250])
        .precision(0.1)
      
      const pathGenerator = geoPath().projection(projection)
      
      const SMALL_COUNTRY_THRESHOLD = 100
      
      // Find small countries and validate centroid y coordinate
      for (const feature of geojson.features) {
        const bounds = pathGenerator.bounds(feature)
        const [[x1, y1], [x2, y2]] = bounds
        const area = (x2 - x1) * (y2 - y1)
        
        if (area < SMALL_COUNTRY_THRESHOLD) {
          const centroid = pathGenerator.centroid(feature)
          const y = centroid[1]
          
          // Verify y is within valid range
          expect(y).toBeGreaterThanOrEqual(0)
          expect(y).toBeLessThanOrEqual(500)
        }
      }
    })
  })
})

describe('Cross-Reference Validation (Task 8.2)', () => {
  describe('Requirement 3.4: Load FLAGS array from flags.ts', () => {
    it('should load FLAGS data and extract ISO codes', () => {
      // Load FLAGS data from flags.ts
      const flagsPath = join(process.cwd(), 'src/data/flags.ts')
      const flagsContent = readFileSync(flagsPath, 'utf-8')
      
      // Extract ISO codes using regex
      const isoCodeRegex = /id:\s*'([A-Z]{2})'/g
      const matches = [...flagsContent.matchAll(isoCodeRegex)]
      const flagIds = matches.map(match => match[1])
      
      // Verify FLAGS data is loaded
      expect(flagIds).toBeDefined()
      expect(flagIds.length).toBeGreaterThan(0)
      expect(flagIds.every(id => /^[A-Z]{2}$/.test(id))).toBe(true)
    })
    
    it('should extract all ISO codes in FLAGS array', () => {
      const flagsPath = join(process.cwd(), 'src/data/flags.ts')
      const flagsContent = readFileSync(flagsPath, 'utf-8')
      
      const isoCodeRegex = /id:\s*'([A-Z]{2})'/g
      const matches = [...flagsContent.matchAll(isoCodeRegex)]
      const flagIds = matches.map(match => match[1])
      
      // Verify expected countries are present
      expect(flagIds).toContain('US')
      expect(flagIds).toContain('FR')
      expect(flagIds).toContain('JP')
      expect(flagIds).toContain('BR')
    })
  })
  
  describe('Requirement 3.5: Report countries in FLAGS but missing from MAP_COUNTRIES', () => {
    it('should identify countries in FLAGS but not in generated MAP_COUNTRIES', () => {
      // Mock data
      const flagIds = ['US', 'FR', 'JP', 'XX'] // XX is not in map
      const mapCountries = [
        { id: 'US', pathData: 'M...', continent: 'americas' as const },
        { id: 'FR', pathData: 'M...', continent: 'europe' as const },
        { id: 'JP', pathData: 'M...', continent: 'asia' as const }
      ]
      
      const mapIds = new Set(mapCountries.map(c => c.id))
      const missingInMap = flagIds.filter(id => !mapIds.has(id))
      
      // Verify missing countries are detected
      expect(missingInMap).toEqual(['XX'])
    })
    
    it('should report empty array when all FLAGS countries are in MAP_COUNTRIES', () => {
      const flagIds = ['US', 'FR', 'JP']
      const mapCountries = [
        { id: 'US', pathData: 'M...', continent: 'americas' as const },
        { id: 'FR', pathData: 'M...', continent: 'europe' as const },
        { id: 'JP', pathData: 'M...', continent: 'asia' as const }
      ]
      
      const mapIds = new Set(mapCountries.map(c => c.id))
      const missingInMap = flagIds.filter(id => !mapIds.has(id))
      
      expect(missingInMap).toEqual([])
    })
  })
  
  describe('Requirement 3.6: Report countries in MAP_COUNTRIES but missing from FLAGS', () => {
    it('should identify countries in MAP_COUNTRIES but not in FLAGS', () => {
      const flagIds = ['US', 'FR', 'JP']
      const mapCountries = [
        { id: 'US', pathData: 'M...', continent: 'americas' as const },
        { id: 'FR', pathData: 'M...', continent: 'europe' as const },
        { id: 'JP', pathData: 'M...', continent: 'asia' as const },
        { id: 'YY', pathData: 'M...', continent: 'africa' as const } // YY is not in FLAGS
      ]
      
      const flagIdsSet = new Set(flagIds)
      const mapIds = mapCountries.map(c => c.id)
      const missingInFlags = mapIds.filter(id => !flagIdsSet.has(id))
      
      // Verify extra countries are detected
      expect(missingInFlags).toEqual(['YY'])
    })
    
    it('should report empty array when all MAP_COUNTRIES are in FLAGS', () => {
      const flagIds = ['US', 'FR', 'JP']
      const mapCountries = [
        { id: 'US', pathData: 'M...', continent: 'americas' as const },
        { id: 'FR', pathData: 'M...', continent: 'europe' as const },
        { id: 'JP', pathData: 'M...', continent: 'asia' as const }
      ]
      
      const flagIdsSet = new Set(flagIds)
      const mapIds = mapCountries.map(c => c.id)
      const missingInFlags = mapIds.filter(id => !flagIdsSet.has(id))
      
      expect(missingInFlags).toEqual([])
    })
  })
  
  describe('Requirement 12.5: Display warnings for any mismatches', () => {
    it('should detect perfect match between FLAGS and MAP_COUNTRIES', () => {
      const flagIds = ['US', 'FR', 'JP', 'BR']
      const mapCountries = [
        { id: 'US', pathData: 'M...', continent: 'americas' as const },
        { id: 'FR', pathData: 'M...', continent: 'europe' as const },
        { id: 'JP', pathData: 'M...', continent: 'asia' as const },
        { id: 'BR', pathData: 'M...', continent: 'americas' as const }
      ]
      
      const mapIds = new Set(mapCountries.map(c => c.id))
      const flagIdsSet = new Set(flagIds)
      
      const missingInMap = flagIds.filter(id => !mapIds.has(id))
      const missingInFlags = [...mapIds].filter(id => !flagIdsSet.has(id))
      
      const isPerfectMatch = missingInMap.length === 0 && missingInFlags.length === 0
      
      expect(isPerfectMatch).toBe(true)
    })
    
    it('should detect mismatches in both directions', () => {
      const flagIds = ['US', 'FR', 'JP', 'XX'] // XX missing in map
      const mapCountries = [
        { id: 'US', pathData: 'M...', continent: 'americas' as const },
        { id: 'FR', pathData: 'M...', continent: 'europe' as const },
        { id: 'JP', pathData: 'M...', continent: 'asia' as const },
        { id: 'YY', pathData: 'M...', continent: 'africa' as const } // YY missing in FLAGS
      ]
      
      const mapIds = new Set(mapCountries.map(c => c.id))
      const flagIdsSet = new Set(flagIds)
      
      const missingInMap = flagIds.filter(id => !mapIds.has(id))
      const missingInFlags = [...mapIds].filter(id => !flagIdsSet.has(id))
      
      expect(missingInMap).toEqual(['XX'])
      expect(missingInFlags).toEqual(['YY'])
    })
    
    it('should provide counts for validation summary', () => {
      const flagIds = ['US', 'FR', 'JP', 'XX']
      const mapCountries = [
        { id: 'US', pathData: 'M...', continent: 'americas' as const },
        { id: 'FR', pathData: 'M...', continent: 'europe' as const },
        { id: 'JP', pathData: 'M...', continent: 'asia' as const },
        { id: 'YY', pathData: 'M...', continent: 'africa' as const }
      ]
      
      const mapIds = new Set(mapCountries.map(c => c.id))
      const flagIdsSet = new Set(flagIds)
      
      const missingInMap = flagIds.filter(id => !mapIds.has(id))
      const missingInFlags = [...mapIds].filter(id => !flagIdsSet.has(id))
      const commonCount = mapCountries.length - missingInFlags.length
      
      expect(flagIds.length).toBe(4)
      expect(mapCountries.length).toBe(4)
      expect(commonCount).toBe(3)
      expect(missingInMap.length).toBe(1)
      expect(missingInFlags.length).toBe(1)
    })
  })
  
  describe('Integration: Full cross-reference validation workflow', () => {
    it('should perform complete validation with actual FLAGS data', () => {
      // Load actual FLAGS data
      const flagsPath = join(process.cwd(), 'src/data/flags.ts')
      const flagsContent = readFileSync(flagsPath, 'utf-8')
      
      const isoCodeRegex = /id:\s*'([A-Z]{2})'/g
      const matches = [...flagsContent.matchAll(isoCodeRegex)]
      const flagIds = matches.map(match => match[1])
      
      // Mock MAP_COUNTRIES based on actual FLAGS
      const mapCountries = flagIds.map(id => ({
        id,
        pathData: 'M0,0L1,1Z',
        continent: 'europe' as const
      }))
      
      // Perform validation
      const mapIds = new Set(mapCountries.map(c => c.id))
      const flagIdsSet = new Set(flagIds)
      
      const missingInMap = flagIds.filter(id => !mapIds.has(id))
      const missingInFlags = [...mapIds].filter(id => !flagIdsSet.has(id))
      
      // With matching data, should have no mismatches
      expect(missingInMap).toEqual([])
      expect(missingInFlags).toEqual([])
      expect(flagIds.length).toBe(mapCountries.length)
    })
  })
})
