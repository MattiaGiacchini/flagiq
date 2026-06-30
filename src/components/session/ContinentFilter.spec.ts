import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ContinentFilter from './ContinentFilter.vue'
import { ALL_CONTINENTS } from '@/types/session'
import type { Continent } from '@/types/session'

describe('ContinentFilter - Task 3.1 Toggle Logic', () => {
  describe('selectAll() toggle behavior', () => {
    it('should select all continents when not all are selected', async () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe', 'asia'] as Continent[]
        }
      })

      // Click "All Regions" button
      const allButton = wrapper.find('.chip--all')
      await allButton.trigger('click')

      // Should emit update with all continents
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emittedValue = wrapper.emitted('update:modelValue')?.[0]?.[0] as Continent[]
      expect(emittedValue).toHaveLength(ALL_CONTINENTS.length)
      expect(emittedValue).toEqual(ALL_CONTINENTS)
    })

    it('should deselect to minimum (1) when all continents are selected', async () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: [...ALL_CONTINENTS]
        }
      })

      // Click "All Regions" button
      const allButton = wrapper.find('.chip--all')
      await allButton.trigger('click')

      // Should emit update with only one continent
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emittedValue = wrapper.emitted('update:modelValue')?.[0]?.[0] as Continent[]
      expect(emittedValue).toHaveLength(1)
      expect(emittedValue[0]).toBe(ALL_CONTINENTS[0])
    })
  })

  describe('toggleContinent() minimum selection enforcement', () => {
    it('should prevent deselecting the last continent', async () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe'] as Continent[]
        }
      })

      // Find the europe chip button
      const chips = wrapper.findAll('.chip')
      const europeChip = chips.find(chip => chip.text() === 'Europe')
      expect(europeChip).toBeTruthy()

      // Try to deselect the last continent
      await europeChip!.trigger('click')

      // Should NOT emit update:modelValue
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('should allow deselecting a continent when more than one is selected', async () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe', 'asia'] as Continent[]
        }
      })

      // Find the europe chip button
      const chips = wrapper.findAll('.chip')
      const europeChip = chips.find(chip => chip.text() === 'Europe')
      expect(europeChip).toBeTruthy()

      // Deselect europe
      await europeChip!.trigger('click')

      // Should emit update with only asia
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emittedValue = wrapper.emitted('update:modelValue')?.[0]?.[0] as Continent[]
      expect(emittedValue).toEqual(['asia'])
    })

    it('should allow selecting a continent when it is not selected', async () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe'] as Continent[]
        }
      })

      // Find the asia chip button
      const chips = wrapper.findAll('.chip')
      const asiaChip = chips.find(chip => chip.text() === 'Asia')
      expect(asiaChip).toBeTruthy()

      // Select asia
      await asiaChip!.trigger('click')

      // Should emit update with europe and asia
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emittedValue = wrapper.emitted('update:modelValue')?.[0]?.[0] as Continent[]
      expect(emittedValue).toContain('europe')
      expect(emittedValue).toContain('asia')
      expect(emittedValue).toHaveLength(2)
    })
  })

  describe('disabled state styling', () => {
    it('should add chip--locked class when only one continent is selected', () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe'] as Continent[]
        }
      })

      const chips = wrapper.findAll('.chip')
      const europeChip = chips.find(chip => chip.text() === 'Europe')
      
      expect(europeChip?.classes()).toContain('chip--locked')
      expect(europeChip?.attributes('disabled')).toBeDefined()
    })

    it('should NOT add chip--locked class when more than one continent is selected', () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe', 'asia'] as Continent[]
        }
      })

      const chips = wrapper.findAll('.chip')
      const europeChip = chips.find(chip => chip.text() === 'Europe')
      const asiaChip = chips.find(chip => chip.text() === 'Asia')
      
      expect(europeChip?.classes()).not.toContain('chip--locked')
      expect(europeChip?.attributes('disabled')).toBeUndefined()
      
      expect(asiaChip?.classes()).not.toContain('chip--locked')
      expect(asiaChip?.attributes('disabled')).toBeUndefined()
    })

    it('should add aria-disabled attribute when chip is locked', () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['oceania'] as Continent[]
        }
      })

      const chips = wrapper.findAll('.chip')
      const oceaniaChip = chips.find(chip => chip.text() === 'Oceania')
      
      expect(oceaniaChip?.attributes('aria-disabled')).toBe('true')
      expect(oceaniaChip?.attributes('aria-pressed')).toBe('true')
    })
  })

  describe('visual state classes', () => {
    it('should apply chip--on class to selected continents', () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe', 'asia'] as Continent[]
        }
      })

      const chips = wrapper.findAll('.chip')
      const europeChip = chips.find(chip => chip.text() === 'Europe')
      const asiaChip = chips.find(chip => chip.text() === 'Asia')
      
      expect(europeChip?.classes()).toContain('chip--on')
      expect(asiaChip?.classes()).toContain('chip--on')
    })

    it('should apply chip--off class to unselected continents', () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe'] as Continent[]
        }
      })

      const chips = wrapper.findAll('.chip')
      const africaChip = chips.find(chip => chip.text() === 'Africa')
      
      expect(africaChip?.classes()).toContain('chip--off')
      expect(africaChip?.classes()).not.toContain('chip--on')
    })
  })
})
