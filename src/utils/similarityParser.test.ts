import { describe, it, expect } from 'vitest'
import { parseSimilarityConfig, printSimilarityConfig } from './similarityParser'
import type { SimilarityMatrix } from '@/data/flagSimilarity'

describe('parseSimilarityConfig', () => {
  it('parses valid minimal similarity config', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: [],
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.version).toBe('1.0')
      expect(result.value.scores).toEqual([])
    }
  })

  it('parses valid similarity config with scores', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: [
        { flagA: 'DE', flagB: 'FR', score: 0.5 },
        { flagA: 'IT', flagB: 'ES', score: 0.7 },
      ],
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.scores).toHaveLength(2)
      expect(result.value.scores[0]).toEqual({ flagA: 'DE', flagB: 'FR', score: 0.5 })
      expect(result.value.scores[1]).toEqual({ flagA: 'IT', flagB: 'ES', score: 0.7 })
    }
  })

  it('parses valid similarity config with metadata and factors', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: [
        {
          flagA: 'DE',
          flagB: 'FR',
          score: 0.5,
          factors: {
            colorSimilarity: 0.6,
            geographicProximity: 0.8,
            patternSimilarity: 0.3,
          },
        },
      ],
      metadata: {
        generatedAt: '2024-01-01T00:00:00Z',
        algorithm: 'test-algorithm',
      },
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.metadata).toBeDefined()
      expect(result.value.metadata?.generatedAt).toBe('2024-01-01T00:00:00Z')
      expect(result.value.scores[0]?.factors).toBeDefined()
    }
  })

  it('accepts score of 0', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: [{ flagA: 'DE', flagB: 'FR', score: 0 }],
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(true)
  })

  it('accepts score of 1', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: [{ flagA: 'DE', flagB: 'FR', score: 1 }],
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(true)
  })

  it('rejects malformed JSON', () => {
    const json = '{ invalid json }'

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('JSON parse error')
    }
  })

  it('rejects missing version field', () => {
    const json = JSON.stringify({
      scores: [],
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Invalid structure: missing version or scores')
    }
  })

  it('rejects missing scores field', () => {
    const json = JSON.stringify({
      version: '1.0',
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Invalid structure: missing version or scores')
    }
  })

  it('rejects scores field that is not an array', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: 'not-an-array',
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Invalid structure: missing version or scores')
    }
  })

  it('rejects score entry missing flagA', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: [{ flagB: 'FR', score: 0.5 }],
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid score entry')
    }
  })

  it('rejects score entry missing flagB', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: [{ flagA: 'DE', score: 0.5 }],
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid score entry')
    }
  })

  it('rejects score entry missing score', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: [{ flagA: 'DE', flagB: 'FR' }],
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid score entry')
    }
  })

  it('rejects score entry with non-numeric score', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: [{ flagA: 'DE', flagB: 'FR', score: 'not-a-number' }],
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid score entry')
    }
  })

  it('rejects score below 0', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: [{ flagA: 'DE', flagB: 'FR', score: -0.1 }],
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Score out of range [0,1]: -0.1')
    }
  })

  it('rejects score above 1', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: [{ flagA: 'DE', flagB: 'FR', score: 1.1 }],
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Score out of range [0,1]: 1.1')
    }
  })

  it('rejects unknown flagA ID', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: [{ flagA: 'XX', flagB: 'FR', score: 0.5 }],
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Unknown flag ID: XX')
    }
  })

  it('rejects unknown flagB ID', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: [{ flagA: 'DE', flagB: 'YY', score: 0.5 }],
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Unknown flag ID: YY')
    }
  })

  it('validates all score entries', () => {
    const json = JSON.stringify({
      version: '1.0',
      scores: [
        { flagA: 'DE', flagB: 'FR', score: 0.5 },
        { flagA: 'IT', flagB: 'ZZ', score: 0.7 }, // Invalid flagB
      ],
    })

    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Unknown flag ID: ZZ')
    }
  })
})

describe('printSimilarityConfig', () => {
  it('prints minimal similarity matrix', () => {
    const matrix: SimilarityMatrix = {
      version: '1.0',
      scores: [],
    }

    const json = printSimilarityConfig(matrix)
    const parsed = JSON.parse(json)

    expect(parsed.version).toBe('1.0')
    expect(parsed.scores).toEqual([])
  })

  it('prints similarity matrix with scores', () => {
    const matrix: SimilarityMatrix = {
      version: '1.0',
      scores: [
        { flagA: 'DE', flagB: 'FR', score: 0.5 },
        { flagA: 'IT', flagB: 'ES', score: 0.7 },
      ],
    }

    const json = printSimilarityConfig(matrix)
    const parsed = JSON.parse(json)

    expect(parsed.scores).toHaveLength(2)
    expect(parsed.scores[0]).toEqual({ flagA: 'DE', flagB: 'FR', score: 0.5 })
  })

  it('prints similarity matrix with metadata', () => {
    const matrix: SimilarityMatrix = {
      version: '1.0',
      scores: [],
      metadata: {
        generatedAt: '2024-01-01T00:00:00Z',
        algorithm: 'test-algorithm',
      },
    }

    const json = printSimilarityConfig(matrix)
    const parsed = JSON.parse(json)

    expect(parsed.metadata.generatedAt).toBe('2024-01-01T00:00:00Z')
    expect(parsed.metadata.algorithm).toBe('test-algorithm')
  })

  it('uses 2-space indentation', () => {
    const matrix: SimilarityMatrix = {
      version: '1.0',
      scores: [],
    }

    const json = printSimilarityConfig(matrix)

    // Check for 2-space indentation
    expect(json).toContain('  "version"')
    expect(json).toContain('  "scores"')
  })
})

describe('round-trip conversion', () => {
  it('preserves data through parse-print-parse cycle', () => {
    const matrix: SimilarityMatrix = {
      version: '1.0',
      scores: [
        { flagA: 'DE', flagB: 'FR', score: 0.5 },
        {
          flagA: 'IT',
          flagB: 'ES',
          score: 0.7,
          factors: {
            colorSimilarity: 0.6,
            geographicProximity: 0.8,
            patternSimilarity: 0.5,
          },
        },
      ],
      metadata: {
        generatedAt: '2024-01-01T00:00:00Z',
        algorithm: 'test-algorithm',
      },
    }

    // Print to JSON
    const json = printSimilarityConfig(matrix)

    // Parse back
    const result = parseSimilarityConfig(json)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toEqual(matrix)
    }
  })

  it('preserves data through multiple round-trips', () => {
    const matrix: SimilarityMatrix = {
      version: '2.0',
      scores: [
        { flagA: 'US', flagB: 'CA', score: 0.9 },
        { flagA: 'AU', flagB: 'NZ', score: 0.85 },
      ],
    }

    let current = matrix

    // Perform 3 round-trips
    for (let i = 0; i < 3; i++) {
      const json = printSimilarityConfig(current)
      const result = parseSimilarityConfig(json)

      expect(result.ok).toBe(true)
      if (result.ok) {
        current = result.value
      }
    }

    expect(current).toEqual(matrix)
  })
})
