import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import GameModeSelector from './GameModeSelector.vue'
import { useLocaleStore } from '@/stores/locale'
import type { GameMode } from '@/types/session'

describe('GameModeSelector', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Reset locale to English for each test
    const localeStore = useLocaleStore()
    localeStore.setLocale('en')
  })

  it('renders all four game modes', () => {
    const wrapper = mount(GameModeSelector, {
      props: {
        modelValue: 'name-it',
      },
    })

    const modes = wrapper.findAll('.mode-card')
    expect(modes).toHaveLength(4)
  })

  it('displays mode titles in English by default', () => {
    const wrapper = mount(GameModeSelector, {
      props: {
        modelValue: 'name-it',
      },
    })

    const titles = wrapper.findAll('.mode-card__title')
    expect(titles[0]?.text()).toBe('Type It')
    expect(titles[1]?.text()).toBe('Choose Flag')
    expect(titles[2]?.text()).toBe('Find on Map')
    expect(titles[3]?.text()).toBe('Name It')
  })

  it('displays mode titles in Spanish when locale is es', () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('es')

    const wrapper = mount(GameModeSelector, {
      props: {
        modelValue: 'name-it',
      },
    })

    const titles = wrapper.findAll('.mode-card__title')
    expect(titles[0]?.text()).toBe('Escríbelo')
    expect(titles[1]?.text()).toBe('Elige la Bandera')
    expect(titles[2]?.text()).toBe('Encuentra en el Mapa')
    expect(titles[3]?.text()).toBe('Nómbralo')
  })

  it('displays mode subtitles in English by default', () => {
    const wrapper = mount(GameModeSelector, {
      props: {
        modelValue: 'name-it',
      },
    })

    const subtitles = wrapper.findAll('.mode-card__subtitle')
    expect(subtitles[0]?.text()).toBe('Type the country name from memory')
    expect(subtitles[1]?.text()).toBe('Pick the correct flag from four options')
    expect(subtitles[2]?.text()).toBe('Tap the country on a world map')
    expect(subtitles[3]?.text()).toBe('See the flag, name the country')
  })

  it('displays mode subtitles in Spanish when locale is es', () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('es')

    const wrapper = mount(GameModeSelector, {
      props: {
        modelValue: 'name-it',
      },
    })

    const subtitles = wrapper.findAll('.mode-card__subtitle')
    expect(subtitles[0]?.text()).toBe('Escribe el nombre del país de memoria')
    expect(subtitles[1]?.text()).toBe('Elige la bandera correcta entre cuatro opciones')
    expect(subtitles[2]?.text()).toBe('Toca el país en un mapa mundial')
    expect(subtitles[3]?.text()).toBe('Ve la bandera, nombra el país')
  })

  it('marks the selected mode as selected', () => {
    const wrapper = mount(GameModeSelector, {
      props: {
        modelValue: 'find-on-map',
      },
    })

    const modes = wrapper.findAll('.mode-card')
    expect(modes[0]?.classes()).not.toContain('mode-card--selected') // type-it
    expect(modes[1]?.classes()).not.toContain('mode-card--selected') // choose-flag
    expect(modes[2]?.classes()).toContain('mode-card--selected') // find-on-map
    expect(modes[3]?.classes()).not.toContain('mode-card--selected') // name-it
  })

  it('emits update:modelValue when a mode is selected', async () => {
    const wrapper = mount(GameModeSelector, {
      props: {
        modelValue: 'name-it',
      },
    })

    // Click on find-on-map mode (3rd card, index 2)
    const modes = wrapper.findAll('.mode-card')
    await modes[2]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['find-on-map'])
  })

  it('includes find-on-map mode with correct icon', () => {
    const wrapper = mount(GameModeSelector, {
      props: {
        modelValue: 'name-it',
      },
    })

    const modes = wrapper.findAll('.mode-card')
    const findOnMapMode = modes[2]

    // Check that it has the map icon (polygon and lines)
    const icon = findOnMapMode?.find('.mode-card__icon')
    expect(icon?.html()).toContain('<polygon')
    expect(icon?.html()).toContain('<line')
  })

  it('reactively updates text when locale changes', async () => {
    const localeStore = useLocaleStore()
    localeStore.setLocale('en')

    const wrapper = mount(GameModeSelector, {
      props: {
        modelValue: 'find-on-map',
      },
    })

    let title = wrapper.findAll('.mode-card__title')[2]
    expect(title?.text()).toBe('Find on Map')

    // Switch to Spanish
    localeStore.setLocale('es')
    await wrapper.vm.$nextTick()

    title = wrapper.findAll('.mode-card__title')[2]
    expect(title?.text()).toBe('Encuentra en el Mapa')
  })
})
