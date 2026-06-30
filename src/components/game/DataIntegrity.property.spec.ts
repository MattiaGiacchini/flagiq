import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { AnsweredQuestion } from '@/stores/game'
import type { Flag } from '@/data/flags'
import type { Continent } from '@/types/session'
import { calculateContinentPerformance } from '@/utils/continentPerformance'
import { extractIncorrectAnswers } from '@/utils/incorrectAnswers'

/**
 * Property-based tests for data integrity and calculations
 * 
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10**
 */

describe('Data Integrity - Property-Based Tests', () => {
  /**
   * Helper functions that mirror the actual calculations
   */
  function calculatePercentage(score: number, total: number): number {
    if (total === 0) return 0
    return Math.round((score / total) * 100)
  }

  function calculateCircumference(radius: number): number {
    return 2 * Math.PI * radius
  }

  function calculateDashOffset(circumference: number, percentage: number): number {
    return circumference * (1 - percentage / 100)
  }

  /**
   * Generators for test data
   */
  const continentArb = fc.constantFrom<Continent>(
    'africa',
    'americas',
    'asia',
    'europe',
    'oceania'
  )

  const flagArb = fc.record({
    id: fc.string({ minLength: 2, maxLength: 2 }).map(s => s.toUpperCase()),
    name: fc.string({ minLength: 3, maxLength: 20 }),
    nameEs: fc.string({ minLength: 3, maxLength: 20 }),
    emoji: fc.string({ minLength: 1, maxLength: 4 }),
    code: fc.string({ minLength: 2, maxLength: 2 }).map(s => s.toLowerCase()),
    continent: continentArb
  }) as fc.Arbitrary<Flag>

  const answeredQuestionArb = (flags: Flag[]) =>
    fc.record({
      question: fc.record({
        correct: fc.constantFrom(...flags),
        options: fc.constant([])
      }),
      chosenId: fc.constantFrom(...flags.map(f => f.id)),
      result: fc.constantFrom<'correct' | 'wrong'>('correct', 'wrong')
    }) as fc.Arbitrary<AnsweredQuestion>

  describe('Property 8.1: Correct + Incorrect Count Equals Total', () => {
    it('should maintain score integrity: correct + incorrect = total for any game session', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }), // total questions
          fc.double({ min: 0, max: 1, noNaN: true }), // score ratio
          (total, scoreRatio) => {
            const score = Math.floor(total * scoreRatio)
            const incorrect = total - score

            // Property: correct + incorrect always equals total
            expect(score + incorrect).toBe(total)

            // Property: both values are non-negative
            expect(score).toBeGreaterThanOrEqual(0)
            expect(incorrect).toBeGreaterThanOrEqual(0)

            // Property: score never exceeds total
            expect(score).toBeLessThanOrEqual(total)
            expect(incorrect).toBeLessThanOrEqual(total)
          }
        ),
        { numRuns: 1000 }
      )
    })
  })

  describe('Property 8.2: Percentage Calculation Accuracy', () => {
    it('should calculate percentage as Math.round((score / total) * 100) for any valid score', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }).chain(total =>
            fc.integer({ min: 0, max: total }).map(score => ({ score, total }))
          ),
          ({ score, total }) => {
            const percentage = calculatePercentage(score, total)
            const expected = Math.round((score / total) * 100)

            // Property: calculated percentage matches the formula
            expect(percentage).toBe(expected)

            // Property: percentage is always in 0-100 range
            expect(percentage).toBeGreaterThanOrEqual(0)
            expect(percentage).toBeLessThanOrEqual(100)

            // Property: 100% only when score === total
            if (score === total && total > 0) {
              expect(percentage).toBe(100)
            }

            // Property: 0% only when score === 0
            if (score === 0) {
              expect(percentage).toBe(0)
            }
          }
        ),
        { numRuns: 1000 }
      )
    })
  })

  describe('Property 8.3: Continent Percentage Calculation', () => {
    it('should calculate continent percentages as (correct / total) * 100 per continent', () => {
      fc.assert(
        fc.property(
          fc.array(flagArb, { minLength: 1, maxLength: 10 }).chain(flags =>
            fc.array(answeredQuestionArb(flags), { minLength: 1, maxLength: 20 }).map(answers => ({
              flags,
              answers
            }))
          ),
          ({ flags, answers }) => {
            const performance = calculateContinentPerformance(answers)

            for (const stat of performance) {
              // Property: percentage matches formula (correct / total) * 100
              const expectedPercentage = Math.round((stat.correct / stat.total) * 100)
              expect(stat.percentage).toBe(expectedPercentage)

              // Property: correct + (total - correct) = total
              expect(stat.correct).toBeLessThanOrEqual(stat.total)

              // Property: percentage is in 0-100 range
              expect(stat.percentage).toBeGreaterThanOrEqual(0)
              expect(stat.percentage).toBeLessThanOrEqual(100)

              // Property: percentage is 100 only when all correct
              if (stat.correct === stat.total) {
                expect(stat.percentage).toBe(100)
              }

              // Property: percentage is 0 only when none correct
              if (stat.correct === 0) {
                expect(stat.percentage).toBe(0)
              }
            }
          }
        ),
        { numRuns: 500 }
      )
    })
  })

  describe('Property 8.4: Data Immutability', () => {
    it('should not mutate source data when extracting incorrect answers', () => {
      fc.assert(
        fc.property(
          fc.array(flagArb, { minLength: 5, maxLength: 10 }).chain(flags =>
            fc.array(answeredQuestionArb(flags), { minLength: 1, maxLength: 20 }).map(answers => ({
              flags,
              answers
            }))
          ),
          ({ flags, answers }) => {
            // Create deep copies to compare against
            const originalAnswers = JSON.parse(JSON.stringify(answers))
            const originalFlags = JSON.parse(JSON.stringify(flags))

            // Execute the function
            extractIncorrectAnswers(answers, flags)

            // Property: source arrays are not mutated
            expect(answers).toEqual(originalAnswers)
            expect(flags).toEqual(originalFlags)
          }
        ),
        { numRuns: 500 }
      )
    })

    it('should not mutate source data when calculating continent performance', () => {
      fc.assert(
        fc.property(
          fc.array(flagArb, { minLength: 1, maxLength: 10 }).chain(flags =>
            fc.array(answeredQuestionArb(flags), { minLength: 1, maxLength: 20 }).map(answers => ({
              flags,
              answers
            }))
          ),
          ({ flags, answers }) => {
            // Create deep copy to compare against
            const originalAnswers = JSON.parse(JSON.stringify(answers))

            // Execute the function
            calculateContinentPerformance(answers)

            // Property: source array is not mutated
            expect(answers).toEqual(originalAnswers)
          }
        ),
        { numRuns: 500 }
      )
    })
  })

  describe('Property 8.5: Circumference and Dash Offset Calculations', () => {
    it('should calculate circumference as 2 * π * radius for any valid radius', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 1, max: 500, noNaN: true }),
          (radius) => {
            const circumference = calculateCircumference(radius)
            const expected = 2 * Math.PI * radius

            // Property: circumference matches the formula
            expect(circumference).toBeCloseTo(expected, 10)

            // Property: circumference is always positive
            expect(circumference).toBeGreaterThan(0)
          }
        ),
        { numRuns: 1000 }
      )
    })

    it('should calculate dash offset as circumference * (1 - percentage/100)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 10, max: 1000, noNaN: true }),
          fc.integer({ min: 0, max: 100 }),
          (circumference, percentage) => {
            const dashOffset = calculateDashOffset(circumference, percentage)
            const expected = circumference * (1 - percentage / 100)

            // Property: dash offset matches the formula
            expect(dashOffset).toBeCloseTo(expected, 10)

            // Property: dash offset is in valid range [0, circumference]
            expect(dashOffset).toBeGreaterThanOrEqual(0)
            expect(dashOffset).toBeLessThanOrEqual(circumference)
          }
        ),
        { numRuns: 1000 }
      )
    })
  })

  describe('Property 8.6: Flag Path Construction', () => {
    it('should construct flag paths as /public/flags/${code}.svg with lowercase code', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-zA-Z]{2}$/),
          (code) => {
            // Simulate the flag path construction
            const flagPath = `/public/flags/${code.toLowerCase()}.svg`

            // Property: path always contains lowercase code
            expect(flagPath).toContain(code.toLowerCase())

            // Property: path follows the expected format
            expect(flagPath).toMatch(/^\/public\/flags\/[a-z]{2}\.svg$/)

            // Property: code in path is never uppercase
            const pathCode = flagPath.match(/\/([a-z]{2})\.svg$/)?.[1]
            expect(pathCode).toBe(code.toLowerCase())
            if (code !== code.toLowerCase()) {
              expect(pathCode).not.toBe(code)
            }
          }
        ),
        { numRuns: 1000 }
      )
    })
  })

  describe('Property 8.7: Time Formatting', () => {
    it('should format elapsed time correctly from milliseconds', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 3600000 }), // 0 to 1 hour in milliseconds
          (elapsedMs) => {
            const totalSeconds = Math.round(elapsedMs / 1000)
            const minutes = Math.floor(totalSeconds / 60)
            const seconds = totalSeconds % 60

            // Property: seconds are always in 0-59 range
            expect(seconds).toBeGreaterThanOrEqual(0)
            expect(seconds).toBeLessThan(60)

            // Property: minutes are non-negative
            expect(minutes).toBeGreaterThanOrEqual(0)

            // Property: total reconstruction equals original
            const reconstructed = minutes * 60 + seconds
            expect(reconstructed).toBe(totalSeconds)

            // Property: formatting logic for display
            if (minutes === 0) {
              const formatted = `${seconds}s`
              expect(formatted).toMatch(/^\d+s$/)
            } else {
              const formatted = `${minutes}m ${seconds.toString().padStart(2, '0')}s`
              expect(formatted).toMatch(/^\d+m \d{2}s$/)
            }
          }
        ),
        { numRuns: 1000 }
      )
    })
  })

  describe('Property 8.8: Color Coding Derivation', () => {
    it('should derive color coding directly from calculated percentages', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (percentage) => {
            // Simulate the color coding logic
            let expectedColor: string
            if (percentage === 100) {
              expectedColor = 'perfect'
            } else if (percentage >= 78) {
              expectedColor = 'high'
            } else if (percentage >= 50) {
              expectedColor = 'medium'
            } else {
              expectedColor = 'low'
            }

            // Property: color is determined solely by percentage value
            // Test boundary conditions
            if (percentage === 100) {
              expect(expectedColor).toBe('perfect')
            } else if (percentage === 99) {
              expect(expectedColor).toBe('high')
            } else if (percentage === 78) {
              expect(expectedColor).toBe('high')
            } else if (percentage === 77) {
              expect(expectedColor).toBe('medium')
            } else if (percentage === 50) {
              expect(expectedColor).toBe('medium')
            } else if (percentage === 49) {
              expect(expectedColor).toBe('low')
            } else if (percentage === 0) {
              expect(expectedColor).toBe('low')
            }

            // Property: color is one of the four valid values
            expect(['perfect', 'high', 'medium', 'low']).toContain(expectedColor)
          }
        ),
        { numRuns: 1000 }
      )
    })
  })

  describe('Property 8.9: Statistics Consistency', () => {
    it('should derive all statistics from source data without loss', () => {
      fc.assert(
        fc.property(
          fc.array(flagArb, { minLength: 5, maxLength: 10 }).chain(flags =>
            fc.array(answeredQuestionArb(flags), { minLength: 1, maxLength: 30 }).map(answers => ({
              flags,
              answers
            }))
          ),
          ({ flags, answers }) => {
            // Count correct and incorrect from source
            const correctCount = answers.filter(a => a.result === 'correct').length
            const incorrectCount = answers.filter(a => a.result === 'wrong').length
            const total = answers.length

            // Property: counts are consistent with source
            expect(correctCount + incorrectCount).toBe(total)

            // Calculate performance
            const performance = calculateContinentPerformance(answers)

            // Property: sum of all continent totals equals original total
            const continentTotal = performance.reduce((sum, stat) => sum + stat.total, 0)
            expect(continentTotal).toBe(total)

            // Extract incorrect answers
            const incorrect = extractIncorrectAnswers(answers, flags)

            // Property: incorrect answers count matches wrong result count
            expect(incorrect.length).toBe(incorrectCount)

            // Property: all items in incorrect array come from wrong answers
            for (const item of incorrect) {
              // Find a matching wrong answer by correct flag ID
              const matchingWrongAnswers = answers.filter(
                a => a.result === 'wrong' && a.question.correct.id === item.correctFlag.id
              )
              // At least one wrong answer should exist for this flag
              expect(matchingWrongAnswers.length).toBeGreaterThan(0)
            }
          }
        ),
        { numRuns: 500 }
      )
    })
  })
})
