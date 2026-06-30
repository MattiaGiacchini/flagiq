import { describe, it, expect } from 'vitest'
import { VALID_COUNTS, DEFAULT_SESSION_CONFIG, ALL_CONTINENTS } from './session'

describe('Session Type Constants - Task 1.1 Verification', () => {
  describe('VALID_COUNTS array order', () => {
    it('should have "all" as the first element', () => {
      expect(VALID_COUNTS[0]).toBe('all')
    })

    it('should maintain the order: ["all", 10, 25, 50]', () => {
      expect(VALID_COUNTS).toEqual(['all', 10, 25, 50])
    })

    it('should have exactly 4 elements', () => {
      expect(VALID_COUNTS).toHaveLength(4)
    })
  })

  describe('DEFAULT_SESSION_CONFIG', () => {
    it('should have count set to "all"', () => {
      expect(DEFAULT_SESSION_CONFIG.count).toBe('all')
    })

    it('should have all continents selected', () => {
      expect(DEFAULT_SESSION_CONFIG.continents).toEqual(ALL_CONTINENTS)
    })

    it('should have mode set to "name-it"', () => {
      expect(DEFAULT_SESSION_CONFIG.mode).toBe('name-it')
    })

    it('should have blitz disabled by default', () => {
      expect(DEFAULT_SESSION_CONFIG.blitz).toBe(false)
    })
  })
})
