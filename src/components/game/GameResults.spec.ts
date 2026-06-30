import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameResults from './GameResults.vue'
import type { AnsweredQuestion } from '@/stores/game'
import { FLAGS } from '@/data/flags'

describe('GameResults.vue - Task 4.1', () => {
  it('computes incorrectAnswers correctly', () => {
    const answers: AnsweredQuestion[] = [
      {
        question: {
          correct: FLAGS[0]!, // First flag (Albania)
          options: [FLAGS[0]!, FLAGS[1]!, FLAGS[2]!, FLAGS[3]!],
        },
        chosenId: FLAGS[1]!.id, // Wrong answer
        result: 'wrong',
      },
      {
        question: {
          correct: FLAGS[2]!, // Third flag
          options: [FLAGS[0]!, FLAGS[1]!, FLAGS[2]!, FLAGS[3]!],
        },
        chosenId: FLAGS[2]!.id, // Correct answer
        result: 'correct',
      },
    ]

    const wrapper = mount(GameResults, {
      props: {
        score: 1,
        total: 2,
        elapsedMs: 10000,
        answers,
        locale: 'en',
      },
    })

    // Access the computed property through the component instance
    const incorrectAnswers = (wrapper.vm as any).incorrectAnswers
    expect(incorrectAnswers).toHaveLength(1)
    expect(incorrectAnswers[0].correctFlag.id).toBe(FLAGS[0]!.id)
    expect(incorrectAnswers[0].chosenFlag.id).toBe(FLAGS[1]!.id)
  })

  it('computes continentPerformance correctly', () => {
    const answers: AnsweredQuestion[] = [
      {
        question: {
          correct: FLAGS[0]!, // Europe
          options: [FLAGS[0]!, FLAGS[1]!, FLAGS[2]!, FLAGS[3]!],
        },
        chosenId: FLAGS[0]!.id,
        result: 'correct',
      },
      {
        question: {
          correct: FLAGS[1]!, // Europe
          options: [FLAGS[0]!, FLAGS[1]!, FLAGS[2]!, FLAGS[3]!],
        },
        chosenId: FLAGS[2]!.id, // Wrong
        result: 'wrong',
      },
    ]

    const wrapper = mount(GameResults, {
      props: {
        score: 1,
        total: 2,
        elapsedMs: 10000,
        answers,
        locale: 'en',
      },
    })

    // Access the computed property through the component instance
    const continentPerformance = (wrapper.vm as any).continentPerformance
    expect(continentPerformance).toHaveLength(1)
    expect(continentPerformance[0].continent).toBe('europe')
    expect(continentPerformance[0].correct).toBe(1)
    expect(continentPerformance[0].total).toBe(2)
    expect(continentPerformance[0].percentage).toBe(50)
  })

  it('maintains existing computed properties', () => {
    const answers: AnsweredQuestion[] = []

    const wrapper = mount(GameResults, {
      props: {
        score: 8,
        total: 10,
        elapsedMs: 65000, // 1m 5s
        answers,
        locale: 'en',
      },
    })

    // Access computed properties
    const percentage = (wrapper.vm as any).percentage
    const message = (wrapper.vm as any).message
    const formattedTime = (wrapper.vm as any).formattedTime

    expect(percentage).toBe(80)
    expect(message).toBe('Great job! 🎉')
    expect(formattedTime).toBe('1m 05s')
  })

  it('handles formattedTime for short durations', () => {
    const answers: AnsweredQuestion[] = []

    const wrapper = mount(GameResults, {
      props: {
        score: 5,
        total: 10,
        elapsedMs: 45000, // 45s
        answers,
        locale: 'en',
      },
    })

    const formattedTime = (wrapper.vm as any).formattedTime
    expect(formattedTime).toBe('45s')
  })
})
