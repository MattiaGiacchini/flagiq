import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { DEFAULT_SESSION_CONFIG } from '@/types/session'
import type { SessionConfig } from '@/types/session'
import { isValidSessionConfig } from '@/utils/sessionValidation'

const SESSION_CONFIG_KEY = 'flagiq:sessionConfig'

function saveConfigToStorage(config: SessionConfig): void {
  try {
    localStorage.setItem(SESSION_CONFIG_KEY, JSON.stringify(config))
  } catch (error) {
    console.warn('[SessionStore] Failed to save config to localStorage:', error)
  }
}

function loadConfigFromStorage(): SessionConfig | null {
  try {
    const stored = localStorage.getItem(SESSION_CONFIG_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    return isValidSessionConfig(parsed) ? parsed : null
  } catch (error) {
    console.warn('[SessionStore] Failed to load config from localStorage:', error)
    return null
  }
}

export const useSessionStore = defineStore('session', () => {
  const config = ref<SessionConfig>(loadConfigFromStorage() ?? { ...DEFAULT_SESSION_CONFIG })
  const sessionActive = ref<boolean>(false)

  const selectedContinents = computed(() => config.value.continents)
  const selectedMode = computed(() => config.value.mode)
  const selectedCount = computed(() => config.value.count)
  const blitzEnabled = computed(() => config.value.blitz)

  function updateConfig(newConfig: SessionConfig): boolean {
    if (!isValidSessionConfig(newConfig)) return false
    config.value = { ...newConfig, continents: [...newConfig.continents] }
    saveConfigToStorage(config.value)
    return true
  }

  function startSession() {
    sessionActive.value = true
  }

  function endSession() {
    sessionActive.value = false
  }

  return {
    config,
    sessionActive,
    selectedContinents,
    selectedMode,
    selectedCount,
    blitzEnabled,
    updateConfig,
    startSession,
    endSession,
  }
})
