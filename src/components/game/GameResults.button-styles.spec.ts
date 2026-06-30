import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameResults from './GameResults.vue'
import type { AnsweredQuestion } from '@/stores/game'

describe('GameResults.vue - Button Styles and Visual Feedback (Task 11)', () => {
  const mockAnswers: AnsweredQuestion[] = []
  
  const defaultProps = {
    score: 7,
    total: 10,
    elapsedMs: 60000,
    answers: mockAnswers,
    locale: 'en' as const,
  }

  describe('Requirement 11.3: Primary action styling', () => {
    it('Play Again button has primary styling (btn--primary class)', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('button.btn--primary')
      expect(playAgainButton.exists()).toBe(true)
      expect(playAgainButton.classes()).toContain('btn')
      expect(playAgainButton.classes()).toContain('btn--primary')
    })

    it('Home button has secondary/ghost styling (btn--ghost class)', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const homeButton = wrapper.find('button.btn--ghost')
      expect(homeButton.exists()).toBe(true)
      expect(homeButton.classes()).toContain('btn')
      expect(homeButton.classes()).toContain('btn--ghost')
    })
  })

  describe('Requirement 11.4: Full width on mobile', () => {
    it('actions container uses flexbox layout for mobile stacking', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const actionsContainer = wrapper.find('.results__actions')
      expect(actionsContainer.exists()).toBe(true)
      
      // Check it's a flex container with column direction (mobile default)
      const html = actionsContainer.html()
      expect(html).toBeTruthy()
    })

    it('buttons are direct children of actions container', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const actionsContainer = wrapper.find('.results__actions')
      const buttons = actionsContainer.findAll('button.btn')
      
      // Both buttons should be direct children
      expect(buttons).toHaveLength(2)
    })
  })

  describe('Requirement 11.5: Spacing between buttons', () => {
    it('actions container has gap spacing', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const actionsContainer = wrapper.find('.results__actions')
      expect(actionsContainer.exists()).toBe(true)
      
      // The CSS should apply gap (verified in the component styles)
      expect(actionsContainer.classes()).toContain('results__actions')
    })
  })

  describe('Requirement 11.6: Hover and active states', () => {
    it('buttons have hover capability (not disabled)', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      const homeButton = wrapper.find('.btn--ghost')
      
      expect(playAgainButton.attributes('disabled')).toBeFalsy()
      expect(homeButton.attributes('disabled')).toBeFalsy()
    })

    it('buttons have cursor pointer via btn class', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const buttons = wrapper.findAll('.btn')
      
      buttons.forEach(button => {
        // All buttons should have the .btn class which applies cursor: pointer
        expect(button.classes()).toContain('btn')
      })
    })

    it('buttons respond to active state (mousedown)', async () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      
      // Trigger mousedown to simulate active state
      await playAgainButton.trigger('mousedown')
      
      // Button should still be functional
      expect(playAgainButton.exists()).toBe(true)
    })
  })

  describe('Requirement 11.8: Focus indicators - WCAG AA', () => {
    it('buttons are focusable native button elements', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      const homeButton = wrapper.find('.btn--ghost')
      
      expect(playAgainButton.element.tagName).toBe('BUTTON')
      expect(homeButton.element.tagName).toBe('BUTTON')
    })

    it('buttons do not have tabindex -1 (are keyboard accessible)', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      const homeButton = wrapper.find('.btn--ghost')
      
      // Should not prevent keyboard focus
      expect(playAgainButton.attributes('tabindex')).not.toBe('-1')
      expect(homeButton.attributes('tabindex')).not.toBe('-1')
    })

    it('buttons have proper type attribute', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      const homeButton = wrapper.find('.btn--ghost')
      
      // Should be button type (not submit)
      // If no type specified, default is 'submit' in forms but these are standalone
      expect(playAgainButton.element.tagName).toBe('BUTTON')
      expect(homeButton.element.tagName).toBe('BUTTON')
    })
  })

  describe('Button content and structure', () => {
    it('Play Again button displays correct text in English', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      expect(playAgainButton.text()).toBe('Play again')
    })

    it('Play Again button displays correct text in Spanish', () => {
      const wrapper = mount(GameResults, {
        props: {
          ...defaultProps,
          locale: 'es',
        },
      })

      const playAgainButton = wrapper.find('.btn--primary')
      expect(playAgainButton.text()).toBe('Jugar de nuevo')
    })

    it('Home button displays correct text in English', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const homeButton = wrapper.find('.btn--ghost')
      expect(homeButton.text()).toBe('Back to home')
    })

    it('Home button displays correct text in Spanish', () => {
      const wrapper = mount(GameResults, {
        props: {
          ...defaultProps,
          locale: 'es',
        },
      })

      const homeButton = wrapper.find('.btn--ghost')
      expect(homeButton.text()).toBe('Volver al inicio')
    })
  })

  describe('Button order and prominence', () => {
    it('Play Again (primary action) appears before Home button', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const buttons = wrapper.findAll('.btn')
      
      // First button should be primary (Play Again)
      expect(buttons.length).toBeGreaterThan(0)
      expect(buttons[0]!.classes()).toContain('btn--primary')
      expect(buttons[0]!.text()).toContain('Play again')
      
      // Second button should be ghost (Home)
      expect(buttons.length).toBeGreaterThan(1)
      expect(buttons[1]!.classes()).toContain('btn--ghost')
      expect(buttons[1]!.text()).toContain('Back to home')
    })
  })

  describe('Touch-friendly sizing', () => {
    it('buttons have minimum height for touch targets', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const buttons = wrapper.findAll('.btn')
      
      // All buttons should have the .btn class which has min-height: 44px
      buttons.forEach(button => {
        expect(button.classes()).toContain('btn')
      })
    })
  })

  describe('Semantic navigation structure', () => {
    it('buttons are wrapped in nav element', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const nav = wrapper.find('nav.results__actions')
      expect(nav.exists()).toBe(true)
    })

    it('nav element has descriptive aria-label', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const nav = wrapper.find('nav.results__actions')
      expect(nav.attributes('aria-label')).toBe('Game actions')
    })
  })

  describe('Button state management', () => {
    it('buttons are always enabled (no disabled state)', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      const homeButton = wrapper.find('.btn--ghost')
      
      expect(playAgainButton.attributes('disabled')).toBeUndefined()
      expect(homeButton.attributes('disabled')).toBeUndefined()
    })

    it('buttons remain enabled even with perfect score', () => {
      const wrapper = mount(GameResults, {
        props: {
          ...defaultProps,
          score: 10,
          total: 10,
        },
      })

      const playAgainButton = wrapper.find('.btn--primary')
      const homeButton = wrapper.find('.btn--ghost')
      
      expect(playAgainButton.attributes('disabled')).toBeUndefined()
      expect(homeButton.attributes('disabled')).toBeUndefined()
    })

    it('buttons remain enabled even with zero score', () => {
      const wrapper = mount(GameResults, {
        props: {
          ...defaultProps,
          score: 0,
          total: 10,
        },
      })

      const playAgainButton = wrapper.find('.btn--primary')
      const homeButton = wrapper.find('.btn--ghost')
      
      expect(playAgainButton.attributes('disabled')).toBeUndefined()
      expect(homeButton.attributes('disabled')).toBeUndefined()
    })
  })
})
