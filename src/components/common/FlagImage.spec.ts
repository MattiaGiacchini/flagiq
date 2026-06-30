import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FlagImage from './FlagImage.vue'

describe('FlagImage', () => {
  beforeEach(() => {
    // Clear console warnings
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('renders with emoji fallback initially', () => {
    const wrapper = mount(FlagImage, {
      props: {
        countryCode: 'US',
        emoji: '🇺🇸',
        alt: 'Flag of United States'
      }
    })

    const emoji = wrapper.find('.flag-emoji')
    expect(emoji.exists()).toBe(true)
    expect(emoji.text()).toBe('🇺🇸')
    expect(emoji.attributes('aria-label')).toBe('Flag of United States')
  })

  it('has proper props structure', () => {
    const wrapper = mount(FlagImage, {
      props: {
        countryCode: 'FR',
        emoji: '🇫🇷',
        alt: 'Flag of France',
        eager: true
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/flags/fr.svg')
    expect(img.attributes('alt')).toBe('Flag of France')
    expect(img.attributes('loading')).toBe('eager')
  })

  it('uses lazy loading by default', () => {
    const wrapper = mount(FlagImage, {
      props: {
        countryCode: 'JP',
        emoji: '🇯🇵',
        alt: 'Flag of Japan'
      }
    })

    const img = wrapper.find('img')
    expect(img.attributes('loading')).toBe('lazy')
  })

  it('uses eager loading when prop is true', () => {
    const wrapper = mount(FlagImage, {
      props: {
        countryCode: 'DE',
        emoji: '🇩🇪',
        alt: 'Flag of Germany',
        eager: true
      }
    })

    const img = wrapper.find('img')
    expect(img.attributes('loading')).toBe('eager')
  })

  it('hides emoji fallback when image loads', async () => {
    const wrapper = mount(FlagImage, {
      props: {
        countryCode: 'GB',
        emoji: '🇬🇧',
        alt: 'Flag of United Kingdom'
      }
    })

    const img = wrapper.find('img')
    await img.trigger('load')
    await wrapper.vm.$nextTick()

    const emoji = wrapper.find('.flag-emoji')
    expect(emoji.exists()).toBe(false)
    expect(img.isVisible()).toBe(true)
  })

  it('tries PNG fallback when SVG fails', async () => {
    const wrapper = mount(FlagImage, {
      props: {
        countryCode: 'CA',
        emoji: '🇨🇦',
        alt: 'Flag of Canada'
      }
    })

    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('/flags/ca.svg')

    // Trigger error on SVG
    await img.trigger('error')
    await wrapper.vm.$nextTick()

    // Should now try PNG
    expect(img.attributes('src')).toBe('/flags/ca.png')
  })

  it('stays on emoji fallback when both SVG and PNG fail', async () => {
    const wrapper = mount(FlagImage, {
      props: {
        countryCode: 'XX',
        emoji: '🏳️',
        alt: 'Unknown flag'
      }
    })

    const img = wrapper.find('img')

    // Trigger SVG error
    await img.trigger('error')
    await wrapper.vm.$nextTick()
    expect(img.attributes('src')).toBe('/flags/xx.png')

    // Trigger PNG error
    await img.trigger('error')
    await wrapper.vm.$nextTick()

    // Should show emoji and log warning
    const emoji = wrapper.find('.flag-emoji')
    expect(emoji.exists()).toBe(true)
    expect(console.warn).toHaveBeenCalledWith('Failed to load flag image for XX, using emoji fallback')
  })

  it('applies correct CSS classes for styling', () => {
    const wrapper = mount(FlagImage, {
      props: {
        countryCode: 'IT',
        emoji: '🇮🇹',
        alt: 'Flag of Italy'
      }
    })

    expect(wrapper.find('.flag-image').exists()).toBe(true)
    expect(wrapper.find('.flag-emoji').exists()).toBe(true)
    expect(wrapper.find('.flag-img').exists()).toBe(true)
  })
})
