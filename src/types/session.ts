export type Continent = 'europe' | 'asia' | 'americas' | 'africa' | 'oceania'

export type GameMode = 'type-it' | 'choose-flag' | 'find-on-map' | 'name-it'

export type QuestionCount = 10 | 25 | 50 | 'all'

export interface SessionConfig {
  continents: Continent[]    // min 1, max 5 — never empty
  mode: GameMode
  count: QuestionCount
  blitz: boolean
  useSimilarity?: boolean    // default false — enable similarity-based distractor selection
}

export const ALL_CONTINENTS: Continent[] = [
  'europe', 'asia', 'americas', 'africa', 'oceania',
]

export const VALID_COUNTS: QuestionCount[] = ['all', 10, 25, 50]

export const VALID_MODES: GameMode[] = [
  'type-it', 'choose-flag', 'find-on-map', 'name-it',
]

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  continents: [...ALL_CONTINENTS],
  mode: 'name-it',
  count: 'all',
  blitz: false,
}
