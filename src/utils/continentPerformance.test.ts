import { describe, it, expect } from 'vitest'
import { calculateContinentPerformance } from './continentPerformance'
import type { AnsweredQuestion } from '@/stores/game'
import type { Question } from '@/stores/game'
import type { Flag } from '@/data/flags'

// Helper function to create test flags
function createFlag(id: string, continent: Flag['continent']): Flag {
  return {
    id,
    name: `Country ${id}`,
    nameEs: `País ${id}`,
    continent,
    emoji: '🏴',
  }
}

// Helper function to create test questions
function createQuestion(correctFlag: Flag): Question {
  return {
    correct: correctFlag,
    options: [correctFlag],
  }
}

describe('calculateContinentPerformance', () => {
  it('calculates stats correctly for single continent with mixed performance', () => {
    const europeFlag1 = createFlag('DE', 'europe')
    const europeFlag2 = createFlag('FR', 'europe')

    const answers: AnsweredQuestion[] = [
      { question: createQuestion(europeFlag1), chosenId: 'DE', result: 'correct' },
      { question: createQuestion(europeFlag2), chosenId: 'XX', result: 'wrong' },
    ]

    const stats = calculateContinentPerformance(answers)

    expect(stats).toHaveLength(1)
    expect(stats[0]).toEqual({
      continent: 'europe',
      correct: 1,
      total: 2,
      percentage: 50,
    })
  })

  it('calculates stats correctly for multiple continents', () => {
    const europeFlag1 = createFlag('DE', 'europe')
    const europeFlag2 = createFlag('FR', 'europe')
    const asiaFlag1 = createFlag('JP', 'asia')
    const africaFlag1 = createFlag('EG', 'africa')

    const answers: AnsweredQuestion[] = [
      { question: createQuestion(europeFlag1), chosenId: 'DE', result: 'correct' },
      { question: createQuestion(europeFlag2), chosenId: 'XX', result: 'wrong' },
      { question: createQuestion(asiaFlag1), chosenId: 'JP', result: 'correct' },
      { question: createQuestion(africaFlag1), chosenId: 'EG', result: 'correct' },
    ]

    const stats = calculateContinentPerformance(answers)

    expect(stats).toHaveLength(3)

    // Verify sorting (alphabetical: africa, asia, europe)
    expect(stats[0]?.continent).toBe('africa')
    expect(stats[1]?.continent).toBe('asia')
    expect(stats[2]?.continent).toBe('europe')

    // Verify calculations
    expect(stats[0]).toEqual({
      continent: 'africa',
      correct: 1,
      total: 1,
      percentage: 100,
    })
    expect(stats[1]).toEqual({
      continent: 'asia',
      correct: 1,
      total: 1,
      percentage: 100,
    })
    expect(stats[2]).toEqual({
      continent: 'europe',
      correct: 1,
      total: 2,
      percentage: 50,
    })
  })

  it('handles all correct answers', () => {
    const europeFlag1 = createFlag('DE', 'europe')
    const europeFlag2 = createFlag('FR', 'europe')

    const answers: AnsweredQuestion[] = [
      { question: createQuestion(europeFlag1), chosenId: 'DE', result: 'correct' },
      { question: createQuestion(europeFlag2), chosenId: 'FR', result: 'correct' },
    ]

    const stats = calculateContinentPerformance(answers)

    expect(stats).toHaveLength(1)
    expect(stats[0]).toEqual({
      continent: 'europe',
      correct: 2,
      total: 2,
      percentage: 100,
    })
  })

  it('handles all wrong answers', () => {
    const europeFlag1 = createFlag('DE', 'europe')
    const europeFlag2 = createFlag('FR', 'europe')

    const answers: AnsweredQuestion[] = [
      { question: createQuestion(europeFlag1), chosenId: 'XX', result: 'wrong' },
      { question: createQuestion(europeFlag2), chosenId: 'YY', result: 'wrong' },
    ]

    const stats = calculateContinentPerformance(answers)

    expect(stats).toHaveLength(1)
    expect(stats[0]).toEqual({
      continent: 'europe',
      correct: 0,
      total: 2,
      percentage: 0,
    })
  })

  it('rounds percentage correctly', () => {
    const europeFlag1 = createFlag('DE', 'europe')
    const europeFlag2 = createFlag('FR', 'europe')
    const europeFlag3 = createFlag('IT', 'europe')

    const answers: AnsweredQuestion[] = [
      { question: createQuestion(europeFlag1), chosenId: 'DE', result: 'correct' },
      { question: createQuestion(europeFlag2), chosenId: 'XX', result: 'wrong' },
      { question: createQuestion(europeFlag3), chosenId: 'XX', result: 'wrong' },
    ]

    const stats = calculateContinentPerformance(answers)

    expect(stats[0]?.percentage).toBe(33) // 1/3 = 0.333... -> rounds to 33
  })

  it('returns empty array for no answers', () => {
    const stats = calculateContinentPerformance([])

    expect(stats).toEqual([])
  })

  it('sorts continents alphabetically', () => {
    const oceaniaFlag = createFlag('AU', 'oceania')
    const africaFlag = createFlag('EG', 'africa')
    const americasFlag = createFlag('US', 'americas')

    const answers: AnsweredQuestion[] = [
      { question: createQuestion(oceaniaFlag), chosenId: 'AU', result: 'correct' },
      { question: createQuestion(africaFlag), chosenId: 'EG', result: 'correct' },
      { question: createQuestion(americasFlag), chosenId: 'US', result: 'correct' },
    ]

    const stats = calculateContinentPerformance(answers)

    // Expected order: africa, americas, oceania
    expect(stats.map(s => s.continent)).toEqual(['africa', 'americas', 'oceania'])
  })
})
