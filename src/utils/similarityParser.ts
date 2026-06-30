/**
 * Similarity Parser and Printer Utilities
 * 
 * This module provides functions to parse and print flag similarity configuration files.
 * It validates JSON structure, required fields, score ranges, and flag ID existence.
 */

import type { SimilarityMatrix, Result } from '@/data/flagSimilarity'
import { FLAGS } from '@/data/flags'

/**
 * Parse a JSON string into a SimilarityMatrix object with validation
 * 
 * Validates:
 * - JSON structure (valid JSON with version and scores fields)
 * - Required fields (flagA, flagB, score for each score entry)
 * - Score range (all scores must be in [0, 1])
 * - Flag ID existence (all flag IDs must exist in FLAGS dataset)
 * 
 * @param json - JSON string to parse
 * @returns Result object containing either the parsed SimilarityMatrix or an error message
 * 
 * @example
 * const result = parseSimilarityConfig('{"version":"1.0","scores":[]}')
 * if (result.ok) {
 *   console.log(result.value)
 * } else {
 *   console.error(result.error)
 * }
 */
export function parseSimilarityConfig(json: string): Result<SimilarityMatrix, string> {
  try {
    const parsed = JSON.parse(json)
    
    // Validate structure - must have version and scores array
    if (!parsed.version || !Array.isArray(parsed.scores)) {
      return { ok: false, error: 'Invalid structure: missing version or scores' }
    }
    
    // Validate each score entry
    for (const score of parsed.scores) {
      // Check required fields
      if (!score.flagA || !score.flagB || typeof score.score !== 'number') {
        return { ok: false, error: `Invalid score entry: ${JSON.stringify(score)}` }
      }
      
      // Check score range [0, 1]
      if (score.score < 0 || score.score > 1) {
        return { ok: false, error: `Score out of range [0,1]: ${score.score}` }
      }
      
      // Validate flagA exists in FLAGS dataset
      if (!FLAGS.find(f => f.id === score.flagA)) {
        return { ok: false, error: `Unknown flag ID: ${score.flagA}` }
      }
      
      // Validate flagB exists in FLAGS dataset
      if (!FLAGS.find(f => f.id === score.flagB)) {
        return { ok: false, error: `Unknown flag ID: ${score.flagB}` }
      }
    }
    
    return { ok: true, value: parsed as SimilarityMatrix }
  } catch (e) {
    return { ok: false, error: `JSON parse error: ${e}` }
  }
}

/**
 * Print a SimilarityMatrix object as a formatted JSON string
 * 
 * Formats the matrix with 2-space indentation for readability.
 * The resulting JSON string can be parsed back using parseSimilarityConfig.
 * 
 * @param matrix - SimilarityMatrix object to print
 * @returns Formatted JSON string
 * 
 * @example
 * const matrix: SimilarityMatrix = {
 *   version: "1.0",
 *   scores: [{ flagA: "DE", flagB: "FR", score: 0.5 }]
 * }
 * const json = printSimilarityConfig(matrix)
 * console.log(json)
 */
export function printSimilarityConfig(matrix: SimilarityMatrix): string {
  return JSON.stringify(matrix, null, 2)
}
