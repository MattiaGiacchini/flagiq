import { describe, it, expect } from 'vitest'
import { extractIncorrectAnswers } from './incorrectAnswers'
import type { AnsweredQuestion } from '@/stores/game'
import type { Flag } from '@/data/flags'

describe('extractIncorrectAnswers', () => {
  const mockFlags: Flag[] = [
    { id: 'DE', name: 'Germany', nameEs: 'Alemania', continent: 'europe', emoji: '🇩🇪' },
    { id: 'FR', name: 'France', nameEs: 'Francia', continent: 'europe', emoji: '🇫🇷' },
    { id: 'IT', name: 'Italy', nameEs: 'Italia', continent: 'europe', emoji: '🇮🇹' },
    { id: 'JP', name: 'Japan', nameEs: 'Japón', continent: 'asia', emoji: '🇯🇵' },
  ]

  it('should return empty array when no wrong answers', () => {
    const answers: AnsweredQuestion[] = [
      {
        question: {
          correct: mockFlags[0]!,
          options: [mockFlags[0]!, mockFlags[1]!, mockFlags[2]!, mockFlags[3]!]
        },
        chosenId: 'DE',
        result: 'correct'
      }
    ]

    const result = extractIncorrectAnswers(answers, mockFlags)
    expect(result).toEqual([])
  })

  it('should extract single incorrect answer', () => {
    const answers: AnsweredQuestion[] = [
      {
        question: {
          correct: mockFlags[0]!, // Germany
          options: [mockFlags[0]!, mockFlags[1]!, mockFlags[2]!, mockFlags[3]!]
        },
        chosenId: 'FR', // Chose France
        result: 'wrong'
      }
    ]

    const result = extractIncorrectAnswers(answers, mockFlags)
    
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      correctFlag: mockFlags[0],
      chosenFlag: mockFlags[1],
      continent: 'europe'
    })
  })

  it('should extract multiple incorrect answers', () => {
    const answers: AnsweredQuestion[] = [
      {
        question: {
          correct: mockFlags[0]!, // Germany
          options: [mockFlags[0]!, mockFlags[1]!, mockFlags[2]!, mockFlags[3]!]
        },
        chosenId: 'FR', // Chose France
        result: 'wrong'
      },
      {
        question: {
          correct: mockFlags[3]!, // Japan
          options: [mockFlags[0]!, mockFlags[1]!, mockFlags[2]!, mockFlags[3]!]
        },
        chosenId: 'IT', // Chose Italy
        result: 'wrong'
      }
    ]

    const result = extractIncorrectAnswers(answers, mockFlags)
    
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      correctFlag: mockFlags[0],
      chosenFlag: mockFlags[1],
      continent: 'europe'
    })
    expect(result[1]).toEqual({
      correctFlag: mockFlags[3],
      chosenFlag: mockFlags[2],
      continent: 'asia'
    })
  })

  it('should filter out correct answers from mixed results', () => {
    const answers: AnsweredQuestion[] = [
      {
        question: {
          correct: mockFlags[0]!, // Germany
          options: [mockFlags[0]!, mockFlags[1]!, mockFlags[2]!, mockFlags[3]!]
        },
        chosenId: 'DE', // Correct
        result: 'correct'
      },
      {
        question: {
          correct: mockFlags[1]!, // France
          options: [mockFlags[0]!, mockFlags[1]!, mockFlags[2]!, mockFlags[3]!]
        },
        chosenId: 'IT', // Wrong
        result: 'wrong'
      },
      {
        question: {
          correct: mockFlags[3]!, // Japan
          options: [mockFlags[0]!, mockFlags[1]!, mockFlags[2]!, mockFlags[3]!]
        },
        chosenId: 'JP', // Correct
        result: 'correct'
      }
    ]

    const result = extractIncorrectAnswers(answers, mockFlags)
    
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      correctFlag: mockFlags[1],
      chosenFlag: mockFlags[2],
      continent: 'europe'
    })
  })

  it('should throw error when chosen flag is not found', () => {
    const answers: AnsweredQuestion[] = [
      {
        question: {
          correct: mockFlags[0]!,
          options: [mockFlags[0]!, mockFlags[1]!, mockFlags[2]!, mockFlags[3]!]
        },
        chosenId: 'XX', // Non-existent flag
        result: 'wrong'
      }
    ]

    expect(() => extractIncorrectAnswers(answers, mockFlags)).toThrow(
      'Flag with ID XX not found'
    )
  })
})
