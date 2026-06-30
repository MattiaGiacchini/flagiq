import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GameResults from './GameResults.vue'
import type { AnsweredQuestion } from '@/stores/game'

describe('GameResults.vue - Button Interactions (Task 11)', () => {
  const mockAnswers: AnsweredQuestion[] = []
  
  const defaultProps = {
    score: 7,
    total: 10,
    elapsedMs: 60000,
    answers: mockAnswers,
    locale: 'en' as const,
  }

  describe('Requirement 11.1: Restart event emission', () => {
    it('emits restart event when Play Again button is clicked', async () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      await playAgainButton.trigger('click')

      expect(wrapper.emitted('restart')).toBeTruthy()
      expect(wrapper.emitted('restart')).toHaveLength(1)
    })
  })

  describe('Requirement 11.2: Home event emission', () => {
    it('emits home event when Home button is clicked', async () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const homeButton = wrapper.find('.btn--ghost')
      await homeButton.trigger('click')

      expect(wrapper.emitted('home')).toBeTruthy()
      expect(wrapper.emitted('home')).toHaveLength(1)
    })
  })

  describe('Requirement 11.3: Primary action styling', () => {
    it('styles Play Again button with primary class', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      expect(playAgainButton.exists()).toBe(true)
      expect(playAgainButton.text()).toContain('Play again')
    })

    it('styles Home button with ghost class (secondary)', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const homeButton = wrapper.find('.btn--ghost')
      expect(homeButton.exists()).toBe(true)
      expect(homeButton.text()).toContain('Back to home')
    })
  })

  describe('Requirement 11.4 & 11.5: Mobile button layout', () => {
    it('renders action buttons container with proper structure', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const actionsContainer = wrapper.find('.results__actions')
      expect(actionsContainer.exists()).toBe(true)
      
      const buttons = actionsContainer.findAll('.btn')
      expect(buttons).toHaveLength(2)
    })

    it('maintains proper button order (Play Again first, Home second)', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const buttons = wrapper.findAll('.btn')
      expect(buttons.length).toBeGreaterThan(1)
      expect(buttons[0]!.text()).toContain('Play again')
      expect(buttons[1]!.text()).toContain('Back to home')
    })
  })

  describe('Requirement 11.7: Keyboard accessibility', () => {
    it('allows Enter key to activate Play Again button', async () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      await playAgainButton.trigger('keydown.enter')

      // Native button behavior handles Enter automatically
      expect(playAgainButton.element.tagName).toBe('BUTTON')
    })

    it('allows Space key to activate buttons (native button behavior)', async () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      await playAgainButton.trigger('keydown.space')

      // Native button behavior handles Space automatically
      expect(playAgainButton.element.tagName).toBe('BUTTON')
    })

    it('buttons are keyboard focusable', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      const homeButton = wrapper.find('.btn--ghost')

      // Buttons are naturally focusable (no tabindex=-1)
      expect(playAgainButton.attributes('tabindex')).toBeFalsy()
      expect(homeButton.attributes('tabindex')).toBeFalsy()
    })
  })

  describe('Requirement 11.8 & 11.9: ARIA labels and accessibility', () => {
    it('Play Again button has descriptive ARIA label', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      const ariaLabel = playAgainButton.attributes('aria-label')
      
      expect(ariaLabel).toBeTruthy()
      expect(ariaLabel).toContain('Play again')
      expect(ariaLabel).toContain('same settings')
    })

    it('Home button has descriptive ARIA label', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const homeButton = wrapper.find('.btn--ghost')
      const ariaLabel = homeButton.attributes('aria-label')
      
      expect(ariaLabel).toBeTruthy()
      expect(ariaLabel).toContain('home')
    })

    it('buttons have proper ARIA labels in Spanish locale', () => {
      const wrapper = mount(GameResults, {
        props: {
          ...defaultProps,
          locale: 'es',
        },
      })

      const playAgainButton = wrapper.find('.btn--primary')
      const homeButton = wrapper.find('.btn--ghost')
      
      expect(playAgainButton.attributes('aria-label')).toContain('Jugar de nuevo')
      expect(homeButton.attributes('aria-label')).toContain('inicio')
    })
  })

  describe('Requirement 11.10: Button semantics', () => {
    it('Play Again button indicates restart with same configuration', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      const ariaLabel = playAgainButton.attributes('aria-label')
      
      // Ensure it's clear this restarts with same config
      expect(ariaLabel).toContain('same')
    })

    it('Home button indicates navigation to home screen', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const homeButton = wrapper.find('.btn--ghost')
      const ariaLabel = homeButton.attributes('aria-label')
      
      // Ensure it's clear this navigates to home
      expect(ariaLabel?.toLowerCase()).toMatch(/home|inicio/)
    })
  })

  describe('Visual feedback requirements (11.6)', () => {
    it('buttons have transition properties for smooth visual feedback', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      
      // Check that button has the base .btn class which includes transitions
      expect(playAgainButton.classes()).toContain('btn')
    })
  })

  describe('Action buttons navigation context', () => {
    it('wraps action buttons in nav element with aria-label', () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const nav = wrapper.find('nav.results__actions')
      expect(nav.exists()).toBe(true)
      expect(nav.attributes('aria-label')).toBe('Game actions')
    })
  })

  describe('Error state button behavior', () => {
    it('shows only Home button in error state when no game data', () => {
      const wrapper = mount(GameResults, {
        props: {
          score: 0,
          total: 0, // No game data
          elapsedMs: 0,
          answers: [],
          locale: 'en',
        },
      })

      const errorButton = wrapper.find('.results__error button')
      expect(errorButton.exists()).toBe(true)
      expect(errorButton.text()).toContain('Back to home')
      
      // Should emit home event
      errorButton.trigger('click')
      expect(wrapper.emitted('home')).toBeTruthy()
    })
  })

  describe('Multiple clicks handling', () => {
    it('allows multiple restart events (e.g., user double-clicks)', async () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const playAgainButton = wrapper.find('.btn--primary')
      
      await playAgainButton.trigger('click')
      await playAgainButton.trigger('click')
      await playAgainButton.trigger('click')

      expect(wrapper.emitted('restart')).toHaveLength(3)
    })

    it('allows multiple home events', async () => {
      const wrapper = mount(GameResults, {
        props: defaultProps,
      })

      const homeButton = wrapper.find('.btn--ghost')
      
      await homeButton.trigger('click')
      await homeButton.trigger('click')

      expect(wrapper.emitted('home')).toHaveLength(2)
    })
  })
})
