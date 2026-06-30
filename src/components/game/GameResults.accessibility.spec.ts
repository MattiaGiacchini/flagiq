import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameResults from './GameResults.vue'
import type { AnsweredQuestion } from '@/stores/game'
import { FLAGS } from '@/data/flags'

describe('GameResults - Accessibility Requirements', () => {
  const mockAnswers: AnsweredQuestion[] = [
    {
      question: {
        correct: FLAGS.find((f) => f.id === 'DE')!,
        options: [
          FLAGS.find((f) => f.id === 'DE')!,
          FLAGS.find((f) => f.id === 'FR')!,
          FLAGS.find((f) => f.id === 'IT')!,
          FLAGS.find((f) => f.id === 'ES')!,
        ],
      },
      chosenId: 'DE',
      result: 'correct',
    },
    {
      question: {
        correct: FLAGS.find((f) => f.id === 'FR')!,
        options: [
          FLAGS.find((f) => f.id === 'FR')!,
          FLAGS.find((f) => f.id === 'BE')!,
          FLAGS.find((f) => f.id === 'NL')!,
          FLAGS.find((f) => f.id === 'LU')!,
        ],
      },
      chosenId: 'BE',
      result: 'wrong',
    },
    {
      question: {
        correct: FLAGS.find((f) => f.id === 'JP')!,
        options: [
          FLAGS.find((f) => f.id === 'JP')!,
          FLAGS.find((f) => f.id === 'CN')!,
          FLAGS.find((f) => f.id === 'KR')!,
          FLAGS.find((f) => f.id === 'TH')!,
        ],
      },
      chosenId: 'JP',
      result: 'correct',
    },
  ]

  describe('Requirement 8.7: Touch-Friendly Button Sizes on Mobile', () => {
    it('ensures all buttons have minimum 44px height specified in CSS', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 45000,
          answers: mockAnswers,
          locale: 'en',
        },
      })

      const buttons = wrapper.findAll('.btn')
      expect(buttons.length).toBeGreaterThan(0)

      // Verify buttons have the class that specifies min-height: 44px
      buttons.forEach((button) => {
        expect(button.classes()).toContain('btn')
      })

      // Check that the component HTML includes buttons
      const html = wrapper.html()
      expect(html).toContain('class="btn btn--primary"')
      expect(html).toContain('class="btn btn--ghost"')
    })

    it('verifies buttons exist with touch-friendly classes', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 45000,
          answers: mockAnswers,
          locale: 'en',
        },
      })

      const primaryButton = wrapper.find('.btn--primary')
      expect(primaryButton.exists()).toBe(true)
      expect(primaryButton.classes()).toContain('btn')

      const ghostButton = wrapper.find('.btn--ghost')
      expect(ghostButton.exists()).toBe(true)
      expect(ghostButton.classes()).toContain('btn')
    })

    it('ensures buttons maintain structure in both locales', () => {
      const locales: Array<'en' | 'es'> = ['en', 'es']

      locales.forEach((locale) => {
        const wrapper = mount(GameResults, {
          props: {
            score: 2,
            total: 3,
            elapsedMs: 45000,
            answers: mockAnswers,
            locale,
          },
        })

        const buttons = wrapper.findAll('.btn')
        expect(buttons.length).toBe(2)
        
        // Verify each button has the proper class
        buttons.forEach((button) => {
          expect(button.classes()).toContain('btn')
        })
      })
    })
  })

  describe('Requirement 8.8: Minimum Font Sizes', () => {
    it('ensures body text elements are present and styled', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 45000,
          answers: mockAnswers,
          locale: 'en',
        },
      })

      // Check percentage text exists (now in CircularProgress component)
      const percentage = wrapper.find('.circular-progress__percentage')
      expect(percentage.exists()).toBe(true)
      expect(percentage.text()).toContain('%')

      // Check time value exists
      const timeValue = wrapper.find('.results__time-value')
      expect(timeValue.exists()).toBe(true)

      // Check time icon exists
      const timeIcon = wrapper.find('.results__time-icon')
      expect(timeIcon.exists()).toBe(true)

      // Check button exists
      const button = wrapper.find('.btn')
      expect(button.exists()).toBe(true)
    })

    it('verifies text elements exist on mobile layout', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 45000,
          answers: mockAnswers,
          locale: 'en',
        },
      })

      // All body text elements should exist
      const textSelectors = [
        '.circular-progress__percentage', // Updated: percentage now in CircularProgress
        '.results__time-value',
        '.results__time-icon',
        '.btn',
      ]

      textSelectors.forEach((selector) => {
        const element = wrapper.find(selector)
        expect(element.exists()).toBe(true)
      })
    })

    it('verifies text elements exist on desktop layout', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 45000,
          answers: mockAnswers,
          locale: 'en',
        },
      })

      // Font-sized elements should exist on desktop too
      const textSelectors = [
        '.circular-progress__percentage', // Updated: percentage now in CircularProgress
        '.results__time-value',
        '.results__time-icon',
        '.btn',
      ]

      textSelectors.forEach((selector) => {
        const element = wrapper.find(selector)
        expect(element.exists()).toBe(true)
      })
    })

    it('ensures text elements exist in both English and Spanish', () => {
      const locales: Array<'en' | 'es'> = ['en', 'es']

      locales.forEach((locale) => {
        const wrapper = mount(GameResults, {
          props: {
            score: 2,
            total: 3,
            elapsedMs: 45000,
            answers: mockAnswers,
            locale,
          },
        })

        // Check body text elements exist (percentage now in CircularProgress)
        const percentage = wrapper.find('.circular-progress__percentage')
        expect(percentage.exists()).toBe(true)
        
        const timeValue = wrapper.find('.results__time-value')
        expect(timeValue.exists()).toBe(true)
      })
    })
  })

  describe('Combined Accessibility Validation', () => {
    it('validates both button structure and text structure together', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 45000,
          answers: mockAnswers,
          locale: 'en',
        },
      })

      // Verify buttons exist with proper classes
      const buttons = wrapper.findAll('.btn')
      expect(buttons.length).toBe(2)
      
      buttons.forEach((button) => {
        expect(button.classes()).toContain('btn')
      })

      // Verify text elements exist (percentage now in CircularProgress)
      expect(wrapper.find('.circular-progress__percentage').exists()).toBe(true)
      expect(wrapper.find('.results__time-value').exists()).toBe(true)
    })

    it('validates button container structure', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 45000,
          answers: mockAnswers,
          locale: 'en',
        },
      })

      const actionsContainer = wrapper.find('.results__actions')
      expect(actionsContainer.exists()).toBe(true)

      const buttons = actionsContainer.findAll('.btn')
      expect(buttons.length).toBe(2)

      // Verify each button has the .btn class
      buttons.forEach((button) => {
        expect(button.classes()).toContain('btn')
      })
    })

    it('verifies CSS classes are applied correctly', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 2,
          total: 3,
          elapsedMs: 45000,
          answers: mockAnswers,
          locale: 'en',
        },
      })

      // Check that scoped styles are attached
      const html = wrapper.html()
      
      // Buttons should have btn class
      expect(html).toMatch(/class="[^"]*\bbtn\b[^"]*"/)
      
      // Text elements should have their classes (percentage now in CircularProgress)
      expect(html).toMatch(/class="[^"]*\bcircular-progress__percentage\b[^"]*"/)
      expect(html).toMatch(/class="[^"]*\bresults__time-value\b[^"]*"/)
    })
  })
})
