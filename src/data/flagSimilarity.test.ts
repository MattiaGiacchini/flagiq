import { describe, it, expect } from 'vitest'
import { getSimilarFlags, type SimilarityMatrix } from './flagSimilarity'

describe('getSimilarFlags', () => {
  const mockMatrix: SimilarityMatrix = {
    version: '1.0',
    scores: [
      { flagA: 'FR', flagB: 'IT', score: 0.85 },
      { flagA: 'FR', flagB: 'BE', score: 0.92 },
      { flagA: 'FR', flagB: 'NL', score: 0.78 },
      { flagA: 'DE', flagB: 'BE', score: 0.80 },
      { flagA: 'ES', flagB: 'PT', score: 0.88 }
    ]
  }

  it('returns similar flags sorted by score descending', () => {
    const result = getSimilarFlags('FR', mockMatrix, 3)
    expect(result).toEqual(['BE', 'IT', 'NL'])
  })

  it('limits results to specified limit', () => {
    const result = getSimilarFlags('FR', mockMatrix, 2)
    expect(result).toEqual(['BE', 'IT'])
  })

  it('handles target as flagB', () => {
    const result = getSimilarFlags('IT', mockMatrix, 1)
    expect(result).toEqual(['FR'])
  })

  it('returns empty array when no matches found', () => {
    const result = getSimilarFlags('US', mockMatrix, 5)
    expect(result).toEqual([])
  })

  it('handles limit larger than available matches', () => {
    const result = getSimilarFlags('FR', mockMatrix, 10)
    expect(result).toEqual(['BE', 'IT', 'NL'])
  })

  it('handles zero limit', () => {
    const result = getSimilarFlags('FR', mockMatrix, 0)
    expect(result).toEqual([])
  })

  it('handles empty similarity matrix', () => {
    const emptyMatrix: SimilarityMatrix = {
      version: '1.0',
      scores: []
    }
    const result = getSimilarFlags('FR', emptyMatrix, 3)
    expect(result).toEqual([])
  })

  it('correctly identifies similar flags regardless of flag order in score', () => {
    const result = getSimilarFlags('BE', mockMatrix, 5)
    // BE appears in scores with FR and DE
    expect(result).toContain('FR')
    expect(result).toContain('DE')
    expect(result).toHaveLength(2)
  })

  it('sorts by score with highest first', () => {
    const result = getSimilarFlags('FR', mockMatrix, 3)
    // BE has score 0.92, IT has 0.85, NL has 0.78
    expect(result[0]).toBe('BE')
    expect(result[1]).toBe('IT')
    expect(result[2]).toBe('NL')
  })
})
