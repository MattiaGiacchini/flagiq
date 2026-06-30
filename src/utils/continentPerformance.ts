import type { AnsweredQuestion } from '@/stores/game'
import type { Continent } from '@/types/session'

export interface ContinentStats {
  continent: Continent
  correct: number
  total: number
  percentage: number
}

/**
 * Calculates performance statistics grouped by continent.
 * 
 * For each continent that appears in the answered questions:
 * - Counts total questions for that continent
 * - Counts correct answers for that continent
 * - Calculates percentage (rounded to nearest integer)
 * 
 * Results are sorted alphabetically by continent name.
 * 
 * @param answers - Array of answered questions from a game session
 * @returns Array of continent statistics, sorted alphabetically
 */
export function calculateContinentPerformance(answers: AnsweredQuestion[]): ContinentStats[] {
  const statsByContinent = new Map<Continent, { correct: number; total: number }>()

  for (const answer of answers) {
    const continent = answer.question.correct.continent
    const stats = statsByContinent.get(continent) ?? { correct: 0, total: 0 }

    stats.total++
    if (answer.result === 'correct') {
      stats.correct++
    }

    statsByContinent.set(continent, stats)
  }

  return Array.from(statsByContinent.entries())
    .map(([continent, stats]) => ({
      continent,
      correct: stats.correct,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100),
    }))
    .sort((a, b) => a.continent.localeCompare(b.continent))
}
