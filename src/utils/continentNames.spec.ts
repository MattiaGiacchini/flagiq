import { describe, it, expect } from 'vitest'
import { continentName } from './continentNames'
import type { Continent } from '@/types/session'

describe('continentName', () => {
  describe('English locale', () => {
    it('returns "Europe" for europe continent', () => {
      expect(continentName('europe', 'en')).toBe('Europe')
    })

    it('returns "Asia" for asia continent', () => {
      expect(continentName('asia', 'en')).toBe('Asia')
    })

    it('returns "Americas" for americas continent', () => {
      expect(continentName('americas', 'en')).toBe('Americas')
    })

    it('returns "Africa" for africa continent', () => {
      expect(continentName('africa', 'en')).toBe('Africa')
    })

    it('returns "Oceania" for oceania continent', () => {
      expect(continentName('oceania', 'en')).toBe('Oceania')
    })
  })

  describe('Spanish locale', () => {
    it('returns "Europa" for europe continent', () => {
      expect(continentName('europe', 'es')).toBe('Europa')
    })

    it('returns "Asia" for asia continent', () => {
      expect(continentName('asia', 'es')).toBe('Asia')
    })

    it('returns "Américas" for americas continent', () => {
      expect(continentName('americas', 'es')).toBe('Américas')
    })

    it('returns "África" for africa continent', () => {
      expect(continentName('africa', 'es')).toBe('África')
    })

    it('returns "Oceanía" for oceania continent', () => {
      expect(continentName('oceania', 'es')).toBe('Oceanía')
    })
  })

  describe('all continents', () => {
    it('returns correct name for all 5 continents in English', () => {
      const continents: Continent[] = ['europe', 'asia', 'americas', 'africa', 'oceania']
      const expectedNames = ['Europe', 'Asia', 'Americas', 'Africa', 'Oceania']
      
      continents.forEach((continent, index) => {
        expect(continentName(continent, 'en')).toBe(expectedNames[index])
      })
    })

    it('returns correct name for all 5 continents in Spanish', () => {
      const continents: Continent[] = ['europe', 'asia', 'americas', 'africa', 'oceania']
      const expectedNames = ['Europa', 'Asia', 'Américas', 'África', 'Oceanía']
      
      continents.forEach((continent, index) => {
        expect(continentName(continent, 'es')).toBe(expectedNames[index])
      })
    })
  })
})
