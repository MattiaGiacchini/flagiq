<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { useLocaleStore } from '@/stores/locale'
import { flagsByContinent } from '@/data/flags'
import type { Continent, GameMode, QuestionCount, SessionConfig } from '@/types/session'
import ContinentFilter from './ContinentFilter.vue'
import GameModeSelector from './GameModeSelector.vue'
import QuestionCountPicker from './QuestionCountPicker.vue'
import BlitzModeToggle from './BlitzModeToggle.vue'
import StartSessionButton from './StartSessionButton.vue'

const router = useRouter()
const sessionStore = useSessionStore()
const localeStore = useLocaleStore()

// Read saved config from store (which loads from localStorage on store initialization)
const savedConfig = sessionStore.config

// Detect first-time user: check if localStorage has saved config
const hasSavedConfig = localStorage.getItem('flagiq:sessionConfig') !== null

// Initialize component state from saved config
const selectedContinents = ref<Continent[]>([...savedConfig.continents])
const selectedMode = ref<GameMode | null>(hasSavedConfig ? savedConfig.mode : null)
const selectedCount = ref<QuestionCount>(savedConfig.count)
const blitzEnabled = ref<boolean>(savedConfig.blitz)

const availableFlags = computed(() => flagsByContinent(selectedContinents.value).length)

const canStart = computed(() => selectedContinents.value.length > 0 && selectedMode.value !== null)

// Automatic "All flags" selection when Blitz mode is enabled
watch(blitzEnabled, (isEnabled) => {
  if (isEnabled) {
    selectedCount.value = 'all'
  }
})

// Translations
const translations = computed(() => {
  return localeStore.current === 'es'
    ? {
        title: 'Configuración de Sesión',
        subtitle: 'Configura tu sesión de aprendizaje a continuación.',
        continentFilter: 'Filtro de Continentes',
        gameMode: 'Modo de Juego',
        questions: 'Preguntas'
      }
    : {
        title: 'Session Setup',
        subtitle: 'Set up your learning configuration below.',
        continentFilter: 'Continent Filter',
        gameMode: 'Game Mode',
        questions: 'Questions'
      }
})

function handleStart() {
  if (selectedContinents.value.length === 0) {
    console.error('[SessionSetupPanel] Cannot start with no continents selected')
    return
  }

  if (selectedMode.value === null) {
    console.warn('[SessionSetupPanel] Cannot start with null mode')
    return
  }
  
  const currentConfig: SessionConfig = {
    continents: selectedContinents.value,
    mode: selectedMode.value,
    count: selectedCount.value,
    blitz: blitzEnabled.value,
    useSimilarity: false,
  }
  const success = sessionStore.updateConfig(currentConfig)
  if (success) {
    sessionStore.startSession()
    router.push('/play')
  } else {
    console.warn('[SessionSetupPanel] updateConfig rejected the current config — navigation aborted.')
  }
}
</script>

<template>
  <div class="session-setup-panel">
    <div class="panel-header">
      <h1 class="panel-header__title">{{ translations.title }}</h1>
      <p class="panel-header__subtitle">{{ translations.subtitle }}</p>
    </div>

    <section class="panel-section">
      <h2 class="panel-section__heading">{{ translations.continentFilter }}</h2>
      <ContinentFilter v-model="selectedContinents" />
    </section>

    <section class="panel-section">
      <h2 class="panel-section__heading">{{ translations.gameMode }}</h2>
      <GameModeSelector v-model="selectedMode" />
    </section>

    <div class="panel-row">
      <section class="panel-card">
        <h2 class="panel-section__heading">{{ translations.questions }}</h2>
        <QuestionCountPicker
          v-model="selectedCount"
          :availableFlags="availableFlags"
        />
      </section>

      <section class="panel-card">
        <BlitzModeToggle v-model="blitzEnabled" />
      </section>
    </div>

    <div class="panel-footer">
      <StartSessionButton :disabled="!canStart" @click:start="handleStart" />
    </div>
  </div>
</template>

<style scoped>
.session-setup-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 680px;
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.panel-header__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1f3c;
  margin: 0;
}

.panel-header__subtitle {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.panel-section__heading {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9ca3af;
  margin: 0;
}

.panel-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.panel-card {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 1.125rem;
  border: 1px solid #e8ebf0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.panel-card--full {
  grid-column: 1 / -1;
}

.panel-footer {
  padding-bottom: 0.5rem;
}
</style>
