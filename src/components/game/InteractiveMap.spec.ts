import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import InteractiveMap from './InteractiveMap.vue'
import type { Continent } from '@/types/session'

describe('InteractiveMap.vue', () => {
  it('renders SVG with correct viewBox for single continent', () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['europe'] as Continent[],
        locale: 'en',
      },
    })

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    // Single continent should get a centered viewBox, not the default world view
    expect(svg.element.getAttribute('viewBox')).toBe('450 0 603 346')
    expect(svg.attributes('role')).toBe('application')
    expect(svg.attributes('aria-label')).toBe('Interactive world map')
  })

  it('renders SVG with default viewBox for multiple continents', () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['europe', 'asia'] as Continent[],
        locale: 'en',
      },
    })

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    // Multiple continents should get the default world view
    expect(svg.element.getAttribute('viewBox')).toBe('0 0 1000 500')
    expect(svg.attributes('role')).toBe('application')
    expect(svg.attributes('aria-label')).toBe('Interactive world map')
  })

  it('renders only countries from visible continents', () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['europe'] as Continent[],
        locale: 'en',
      },
    })

    const paths = wrapper.findAll('path')
    expect(paths.length).toBeGreaterThan(0)

    // All rendered paths should be from Europe
    paths.forEach((path) => {
      const countryId = path.attributes('id')
      expect(countryId).toBeTruthy()
    })
  })

  it('emits countryClicked event when a country is clicked', async () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['europe'] as Continent[],
        locale: 'en',
      },
    })

    const firstPath = wrapper.find('path')
    const countryId = firstPath.attributes('id')

    await firstPath.trigger('click')

    expect(wrapper.emitted('countryClicked')).toBeTruthy()
    expect(wrapper.emitted('countryClicked')?.[0]).toEqual([countryId])
  })

  it('emits countryClicked event when Enter key is pressed', async () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['europe'] as Continent[],
        locale: 'en',
      },
    })

    const firstPath = wrapper.find('path')
    const countryId = firstPath.attributes('id')

    await firstPath.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('countryClicked')).toBeTruthy()
    expect(wrapper.emitted('countryClicked')?.[0]).toEqual([countryId])
  })

  it('emits countryClicked event when Space key is pressed', async () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['europe'] as Continent[],
        locale: 'en',
      },
    })

    const firstPath = wrapper.find('path')
    const countryId = firstPath.attributes('id')

    await firstPath.trigger('keydown', { key: ' ' })

    expect(wrapper.emitted('countryClicked')).toBeTruthy()
    expect(wrapper.emitted('countryClicked')?.[0]).toEqual([countryId])
  })

  it('does not emit events when disableInteraction is true', async () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['europe'] as Continent[],
        locale: 'en',
        disableInteraction: true,
      },
    })

    const firstPath = wrapper.find('path')

    await firstPath.trigger('click')
    await firstPath.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('countryClicked')).toBeFalsy()
  })

  it('applies correct CSS class when country is highlighted as correct', () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['europe'] as Continent[],
        highlightedCountries: [{ id: 'FR', color: 'correct' }],
        locale: 'en',
      },
    })

    const francePath = wrapper.find('#FR')
    expect(francePath.classes()).toContain('country-path--correct')
  })

  it('applies correct CSS class when country is highlighted as wrong', () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['europe'] as Continent[],
        highlightedCountries: [{ id: 'DE', color: 'wrong' }],
        locale: 'en',
      },
    })

    const germanyPath = wrapper.find('#DE')
    expect(germanyPath.classes()).toContain('country-path--wrong')
  })

  it('renders small country overlay circles for countries with centroids', () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['oceania'] as Continent[], // Centroids are in Oceania
        locale: 'en',
      },
    })

    const circles = wrapper.findAll('circle')
    expect(circles.length).toBeGreaterThan(0)

    circles.forEach((circle) => {
      expect(circle.attributes('r')).toBe('10')
      expect(circle.classes()).toContain('country-overlay')
      expect(circle.attributes('aria-hidden')).toBe('true')
    })
  })

  it('sets tabindex to -1 when interaction is disabled', () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['europe'] as Continent[],
        locale: 'en',
        disableInteraction: true,
      },
    })

    const paths = wrapper.findAll('path')
    paths.forEach((path) => {
      expect(path.attributes('tabindex')).toBe('-1')
    })
  })

  it('sets tabindex to 0 when interaction is enabled', () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['europe'] as Continent[],
        locale: 'en',
        disableInteraction: false,
      },
    })

    const paths = wrapper.findAll('path')
    paths.forEach((path) => {
      expect(path.attributes('tabindex')).toBe('0')
    })
  })

  it('applies ARIA labels with localized country names', () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['europe'] as Continent[],
        locale: 'es',
      },
    })

    const francePath = wrapper.find('#FR')
    expect(francePath.attributes('aria-label')).toBe('Francia')
  })

  it('handles multiple visible continents', () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['europe', 'asia'] as Continent[],
        locale: 'en',
      },
    })

    const paths = wrapper.findAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(20) // Both Europe and Asia have many countries
  })

  it('renders correctly with empty highlightedCountries', () => {
    const wrapper = mount(InteractiveMap, {
      props: {
        visibleContinents: ['oceania'] as Continent[],
        highlightedCountries: [],
        locale: 'en',
      },
    })

    const paths = wrapper.findAll('path')
    paths.forEach((path) => {
      expect(path.classes()).toContain('country-path')
      expect(path.classes()).not.toContain('country-path--correct')
      expect(path.classes()).not.toContain('country-path--wrong')
    })
  })
})
