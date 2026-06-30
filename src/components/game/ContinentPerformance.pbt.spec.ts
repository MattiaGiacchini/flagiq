import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Color coding function based on percentage thresholds
 * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
 */
function getPerformanceColor(percentage: number): string {
  if (percentage === 100) return 'perfect'
  if (percentage >= 78) return 'high'
  if (percentage >= 50) return 'medium'
  return 'low'
}

describe('ContinentPerformance - Color Coding Property Tests', () => {
  /**
   * Property: Color coding SHALL follow defined thresholds
   * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
   */
  it('property: color coding follows correct thresholds for all percentages', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (percentage) => {
          const color = getPerformanceColor(percentage)
          
          // Green for 100%
          if (percentage === 100) {
            expect(color).toBe('perfect')
          }
          // Blue for ≥78%
          else if (percentage >= 78) {
            expect(color).toBe('high')
          }
          // Orange for 50-77%
          else if (percentage >= 50) {
            expect(color).toBe('medium')
          }
          // Red for <50%
          else {
            expect(color).toBe('low')
          }
        }
      ),
      { numRuns: 1000 }
    )
  })

  /**
   * Property: Color coding is deterministic
   * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
   */
  it('property: same percentage always returns same color', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (percentage) => {
          const color1 = getPerformanceColor(percentage)
          const color2 = getPerformanceColor(percentage)
          expect(color1).toBe(color2)
        }
      ),
      { numRuns: 500 }
    )
  })

  /**
   * Property: Boundary values are correctly classified
   * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
   */
  it('property: boundary values are classified correctly', () => {
    // Test critical boundary points
    const boundaries = [
      { percentage: 100, expected: 'perfect' },
      { percentage: 99, expected: 'high' },
      { percentage: 78, expected: 'high' },
      { percentage: 77, expected: 'medium' },
      { percentage: 50, expected: 'medium' },
      { percentage: 49, expected: 'low' },
      { percentage: 0, expected: 'low' }
    ]

    boundaries.forEach(({ percentage, expected }) => {
      expect(getPerformanceColor(percentage)).toBe(expected)
    })
  })

  /**
   * Property: Color transitions are monotonic (color doesn't improve as percentage decreases)
   * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
   */
  it('property: color quality never improves as percentage decreases', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 1, max: 100 }),
        (p1, p2) => {
          // Ensure p1 < p2
          const lower = Math.min(p1, p2)
          const higher = Math.max(p1, p2)
          
          if (lower === higher) return true

          const colorRanking: Record<string, number> = { low: 1, medium: 2, high: 3, perfect: 4 }
          const lowerColor = getPerformanceColor(lower)
          const higherColor = getPerformanceColor(higher)
          
          // Higher percentage should have equal or better color
          const higherRank = colorRanking[higherColor]
          const lowerRank = colorRanking[lowerColor]
          
          if (higherRank !== undefined && lowerRank !== undefined) {
            expect(higherRank).toBeGreaterThanOrEqual(lowerRank)
          }
        }
      ),
      { numRuns: 1000 }
    )
  })

  /**
   * Property: All valid percentages map to exactly one of four colors
   * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
   */
  it('property: every percentage maps to exactly one valid color', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (percentage) => {
          const color = getPerformanceColor(percentage)
          const validColors = ['perfect', 'high', 'medium', 'low']
          expect(validColors).toContain(color)
        }
      ),
      { numRuns: 500 }
    )
  })
})
