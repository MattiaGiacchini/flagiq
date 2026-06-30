import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuestionCountPicker from './QuestionCountPicker.vue'
import { VALID_COUNTS } from '@/types/session'

describe('QuestionCountPicker - Task 1.1 Verification', () => {
  describe('Option rendering order', () => {
    it('should render options in the order defined by VALID_COUNTS', () => {
      const wrapper = mount(QuestionCountPicker, {
        props: {
          modelValue: 'all',
          availableFlags: 100
        }
      })

      const buttons = wrapper.findAll('.pill')
      expect(buttons).toHaveLength(4)

      // Verify the order matches VALID_COUNTS
      expect(buttons[0]?.text()).toBe('All')  // 'all'
      expect(buttons[1]?.text()).toBe('10')   // 10
      expect(buttons[2]?.text()).toBe('25')   // 25
      expect(buttons[3]?.text()).toBe('50')   // 50
    })

    it('should have "All" as the first button', () => {
      const wrapper = mount(QuestionCountPicker, {
        props: {
          modelValue: 'all',
          availableFlags: 100
        }
      })

      const firstButton = wrapper.findAll('.pill')[0]
      expect(firstButton?.text()).toBe('All')
    })

    it('should mark "all" as active when selected', () => {
      const wrapper = mount(QuestionCountPicker, {
        props: {
          modelValue: 'all',
          availableFlags: 100
        }
      })

      const firstButton = wrapper.findAll('.pill')[0]
      expect(firstButton?.classes()).toContain('pill--active')
    })

    it('should render exactly 4 option buttons', () => {
      const wrapper = mount(QuestionCountPicker, {
        props: {
          modelValue: 10,
          availableFlags: 100
        }
      })

      const buttons = wrapper.findAll('.pill')
      expect(buttons).toHaveLength(VALID_COUNTS.length)
    })
  })
})
