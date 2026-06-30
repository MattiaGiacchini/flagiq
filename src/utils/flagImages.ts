/**
 * Get local flag image path (SVG format)
 * @param countryCode - ISO 3166-1 alpha-2 code (e.g., 'US', 'FR')
 * @returns Local path to flag SVG image: /flags/{code}.svg
 */
export function getLocalFlagPath(countryCode: string): string {
  const code = countryCode.toLowerCase()
  return `/flags/${code}.svg`
}

/**
 * Get fallback PNG path if SVG fails
 * @param countryCode - ISO 3166-1 alpha-2 code (e.g., 'US', 'FR')
 * @returns Fallback PNG path: /flags/{code}.png
 */
export function getFallbackFlagPath(countryCode: string): string {
  const code = countryCode.toLowerCase()
  return `/flags/${code}.png`
}
