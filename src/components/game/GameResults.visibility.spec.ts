import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import * as fc from 'fast-check'
import GameResults from './GameResults.vue'
import CircularProgress from './CircularProgress.vue'
import ContinentPerformance from './ContinentPerformance.vue'
import IncorrectAnswers from './IncorrectAnswers.vue'
import type { AnsweredQuestion } from '@/stores/game'
import { FLAGS } from '@/data/flags'

describe('GameResults.vue - Task 5.1: Component Visibility Rules', () => {
  /**
   * **Validates: Requirements 1.9, 10.1**
   *
   * Property: CircularProgress is always visible when GameResults is rendered
   * 
   * For any valid game result (score, total, answers), the CircularProgress
   * component SHALL always be present in the DOM with the correct percentage.
   */
  it('property: CircularProgress is always visible with correct percentage', () => {
    fc.assert(
      fc.property(
        // Generate score and total where score <= total, and total > 0 to avoid division by zero
        fc.integer({ min: 1, max: 20 }).chain((total) =>
          fc.record({
            score: fc.integer({ min: 0, max: total }),
            total: fc.constant(total),
          })
        ),
        fc.integer({ min: 0, max: 300000 }), // elapsedMs up to 5 minutes
        ({ score, total }, elapsedMs) => {
          // Arrange
          const answers: AnsweredQuestion[] = []
          const wrapper = mount(GameResults, {
            props: {
              score,
              total,
              elapsedMs,
              answers,
              locale: 'en',
            },
          })

          // Act
          const circularProgress = wrapper.findComponent(CircularProgress)
          const expectedPercentage = Math.round((score / total) * 100)

          // Assert
          expect(circularProgress.exists()).toBe(true)
          expect(circularProgress.props('percentage')).toBe(expectedPercentage)

          wrapper.unmount()
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * **Validates: Requirements 4.8, 5.9**
   *
   * Property: IncorrectAnswers only visible when incorrect answers exist
   * 
   * For any results state, the IncorrectAnswers component SHALL only render
   * when there are incorrect answers (score < total and wrong answers in data).
   */
  it('property: IncorrectAnswers only visible when incorrect answers exist', () => {
    fc.assert(
      fc.property(
        // Generate varying numbers of correct and incorrect answers
        fc.record({
          correctCount: fc.nat({ max: 10 }),
          incorrectCount: fc.nat({ max: 10 }),
        }),
        ({ correctCount, incorrectCount }) => {
          // Arrange: Build answers array with correct and incorrect answers
          const answers: AnsweredQuestion[] = []

          // Add correct answers
          for (let i = 0; i < correctCount; i++) {
            const flag = FLAGS[i % FLAGS.length]!
            answers.push({
              question: {
                correct: flag,
                options: [flag],
              },
              chosenId: flag.id,
              result: 'correct',
            })
          }

          // Add incorrect answers
          for (let i = 0; i < incorrectCount; i++) {
            const correctFlag = FLAGS[i % FLAGS.length]!
            const wrongFlag = FLAGS[(i + 1) % FLAGS.length]!
            answers.push({
              question: {
                correct: correctFlag,
                options: [correctFlag, wrongFlag],
              },
              chosenId: wrongFlag.id,
              result: 'wrong',
            })
          }

          const total = correctCount + incorrectCount
          const score = correctCount

          const wrapper = mount(GameResults, {
            props: {
              score,
              total,
              elapsedMs: 10000,
              answers,
              locale: 'en',
            },
          })

          // Act
          const incorrectAnswersComponent = wrapper.findComponent(IncorrectAnswers)

          // Assert
          if (incorrectCount > 0) {
            expect(incorrectAnswersComponent.exists()).toBe(true)
          } else {
            expect(incorrectAnswersComponent.exists()).toBe(false)
          }

          wrapper.unmount()
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * **Validates: Requirements 5.9**
   *
   * Property: ContinentPerformance only visible when continent data exists
   * 
   * For any results state, the ContinentPerformance component SHALL only render
   * when there is continent-specific performance data available.
   */
  it('property: ContinentPerformance only visible when continent data exists', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 15 }), // Number of questions
        (numQuestions) => {
          // Arrange: Build answers array
          const answers: AnsweredQuestion[] = []

          for (let i = 0; i < numQuestions; i++) {
            const flag = FLAGS[i % FLAGS.length]!
            answers.push({
              question: {
                correct: flag,
                options: [flag],
              },
              chosenId: flag.id,
              result: 'correct',
            })
          }

          const wrapper = mount(GameResults, {
            props: {
              score: numQuestions,
              total: numQuestions,
              elapsedMs: 10000,
              answers,
              locale: 'en',
            },
          })

          // Act
          const continentPerformanceComponent = wrapper.findComponent(ContinentPerformance)

          // Assert
          if (numQuestions > 0) {
            // With questions, continent data should exist
            expect(continentPerformanceComponent.exists()).toBe(true)
          } else {
            // With no questions, no continent data
            expect(continentPerformanceComponent.exists()).toBe(false)
          }

          wrapper.unmount()
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * **Validates: Requirements 1.9, 4.8, 5.9, 10.1**
   *
   * Property: All visibility rules work together consistently
   * 
   * For any combination of correct/incorrect answers, the visibility of all
   * three components (CircularProgress, IncorrectAnswers, ContinentPerformance)
   * SHALL follow their respective rules simultaneously.
   */
  it('property: all visibility rules work together consistently', () => {
    fc.assert(
      fc.property(
        fc.record({
          correctCount: fc.integer({ min: 0, max: 10 }),
          incorrectCount: fc.integer({ min: 0, max: 10 }),
        }).filter(({ correctCount, incorrectCount }) => correctCount + incorrectCount > 0), // Ensure at least one question
        ({ correctCount, incorrectCount }) => {
          // Arrange
          const answers: AnsweredQuestion[] = []

          // Add correct answers
          for (let i = 0; i < correctCount; i++) {
            const flag = FLAGS[i % FLAGS.length]!
            answers.push({
              question: {
                correct: flag,
                options: [flag],
              },
              chosenId: flag.id,
              result: 'correct',
            })
          }

          // Add incorrect answers
          for (let i = 0; i < incorrectCount; i++) {
            const correctFlag = FLAGS[i % FLAGS.length]!
            const wrongFlag = FLAGS[(i + 1) % FLAGS.length]!
            answers.push({
              question: {
                correct: correctFlag,
                options: [correctFlag, wrongFlag],
              },
              chosenId: wrongFlag.id,
              result: 'wrong',
            })
          }

          const total = correctCount + incorrectCount
          const score = correctCount

          const wrapper = mount(GameResults, {
            props: {
              score,
              total,
              elapsedMs: 10000,
              answers,
              locale: 'en',
            },
          })

          // Act & Assert
          const circularProgress = wrapper.findComponent(CircularProgress)
          const incorrectAnswersComponent = wrapper.findComponent(IncorrectAnswers)
          const continentPerformanceComponent = wrapper.findComponent(ContinentPerformance)

          // CircularProgress: Always visible
          expect(circularProgress.exists()).toBe(true)

          // IncorrectAnswers: Only when incorrect answers exist
          expect(incorrectAnswersComponent.exists()).toBe(incorrectCount > 0)

          // ContinentPerformance: Only when questions exist
          expect(continentPerformanceComponent.exists()).toBe(total > 0)

          wrapper.unmount()
        }
      ),
      { numRuns: 100 }
    )
  })
})
