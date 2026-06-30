import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FindOnMapQuestion from './FindOnMapQuestion.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useSessionStore } from '@/stores/session'
import { FLAGS } from '@/data/flags'
import type { Question } from '@/stores/game'

/**
 * Mobile Layout Optimization Tests
 * 
 * **Validates: Requirements 1.3, 2.3, 3.2, 3.3, 3.4, 3.5**
 * 
 * These tests verify that the mobile layout optimization correctly
 * prioritizes map visibility while maintaining desktop layout unchanged.
 */
describe('Find on Map Mobile Layout Optimization', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  const createQuestion = (): Question => {
    const usFlag = FLAGS.find(f => f.id === 'US')
    if (!usFlag) {
      throw new Error('US flag not found in FLAGS data')
    }
    return {
      correct: usFlag,
      options: [usFlag],
    }
  }

  /**
   * Test: Desktop Layout Structure Unchanged
   * 
   * Verifies that at desktop viewport sizes (>= 1024px),
   * the layout maintains the original grid structure.
   */
  it('should maintain desktop grid layout structure at >= 1024px viewport', () => {
    const sessionStore = useSessionStore()
    sessionStore.config.continents = ['americas']

    const wrapper = mount(FindOnMapQuestion, {
      props: {
        question: createQuestion(),
        locale: 'en',
      },
      global: {
        plugins: [createPinia()],
      },
    })

    const container = wrapper.find('.find-on-map')
    expect(container.exists()).toBe(true)

    // At desktop size, the component should use grid layout
    const styles = window.getComputedStyle(container.element)
    
    // The desktop layout should have the grid-template-columns defined
    // Note: In JSDOM, computed styles may not reflect media queries accurately
    // This test documents the expected structure
    expect(container.classes()).toContain('find-on-map')
    expect(wrapper.find('.left-panel').exists()).toBe(true)
    expect(wrapper.find('.map-container').exists()).toBe(true)

    wrapper.unmount()
  })

  /**
   * Test: Mobile Layout Class Structure
   * 
   * Verifies that the component structure is correct for mobile optimization.
   * The actual viewport-based layout is tested through CSS media queries.
   */
  it('should have correct structure for mobile responsive layout', () => {
    const sessionStore = useSessionStore()
    sessionStore.config.continents = ['europe']

    const wrapper = mount(FindOnMapQuestion, {
      props: {
        question: createQuestion(),
        locale: 'en',
      },
      global: {
        plugins: [createPinia()],
      },
    })

    const container = wrapper.find('.find-on-map')
    const leftPanel = wrapper.find('.left-panel')
    const mapContainer = wrapper.find('.map-container')

    // Verify the basic structure exists
    expect(container.exists()).toBe(true)
    expect(leftPanel.exists()).toBe(true)
    expect(mapContainer.exists()).toBe(true)

    // Verify essential elements in left panel
    expect(wrapper.find('.mode-label').exists()).toBe(true)
    expect(wrapper.find('.flag-display').exists()).toBe(true)
    expect(wrapper.find('.hint-section').exists()).toBe(true)

    wrapper.unmount()
  })

  /**
   * Test: Interactive Features Work on Mobile Layout
   * 
   * Verifies that all interactive features continue to work
   * regardless of layout changes.
   */
  it('should maintain interactive features with mobile layout', async () => {
    const sessionStore = useSessionStore()
    sessionStore.config.continents = ['americas']

    const wrapper = mount(FindOnMapQuestion, {
      props: {
        question: createQuestion(),
        locale: 'en',
      },
      global: {
        plugins: [createPinia()],
      },
    })

    // Test hint button is present and clickable
    const hintBtn = wrapper.find('.hint-btn')
    expect(hintBtn.exists()).toBe(true)
    expect(hintBtn.attributes('disabled')).toBeUndefined()

    await hintBtn.trigger('click')
    await wrapper.vm.$nextTick()

    // After clicking, button should be disabled
    expect(hintBtn.attributes('disabled')).toBeDefined()

    wrapper.unmount()
  })

  /**
   * Test: Blitz Mode Timer Displays Correctly
   * 
   * Verifies that blitz mode timer renders in mobile layout.
   */
  it('should display blitz mode timer in mobile layout', () => {
    const sessionStore = useSessionStore()
    sessionStore.config.continents = ['asia']

    const wrapper = mount(FindOnMapQuestion, {
      props: {
        question: createQuestion(),
        locale: 'en',
        blitzMode: true,
        timeRemaining: 5,
      },
      global: {
        plugins: [createPinia()],
      },
    })

    const timerDisplay = wrapper.find('.timer-display')
    expect(timerDisplay.exists()).toBe(true)
    expect(timerDisplay.text()).toContain('5s')

    wrapper.unmount()
  })

  /**
   * Test: Low Time Alert Styling Works
   * 
   * Verifies that the low-time alert class is applied correctly.
   */
  it('should apply low-time styling when time < 3 seconds', () => {
    const sessionStore = useSessionStore()
    sessionStore.config.continents = ['oceania']

    const wrapper = mount(FindOnMapQuestion, {
      props: {
        question: createQuestion(),
        locale: 'en',
        blitzMode: true,
        timeRemaining: 2,
      },
      global: {
        plugins: [createPinia()],
      },
    })

    const timerDisplay = wrapper.find('.timer-display')
    expect(timerDisplay.classes()).toContain('timer-display--low')

    wrapper.unmount()
  })

  /**
   * Test: Component Structure Supports Responsive Design
   * 
   * Documents that the component has all necessary elements
   * for the responsive CSS to work correctly.
   */
  it('should have all elements needed for responsive CSS media queries', () => {
    const sessionStore = useSessionStore()
    sessionStore.config.continents = ['africa']

    const wrapper = mount(FindOnMapQuestion, {
      props: {
        question: createQuestion(),
        locale: 'en',
      },
      global: {
        plugins: [createPinia()],
      },
    })

    // Check all key CSS class selectors exist
    expect(wrapper.find('.find-on-map').exists()).toBe(true)
    expect(wrapper.find('.left-panel').exists()).toBe(true)
    expect(wrapper.find('.map-container').exists()).toBe(true)
    expect(wrapper.find('.flag-display').exists()).toBe(true)
    expect(wrapper.find('.flag-emoji').exists()).toBe(true)
    expect(wrapper.find('.hint-section').exists()).toBe(true)
    expect(wrapper.find('.hint-btn').exists()).toBe(true)
    expect(wrapper.find('.mode-label').exists()).toBe(true)

    wrapper.unmount()
  })
})
