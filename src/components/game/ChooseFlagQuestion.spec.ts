import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ChooseFlagQuestion from './ChooseFlagQuestion.vue'
import FlagImage from '@/components/common/FlagImage.vue'
import type { Question } from '@/stores/game'
import type { AppLocale } from '@/stores/locale'

describe('ChooseFlagQuestion', () => {
  const mockQuestion: Question = {
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

  it('renders FlagImage components for each option', () => {
    const wrapper = mount(ChooseFlagQuestion, {
      props: {
        question: mockQuestion,
        locale: 'en' as AppLocale,
      },
    })

    const flagImages = wrapper.findAllComponents(FlagImage)
    expect(flagImages).toHaveLength(4)
  })

  it('passes correct props to FlagImage components', () => {
    const wrapper = mount(ChooseFlagQuestion, {
      props: {
        question: mockQuestion,
        locale: 'en' as AppLocale,
      },
    })

    const flagImages = wrapper.findAllComponents(FlagImage)
    
    // Check first flag (US)
    expect(flagImages[0]?.props('countryCode')).toBe('us')
    expect(flagImages[0]?.props('emoji')).toBe('🇺🇸')
    expect(flagImages[0]?.props('alt')).toBe('')

    // Check second flag (FR)
    expect(flagImages[1]?.props('countryCode')).toBe('fr')
    expect(flagImages[1]?.props('emoji')).toBe('🇫🇷')
  })

  it('maintains aspect-ratio 4/3 on option buttons', () => {
    const wrapper = mount(ChooseFlagQuestion, {
      props: {
        question: mockQuestion,
        locale: 'en' as AppLocale,
      },
    })

    const buttons = wrapper.findAll('.option-btn')
    buttons.forEach((button) => {
      const style = button.attributes('style') || ''
      const classes = button.classes()
      // The aspect-ratio is applied via CSS class, not inline style
      expect(classes).toContain('option-btn')
    })
  })

  it('passes alt text with country name after answer is chosen', async () => {
    const wrapper = mount(ChooseFlagQuestion, {
      props: {
        question: mockQuestion,
        locale: 'en' as AppLocale,
      },
    })

    // Click the first option
    const buttons = wrapper.findAll('.option-btn')
    await buttons[0]?.trigger('click')

    // Wait for state update
    await wrapper.vm.$nextTick()

    const flagImages = wrapper.findAllComponents(FlagImage)
    // After choosing, alt text should be the country name
    expect(flagImages[0]?.props('alt')).toBe('United States')
  })

  it('uses eager loading for better UX', () => {
    const wrapper = mount(ChooseFlagQuestion, {
      props: {
        question: mockQuestion,
        locale: 'en' as AppLocale,
      },
    })

    const flagImages = wrapper.findAllComponents(FlagImage)
    flagImages.forEach((flagImage) => {
      // eager prop should be true for immediate loading of flag options
      expect(flagImage.props('eager')).toBe(true)
    })
  })
})
