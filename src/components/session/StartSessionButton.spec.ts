import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StartSessionButton from './StartSessionButton.vue'
import { useLocaleStore } from '@/stores/locale'

describe('StartSessionButton - Spanish Translation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should display "Start Session" in English when locale is "en"', () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('en')

    const wrapper = mount(StartSessionButton, {
      props: {
        disabled: false
      }
    })

    expect(wrapper.text()).toBe('Start Session')
  })

  it('should display "Iniciar Sesión" in Spanish when locale is "es"', () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('es')

    const wrapper = mount(StartSessionButton, {
      props: {
        disabled: false
      }
    })

    expect(wrapper.text()).toBe('Iniciar Sesión')
  })

  it('should display "Select at least one region" in English when disabled', () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('en')

    const wrapper = mount(StartSessionButton, {
      props: {
        disabled: true
      }
    })

    expect(wrapper.text()).toBe('Select at least one region')
  })

  it('should display "Selecciona al menos una región" in Spanish when disabled', () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('es')

    const wrapper = mount(StartSessionButton, {
      props: {
        disabled: true
      }
    })

    expect(wrapper.text()).toBe('Selecciona al menos una región')
  })

  it('should emit click:start event when clicked', async () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('en')

    const wrapper = mount(StartSessionButton, {
      props: {
        disabled: false
      }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click:start')).toBeTruthy()
  })

  it('should not emit click:start when disabled', async () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('en')

    const wrapper = mount(StartSessionButton, {
      props: {
        disabled: true
      }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click:start')).toBeFalsy()
  })
})
