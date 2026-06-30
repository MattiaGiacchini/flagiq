import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import IncorrectAnswers from './IncorrectAnswers.vue'
import FlagImage from '@/components/common/FlagImage.vue'
import type { IncorrectAnswer } from '@/utils/incorrectAnswers'
import type { Flag } from '@/data/flags'

describe('IncorrectAnswers', () => {
  const mockCorrectFlag: Flag = {
    id: 'DE',
    name: 'Germany',
    nameEs: 'Alemania',
    continent: 'europe',
    emoji: '🇩🇪'
  }

  const mockChosenFlag: Flag = {
    id: 'FR',
    name: 'France',
    nameEs: 'Francia',
    continent: 'europe',
    emoji: '🇫🇷'
  }

  const mockIncorrectAnswer: IncorrectAnswer = {
    correctFlag: mockCorrectFlag,
    chosenFlag: mockChosenFlag,
    continent: 'europe'
  }

  it('does not render when incorrect array is empty', () => {
    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: [],
        locale: 'en'
      }
    })

    expect(wrapper.find('.incorrect-answers').exists()).toBe(false)
  })

  it('renders with single incorrect answer in English', () => {
    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: [mockIncorrectAnswer],
        locale: 'en'
      }
    })

    expect(wrapper.find('.incorrect-answers').exists()).toBe(true)
    expect(wrapper.find('.incorrect-answers__title').text()).toBe('Incorrect Answers')
    
    const cards = wrapper.findAll('.incorrect-answers__card')
    expect(cards).toHaveLength(1)
    
    // Check correct country name
    expect(wrapper.find('.incorrect-answers__correct').text()).toBe('Germany')
    // Check "You answered" text with chosen flag
    expect(wrapper.find('.incorrect-answers__chosen').text()).toContain('You answered:')
    expect(wrapper.find('.incorrect-answers__chosen').text()).toContain('France')
    expect(wrapper.find('.incorrect-answers__chosen').text()).toContain('🇫🇷')
    // Check continent
    expect(wrapper.find('.incorrect-answers__continent').text()).toBe('Europe')
  })

  it('renders with single incorrect answer in Spanish', () => {
    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: [mockIncorrectAnswer],
        locale: 'es'
      }
    })

    expect(wrapper.find('.incorrect-answers__title').text()).toBe('Respuestas incorrectas')
    
    const cards = wrapper.findAll('.incorrect-answers__card')
    expect(cards).toHaveLength(1)
    
    // Check correct country name in Spanish
    expect(wrapper.find('.incorrect-answers__correct').text()).toBe('Alemania')
    // Check "Respondiste" text
    expect(wrapper.find('.incorrect-answers__chosen').text()).toContain('Respondiste:')
    expect(wrapper.find('.incorrect-answers__chosen').text()).toContain('Francia')
    // Check continent in Spanish
    expect(wrapper.find('.incorrect-answers__continent').text()).toBe('Europa')
  })

  it('renders multiple incorrect answers', () => {
    const mockIncorrectAnswer2: IncorrectAnswer = {
      correctFlag: {
        id: 'JP',
        name: 'Japan',
        nameEs: 'Japón',
        continent: 'asia',
        emoji: '🇯🇵'
      },
      chosenFlag: {
        id: 'CN',
        name: 'China',
        nameEs: 'China',
        continent: 'asia',
        emoji: '🇨🇳'
      },
      continent: 'asia'
    }

    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: [mockIncorrectAnswer, mockIncorrectAnswer2],
        locale: 'en'
      }
    })

    const cards = wrapper.findAll('.incorrect-answers__card')
    expect(cards).toHaveLength(2)
    
    // Check first card
    expect(cards[0]?.find('.incorrect-answers__correct').text()).toBe('Germany')
    expect(cards[0]?.find('.incorrect-answers__chosen').text()).toContain('France')
    expect(cards[0]?.find('.incorrect-answers__continent').text()).toBe('Europe')
    
    // Check second card
    expect(cards[1]?.find('.incorrect-answers__correct').text()).toBe('Japan')
    expect(cards[1]?.find('.incorrect-answers__chosen').text()).toContain('China')
    expect(cards[1]?.find('.incorrect-answers__continent').text()).toBe('Asia')
  })

  it('formats correctly for Africa continent in English', () => {
    const africaAnswer: IncorrectAnswer = {
      correctFlag: {
        id: 'NG',
        name: 'Nigeria',
        nameEs: 'Nigeria',
        continent: 'africa',
        emoji: '🇳🇬'
      },
      chosenFlag: {
        id: 'GH',
        name: 'Ghana',
        nameEs: 'Ghana',
        continent: 'africa',
        emoji: '🇬🇭'
      },
      continent: 'africa'
    }

    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: [africaAnswer],
        locale: 'en'
      }
    })

    expect(wrapper.find('.incorrect-answers__correct').text()).toBe('Nigeria')
    expect(wrapper.find('.incorrect-answers__chosen').text()).toContain('Ghana')
    expect(wrapper.find('.incorrect-answers__continent').text()).toBe('Africa')
  })

  it('formats correctly for Africa continent in Spanish', () => {
    const africaAnswer: IncorrectAnswer = {
      correctFlag: {
        id: 'NG',
        name: 'Nigeria',
        nameEs: 'Nigeria',
        continent: 'africa',
        emoji: '🇳🇬'
      },
      chosenFlag: {
        id: 'GH',
        name: 'Ghana',
        nameEs: 'Ghana',
        continent: 'africa',
        emoji: '🇬🇭'
      },
      continent: 'africa'
    }

    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: [africaAnswer],
        locale: 'es'
      }
    })

    expect(wrapper.find('.incorrect-answers__correct').text()).toBe('Nigeria')
    expect(wrapper.find('.incorrect-answers__chosen').text()).toContain('Respondiste:')
    expect(wrapper.find('.incorrect-answers__chosen').text()).toContain('Ghana')
    expect(wrapper.find('.incorrect-answers__continent').text()).toBe('África')
  })

  it('formats correctly for Americas continent', () => {
    const americasAnswer: IncorrectAnswer = {
      correctFlag: {
        id: 'BR',
        name: 'Brazil',
        nameEs: 'Brasil',
        continent: 'americas',
        emoji: '🇧🇷'
      },
      chosenFlag: {
        id: 'AR',
        name: 'Argentina',
        nameEs: 'Argentina',
        continent: 'americas',
        emoji: '🇦🇷'
      },
      continent: 'americas'
    }

    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: [americasAnswer],
        locale: 'en'
      }
    })

    expect(wrapper.find('.incorrect-answers__correct').text()).toBe('Brazil')
    expect(wrapper.find('.incorrect-answers__chosen').text()).toContain('Argentina')
    expect(wrapper.find('.incorrect-answers__continent').text()).toBe('Americas')
  })

  it('formats correctly for Oceania continent in Spanish', () => {
    const oceaniaAnswer: IncorrectAnswer = {
      correctFlag: {
        id: 'AU',
        name: 'Australia',
        nameEs: 'Australia',
        continent: 'oceania',
        emoji: '🇦🇺'
      },
      chosenFlag: {
        id: 'NZ',
        name: 'New Zealand',
        nameEs: 'Nueva Zelanda',
        continent: 'oceania',
        emoji: '🇳🇿'
      },
      continent: 'oceania'
    }

    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: [oceaniaAnswer],
        locale: 'es'
      }
    })

    expect(wrapper.find('.incorrect-answers__correct').text()).toBe('Australia')
    expect(wrapper.find('.incorrect-answers__chosen').text()).toContain('Nueva Zelanda')
    expect(wrapper.find('.incorrect-answers__continent').text()).toBe('Oceanía')
  })

  it('defaults to English locale when not specified', () => {
    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: [mockIncorrectAnswer]
      }
    })

    expect(wrapper.find('.incorrect-answers__title').text()).toBe('Incorrect Answers')
    expect(wrapper.find('.incorrect-answers__chosen').text()).toContain('You answered')
  })

  it('applies correct CSS classes for card-based layout', () => {
    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: [mockIncorrectAnswer],
        locale: 'en'
      }
    })

    expect(wrapper.find('.incorrect-answers').exists()).toBe(true)
    expect(wrapper.find('.incorrect-answers__title').exists()).toBe(true)
    expect(wrapper.find('.incorrect-answers__list').exists()).toBe(true)
    expect(wrapper.find('.incorrect-answers__card').exists()).toBe(true)
    expect(wrapper.find('.incorrect-answers__flag-container').exists()).toBe(true)
    expect(wrapper.find('.incorrect-answers__content').exists()).toBe(true)
  })

  it('renders FlagImage component for each incorrect answer', () => {
    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: [mockIncorrectAnswer],
        locale: 'en'
      }
    })

    const flagImages = wrapper.findAllComponents(FlagImage)
    expect(flagImages).toHaveLength(1)
    
    // Check FlagImage props
    const flagImage = flagImages[0]
    expect(flagImage?.props('countryCode')).toBe('de') // lowercase
    expect(flagImage?.props('emoji')).toBe('🇩🇪')
    expect(flagImage?.props('alt')).toBe('Germany flag')
    expect(flagImage?.props('showSkeleton')).toBe(false)
  })

  it('respects showFlags prop when set to false', () => {
    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: [mockIncorrectAnswer],
        locale: 'en',
        showFlags: false
      }
    })

    // Flag container should not render when showFlags is false
    expect(wrapper.find('.incorrect-answers__flag-container').exists()).toBe(false)
    expect(wrapper.findAllComponents(FlagImage)).toHaveLength(0)
    
    // But text content should still render
    expect(wrapper.find('.incorrect-answers__content').exists()).toBe(true)
    expect(wrapper.find('.incorrect-answers__correct').text()).toBe('Germany')
  })

  it('defaults showFlags prop to true', () => {
    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: [mockIncorrectAnswer],
        locale: 'en'
      }
    })

    // Should render flag by default
    expect(wrapper.find('.incorrect-answers__flag-container').exists()).toBe(true)
    expect(wrapper.findAllComponents(FlagImage)).toHaveLength(1)
  })

  it('uses eager loading for first 3 flags', () => {
    const multipleAnswers: IncorrectAnswer[] = Array.from({ length: 5 }, (_, i) => ({
      correctFlag: {
        id: `C${i}`,
        name: `Country ${i}`,
        nameEs: `País ${i}`,
        continent: 'europe',
        emoji: '🏳️'
      },
      chosenFlag: mockChosenFlag,
      continent: 'europe'
    }))

    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: multipleAnswers,
        locale: 'en'
      }
    })

    const flagImages = wrapper.findAllComponents(FlagImage)
    expect(flagImages).toHaveLength(5)
    
    // First 3 should have eager=true
    expect(flagImages[0]?.props('eager')).toBe(true)
    expect(flagImages[1]?.props('eager')).toBe(true)
    expect(flagImages[2]?.props('eager')).toBe(true)
    
    // Rest should have eager=false
    expect(flagImages[3]?.props('eager')).toBe(false)
    expect(flagImages[4]?.props('eager')).toBe(false)
  })

  it('displays chosen flag emoji in answer text', () => {
    const wrapper = mount(IncorrectAnswers, {
      props: {
        incorrect: [mockIncorrectAnswer],
        locale: 'en'
      }
    })

    const chosenText = wrapper.find('.incorrect-answers__chosen').text()
    expect(chosenText).toContain('You answered:')
    expect(chosenText).toContain('France')
    expect(chosenText).toContain('🇫🇷') // Chosen flag emoji
  })
})
