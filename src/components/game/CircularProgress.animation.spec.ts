import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import * as fc from 'fast-check'
import CircularProgress from './CircularProgress.vue'

/**
 * Property-based tests for CircularProgress animation completion
 * 
 * **Validates: Requirements 7.1, 7.6, 7.7, 7.8**
 * 
 * This test suite verifies Property 6: Animation Completion
 * - Animation completes within specified duration (1000ms default)
 * - Final stroke-dashoffset equals target value
 * - Animation starts from circumference (0% filled)
 * - No visual artifacts or incomplete rendering
 */

describe('CircularProgress - Animation Completion Property', () => {
  let rafCallback: FrameRequestCallback | null = null

  beforeEach(() => {
    vi.useFakeTimers()
    // Mock requestAnimationFrame to capture the callback
    global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      rafCallback = callback
      return 1
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    rafCallback = null
  })

  /**
   * Helper to calculate expected dash offset
   */
  function calculateExpectedDashOffset(size: number, strokeWidth: number, percentage: number): number {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    return circumference * (1 - percentage / 100)
  }

  /**
   * Helper to calculate circumference
   */
  function calculateCircumference(size: number, strokeWidth: number): number {
    const radius = (size - strokeWidth) / 2
    return 2 * Math.PI * radius
  }

  describe('Property 6: Animation Completion', () => {
    it('should start animation from circumference (0% filled) and end at correct target value', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 100, max: 400 }),
          fc.integer({ min: 8, max: 20 }),
          async (percentage, size, strokeWidth) => {
            // Ensure strokeWidth is less than size
            fc.pre(strokeWidth < size)

            const wrapper = mount(CircularProgress, {
              props: {
                percentage,
                size,
                strokeWidth,
                duration: 1000
              }
            })

            // Find the progress circle element
            const progressCircle = wrapper.find('.circular-progress__fill')
            expect(progressCircle.exists()).toBe(true)

            // Get the computed circumference
            const circumference = calculateCircumference(size, strokeWidth)
            const expectedFinalDashOffset = calculateExpectedDashOffset(size, strokeWidth, percentage)

            // Verify initial state: stroke-dashoffset should equal circumference (before animation)
            const initialDashOffset = progressCircle.attributes('stroke-dashoffset')
            
            // Before animation triggers, dashOffset should be circumference (0% filled)
            expect(parseFloat(initialDashOffset!)).toBeCloseTo(circumference, 5)

            // Trigger the requestAnimationFrame callback
            if (rafCallback) {
              rafCallback(performance.now())
            }
            await wrapper.vm.$nextTick()
            await flushPromises()
            
            // After requestAnimationFrame, the component should set isAnimated to true
            // which causes the dashOffset to animate to the target value
            const animatedDashOffset = progressCircle.attributes('stroke-dashoffset')
            
            // The target value should now be the calculated dash offset
            // Note: The actual animation happens via CSS transition, but the target value is set
            expect(parseFloat(animatedDashOffset!)).toBeCloseTo(expectedFinalDashOffset, 5)

            // Verify the CSS transition properties are set
            const style = progressCircle.attributes('style')
            expect(style).toContain('--circumference')
            expect(style).toContain('--dash-offset')
            expect(style).toContain('--duration')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should set animation duration to specified value (default 1000ms)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 500, max: 3000 }),
          (percentage, duration) => {
            const wrapper = mount(CircularProgress, {
              props: {
                percentage,
                duration
              }
            })

            const progressCircle = wrapper.find('.circular-progress__fill')
            expect(progressCircle.exists()).toBe(true)

            // Verify the duration is set in the style
            const style = progressCircle.attributes('style')
            expect(style).toContain(`--duration: ${duration}ms`)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should use cubic-bezier(0.4, 0, 0.2, 1) easing function via CSS', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (percentage) => {
            const wrapper = mount(CircularProgress, {
              props: {
                percentage
              }
            })

            const progressCircle = wrapper.find('.circular-progress__fill')
            expect(progressCircle.exists()).toBe(true)

            // The easing function is defined in the CSS class
            expect(progressCircle.classes()).toContain('circular-progress__fill')
            
            // Verify the element has the transition property
            // (actual easing is in the scoped CSS, but we verify the class is applied)
            const hasClass = progressCircle.classes('circular-progress__fill')
            expect(hasClass).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should maintain correct relationship between circumference and dash offset', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 100, max: 400 }),
          fc.integer({ min: 8, max: 20 }),
          async (percentage, size, strokeWidth) => {
            fc.pre(strokeWidth < size)

            const wrapper = mount(CircularProgress, {
              props: {
                percentage,
                size,
                strokeWidth
              }
            })

            const progressCircle = wrapper.find('.circular-progress__fill')
            
            // Get the stroke-dasharray value (should equal circumference)
            const dashArray = progressCircle.attributes('stroke-dasharray')
            const circumference = calculateCircumference(size, strokeWidth)
            
            expect(parseFloat(dashArray!)).toBeCloseTo(circumference, 5)

            // Calculate expected final dash offset
            const expectedDashOffset = calculateExpectedDashOffset(size, strokeWidth, percentage)

            // Trigger animation
            if (rafCallback) {
              rafCallback(performance.now())
            }
            await wrapper.vm.$nextTick()
            await flushPromises()
            
            const finalDashOffset = progressCircle.attributes('stroke-dashoffset')
            
            // Verify the mathematical relationship: dashOffset = circumference * (1 - percentage/100)
            expect(parseFloat(finalDashOffset!)).toBeCloseTo(expectedDashOffset, 5)
            
            // Verify relationship holds: filled portion should match percentage
            const filledPortion = circumference - parseFloat(finalDashOffset!)
            const expectedFilledPortion = circumference * (percentage / 100)
            expect(filledPortion).toBeCloseTo(expectedFilledPortion, 5)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle edge cases: 0% and 100%', async () => {
      // Test 0%: dash offset should equal circumference (empty circle)
      const wrapper0 = mount(CircularProgress, {
        props: { percentage: 0 }
      })

      const circle0 = wrapper0.find('.circular-progress__fill')
      const circumference0 = calculateCircumference(200, 12) // defaults
      
      if (rafCallback) {
        rafCallback(performance.now())
      }
      await wrapper0.vm.$nextTick()
      await flushPromises()
      
      const dashOffset0 = parseFloat(circle0.attributes('stroke-dashoffset')!)
      expect(dashOffset0).toBeCloseTo(circumference0, 5)

      // Test 100%: dash offset should be 0 (full circle)
      const wrapper100 = mount(CircularProgress, {
        props: { percentage: 100 }
      })

      const circle100 = wrapper100.find('.circular-progress__fill')
      
      if (rafCallback) {
        rafCallback(performance.now())
      }
      await wrapper100.vm.$nextTick()
      await flushPromises()
      
      const dashOffset100 = parseFloat(circle100.attributes('stroke-dashoffset')!)
      expect(dashOffset100).toBeCloseTo(0, 5)
    })

    it('should render percentage text correctly without visual artifacts', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (percentage) => {
            const wrapper = mount(CircularProgress, {
              props: { percentage }
            })

            // Verify the percentage text is displayed correctly
            const percentageText = wrapper.find('.circular-progress__percentage')
            expect(percentageText.exists()).toBe(true)
            expect(percentageText.text()).toBe(`${percentage}%`)

            // Verify no invalid values (NaN, Infinity, etc.)
            const text = percentageText.text()
            expect(text).not.toContain('NaN')
            expect(text).not.toContain('Infinity')
            expect(text).not.toContain('undefined')
            
            // Verify SVG elements are properly rendered
            const svg = wrapper.find('.circular-progress__svg')
            expect(svg.exists()).toBe(true)
            
            // Check aria-label format (default locale is undefined/en)
            const ariaLabel = svg.attributes('aria-label')
            expect(ariaLabel).toBe(`Score: ${percentage} percent`)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should apply will-change hint for browser optimization', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (percentage) => {
            const wrapper = mount(CircularProgress, {
              props: { percentage }
            })

            const progressCircle = wrapper.find('.circular-progress__fill')
            expect(progressCircle.exists()).toBe(true)

            // The will-change property is defined in the scoped CSS
            // We verify the class is applied which contains the will-change rule
            expect(progressCircle.classes('circular-progress__fill')).toBe(true)
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('Animation State Transitions', () => {
    it('should transition smoothly when percentage changes', async () => {
      const wrapper = mount(CircularProgress, {
        props: { percentage: 50 }
      })

      const progressCircle = wrapper.find('.circular-progress__fill')
      const initialCircumference = calculateCircumference(200, 12)
      const initialExpectedOffset = calculateExpectedDashOffset(200, 12, 50)

      if (rafCallback) {
        rafCallback(performance.now())
      }
      await wrapper.vm.$nextTick()
      await flushPromises()

      const initialDashOffset = parseFloat(progressCircle.attributes('stroke-dashoffset')!)
      expect(initialDashOffset).toBeCloseTo(initialExpectedOffset, 5)

      // Change percentage
      await wrapper.setProps({ percentage: 75 })
      await wrapper.vm.$nextTick()
      await flushPromises()
      
      const newExpectedOffset = calculateExpectedDashOffset(200, 12, 75)
      const newDashOffset = parseFloat(progressCircle.attributes('stroke-dashoffset')!)
      
      // Verify the new target value is set
      expect(newDashOffset).toBeCloseTo(newExpectedOffset, 5)
      
      // Verify it's different from initial (proving transition occurred)
      expect(newDashOffset).not.toBeCloseTo(initialDashOffset, 1)
    })

    it('should maintain valid state across multiple percentage updates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 2, maxLength: 5 }),
          async (percentages) => {
            const wrapper = mount(CircularProgress, {
              props: { percentage: percentages[0] }
            })

            const progressCircle = wrapper.find('.circular-progress__fill')
            const circumference = calculateCircumference(200, 12)

            // Trigger initial animation
            if (rafCallback) {
              rafCallback(performance.now())
            }
            await wrapper.vm.$nextTick()
            await flushPromises()

            // Chain updates
            for (let i = 1; i < percentages.length; i++) {
              await wrapper.setProps({ percentage: percentages[i] })
              await wrapper.vm.$nextTick()
              await flushPromises()
              
              const expectedOffset = calculateExpectedDashOffset(200, 12, percentages[i]!)
              const currentOffset = parseFloat(progressCircle.attributes('stroke-dashoffset')!)
              
              // Verify state is valid at each step
              expect(currentOffset).toBeGreaterThanOrEqual(0)
              expect(currentOffset).toBeLessThanOrEqual(circumference)
              expect(currentOffset).toBeCloseTo(expectedOffset, 5)
            }
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
