<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import type { Question } from '@/stores/game'
import type { AppLocale } from '@/stores/locale'
import { flagName } from '@/data/flags'
import { continentName } from '@/utils/continentNames'
import InteractiveMap, { type CountryHighlight } from './InteractiveMap.vue'
import { useSessionStore } from '@/stores/session'
import FlagImage from '@/components/common/FlagImage.vue'

const props = defineProps<{
  question: Question
  locale: AppLocale
  blitzMode?: boolean
  timeRemaining?: number
}>()

const emit = defineEmits<{
  answer: [chosenId: string, hintUsed: boolean]
}>()

type FeedbackState = 'idle' | 'correct' | 'wrong'

const chosen = ref<string | null>(null)
const hintRevealed = ref(false)
const feedbackState = ref<FeedbackState>('idle')
const isMobile = ref(false)

const sessionStore = useSessionStore()

const modeLabel = computed(() =>
  props.locale === 'es'
    ? 'VER LA BANDERA · ENCUENTRA EN EL MAPA'
    : 'SEE THE FLAG · FIND ON MAP',
)

const mobileBannerText = computed(() =>
  props.locale === 'es'
    ? '¿De qué país es? - Selecciona en el mapa'
    : 'What country is this? - Select on the map',
)

const showContinentLabel = computed(() =>
  props.locale === 'es' ? 'Mostrar Continente' : 'Show Continent',
)

const continentHintText = computed(() => {
  if (!hintRevealed.value) return ''
  return continentName(props.question.correct.continent, props.locale)
})

const highlightedCountries = computed<CountryHighlight[]>(() => {
  if (!chosen.value) return []

  const highlights: CountryHighlight[] = []

  // Always highlight the correct answer in green
  highlights.push({ id: props.question.correct.id, color: 'correct' })

  // If wrong answer, also highlight it in red
  if (chosen.value !== props.question.correct.id) {
    highlights.push({ id: chosen.value, color: 'wrong' })
  }

  return highlights
})

const disableInteraction = computed(() => chosen.value !== null)

const wrongAnswerCountryName = computed(() => {
  if (feedbackState.value !== 'wrong') return ''
  return flagName(props.question.correct, props.locale)
})

const isLowTime = computed(() => {
  if (!props.blitzMode || props.timeRemaining === undefined) return false
  return props.timeRemaining < 3
})

function updateMobileState() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  updateMobileState()
  window.addEventListener('resize', updateMobileState)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMobileState)
})

// Watch question prop and reset state when it changes
watch(
  () => props.question,
  () => {
    chosen.value = null
    hintRevealed.value = false
    feedbackState.value = 'idle'
  },
)

function revealHint() {
  if (hintRevealed.value || chosen.value !== null) return
  hintRevealed.value = true
}

function handleCountryClick(countryId: string) {
  if (chosen.value !== null) return

  chosen.value = countryId
  const isCorrect = countryId === props.question.correct.id
  feedbackState.value = isCorrect ? 'correct' : 'wrong'

  // Emit answer after 1500ms delay
  setTimeout(() => {
    emit('answer', countryId, hintRevealed.value)
  }, 1500)
}
</script>

<template>
  <div class="find-on-map">
    <div class="left-panel" :data-prompt-text="mobileBannerText">
      <p class="mode-label">{{ modeLabel }}</p>

      <div class="flag-display" aria-label="Flag to identify">
        <FlagImage
          :country-code="question.correct.id"
          :emoji="question.correct.emoji"
          :alt="`Flag of ${flagName(question.correct, locale)}`"
          eager
          :show-skeleton="isMobile"
        />
      </div>

      <div class="hint-section">
        <p class="hint-label">{{ locale === 'es' ? '¿Necesitas ayuda?' : 'Need a hint?' }}</p>
        <p class="hint-description">{{ locale === 'es' ? 'Revela una pista sin penalizaciones.' : 'Reveal a clue without penalties.' }}</p>
        <button
          class="hint-btn"
          :disabled="hintRevealed || chosen !== null"
          @click="revealHint"
        >
          {{ hintRevealed ? continentHintText : showContinentLabel }}
        </button>
      </div>

      <!-- Blitz mode timer display -->
      <div v-if="blitzMode && timeRemaining !== undefined" class="timer-display" :class="{ 'timer-display--low': isLowTime }">
        <span class="timer-label">{{ locale === 'es' ? 'Tiempo' : 'Time' }}:</span>
        <span class="timer-value">{{ timeRemaining }}s</span>
      </div>

      <!-- Feedback message -->
      <div v-if="feedbackState === 'wrong'" class="feedback-message">
        {{ locale === 'es' ? 'Correcto era' : 'Correct answer' }}: {{ wrongAnswerCountryName }}
      </div>
    </div>

    <div class="map-container">
      <InteractiveMap
        :visible-continents="sessionStore.config.continents"
        :highlighted-countries="highlightedCountries"
        :disable-interaction="disableInteraction"
        :locale="locale"
        @country-clicked="handleCountryClick"
      />
    </div>
  </div>
</template>

<style scoped>
.find-on-map {
  display: grid;
  grid-template-columns: 25% 75%;
  gap: 0;
  width: 100%;
  height: calc(100vh - 180px);
  padding: 0;
  border: 1px solid #e8ebf0;
  border-radius: 1rem;
  background: #f0f2f8;
  overflow: hidden;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: #ffffff;
  border-radius: 1rem 0 0 1rem;
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid #e8ebf0;
}

.mode-label {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #4a5af7;
  background: #eef0fe;
  padding: 0.375rem 1rem;
  border-radius: 999px;
  margin: 0;
  text-align: center;
}

.flag-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 3/2;
  background: transparent;
  padding: 0;
  overflow: visible;
}

.hint-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hint-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1f3c;
  margin: 0;
}

.hint-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.hint-btn {
  padding: 0.75rem 1rem;
  background: #ffffff;
  border: 2px solid #4a5af7;
  border-radius: 0.5rem;
  color: #4a5af7;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease;
  width: 100%;
}

.hint-btn:hover:not(:disabled) {
  background: #f8f9ff;
  transform: translateY(-1px);
}

.hint-btn:disabled {
  opacity: 0.5;
  cursor: default;
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #6b7280;
}

.timer-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #ffffff;
  border: 2px solid #e8ebf0;
  border-radius: 0.5rem;
  font-weight: 600;
}

.timer-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.timer-value {
  font-size: 1.125rem;
  color: #1a1f3c;
}

.timer-display--low {
  border-color: #ef4444;
  background: #fef2f2;
  animation: pulse 0.5s ease-in-out infinite;
}

.timer-display--low .timer-value {
  color: #ef4444;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.feedback-message {
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 2px solid #ef4444;
  border-radius: 0.5rem;
  color: #991b1b;
  font-weight: 600;
  font-size: 0.875rem;
  text-align: center;
}

.map-container {
  width: 100%;
  height: 100%;
  background: #b3d9e8;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 0 1rem 1rem 0;
}

/* Mobile layout: < 768px - Map-first with overlay banner */
@media (max-width: 767px) {
  .find-on-map {
    display: block;
    position: relative;
    height: calc(100vh - 180px);
    border-radius: 1rem;
  }
  
  .left-panel {
    position: absolute;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    width: calc(100% - 2rem);
    max-width: 400px;
    padding: 1rem;
    height: auto;
    max-height: none;
    border-right: none;
    border-bottom: none;
    border-radius: 1rem;
    overflow: visible;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
  
  .left-panel .mode-label {
    display: none;
  }
  
  .left-panel .flag-display {
    aspect-ratio: 3/2;
    width: 80px;
    min-width: 80px;
    height: auto;
    flex-shrink: 0;
    margin: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .left-panel .hint-section,
  .left-panel .timer-display,
  .left-panel .feedback-message {
    display: none;
  }
  
  /* Add text prompt next to flag */
  .left-panel::after {
    content: attr(data-prompt-text);
    font-size: 0.875rem;
    font-weight: 600;
    color: #1a1f3c;
    flex: 1;
    text-align: left;
    line-height: 1.3;
  }
  
  .map-container {
    width: 100%;
    height: 100%;
    border-radius: 1rem;
  }
}
</style>
