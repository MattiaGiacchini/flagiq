import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FlagImage from './FlagImage.vue'

describe('FlagImage', () => {
  beforeEach(() => {
    // Clear console warnings
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('renders with emoji fallback initially when showSkeleton is false', () => {
    const wrapper = mount(FlagImage, {
      props: {
        countryCode: 'US',
        emoji: '🇺🇸',
        alt: 'Flag of United States',
        showSkeleton: false
      }
    })

    const emoji = wrapper.find('.flag-emoji')
    expect(emoji.exists()).toBe(true)
    expect(emoji.text()).toBe('🇺🇸')
    expect(emoji.attributes('aria-label')).toBe('Flag of United States')
  })

  it('renders with emoji fallback initially by default (backwards compatibility)', () => {
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

  describe('skeleton loading state', () => {
    it('shows skeleton placeholder initially when showSkeleton is true', () => {
      const wrapper = mount(FlagImage, {
        props: {
          countryCode: 'FR',
          emoji: '🇫🇷',
          alt: 'Flag of France',
          showSkeleton: true
        }
      })

      const skeleton = wrapper.find('.flag-skeleton')
      expect(skeleton.exists()).toBe(true)
      expect(skeleton.attributes('role')).toBe('status')
      expect(skeleton.attributes('aria-label')).toBe('Loading flag image')

      // Should not show emoji when skeleton is shown
      const emoji = wrapper.find('.flag-emoji')
      expect(emoji.exists()).toBe(false)
    })

    it('transitions from skeleton to image on successful load', async () => {
      const wrapper = mount(FlagImage, {
        props: {
          countryCode: 'DE',
          emoji: '🇩🇪',
          alt: 'Flag of Germany',
          showSkeleton: true
        }
      })

      // Initially shows skeleton
      expect(wrapper.find('.flag-skeleton').exists()).toBe(true)
      expect(wrapper.find('.flag-emoji').exists()).toBe(false)

      // Trigger image load
      const img = wrapper.find('img')
      await img.trigger('load')
      await wrapper.vm.$nextTick()

      // Skeleton should be gone, image should be visible
      expect(wrapper.find('.flag-skeleton').exists()).toBe(false)
      expect(wrapper.find('.flag-emoji').exists()).toBe(false)
      expect(img.isVisible()).toBe(true)
    })

    it('transitions from skeleton to emoji on image error', async () => {
      const wrapper = mount(FlagImage, {
        props: {
          countryCode: 'XX',
          emoji: '🏳️',
          alt: 'Unknown flag',
          showSkeleton: true
        }
      })

      // Initially shows skeleton
      expect(wrapper.find('.flag-skeleton').exists()).toBe(true)

      const img = wrapper.find('img')

      // Trigger SVG error
      await img.trigger('error')
      await wrapper.vm.$nextTick()

      // Should still show skeleton while trying PNG fallback
      expect(wrapper.find('.flag-skeleton').exists()).toBe(true)

      // Trigger PNG error
      await img.trigger('error')
      await wrapper.vm.$nextTick()

      // Should now show emoji fallback
      expect(wrapper.find('.flag-skeleton').exists()).toBe(false)
      const emoji = wrapper.find('.flag-emoji')
      expect(emoji.exists()).toBe(true)
      expect(emoji.text()).toBe('🏳️')
    })

    it('does not show skeleton when showSkeleton is false (default behavior)', () => {
      const wrapper = mount(FlagImage, {
        props: {
          countryCode: 'JP',
          emoji: '🇯🇵',
          alt: 'Flag of Japan',
          showSkeleton: false
        }
      })

      const skeleton = wrapper.find('.flag-skeleton')
      expect(skeleton.exists()).toBe(false)

      // Should show emoji immediately
      const emoji = wrapper.find('.flag-emoji')
      expect(emoji.exists()).toBe(true)
    })
  })

  describe('FlagLoader integration', () => {
    it('uses direct path by default', async () => {
      const wrapper = mount(FlagImage, {
        props: {
          countryCode: 'US',
          emoji: '🇺🇸',
          alt: 'Flag of United States',
          showSkeleton: true
        }
      })

      // Wait for mount to complete
      await wrapper.vm.$nextTick()

      const img = wrapper.find('img')
      const src = img.attributes('src')
      
      // Should use direct path initially
      expect(src).toBe('/flags/us.svg')
    })

    it('falls back to direct path when not preloaded', async () => {
      const wrapper = mount(FlagImage, {
        props: {
          countryCode: 'ZZ',
          emoji: '🏴',
          alt: 'Test flag',
          showSkeleton: false
        }
      })

      await wrapper.vm.$nextTick()

      const img = wrapper.find('img')
      const src = img.attributes('src')
      
      // Should use direct path when not preloaded
      expect(src).toBe('/flags/zz.svg')
    })

    it('handles blob URLs in error fallback correctly', async () => {
      const wrapper = mount(FlagImage, {
        props: {
          countryCode: 'TEST',
          emoji: '🏴',
          alt: 'Test flag',
          showSkeleton: true
        }
      })

      await wrapper.vm.$nextTick()

      const img = wrapper.find('img')
      
      // Manually set a blob URL to test error handling
      const blobUrl = 'blob:http://localhost/test-uuid'
      img.element.setAttribute('src', blobUrl)
      await wrapper.vm.$nextTick()

      // Trigger error on blob URL (simulating failed load)
      await img.trigger('error')
      await wrapper.vm.$nextTick()

      // Should fall back to PNG path
      expect(img.attributes('src')).toBe('/flags/test.png')
    })

    it('imports flagLoader service correctly', async () => {
      const { flagLoader, FlagLoader } = await import('@/services/flagLoader')
      
      expect(flagLoader).toBeDefined()
      expect(FlagLoader).toBeDefined()
      expect(flagLoader).toBeInstanceOf(FlagLoader)
      expect(typeof flagLoader.load).toBe('function')
      expect(typeof flagLoader.isCached).toBe('function')
    })
  })
})
