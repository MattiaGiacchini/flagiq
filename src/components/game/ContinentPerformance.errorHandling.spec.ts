import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ContinentPerformance from './ContinentPerformance.vue'
import type { ContinentStats } from '@/utils/continentPerformance'

describe('ContinentPerformance.vue - Task 9.8: NaN Fallback Handling', () => {
  /**
   * **Validates: Requirements 9.8**
   * 
   * Display fallback values when percentage is NaN
   */
  it('should display "0%" when percentage is NaN', () => {
    const performance: ContinentStats[] = [
      {
        continent: 'africa',
        correct: 0,
        total: 0,
        percentage: NaN, // Simulate NaN scenario
      },
    ]

    const wrapper = mount(ContinentPerformance, {
      props: {
        performance,
        locale: 'en',
      },
    })

    const percentageLabel = wrapper.find('.continent-performance__percentage-label')
    expect(percentageLabel.text()).toBe('0%')

    wrapper.unmount()
  })

  /**
   * **Validates: Requirements 9.8**
   * 
   * Apply correct color class when percentage is NaN (should default to low/red)
   */
  it('should apply low color class when percentage is NaN', () => {
    const performance: ContinentStats[] = [
      {
        continent: 'europe',
        correct: 0,
        total: 0,
        percentage: NaN,
      },
    ]

    const wrapper = mount(ContinentPerformance, {
      props: {
        performance,
        locale: 'en',
      },
    })

    const barFill = wrapper.find('.continent-performance__bar-fill')
    expect(barFill.classes()).toContain('continent-performance__bar-fill--low')

    wrapper.unmount()
  })

  /**
   * **Validates: Requirements 9.8**
   * 
   * Handle valid percentages correctly alongside NaN handling
   */
  it('should handle mix of valid and NaN percentages', () => {
    const performance: ContinentStats[] = [
      {
        continent: 'africa',
        correct: 5,
        total: 5,
        percentage: 100,
      },
      {
        continent: 'europe',
        correct: 0,
        total: 0,
        percentage: NaN,
      },
      {
        continent: 'asia',
        correct: 4,
        total: 5,
        percentage: 80,
      },
    ]

    const wrapper = mount(ContinentPerformance, {
      props: {
        performance,
        locale: 'en',
      },
    })

    const items = wrapper.findAll('.continent-performance__item')
    expect(items).toHaveLength(3)

    // First item: 100% should show as "100%"
    const firstLabel = items[0]!.find('.continent-performance__percentage-label')
    expect(firstLabel.text()).toBe('100%')

    // Second item: NaN should show as "0%"
    const secondLabel = items[1]!.find('.continent-performance__percentage-label')
    expect(secondLabel.text()).toBe('0%')

    // Third item: 80% should show as "80%"
    const thirdLabel = items[2]!.find('.continent-performance__percentage-label')
    expect(thirdLabel.text()).toBe('80%')

    wrapper.unmount()
  })

  /**
   * **Validates: Requirements 9.8**
   * 
   * Bar width should be 0% when percentage is NaN
   */
  it('should set bar width to 0% when percentage is NaN', () => {
    const performance: ContinentStats[] = [
      {
        continent: 'oceania',
        correct: 0,
        total: 0,
        percentage: NaN,
      },
    ]

    const wrapper = mount(ContinentPerformance, {
      props: {
        performance,
        locale: 'en',
      },
    })

    const barFill = wrapper.find('.continent-performance__bar-fill')
    
    // Check that width style is set to 0%
    const style = barFill.attributes('style')
    expect(style).toContain('width: 0%')

    wrapper.unmount()
  })

  /**
   * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
   * 
   * Color coding works correctly with valid percentages
   */
  it('should apply correct color classes for different performance levels', () => {
    const performance: ContinentStats[] = [
      { continent: 'africa', correct: 10, total: 10, percentage: 100 },
      { continent: 'europe', correct: 8, total: 10, percentage: 80 },
      { continent: 'asia', correct: 6, total: 10, percentage: 60 },
      { continent: 'americas', correct: 3, total: 10, percentage: 30 },
    ]

    const wrapper = mount(ContinentPerformance, {
      props: {
        performance,
        locale: 'en',
      },
    })

    const items = wrapper.findAll('.continent-performance__item')

    // 100% - perfect (green)
    expect(items[0]!.find('.continent-performance__bar-fill').classes()).toContain(
      'continent-performance__bar-fill--perfect'
    )

    // 80% - high (blue)
    expect(items[1]!.find('.continent-performance__bar-fill').classes()).toContain(
      'continent-performance__bar-fill--high'
    )

    // 60% - medium (orange)
    expect(items[2]!.find('.continent-performance__bar-fill').classes()).toContain(
      'continent-performance__bar-fill--medium'
    )

    // 30% - low (red)
    expect(items[3]!.find('.continent-performance__bar-fill').classes()).toContain(
      'continent-performance__bar-fill--low'
    )

    wrapper.unmount()
  })
})
