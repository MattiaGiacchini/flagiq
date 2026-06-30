import { ALL_CONTINENTS, VALID_COUNTS, VALID_MODES } from '@/types/session'
import type { SessionConfig } from '@/types/session'

export function isValidSessionConfig(config: unknown): config is SessionConfig {
  if (!config || typeof config !== 'object') return false
  const c = config as SessionConfig
  return (
    Array.isArray(c.continents) &&
    c.continents.length >= 1 &&
    c.continents.every(x => ALL_CONTINENTS.includes(x)) &&
    VALID_MODES.includes(c.mode) &&
    VALID_COUNTS.includes(c.count) &&
    typeof c.blitz === 'boolean' &&
    (c.useSimilarity === undefined || typeof c.useSimilarity === 'boolean')
  )
}
