import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import GameModeSelector from './GameModeSelector.vue'
import { useSessionStore } from '@/stores/session'
import { useLocaleStore } from '@/stores/locale'

describe('GameModeSelector Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const localeStore = useLocaleStore()
    localeStore.setLocale('en')
  })

  it('integrates with Session Store to store find-on-map mode', async () => {
    const sessionStore = useSessionStore()
    
    const wrapper = mount(GameModeSelector, {
      props: {
        modelValue: sessionStore.selectedMode,
        'onUpdate:modelValue': (mode: string) => {
          sessionStore.updateConfig({ 
            ...sessionStore.config, 
            mode: mode as any 
          })
        }
      },
    })

    // Initially should be 'name-it' (default)
    expect(sessionStore.selectedMode).toBe('name-it')

    // Click find-on-map mode (3rd card)
    const modes = wrapper.findAll('.mode-card')
    await modes[2]?.trigger('click')

    // Manually trigger the update (simulating v-model behavior)
    const emittedMode = wrapper.emitted('update:modelValue')?.[0]?.[0]
    if (emittedMode) {
      sessionStore.updateConfig({ 
        ...sessionStore.config, 
        mode: emittedMode as any 
      })
    }

    // Verify Session Store now has find-on-map
    expect(sessionStore.selectedMode).toBe('find-on-map')
    expect(sessionStore.config.mode).toBe('find-on-map')
  })

  it('validates that GameMode type includes find-on-map', () => {
    const sessionStore = useSessionStore()
    
    // This should not throw a TypeScript error and should work at runtime
    const validConfig = {
      continents: ['europe' as const],
      mode: 'find-on-map' as const,
      count: 10 as const,
      blitz: false,
    }

    const result = sessionStore.updateConfig(validConfig)
    expect(result).toBe(true)
    expect(sessionStore.config.mode).toBe('find-on-map')
  })

  it('displays find-on-map with correct translations', async () => {
    const localeStore = useLocaleStore()
    
    // Test English
    localeStore.setLocale('en')
    const wrapperEn = mount(GameModeSelector, {
      props: { modelValue: 'find-on-map' },
    })
    
    const titleEn = wrapperEn.findAll('.mode-card__title')[2]
    const subtitleEn = wrapperEn.findAll('.mode-card__subtitle')[2]
    expect(titleEn?.text()).toBe('Find on Map')
    expect(subtitleEn?.text()).toBe('Tap the country on a world map')

    // Test Spanish
    localeStore.setLocale('es')
    const wrapperEs = mount(GameModeSelector, {
      props: { modelValue: 'find-on-map' },
    })
    
    const titleEs = wrapperEs.findAll('.mode-card__title')[2]
    const subtitleEs = wrapperEs.findAll('.mode-card__subtitle')[2]
    expect(titleEs?.text()).toBe('Encuentra en el Mapa')
    expect(subtitleEs?.text()).toBe('Toca el país en un mapa mundial')
  })
})
