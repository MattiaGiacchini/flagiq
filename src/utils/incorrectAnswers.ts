import type { AnsweredQuestion } from '@/stores/game'
import type { Flag } from '@/data/flags'
import type { Continent } from '@/types/session'

export interface IncorrectAnswer {
  correctFlag: Flag
  chosenFlag: Flag
  continent: Continent
}

/**
 * Extracts incorrect answers from a list of answered questions.
 * 
 * @param answers - Array of answered questions from the game session
 * @param flags - Array of all flags for lookup by ID
 * @returns Array of incorrect answers with correct flag, chosen flag, and continent
 */
export function extractIncorrectAnswers(
  answers: AnsweredQuestion[],
  flags: Flag[]
): IncorrectAnswer[] {
  // Filter for wrong answers only
  const wrongAnswers = answers.filter(a => a.result === 'wrong')
  
  // Map to the desired structure
  return wrongAnswers.map(answer => {
    const correctFlag = answer.question.correct
    const chosenFlag = flags.find(f => f.id === answer.chosenId)
    
    // This should never happen in practice, but handle it defensively
    if (!chosenFlag) {
      throw new Error(`Flag with ID ${answer.chosenId} not found`)
    }
    
    return {
      correctFlag,
      chosenFlag,
      continent: correctFlag.continent
    }
  })
}
