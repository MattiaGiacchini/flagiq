import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BlitzModeToggle from './BlitzModeToggle.vue'
import { useLocaleStore } from '@/stores/locale'

describe('BlitzModeToggle - Spanish Translation (Task 13.4)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const localeStore = useLocaleStore()
    localeStore.setLocale('en')
  })

  it('displays English text when locale is "en"', () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('en')

    const wrapper = mount(BlitzModeToggle, {
      props: { modelValue: false },
    })

    expect(wrapper.find('.blitz-mode-toggle__title').text()).toBe('⚡ Blitz Mode')
    expect(wrapper.find('.blitz-mode-toggle__subtitle').text()).toBe('60-second trial')
  })

  it('displays Spanish text when locale is "es" - Requirement 1.6', () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('es')

    const wrapper = mount(BlitzModeToggle, {
      props: { modelValue: false },
    })

    expect(wrapper.find('.blitz-mode-toggle__title').text()).toBe('⚡ Modo Relámpago')
    expect(wrapper.find('.blitz-mode-toggle__subtitle').text()).toBe('Prueba de 60 segundos')
  })

  it('updates translations when locale changes from en to es', async () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('en')

    const wrapper = mount(BlitzModeToggle, {
      props: { modelValue: false },
    })

    expect(wrapper.find('.blitz-mode-toggle__title').text()).toBe('⚡ Blitz Mode')

    // Change locale to Spanish
    localeStore.setLocale('es')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.blitz-mode-toggle__title').text()).toBe('⚡ Modo Relámpago')
    expect(wrapper.find('.blitz-mode-toggle__subtitle').text()).toBe('Prueba de 60 segundos')
  })

  it('updates translations when locale changes from es to en', async () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('es')

    const wrapper = mount(BlitzModeToggle, {
      props: { modelValue: false },
    })

    expect(wrapper.find('.blitz-mode-toggle__title').text()).toBe('⚡ Modo Relámpago')

    // Change locale to English
    localeStore.setLocale('en')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.blitz-mode-toggle__title').text()).toBe('⚡ Blitz Mode')
    expect(wrapper.find('.blitz-mode-toggle__subtitle').text()).toBe('60-second trial')
  })

  it('shows badge with "60s" when Blitz mode is enabled', () => {
    const wrapper = mount(BlitzModeToggle, {
      props: { modelValue: true },
    })

    const badge = wrapper.find('.blitz-mode-toggle__badge')
    expect(badge.exists()).toBe(true)
    expect(badge.find('.blitz-mode-toggle__badge-text').text()).toBe('60s')
  })

  it('hides badge when Blitz mode is disabled', () => {
    const wrapper = mount(BlitzModeToggle, {
      props: { modelValue: false },
    })

    const badge = wrapper.find('.blitz-mode-toggle__badge')
    expect(badge.exists()).toBe(false)
  })

  it('emits update:modelValue when toggle changes', async () => {
    const wrapper = mount(BlitzModeToggle, {
      props: { modelValue: false },
    })

    // Find the PrimeVue ToggleSwitch component
    const toggleSwitch = wrapper.findComponent({ name: 'ToggleSwitch' })
    expect(toggleSwitch.exists()).toBe(true)

    // Emit change event
    await toggleSwitch.vm.$emit('update:modelValue', true)

    // Check that the event was emitted
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })
})
