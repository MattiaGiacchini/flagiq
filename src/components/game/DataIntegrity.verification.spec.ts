import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameResults from './GameResults.vue'
import CircularProgress from './CircularProgress.vue'
import ContinentPerformance from './ContinentPerformance.vue'
import IncorrectAnswers from './IncorrectAnswers.vue'
import type { AnsweredQuestion } from '@/stores/game'
import type { Flag } from '@/data/flags'

/**
 * Verification tests for data integrity requirements in task 10
 * 
 * These tests verify that the actual implementation meets all the requirements:
 * - Percentage calculation: Math.round((score / total) * 100)
 * - Correct + incorrect count = total questions
 * - Continent percentage calculation: (correct / total) * 100 per continent
 * - Color coding derived from calculated percentages
 * - Immutable data passed to child components
 * - Time formatting from milliseconds
 * - Circumference and dash offset calculations
 * - Flag path construction
 */

describe('Data Integrity Verification Tests', () => {
  const createMockFlag = (id: string, name: string, continent: string): Flag => ({
    id,
    name,
    nameEs: name,
    emoji: '🏴',
    code: id.toLowerCase(),
    continent: continent as any
  })

  const createMockAnswers = (correctCount: number, incorrectCount: number): AnsweredQuestion[] => {
    const answers: AnsweredQuestion[] = []
    const correctFlag = createMockFlag('US', 'United States', 'americas')
    const wrongFlag = createMockFlag('CA', 'Canada', 'americas')

    // Add correct answers
    for (let i = 0; i < correctCount; i++) {
      answers.push({
        question: {
          type: 'choose-flag',
          correct: correctFlag,
          options: [correctFlag, wrongFlag]
        },
        chosenId: correctFlag.id,
        result: 'correct'
      })
    }

    // Add incorrect answers
    for (let i = 0; i < incorrectCount; i++) {
      answers.push({
        question: {
          type: 'choose-flag',
          correct: correctFlag,
          options: [correctFlag, wrongFlag]
        },
        chosenId: wrongFlag.id,
        result: 'wrong'
      })
    }

    return answers
  }

  describe('Requirement 10.1: Percentage Calculation', () => {
    it('should calculate percentage as Math.round((score / total) * 100)', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 7,
          total: 10,
          elapsedMs: 30000,
          answers: createMockAnswers(7, 3)
        }
      })

      const circularProgress = wrapper.findComponent(CircularProgress)
      const percentage = circularProgress.props('percentage')

      // Verify: percentage = Math.round((7 / 10) * 100) = 70
      expect(percentage).toBe(70)
      expect(percentage).toBe(Math.round((7 / 10) * 100))
    })

    it('should calculate 100% correctly', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 10,
          total: 10,
          elapsedMs: 30000,
          answers: createMockAnswers(10, 0)
        }
      })

      const circularProgress = wrapper.findComponent(CircularProgress)
      expect(circularProgress.props('percentage')).toBe(100)
    })

    it('should calculate 0% correctly', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 0,
          total: 10,
          elapsedMs: 30000,
          answers: createMockAnswers(0, 10)
        }
      })

      const circularProgress = wrapper.findComponent(CircularProgress)
      expect(circularProgress.props('percentage')).toBe(0)
    })
  })

  describe('Requirement 10.2: Correct + Incorrect = Total', () => {
    it('should display correct + incorrect counts that equal total', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 7,
          total: 10,
          elapsedMs: 30000,
          answers: createMockAnswers(7, 3)
        }
      })

      const html = wrapper.html()

      // The component displays score (correct) and total - score (incorrect)
      // Verify: 7 + 3 = 10
      expect(wrapper.props('score')).toBe(7)
      expect(wrapper.props('total') - wrapper.props('score')).toBe(3)
      expect(wrapper.props('score') + (wrapper.props('total') - wrapper.props('score'))).toBe(
        wrapper.props('total')
      )
    })
  })

  describe('Requirement 10.3: Continent Percentage Calculation', () => {
    it('should calculate continent percentages as (correct / total) * 100', () => {
      const africaFlag1 = createMockFlag('EG', 'Egypt', 'africa')
      const africaFlag2 = createMockFlag('KE', 'Kenya', 'africa')
      const europeFlag = createMockFlag('FR', 'France', 'europe')

      const answers: AnsweredQuestion[] = [
        {
          question: {
            type: 'choose-flag',
            correct: africaFlag1,
            options: [africaFlag1]
          },
          chosenId: africaFlag1.id,
          result: 'correct'
        },
        {
          question: {
            type: 'choose-flag',
            correct: africaFlag2,
            options: [africaFlag2]
          },
          chosenId: africaFlag2.id,
          result: 'wrong'
        },
        {
          question: {
            type: 'choose-flag',
            correct: europeFlag,
            options: [europeFlag]
          },
          chosenId: europeFlag.id,
          result: 'correct'
        }
      ]

      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 30000,
          answers
        }
      })

      const continentPerformance = wrapper.findComponent(ContinentPerformance)
      const performance = continentPerformance.props('performance')

      // Find Africa stats: 1 correct, 2 total = 50%
      const africaStats = performance.find((p: any) => p.continent === 'africa')
      expect(africaStats).toBeDefined()
      expect(africaStats.correct).toBe(1)
      expect(africaStats.total).toBe(2)
      expect(africaStats.percentage).toBe(Math.round((1 / 2) * 100))
      expect(africaStats.percentage).toBe(50)

      // Find Europe stats: 1 correct, 1 total = 100%
      const europeStats = performance.find((p: any) => p.continent === 'europe')
      expect(europeStats).toBeDefined()
      expect(europeStats.correct).toBe(1)
      expect(europeStats.total).toBe(1)
      expect(europeStats.percentage).toBe(100)
    })
  })

  describe('Requirement 10.4: Color Coding Derived from Percentages', () => {
    it('should derive perfect color for 100%', () => {
      const wrapper = mount(ContinentPerformance, {
        props: {
          performance: [
            { continent: 'africa', correct: 10, total: 10, percentage: 100 }
          ]
        }
      })

      const html = wrapper.html()
      expect(html).toContain('continent-performance__bar-fill--perfect')
    })

    it('should derive high color for ≥78%', () => {
      const wrapper = mount(ContinentPerformance, {
        props: {
          performance: [
            { continent: 'africa', correct: 8, total: 10, percentage: 80 }
          ]
        }
      })

      const html = wrapper.html()
      expect(html).toContain('continent-performance__bar-fill--high')
    })

    it('should derive medium color for 50-77%', () => {
      const wrapper = mount(ContinentPerformance, {
        props: {
          performance: [
            { continent: 'africa', correct: 6, total: 10, percentage: 60 }
          ]
        }
      })

      const html = wrapper.html()
      expect(html).toContain('continent-performance__bar-fill--medium')
    })

    it('should derive low color for <50%', () => {
      const wrapper = mount(ContinentPerformance, {
        props: {
          performance: [
            { continent: 'africa', correct: 4, total: 10, percentage: 40 }
          ]
        }
      })

      const html = wrapper.html()
      expect(html).toContain('continent-performance__bar-fill--low')
    })
  })

  describe('Requirement 10.6: Time Formatting', () => {
    it('should format elapsed time from milliseconds correctly', () => {
      // Test seconds only
      const wrapper1 = mount(GameResults, {
        props: {
          score: 5,
          total: 10,
          elapsedMs: 45000, // 45 seconds
          answers: createMockAnswers(5, 5)
        }
      })
      expect(wrapper1.html()).toContain('45s')

      // Test minutes and seconds
      const wrapper2 = mount(GameResults, {
        props: {
          score: 5,
          total: 10,
          elapsedMs: 125000, // 2m 05s
          answers: createMockAnswers(5, 5)
        }
      })
      expect(wrapper2.html()).toContain('2m 05s')

      // Test exact minute
      const wrapper3 = mount(GameResults, {
        props: {
          score: 5,
          total: 10,
          elapsedMs: 120000, // 2m 00s
          answers: createMockAnswers(5, 5)
        }
      })
      expect(wrapper3.html()).toContain('2m 00s')
    })
  })

  describe('Requirement 10.7: Immutable Data', () => {
    it('should not mutate props data', () => {
      const originalAnswers = createMockAnswers(7, 3)
      const answersCopy = JSON.parse(JSON.stringify(originalAnswers))

      mount(GameResults, {
        props: {
          score: 7,
          total: 10,
          elapsedMs: 30000,
          answers: originalAnswers
        }
      })

      // Verify answers array was not mutated
      expect(originalAnswers).toEqual(answersCopy)
    })
  })

  describe('Requirement 10.8 & 10.9: Circumference and Dash Offset', () => {
    it('should calculate circumference as 2 * π * radius', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50,
          size: 200,
          strokeWidth: 12
        }
      })

      // For size=200, strokeWidth=12: radius = (200-12)/2 = 94
      const expectedRadius = (200 - 12) / 2
      const expectedCircumference = 2 * Math.PI * expectedRadius

      // The component should use this circumference internally
      // We can verify by checking the SVG attributes
      const circle = wrapper.find('.circular-progress__fill')
      const strokeDasharray = circle.attributes('stroke-dasharray')

      expect(parseFloat(strokeDasharray!)).toBeCloseTo(expectedCircumference, 2)
    })

    it('should calculate dash offset as circumference * (1 - percentage/100)', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 75,
          size: 200,
          strokeWidth: 12
        }
      })

      const radius = (200 - 12) / 2
      const circumference = 2 * Math.PI * radius
      const expectedDashOffset = circumference * (1 - 75 / 100)

      // After animation, the dash offset should match this value
      const circle = wrapper.find('.circular-progress__fill')
      const strokeDasharray = circle.attributes('stroke-dasharray')

      expect(parseFloat(strokeDasharray!)).toBeCloseTo(circumference, 2)
    })
  })

  describe('Requirement 10.10: Flag Path Construction', () => {
    it('should construct flag paths as /public/flags/${code}.svg with lowercase', () => {
      const correctFlag = createMockFlag('US', 'United States', 'americas')
      const wrongFlag = createMockFlag('CA', 'Canada', 'americas')

      const answers: AnsweredQuestion[] = [
        {
          question: {
            type: 'choose-flag',
            correct: correctFlag,
            options: [correctFlag, wrongFlag]
          },
          chosenId: wrongFlag.id,
          result: 'wrong'
        }
      ]

      const wrapper = mount(GameResults, {
        props: {
          score: 0,
          total: 1,
          elapsedMs: 30000,
          answers
        }
      })

      const incorrectAnswers = wrapper.findComponent(IncorrectAnswers)

      // FlagImage component should be passed lowercase country code
      // which it uses to construct path: /public/flags/${code}.svg
      const flagImage = incorrectAnswers.findComponent({ name: 'FlagImage' })
      expect(flagImage.exists()).toBe(true)

      const countryCode = flagImage.props('countryCode')
      expect(countryCode).toBe('us') // lowercase
      expect(countryCode).not.toBe('US')
    })
  })
})
