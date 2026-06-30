import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SimilarityToggle from './SimilarityToggle.vue'

describe('SimilarityToggle', () => {
  describe('Component rendering', () => {
    it('should render the component with correct labels', () => {
      const wrapper = mount(SimilarityToggle, {
        props: {
          modelValue: false
        }
      })
      
      expect(wrapper.find('.similarity-toggle__title').text()).toBe('🎯 Similar Flags')
      expect(wrapper.find('.similarity-toggle__subtitle').text()).toBe('Harder options')
    })

    it('should not show challenge badge when disabled', () => {
      const wrapper = mount(SimilarityToggle, {
        props: {
          modelValue: false
        }
      })
      
      expect(wrapper.find('.similarity-toggle__badge').exists()).toBe(false)
    })

    it('should show challenge badge when enabled', () => {
      const wrapper = mount(SimilarityToggle, {
        props: {
          modelValue: true
        }
      })
      
      expect(wrapper.find('.similarity-toggle__badge').exists()).toBe(true)
      expect(wrapper.find('.similarity-toggle__badge-text').text()).toBe('Challenge')
    })
  })

  describe('Toggle interaction', () => {
    it('should emit update:modelValue when toggle changes', async () => {
      const wrapper = mount(SimilarityToggle, {
        props: {
          modelValue: false
        }
      })
      
      const vm = wrapper.vm as any
      vm.handleChange(true)
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    })

    it('should emit false when turning off', async () => {
      const wrapper = mount(SimilarityToggle, {
        props: {
          modelValue: true
        }
      })
      
      const vm = wrapper.vm as any
      vm.handleChange(false)
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })
  })

  describe('Props', () => {
    it('should accept boolean modelValue prop', () => {
      const wrapper = mount(SimilarityToggle, {
        props: {
          modelValue: true
        }
      })
      
      expect(wrapper.props('modelValue')).toBe(true)
    })
  })
})
