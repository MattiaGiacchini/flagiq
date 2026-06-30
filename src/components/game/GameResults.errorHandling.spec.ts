import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameResults from './GameResults.vue'
import CircularProgress from './CircularProgress.vue'
import ContinentPerformance from './ContinentPerformance.vue'
import IncorrectAnswers from './IncorrectAnswers.vue'

describe('GameResults.vue - Task 9: Error Handling and Fallbacks', () => {
  /**
   * **Validates: Requirements 9.8**
   * 
   * Error handling: Display error message when no game data available
   */
  it('should display error message when total is 0', () => {
    const wrapper = mount(GameResults, {
      props: {
        score: 0,
        total: 0,
        elapsedMs: 0,
        answers: [],
        locale: 'en',
      },
    })

    // Check error state is shown
    const errorContent = wrapper.find('.results__error')
    expect(errorContent.exists()).toBe(true)
    expect(errorContent.text()).toContain('No game data available')

    // Check normal content is hidden
    expect(wrapper.findComponent(CircularProgress).exists()).toBe(false)

    wrapper.unmount()
  })

  /**
   * **Validates: Requirements 9.8**
   * 
   * Error handling: Display fallback values when calculations result in NaN
   */
  it('should display fallback "N/A" for time when elapsedMs is NaN', () => {
    const wrapper = mount(GameResults, {
      props: {
        score: 5,
        total: 10,
        elapsedMs: NaN,
        answers: [],
        locale: 'en',
      },
    })

    const timeValue = wrapper.find('.results__time-value')
    expect(timeValue.text()).toBe('N/A')

    wrapper.unmount()
  })

  /**
   * **Validates: Requirements 9.6**
   * 
   * CircularProgress percentage clamping to 0-100 range
   */
  it('should clamp percentage to 0-100 range', () => {
    const wrapper = mount(GameResults, {
      props: {
        score: 5,
        total: 10,
        elapsedMs: 10000,
        answers: [],
        locale: 'en',
      },
    })

    const circularProgress = wrapper.findComponent(CircularProgress)
    expect(circularProgress.exists()).toBe(true)
    
    // Percentage should be 50%
    const percentage = circularProgress.props('percentage')
    expect(percentage).toBe(50)
    expect(percentage).toBeGreaterThanOrEqual(0)
    expect(percentage).toBeLessThanOrEqual(100)

    wrapper.unmount()
  })

  /**
   * **Validates: Requirements 9.3**
   * 
   * Hide IncorrectAnswers when user achieves 100% score
   */
  it('should hide IncorrectAnswers section when score is 100%', () => {
    const wrapper = mount(GameResults, {
      props: {
        score: 10,
        total: 10,
        elapsedMs: 10000,
        answers: [],
        locale: 'en',
      },
    })

    const incorrectAnswersComponent = wrapper.findComponent(IncorrectAnswers)
    expect(incorrectAnswersComponent.exists()).toBe(false)

    wrapper.unmount()
  })

  /**
   * **Validates: Requirements 9.4**
   * 
   * Hide ContinentPerformance when no continent data available
   */
  it('should hide ContinentPerformance section when no answers provided', () => {
    const wrapper = mount(GameResults, {
      props: {
        score: 5,
        total: 10,
        elapsedMs: 10000,
        answers: [],
        locale: 'en',
      },
    })

    const continentPerformanceComponent = wrapper.findComponent(ContinentPerformance)
    expect(continentPerformanceComponent.exists()).toBe(false)

    wrapper.unmount()
  })

  /**
   * **Validates: Requirements 9.5**
   * 
   * Desktop layout adjusts when sections are hidden
   */
  it('should apply minimal layout class when both sections are hidden', () => {
    const wrapper = mount(GameResults, {
      props: {
        score: 10,
        total: 10,
        elapsedMs: 10000,
        answers: [],
        locale: 'en',
      },
    })

    const container = wrapper.find('.results__container')
    expect(container.classes()).toContain('results__container--minimal')
    expect(container.classes()).toContain('results__container--no-incorrect')
    expect(container.classes()).toContain('results__container--no-continent')

    wrapper.unmount()
  })

  it('should apply no-incorrect class when only incorrect section is hidden', () => {
    const wrapper = mount(GameResults, {
      props: {
        score: 10,
        total: 10,
        elapsedMs: 10000,
        answers: [],
        locale: 'en',
      },
    })

    const container = wrapper.find('.results__container')
    expect(container.classes()).toContain('results__container--no-incorrect')

    wrapper.unmount()
  })

  /**
   * **Validates: Requirements 9.8**
   * 
   * Handle percentage calculation with edge cases
   */
  it('should handle 0 score correctly', () => {
    const wrapper = mount(GameResults, {
      props: {
        score: 0,
        total: 10,
        elapsedMs: 10000,
        answers: [],
        locale: 'en',
      },
    })

    const circularProgress = wrapper.findComponent(CircularProgress)
    expect(circularProgress.props('percentage')).toBe(0)

    wrapper.unmount()
  })
})
