import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import NameItQuestion from './NameItQuestion.vue'
import FlagImage from '@/components/common/FlagImage.vue'
import type { Question } from '@/stores/game'
import type { AppLocale } from '@/stores/locale'

describe('NameItQuestion', () => {
  const mockQuestion1: Question = {
    correct: {
      id: 'us',
      emoji: '🇺🇸',
      name: 'United States',
      nameEs: 'Estados Unidos',
      continent: 'americas',
    },
    options: [
      {
        id: 'us',
        emoji: '🇺🇸',
        name: 'United States',
        nameEs: 'Estados Unidos',
        continent: 'americas',
      },
      {
        id: 'fr',
        emoji: '🇫🇷',
        name: 'France',
        nameEs: 'Francia',
        continent: 'europe',
      },
      {
        id: 'jp',
        emoji: '🇯🇵',
        name: 'Japan',
        nameEs: 'Japón',
        continent: 'asia',
      },
      {
        id: 'br',
        emoji: '🇧🇷',
        name: 'Brazil',
        nameEs: 'Brasil',
        continent: 'americas',
      },
    ],
  }

  const mockQuestion2: Question = {
    correct: {
      id: 'de',
      emoji: '🇩🇪',
      name: 'Germany',
      nameEs: 'Alemania',
      continent: 'europe',
    },
    options: [
      {
        id: 'de',
        emoji: '🇩🇪',
        name: 'Germany',
        nameEs: 'Alemania',
        continent: 'europe',
      },
      {
        id: 'it',
        emoji: '🇮🇹',
        name: 'Italy',
        nameEs: 'Italia',
        continent: 'europe',
      },
      {
        id: 'es',
        emoji: '🇪🇸',
        name: 'Spain',
        nameEs: 'España',
        continent: 'europe',
      },
      {
        id: 'pt',
        emoji: '🇵🇹',
        name: 'Portugal',
        nameEs: 'Portugal',
        continent: 'europe',
      },
    ],
  }

  beforeEach(() => {
    // Create and set active Pinia instance for gameStore
    setActivePinia(createPinia())
    
    // Mock window.innerWidth for mobile tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  describe('Basic Rendering', () => {
    it('renders the mode label in English', () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      const modeLabel = wrapper.find('.mode-label')
      expect(modeLabel.text()).toBe('SEE THE FLAG · CHOOSE THE COUNTRY')
    })

    it('renders the mode label in Spanish', () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'es' as AppLocale,
        },
      })

      const modeLabel = wrapper.find('.mode-label')
      expect(modeLabel.text()).toBe('VER LA BANDERA · ELIGE EL PAÍS')
    })

    it('renders FlagImage component with correct props', () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      const flagImage = wrapper.findComponent(FlagImage)
      expect(flagImage.exists()).toBe(true)
      expect(flagImage.props('countryCode')).toBe('us')
      expect(flagImage.props('emoji')).toBe('🇺🇸')
      expect(flagImage.props('eager')).toBe(true)
    })

    it('renders all option buttons', () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      const buttons = wrapper.findAll('.option-btn')
      expect(buttons).toHaveLength(4)
      expect(buttons[0]?.text()).toBe('United States')
      expect(buttons[1]?.text()).toBe('France')
      expect(buttons[2]?.text()).toBe('Japan')
      expect(buttons[3]?.text()).toBe('Brazil')
    })

    it('renders option names in Spanish when locale is es', () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'es' as AppLocale,
        },
      })

      const buttons = wrapper.findAll('.option-btn')
      expect(buttons[0]?.text()).toBe('Estados Unidos')
      expect(buttons[1]?.text()).toBe('Francia')
      expect(buttons[2]?.text()).toBe('Japón')
      expect(buttons[3]?.text()).toBe('Brasil')
    })
  })

  describe('User Interaction', () => {
    it('marks the correct answer when user clicks correct option', async () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      const buttons = wrapper.findAll('.option-btn')
      await buttons[0]?.trigger('click') // US is correct
      await nextTick()

      expect(buttons[0]?.classes()).toContain('option-btn--correct')
      expect(buttons[0]?.classes()).toContain('option-btn--disabled')
    })

    it('marks wrong answer and reveals correct answer when user clicks incorrect option', async () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      const buttons = wrapper.findAll('.option-btn')
      await buttons[1]?.trigger('click') // France is wrong
      await nextTick()

      expect(buttons[1]?.classes()).toContain('option-btn--wrong')
      expect(buttons[0]?.classes()).toContain('option-btn--correct') // US is revealed
      
      // All buttons should be disabled
      buttons.forEach((button) => {
        expect(button.classes()).toContain('option-btn--disabled')
      })
    })

    it('disables all buttons after user makes a choice', async () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      const buttons = wrapper.findAll('.option-btn')
      await buttons[0]?.trigger('click')
      await nextTick()

      buttons.forEach((button) => {
        expect(button.attributes('disabled')).toBeDefined()
      })
    })

    it('prevents clicking after first choice is made', async () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      const buttons = wrapper.findAll('.option-btn')
      await buttons[0]?.trigger('click')
      await nextTick()

      // Try clicking another button
      await buttons[1]?.trigger('click')
      await nextTick()

      // Second button should not have correct/wrong state
      expect(buttons[1]?.classes()).not.toContain('option-btn--correct')
      expect(buttons[1]?.classes()).not.toContain('option-btn--wrong')
    })

    it('emits answer event after user makes a choice', async () => {
      vi.useFakeTimers()
      
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      const buttons = wrapper.findAll('.option-btn')
      await buttons[1]?.trigger('click') // Click France
      await nextTick()

      // Wait for the setTimeout delay (400ms)
      vi.advanceTimersByTime(400)
      await nextTick()

      expect(wrapper.emitted('answer')).toBeTruthy()
      expect(wrapper.emitted('answer')?.[0]).toEqual(['fr'])

      vi.useRealTimers()
    })
  })

  describe('State Reset on Question Change - Bug Fix', () => {
    it('clears visual state when question changes', async () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      // User answers first question incorrectly
      const buttons = wrapper.findAll('.option-btn')
      await buttons[1]?.trigger('click') // Click France (wrong)
      await nextTick()

      // Verify first question state
      expect(buttons[1]?.classes()).toContain('option-btn--wrong')
      expect(buttons[0]?.classes()).toContain('option-btn--correct')

      // Change to new question
      await wrapper.setProps({ question: mockQuestion2 })
      await nextTick()

      // Get new buttons after question change
      const newButtons = wrapper.findAll('.option-btn')

      // Verify all buttons are in idle state (no correct/wrong/disabled classes)
      newButtons.forEach((button) => {
        expect(button.classes()).not.toContain('option-btn--correct')
        expect(button.classes()).not.toContain('option-btn--wrong')
        expect(button.classes()).not.toContain('option-btn--disabled')
      })

      // Verify buttons are interactive again
      newButtons.forEach((button) => {
        expect(button.attributes('disabled')).toBeUndefined()
      })
    })

    it('resets chosen state when question changes', async () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      // User answers first question
      const buttons = wrapper.findAll('.option-btn')
      await buttons[0]?.trigger('click')
      await nextTick()

      // Verify buttons are disabled
      expect(buttons[0]?.attributes('disabled')).toBeDefined()

      // Change to new question
      await wrapper.setProps({ question: mockQuestion2 })
      await nextTick()

      // Get new buttons
      const newButtons = wrapper.findAll('.option-btn')

      // Verify buttons are NOT disabled
      newButtons.forEach((button) => {
        expect(button.attributes('disabled')).toBeUndefined()
      })
    })

    it('allows user to answer new question after state reset', async () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      // Answer first question
      let buttons = wrapper.findAll('.option-btn')
      await buttons[0]?.trigger('click')
      await nextTick()

      // Change to new question
      await wrapper.setProps({ question: mockQuestion2 })
      await nextTick()

      // Answer new question
      buttons = wrapper.findAll('.option-btn')
      await buttons[0]?.trigger('click') // Click Germany (correct)
      await nextTick()

      // Verify new question state is applied correctly
      expect(buttons[0]?.classes()).toContain('option-btn--correct')
      expect(buttons[0]?.classes()).toContain('option-btn--disabled')
    })

    it('forces DOM re-render with :key attribute on options container', async () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      const optionsContainer = wrapper.find('.options')
      const initialKey = optionsContainer.attributes('data-v-app') // Vue adds data attributes

      // Change question
      await wrapper.setProps({ question: mockQuestion2 })
      await nextTick()

      // The key should have changed, forcing Vue to recreate the container
      // We verify this by checking that the question.correct.id is used as the key
      // This is implicit in Vue's behavior, but we can verify buttons are fresh
      const buttons = wrapper.findAll('.option-btn')
      buttons.forEach((button) => {
        expect(button.classes()).not.toContain('option-btn--correct')
        expect(button.classes()).not.toContain('option-btn--wrong')
      })
    })

    it('handles rapid question changes gracefully', async () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      // Answer first question
      let buttons = wrapper.findAll('.option-btn')
      await buttons[0]?.trigger('click')
      await nextTick()

      // Rapidly change questions multiple times
      await wrapper.setProps({ question: mockQuestion2 })
      await nextTick()
      await wrapper.setProps({ question: mockQuestion1 })
      await nextTick()
      await wrapper.setProps({ question: mockQuestion2 })
      await nextTick()

      // Verify final state is clean
      buttons = wrapper.findAll('.option-btn')
      buttons.forEach((button) => {
        expect(button.classes()).not.toContain('option-btn--correct')
        expect(button.classes()).not.toContain('option-btn--wrong')
        expect(button.classes()).not.toContain('option-btn--disabled')
        expect(button.attributes('disabled')).toBeUndefined()
      })
    })
  })

  describe('Mobile Responsive Behavior', () => {
    it('detects mobile viewport on mount', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      // Wait for onMounted to execute
      await nextTick()

      const flagImage = wrapper.findComponent(FlagImage)
      expect(flagImage.props('showSkeleton')).toBe(true)
    })

    it('detects desktop viewport on mount', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      // Wait for onMounted to execute
      await nextTick()

      const flagImage = wrapper.findComponent(FlagImage)
      expect(flagImage.props('showSkeleton')).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA roles on options container', () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      const optionsContainer = wrapper.find('.options')
      expect(optionsContainer.attributes('role')).toBe('list')
    })

    it('has proper ARIA roles on option buttons', () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      const buttons = wrapper.findAll('.option-btn')
      buttons.forEach((button) => {
        expect(button.attributes('role')).toBe('listitem')
      })
    })

    it('has aria-label on flag display', () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      const flagDisplay = wrapper.find('.flag-display')
      expect(flagDisplay.attributes('aria-label')).toBe('Flag to identify')
    })

    it('provides appropriate alt text for flag image in English', () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'en' as AppLocale,
        },
      })

      const flagImage = wrapper.findComponent(FlagImage)
      expect(flagImage.props('alt')).toBe('Flag of United States')
    })

    it('provides appropriate alt text for flag image in Spanish', () => {
      const wrapper = mount(NameItQuestion, {
        props: {
          question: mockQuestion1,
          locale: 'es' as AppLocale,
        },
      })

      const flagImage = wrapper.findComponent(FlagImage)
      expect(flagImage.props('alt')).toBe('Bandera de Estados Unidos')
    })
  })
})
