import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { FLAGS as _FLAGS, flagsByContinent } from '@/data/flags'
import type { Flag } from '@/data/flags'
import type { SessionConfig } from '@/types/session'

export interface Question {
  correct: Flag
  options: Flag[]   // always 4, correct included, shuffled
}

export type QuestionResult = 'unanswered' | 'correct' | 'wrong'

export interface AnsweredQuestion {
  question: Question
  chosenId: string
  result: QuestionResult
  hintUsed?: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i] as T
    a[i] = a[j] as T
    a[j] = tmp
  }
  return a
}

function pickDistractors(pool: Flag[], correct: Flag, n: number): Flag[] {
  const candidates = pool.filter(f => f.id !== correct.id)
  return shuffle(candidates).slice(0, n)
}

function buildQuestions(config: SessionConfig): Question[] {
  const pool = flagsByContinent(config.continents)
  if (pool.length < 4) return []

  const limit = config.count === 'all' ? pool.length : Math.min(config.count, pool.length)
  const picked = shuffle(pool).slice(0, limit)

  return picked.map(correct => {
    const distractors = pickDistractors(pool, correct, 3)
    const options = shuffle([correct, ...distractors])
    return { correct, options }
  })
}

export const useGameStore = defineStore('game', () => {
  const questions = ref<Question[]>([])
  const answers = ref<AnsweredQuestion[]>([])
  const currentIndex = ref(0)
  const isActive = ref(false)

  // Timer
  const startedAt = ref<number | null>(null)
  const finishedAt = ref<number | null>(null)

  const currentQuestion = computed<Question | null>(
    () => questions.value[currentIndex.value] ?? null,
  )

  const totalQuestions = computed(() => questions.value.length)

  const score = computed(() =>
    answers.value.filter(a => a.result === 'correct').length,
  )

  const streak = computed(() => {
    let s = 0
    for (let i = answers.value.length - 1; i >= 0; i--) {
      const a = answers.value[i]
      if (a && a.result === 'correct') s++
      else break
    }
    return s
  })

  const isFinished = computed(
    () => isActive.value && currentIndex.value >= questions.value.length,
  )

  const elapsedMs = computed(() => {
    if (!startedAt.value) return 0
    const end = finishedAt.value ?? Date.now()
    return end - startedAt.value
  })

  function startGame(config: SessionConfig) {
    questions.value = buildQuestions(config)
    answers.value = []
    currentIndex.value = 0
    isActive.value = true
    startedAt.value = Date.now()
    finishedAt.value = null
  }

  function answer(chosenId: string, hintUsed?: boolean): QuestionResult {
    const q = currentQuestion.value
    if (!q) return 'unanswered'

    const result: QuestionResult = chosenId === q.correct.id ? 'correct' : 'wrong'
    answers.value.push({ question: q, chosenId, result, hintUsed })
    currentIndex.value++

    // Mark finish time when the last question is answered
    if (currentIndex.value >= questions.value.length) {
      finishedAt.value = Date.now()
    }

    return result
  }

  function reset() {
    questions.value = []
    answers.value = []
    currentIndex.value = 0
    isActive.value = false
    startedAt.value = null
    finishedAt.value = null
  }

  return {
    questions,
    answers,
    currentIndex,
    isActive,
    startedAt,
    finishedAt,
    elapsedMs,
    currentQuestion,
    totalQuestions,
    score,
    streak,
    isFinished,
    startGame,
    answer,
    reset,
  }
})
