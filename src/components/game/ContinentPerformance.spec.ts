import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ContinentPerformance from './ContinentPerformance.vue'
import type { ContinentStats } from '@/utils/continentPerformance'

describe('ContinentPerformance', () => {
  const mockPerformance: ContinentStats[] = [
    {
      continent: 'africa',
      correct: 5,
      total: 5,
      percentage: 100
    },
    {
      continent: 'asia',
      correct: 3,
      total: 4,
      percentage: 75
    },
    {
      continent: 'europe',
      correct: 2,
      total: 3,
      percentage: 67
    }
  ]

  it('renders the component title in English', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: mockPerformance,
        locale: 'en'
      }
    })

    expect(wrapper.find('.continent-performance__title').text()).toBe('Performance by Continent')
  })

  it('renders the component title in Spanish', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: mockPerformance,
        locale: 'es'
    }
    })

    expect(wrapper.find('.continent-performance__title').text()).toBe('Rendimiento por continente')
  })

  it('renders performance bars for each continent', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: mockPerformance,
        locale: 'en'
      }
    })

    const items = wrapper.findAll('.continent-performance__item')
    expect(items).toHaveLength(3)
  })

  it('displays continent names correctly in English', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: mockPerformance,
        locale: 'en'
      }
    })

    const names = wrapper.findAll('.continent-performance__name')
    expect(names[0]?.text()).toBe('Africa')
    expect(names[1]?.text()).toBe('Asia')
    expect(names[2]?.text()).toBe('Europe')
  })

  it('displays continent names correctly in Spanish', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: mockPerformance,
        locale: 'es'
      }
    })

    const names = wrapper.findAll('.continent-performance__name')
    expect(names[0]?.text()).toBe('África')
    expect(names[1]?.text()).toBe('Asia')
    expect(names[2]?.text()).toBe('Europa')
  })

  it('displays stats in correct format: "{correct}/{total}"', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: mockPerformance,
        locale: 'en'
      }
    })

    const stats = wrapper.findAll('.continent-performance__stats')
    expect(stats[0]?.text()).toBe('5/5')
    expect(stats[1]?.text()).toBe('3/4')
    expect(stats[2]?.text()).toBe('2/3')
  })

  it('displays inline percentage labels within bars', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: mockPerformance,
        locale: 'en'
      }
    })

    const labels = wrapper.findAll('.continent-performance__percentage-label')
    expect(labels[0]?.text()).toBe('100%')
    expect(labels[1]?.text()).toBe('75%')
    expect(labels[2]?.text()).toBe('67%')
  })

  it('applies correct color class for 100% performance', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: mockPerformance,
        locale: 'en'
      }
    })

    const fills = wrapper.findAll('.continent-performance__bar-fill')
    expect(fills[0]?.classes()).toContain('continent-performance__bar-fill--perfect')
  })

  it('applies correct color class for high performance (≥78%)', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: [
          { continent: 'asia', correct: 8, total: 10, percentage: 80 }
        ],
        locale: 'en'
      }
    })

    const fill = wrapper.find('.continent-performance__bar-fill')
    expect(fill.classes()).toContain('continent-performance__bar-fill--high')
  })

  it('applies correct color class for medium performance (50-77%)', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: [
          { continent: 'europe', correct: 60, total: 100, percentage: 60 }
        ],
        locale: 'en'
      }
    })

    const fill = wrapper.find('.continent-performance__bar-fill')
    expect(fill.classes()).toContain('continent-performance__bar-fill--medium')
  })

  it('applies correct color class for low performance (<50%)', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: [
          { continent: 'oceania', correct: 2, total: 5, percentage: 40 }
        ],
        locale: 'en'
      }
    })

    const fill = wrapper.find('.continent-performance__bar-fill')
    expect(fill.classes()).toContain('continent-performance__bar-fill--low')
  })

  it('applies correct color at boundary: 78% should be high', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: [
          { continent: 'asia', correct: 78, total: 100, percentage: 78 }
        ],
        locale: 'en'
      }
    })

    const fill = wrapper.find('.continent-performance__bar-fill')
    expect(fill.classes()).toContain('continent-performance__bar-fill--high')
  })

  it('applies correct color at boundary: 77% should be medium', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: [
          { continent: 'asia', correct: 77, total: 100, percentage: 77 }
        ],
        locale: 'en'
      }
    })

    const fill = wrapper.find('.continent-performance__bar-fill')
    expect(fill.classes()).toContain('continent-performance__bar-fill--medium')
  })

  it('applies correct color at boundary: 50% should be medium', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: [
          { continent: 'asia', correct: 50, total: 100, percentage: 50 }
        ],
        locale: 'en'
      }
    })

    const fill = wrapper.find('.continent-performance__bar-fill')
    expect(fill.classes()).toContain('continent-performance__bar-fill--medium')
  })

  it('applies correct color at boundary: 49% should be low', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: [
          { continent: 'asia', correct: 49, total: 100, percentage: 49 }
        ],
        locale: 'en'
      }
    })

    const fill = wrapper.find('.continent-performance__bar-fill')
    expect(fill.classes()).toContain('continent-performance__bar-fill--low')
  })

  it('sets bar width proportional to percentage', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: mockPerformance,
        locale: 'en'
      }
    })

    const fills = wrapper.findAll('.continent-performance__bar-fill')
    expect(fills[0]?.attributes('style')).toContain('width: 100%')
    expect(fills[1]?.attributes('style')).toContain('width: 75%')
    expect(fills[2]?.attributes('style')).toContain('width: 67%')
  })

  it('renders empty list when performance array is empty', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: [],
        locale: 'en'
      }
    })

    const items = wrapper.findAll('.continent-performance__item')
    expect(items).toHaveLength(0)
  })

  it('applies compact class when compact prop is true', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: mockPerformance,
        locale: 'en',
        compact: true
      }
    })

    expect(wrapper.find('.continent-performance').classes()).toContain('continent-performance--compact')
  })

  it('does not apply compact class when compact prop is false', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: mockPerformance,
        locale: 'en',
        compact: false
      }
    })

    expect(wrapper.find('.continent-performance').classes()).not.toContain('continent-performance--compact')
  })

  it('compact prop defaults to false', () => {
    const wrapper = mount(ContinentPerformance, {
      props: {
        performance: mockPerformance,
        locale: 'en'
      }
    })

    expect(wrapper.find('.continent-performance').classes()).not.toContain('continent-performance--compact')
  })
})
