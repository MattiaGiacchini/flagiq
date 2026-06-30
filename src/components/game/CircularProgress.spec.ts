import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CircularProgress from './CircularProgress.vue'

describe('CircularProgress', () => {
  beforeEach(() => {
    // Mock requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 0
    })
  })

  describe('Rendering', () => {
    it('renders the component with default props', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 70
        }
      })

      expect(wrapper.find('.circular-progress').exists()).toBe(true)
      expect(wrapper.find('.circular-progress__svg').exists()).toBe(true)
      expect(wrapper.find('.circular-progress__percentage').exists()).toBe(true)
    })

    it('displays the correct percentage text', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 85
        }
      })

      expect(wrapper.find('.circular-progress__percentage').text()).toBe('85%')
    })

    it('applies custom size prop', () => {
      const customSize = 300
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50,
          size: customSize
        }
      })

      const container = wrapper.find('.circular-progress')
      expect(container.attributes('style')).toContain(`width: ${customSize}px`)
      expect(container.attributes('style')).toContain(`height: ${customSize}px`)
    })

    it('applies custom color prop', () => {
      const customColor = '#10b981'
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50,
          color: customColor
        }
      })

      const progressCircle = wrapper.findAll('circle')[1] // Second circle is the progress
      expect(progressCircle?.attributes('stroke')).toBe(customColor)
    })

    it('applies default size when size prop is not provided', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50
        }
      })

      const container = wrapper.find('.circular-progress')
      expect(container.attributes('style')).toContain('width: 200px')
      expect(container.attributes('style')).toContain('height: 200px')
    })

    it('applies default stroke width when strokeWidth prop is not provided', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50
        }
      })

      const circles = wrapper.findAll('circle')
      expect(circles[0]?.attributes('stroke-width')).toBe('12')
      expect(circles[1]?.attributes('stroke-width')).toBe('12')
    })

    it('applies custom stroke width prop', () => {
      const customStrokeWidth = 8
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50,
          strokeWidth: customStrokeWidth
        }
      })

      const circles = wrapper.findAll('circle')
      expect(circles[0]?.attributes('stroke-width')).toBe(String(customStrokeWidth))
      expect(circles[1]?.attributes('stroke-width')).toBe(String(customStrokeWidth))
    })
  })

  describe('Percentage Validation', () => {
    it('clamps percentage to 0 when given negative value', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: -10
        }
      })

      expect(wrapper.find('.circular-progress__percentage').text()).toBe('0%')
    })

    it('clamps percentage to 100 when given value over 100', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 150
        }
      })

      expect(wrapper.find('.circular-progress__percentage').text()).toBe('100%')
    })

    it('accepts 0 as valid percentage', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 0
        }
      })

      expect(wrapper.find('.circular-progress__percentage').text()).toBe('0%')
    })

    it('accepts 100 as valid percentage', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 100
        }
      })

      expect(wrapper.find('.circular-progress__percentage').text()).toBe('100%')
    })

    it('preserves decimal percentages within range', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 75.5
        }
      })

      expect(wrapper.find('.circular-progress__percentage').text()).toBe('75.5%')
    })
  })

  describe('Circle Geometry Calculations', () => {
    it('calculates correct radius based on size and strokeWidth', () => {
      const size = 200
      const strokeWidth = 12
      const expectedRadius = (size - strokeWidth) / 2

      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50,
          size,
          strokeWidth
        }
      })

      const progressCircle = wrapper.findAll('circle')[1]
      expect(progressCircle?.attributes('r')).toBe(String(expectedRadius))
    })

    it('calculates correct center point', () => {
      const size = 200
      const expectedCenter = size / 2

      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50,
          size
        }
      })

      const circles = wrapper.findAll('circle')
      expect(circles[0]?.attributes('cx')).toBe(String(expectedCenter))
      expect(circles[0]?.attributes('cy')).toBe(String(expectedCenter))
    })

    it('calculates correct circumference', () => {
      const size = 200
      const strokeWidth = 12
      const radius = (size - strokeWidth) / 2
      const expectedCircumference = 2 * Math.PI * radius

      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50,
          size,
          strokeWidth
        }
      })

      const progressCircle = wrapper.findAll('circle')[1]
      const strokeDasharray = Number(progressCircle?.attributes('stroke-dasharray'))
      
      expect(strokeDasharray).toBeCloseTo(expectedCircumference, 5)
    })

    it('sets stroke-dasharray equal to circumference', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 75
        }
      })

      const progressCircle = wrapper.findAll('circle')[1]
      const strokeDasharray = progressCircle?.attributes('stroke-dasharray')
      
      // Should be a positive number representing circumference
      expect(Number(strokeDasharray)).toBeGreaterThan(0)
    })
  })

  describe('Dash Offset Animation', () => {
    it('initially sets stroke-dashoffset to circumference (0% filled)', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50
        }
      })

      const progressCircle = wrapper.findAll('circle')[1]
      const strokeDasharray = Number(progressCircle?.attributes('stroke-dasharray'))
      const strokeDashoffset = Number(progressCircle?.attributes('stroke-dashoffset'))
      
      // Before animation, should be equal to circumference
      expect(strokeDashoffset).toBeCloseTo(strokeDasharray, 5)
    })

    it('animates to correct dash offset for given percentage', async () => {
      const percentage = 75
      const wrapper = mount(CircularProgress, {
        props: {
          percentage
        }
      })

      await nextTick()

      const progressCircle = wrapper.findAll('circle')[1]
      const strokeDasharray = Number(progressCircle?.attributes('stroke-dasharray'))
      const strokeDashoffset = Number(progressCircle?.attributes('stroke-dashoffset'))
      
      const expectedDashOffset = strokeDasharray * (1 - percentage / 100)
      
      // After animation triggers, should match target
      expect(strokeDashoffset).toBeCloseTo(expectedDashOffset, 5)
    })

    it('calculates 0 dash offset for 100% (full circle)', async () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 100
        }
      })

      await nextTick()

      const progressCircle = wrapper.findAll('circle')[1]
      const strokeDashoffset = Number(progressCircle?.attributes('stroke-dashoffset'))
      
      expect(strokeDashoffset).toBeCloseTo(0, 5)
    })

    it('calculates circumference dash offset for 0% (empty circle)', async () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 0
        }
      })

      await nextTick()

      const progressCircle = wrapper.findAll('circle')[1]
      const strokeDasharray = Number(progressCircle?.attributes('stroke-dasharray'))
      const strokeDashoffset = Number(progressCircle?.attributes('stroke-dashoffset'))
      
      expect(strokeDashoffset).toBeCloseTo(strokeDasharray, 5)
    })

    it('calculates half circumference dash offset for 50%', async () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50
        }
      })

      await nextTick()

      const progressCircle = wrapper.findAll('circle')[1]
      const strokeDasharray = Number(progressCircle?.attributes('stroke-dasharray'))
      const strokeDashoffset = Number(progressCircle?.attributes('stroke-dashoffset'))
      
      expect(strokeDashoffset).toBeCloseTo(strokeDasharray / 2, 5)
    })
  })

  describe('SVG Attributes', () => {
    it('applies correct viewBox based on size', () => {
      const size = 250
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50,
          size
        }
      })

      const svg = wrapper.find('.circular-progress__svg')
      expect(svg.attributes('viewBox')).toBe(`0 0 ${size} ${size}`)
    })

    it('sets proper ARIA attributes for accessibility', () => {
      const percentage = 85
      const wrapper = mount(CircularProgress, {
        props: {
          percentage
        }
      })

      const svg = wrapper.find('.circular-progress__svg')
      expect(svg.attributes('role')).toBe('img')
      expect(svg.attributes('aria-label')).toBe(`Score: ${percentage} percent`)
    })

    it('applies CSS custom properties for animation', async () => {
      const duration = 1500
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50,
          duration
        }
      })

      await nextTick()

      const progressCircle = wrapper.findAll('circle')[1]
      const style = progressCircle?.attributes('style')
      
      expect(style).toContain(`--duration: ${duration}ms`)
    })
  })

  describe('CSS Classes', () => {
    it('applies correct CSS classes to elements', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50
        }
      })

      expect(wrapper.find('.circular-progress').exists()).toBe(true)
      expect(wrapper.find('.circular-progress__svg').exists()).toBe(true)
      expect(wrapper.find('.circular-progress__background').exists()).toBe(true)
      expect(wrapper.find('.circular-progress__fill').exists()).toBe(true)
      expect(wrapper.find('.circular-progress__text').exists()).toBe(true)
      expect(wrapper.find('.circular-progress__percentage').exists()).toBe(true)
    })

    it('renders two circles (background and progress)', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50
        }
      })

      const circles = wrapper.findAll('circle')
      expect(circles).toHaveLength(2)
      expect(circles[0]?.classes()).toContain('circular-progress__background')
      expect(circles[1]?.classes()).toContain('circular-progress__fill')
    })
  })

  describe('Edge Cases', () => {
    it('handles very large size values', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50,
          size: 1000
        }
      })

      expect(wrapper.find('.circular-progress').exists()).toBe(true)
      expect(wrapper.find('.circular-progress__percentage').text()).toBe('50%')
    })

    it('handles very small size values', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50,
          size: 50
        }
      })

      expect(wrapper.find('.circular-progress').exists()).toBe(true)
      expect(wrapper.find('.circular-progress__percentage').text()).toBe('50%')
    })

    it('handles strokeWidth close to size', () => {
      const wrapper = mount(CircularProgress, {
        props: {
          percentage: 50,
          size: 100,
          strokeWidth: 40
        }
      })

      const radius = (100 - 40) / 2
      const progressCircle = wrapper.findAll('circle')[1]
      
      expect(Number(progressCircle?.attributes('r'))).toBe(radius)
    })
  })
})
