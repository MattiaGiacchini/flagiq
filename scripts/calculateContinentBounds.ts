/**
 * Script to calculate accurate continent bounding boxes from SVG path data
 */

import { MAP_COUNTRIES } from '../src/data/mapPaths'
import type { Continent } from '../src/types/session'

interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

interface ContinentBounds {
  x: number
  y: number
  width: number
  height: number
  centerX: number
  centerY: number
}

/**
 * Parse SVG path data and extract all coordinate points
 */
function parsePathCoordinates(pathData: string): Array<{ x: number; y: number }> {
  const coords: Array<{ x: number; y: number }> = []
  
  // Remove all command letters and split by spaces/commas
  const cleanPath = pathData.replace(/[MmLlHhVvCcSsQqTtAaZz]/g, ' ')
  const numbers = cleanPath.split(/[\s,]+/).filter(n => n.trim() !== '')
  
  // Parse pairs of numbers as x,y coordinates
  for (let i = 0; i < numbers.length - 1; i += 2) {
    const x = parseFloat(numbers[i])
    const y = parseFloat(numbers[i + 1])
    if (!isNaN(x) && !isNaN(y)) {
      coords.push({ x, y })
    }
  }
  
  return coords
}

/**
 * Calculate bounding box from an array of coordinates
 */
function calculateBounds(coords: Array<{ x: number; y: number }>): Bounds {
  if (coords.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  }
  
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  
  for (const coord of coords) {
    minX = Math.min(minX, coord.x)
    minY = Math.min(minY, coord.y)
    maxX = Math.max(maxX, coord.x)
    maxY = Math.max(maxY, coord.y)
  }
  
  return { minX, minY, maxX, maxY }
}

/**
 * Calculate bounding box for a continent with padding
 * For continents that wrap around (coordinates in both hemispheres),
 * we filter to keep only the main landmass cluster
 */
function calculateContinentBounds(continent: Continent, paddingPercent: number = 10): ContinentBounds {
  // Get all countries in this continent
  const countries = MAP_COUNTRIES.filter(c => c.continent === continent)
  
  if (countries.length === 0) {
    console.warn(`No countries found for continent: ${continent}`)
    return { x: 0, y: 0, width: 100, height: 100, centerX: 50, centerY: 50 }
  }
  
  // Collect all coordinates from all countries
  let allCoords: Array<{ x: number; y: number }> = []
  
  for (const country of countries) {
    const coords = parsePathCoordinates(country.pathData)
    allCoords.push(...coords)
  }
  
  // For continents with longitude wrapping, filter to main landmass
  // Viewbox is 0-1000 width, so if we see coords < 100 and > 900, it's wrapping
  if (allCoords.some(c => c.x < 100) && allCoords.some(c => c.x > 900)) {
    console.log(`  (Note: ${continent} has longitude wrapping, filtering to main landmass)`)
    
    // Determine which side has more points
    const leftCoords = allCoords.filter(c => c.x < 500)
    const rightCoords = allCoords.filter(c => c.x >= 500)
    
    // Keep the side with more coordinates (main landmass)
    allCoords = leftCoords.length > rightCoords.length ? leftCoords : rightCoords
  }
  
  // Calculate overall bounds
  const bounds = calculateBounds(allCoords)
  
  // Calculate dimensions
  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  
  // Add padding
  const paddingX = (width * paddingPercent) / 100
  const paddingY = (height * paddingPercent) / 100
  
  const x = bounds.minX - paddingX
  const y = bounds.minY - paddingY
  const paddedWidth = width + (2 * paddingX)
  const paddedHeight = height + (2 * paddingY)
  
  // Calculate center
  const centerX = x + paddedWidth / 2
  const centerY = y + paddedHeight / 2
  
  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
    width: Math.round(paddedWidth * 100) / 100,
    height: Math.round(paddedHeight * 100) / 100,
    centerX: Math.round(centerX * 100) / 100,
    centerY: Math.round(centerY * 100) / 100
  }
}

// Calculate bounds for all continents
console.log('Calculating continent bounding boxes...\n')

const continents: Continent[] = ['europe', 'asia', 'africa', 'americas', 'oceania']

for (const continent of continents) {
  const bounds = calculateContinentBounds(continent, 10)
  
  console.log(`${continent}:`)
  console.log(`  { x: ${bounds.x}, y: ${bounds.y}, width: ${bounds.width}, height: ${bounds.height} }`)
  console.log(`  Center: (${bounds.centerX}, ${bounds.centerY})`)
  console.log(`  Country count: ${MAP_COUNTRIES.filter(c => c.continent === continent).length}`)
  console.log()
}

// Output as TypeScript object
console.log('\nTypeScript Object:\n')
console.log('const continentBounds: Record<Continent, { x: number; y: number; width: number; height: number }> = {')
for (const continent of continents) {
  const bounds = calculateContinentBounds(continent, 10)
  console.log(`  ${continent}: { x: ${bounds.x}, y: ${bounds.y}, width: ${bounds.width}, height: ${bounds.height} },`)
}
console.log('}')
