/**
 * Flag Similarity Matrix Data Structures
 * 
 * This module defines types and interfaces for representing similarity scores
 * between flags. The similarity matrix is used to generate more challenging
 * multiple-choice options based on visual and geographic characteristics.
 */

/**
 * Result type for error handling
 * 
 * Represents either a successful result with a value of type T,
 * or a failure with an error of type E.
 */
export type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; error: E }

/**
 * Similarity score between two flags
 * 
 * Represents the similarity between two flags on a scale from 0 to 1,
 * where higher values indicate more similar flags. Optionally includes
 * breakdown factors for different similarity dimensions.
 */
export interface SimilarityScore {
  /** ISO 3166-1 alpha-2 code for first flag */
  flagA: string
  
  /** ISO 3166-1 alpha-2 code for second flag */
  flagB: string
  
  /** Overall similarity score between 0.0 and 1.0 (higher = more similar) */
  score: number
  
  /** Optional breakdown of similarity factors */
  factors?: {
    /** Color palette similarity (0.0 to 1.0) */
    colorSimilarity?: number
    
    /** Geographic proximity between countries (0.0 to 1.0) */
    geographicProximity?: number
    
    /** Pattern similarity (stripes, stars, emblems, etc.) (0.0 to 1.0) */
    patternSimilarity?: number
  }
}

/**
 * Complete similarity matrix containing all flag similarity scores
 * 
 * The matrix stores pairwise similarity scores between flags and metadata
 * about the matrix version and generation algorithm.
 */
export interface SimilarityMatrix {
  /** Version identifier for the similarity matrix format */
  version: string
  
  /** Array of all pairwise similarity scores */
  scores: SimilarityScore[]
  
  /** Optional metadata about the similarity matrix */
  metadata?: {
    /** ISO 8601 timestamp of when the matrix was generated */
    generatedAt?: string
    
    /** Description of the algorithm used to generate similarity scores */
    algorithm?: string
  }
}

/**
 * Get the most similar flags to a target flag
 * 
 * Searches the similarity matrix for all flags that have similarity scores
 * with the target flag, sorts them by score in descending order, and returns
 * the top N most similar flag IDs.
 * 
 * @param targetId - ISO 3166-1 alpha-2 code for the target flag
 * @param matrix - Similarity matrix containing pairwise scores
 * @param limit - Maximum number of similar flags to return
 * @returns Array of flag IDs sorted by similarity score (highest first)
 * 
 * @example
 * ```typescript
 * const matrix: SimilarityMatrix = {
 *   version: '1.0',
 *   scores: [
 *     { flagA: 'FR', flagB: 'IT', score: 0.85 },
 *     { flagA: 'FR', flagB: 'BE', score: 0.92 },
 *     { flagA: 'FR', flagB: 'NL', score: 0.78 }
 *   ]
 * }
 * 
 * getSimilarFlags('FR', matrix, 2) // Returns: ['BE', 'IT']
 * ```
 */
export function getSimilarFlags(
  targetId: string,
  matrix: SimilarityMatrix,
  limit: number
): string[] {
  return matrix.scores
    // Filter scores to find matches where targetId is either flagA or flagB
    .filter(s => s.flagA === targetId || s.flagB === targetId)
    // Map to { id: otherFlagId, score: score }
    .map(s => ({
      id: s.flagA === targetId ? s.flagB : s.flagA,
      score: s.score
    }))
    // Sort by score descending (highest similarity first)
    .sort((a, b) => b.score - a.score)
    // Take top N results
    .slice(0, limit)
    // Extract just the flag IDs
    .map(s => s.id)
}
