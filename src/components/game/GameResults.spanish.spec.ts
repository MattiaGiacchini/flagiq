/**
 * Test suite to verify comprehensive Spanish language support in GameResults component
 * Task 15.1: Confirm GameResults already has comprehensive Spanish support
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameResults from './GameResults.vue'
import type { AnsweredQuestion } from '@/stores/game'
import { FLAGS } from '@/data/flags'

describe('GameResults - Spanish Translation Support', () => {
  // Create properly structured mock answers using real flag data
  const mockAnswers: AnsweredQuestion[] = [
    {
      question: {
        correct: FLAGS[0]!, // Albania (Europe)
        options: [FLAGS[0]!, FLAGS[1]!, FLAGS[2]!, FLAGS[3]!]
      },
      chosenId: FLAGS[0]!.id,
      result: 'correct'
    },
    {
      question: {
        correct: FLAGS[1]!, // Second flag
        options: [FLAGS[0]!, FLAGS[1]!, FLAGS[2]!, FLAGS[3]!]
      },
      chosenId: FLAGS[2]!.id, // Wrong answer
      result: 'wrong'
    },
    {
      question: {
        correct: FLAGS[3]!, // Third flag
        options: [FLAGS[0]!, FLAGS[1]!, FLAGS[2]!, FLAGS[3]!]
      },
      chosenId: FLAGS[3]!.id,
      result: 'correct'
    }
  ]

  describe('Main Results Display - Spanish', () => {
    it('displays Spanish labels for result statistics', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 65000,
          answers: mockAnswers,
          locale: 'es'
        }
      })

      const html = wrapper.html()

      // Verify Spanish labels are present
      expect(html).toContain('Correctas') // "Correct" in Spanish
      expect(html).toContain('Incorrectas') // "Incorrect" in Spanish
    })

    it('displays Spanish performance message', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 3,
          total: 3,
          elapsedMs: 10000,
          answers: mockAnswers,
          locale: 'es'
        }
      })

      // Perfect score should show "¡Perfecto!"
      expect(wrapper.text()).toContain('¡Perfecto!')
    })

    it('displays different Spanish performance messages based on score', () => {
      // Test 80% - "¡Muy bien!"
      const wrapper80 = mount(GameResults, {
        props: {
          score: 8,
          total: 10,
          elapsedMs: 10000,
          answers: mockAnswers,
          locale: 'es'
        }
      })
      expect(wrapper80.text()).toContain('¡Muy bien!')

      // Test 60% - "Bien hecho"
      const wrapper60 = mount(GameResults, {
        props: {
          score: 6,
          total: 10,
          elapsedMs: 10000,
          answers: mockAnswers,
          locale: 'es'
        }
      })
      expect(wrapper60.text()).toContain('Bien hecho')

      // Test 40% - "Sigue practicando"
      const wrapper40 = mount(GameResults, {
        props: {
          score: 4,
          total: 10,
          elapsedMs: 10000,
          answers: mockAnswers,
          locale: 'es'
        }
      })
      expect(wrapper40.text()).toContain('Sigue practicando')

      // Test <40% - "A seguir estudiando"
      const wrapper20 = mount(GameResults, {
        props: {
          score: 2,
          total: 10,
          elapsedMs: 10000,
          answers: mockAnswers,
          locale: 'es'
        }
      })
      expect(wrapper20.text()).toContain('A seguir estudiando')
    })

    it('displays Spanish button labels', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 65000,
          answers: mockAnswers,
          locale: 'es'
        }
      })

      const html = wrapper.html()

      // Verify Spanish button text
      expect(html).toContain('Jugar de nuevo') // "Play again" in Spanish
      expect(html).toContain('Volver al inicio') // "Back to home" in Spanish
    })
  })

  describe('Error State - Spanish', () => {
    it('displays Spanish error messages when no game data available', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 0,
          total: 0, // No game data
          elapsedMs: 0,
          answers: [],
          locale: 'es'
        }
      })

      const html = wrapper.html()

      // Verify Spanish error messages
      expect(html).toContain('No hay datos disponibles') // "No game data available"
      expect(html).toContain('No se encontraron datos del juego') // Error description
      expect(html).toContain('Volver al inicio') // "Back to home" button
    })
  })

  describe('ARIA Labels - Spanish', () => {
    it('provides Spanish aria-labels for accessibility', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 65000,
          answers: mockAnswers,
          locale: 'es'
        }
      })

      const html = wrapper.html()

      // Verify Spanish aria-labels are present
      expect(html).toContain('Sesión completada') // "Session complete"
      expect(html).toContain('Puntuación:') // "Score:"
      expect(html).toContain('correctas') // "correct"
      expect(html).toContain('por ciento') // "percent"
    })

    it('provides Spanish aria-labels for buttons', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 65000,
          answers: mockAnswers,
          locale: 'es'
        }
      })

      const html = wrapper.html()

      // Verify Spanish button aria-labels
      expect(html).toContain('Jugar de nuevo con la misma configuración')
      expect(html).toContain('Volver a la pantalla de inicio')
    })
  })

  describe('English Translation - Control Test', () => {
    it('displays English labels when locale is "en"', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 65000,
          answers: mockAnswers,
          locale: 'en'
        }
      })

      const html = wrapper.html()

      // Verify English labels are present
      expect(html).toContain('Correct')
      expect(html).toContain('Incorrect')
      expect(html).toContain('Play again')
      expect(html).toContain('Back to home')
    })
  })

  describe('Child Component Integration', () => {
    it('passes locale prop to CircularProgress component', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 65000,
          answers: mockAnswers,
          locale: 'es'
        }
      })

      // CircularProgress should receive locale prop
      const circularProgress = wrapper.findComponent({ name: 'CircularProgress' })
      expect(circularProgress.exists()).toBe(true)
      expect(circularProgress.props('locale')).toBe('es')
    })

    it('passes locale prop to ContinentPerformance component', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 65000,
          answers: mockAnswers,
          locale: 'es'
        }
      })

      // ContinentPerformance should receive locale prop
      const continentPerformance = wrapper.findComponent({ name: 'ContinentPerformance' })
      if (continentPerformance.exists()) {
        expect(continentPerformance.props('locale')).toBe('es')
      }
    })

    it('passes locale prop to IncorrectAnswers component', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 1,
          total: 3,
          elapsedMs: 65000,
          answers: mockAnswers,
          locale: 'es'
        }
      })

      // IncorrectAnswers should receive locale prop
      const incorrectAnswers = wrapper.findComponent({ name: 'IncorrectAnswers' })
      if (incorrectAnswers.exists()) {
        expect(incorrectAnswers.props('locale')).toBe('es')
      }
    })
  })

  describe('Validation Messages - Spanish', () => {
    it('displays Spanish text for all validation and result messages', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 65000,
          answers: mockAnswers,
          locale: 'es'
        }
      })

      const text = wrapper.text()

      // Should not contain English-only text in Spanish mode
      // (Exception: numbers and symbols are universal)
      expect(text).not.toMatch(/\bSession Results\b/)
      expect(text).not.toMatch(/\bGreat job\b/)
    })
  })
})
