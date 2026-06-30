<script setup lang="ts">
import { computed } from 'vue'
import type { AnsweredQuestion } from '@/stores/game'
import { FLAGS } from '@/data/flags'
import { calculateContinentPerformance } from '@/utils/continentPerformance'
import { extractIncorrectAnswers } from '@/utils/incorrectAnswers'
import CircularProgress from './CircularProgress.vue'
import ContinentPerformance from './ContinentPerformance.vue'
import IncorrectAnswers from './IncorrectAnswers.vue'

const props = defineProps<{
  score: number
  total: number
  elapsedMs: number
  answers: AnsweredQuestion[]
  locale?: 'en' | 'es'
  isBlitz?: boolean
  blitzCompleted?: number
  blitzTotal?: number
  gameMode?: string
}>()

const emit = defineEmits<{
  restart: []
  home: []
}>()

// Existing computed properties
const percentage = computed(() => {
  // Handle NaN by ensuring valid numbers
  if (!props.total || props.total === 0) return 0
  const calculated = Math.round((props.score / props.total) * 100)
  return isNaN(calculated) ? 0 : calculated
})

const message = computed(() => {
  const es = props.locale === 'es'
  if (percentage.value === 100) return es ? '¡Perfecto!' : 'Perfect!'
  if (percentage.value >= 80) return es ? '¡Muy bien!' : 'Great job!'
  if (percentage.value >= 60) return es ? 'Bien hecho' : 'Well done'
  if (percentage.value >= 40) return es ? 'Sigue practicando' : 'Keep practicing'
  return es ? 'A seguir estudiando' : 'Keep studying'
})

const formattedTime = computed(() => {
  if (!props.elapsedMs || isNaN(props.elapsedMs)) return 'N/A'
  const total = Math.round(props.elapsedMs / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s.toString().padStart(2, '0')}s`
})

const gameModeName = computed(() => {
  if (!props.gameMode) return ''
  
  const modeNames: Record<string, { en: string; es: string }> = {
    'name-it': { en: 'Name It', es: 'Nómbrala' },
    'choose-flag': { en: 'Choose Flag', es: 'Elige la bandera' },
    'type-it': { en: 'Type It', es: 'Escríbela' },
    'find-on-map': { en: 'Find on Map', es: 'Encuéntrala' },
  }
  
  const mode = modeNames[props.gameMode]
  return mode ? (props.locale === 'es' ? mode.es : mode.en) : props.gameMode
})

// New computed properties
const incorrectAnswers = computed(() => extractIncorrectAnswers(props.answers, FLAGS))

const continentPerformance = computed(() => calculateContinentPerformance(props.answers))

// Show/hide logic
const hasIncorrectAnswers = computed(() => incorrectAnswers.value.length > 0)
const hasContinentData = computed(() => continentPerformance.value.length > 0)
// Game data is valid if we have a total > 0 (indicating an actual game was played/configured)
const hasGameData = computed(() => props.total > 0)
</script>

<template>
  <div class="results">
    <!-- Error state: No game data -->
    <div v-if="!hasGameData" class="results__error">
      <div class="results__error-content">
        <h2 class="results__error-title">
          {{ props.locale === 'es' ? 'No hay datos disponibles' : 'No game data available' }}
        </h2>
        <p class="results__error-message">
          {{ props.locale === 'es' 
            ? 'No se encontraron datos del juego. Por favor, intenta de nuevo.' 
            : 'No game data found. Please try again.' 
          }}
        </p>
        <button class="btn btn--primary" @click="emit('home')">
          {{ props.locale === 'es' ? 'Volver al inicio' : 'Back to home' }}
        </button>
      </div>
    </div>

    <!-- Normal results display -->
    <template v-else>
      <!-- ARIA live region for results announcement to screen readers -->
      <div
        class="results__announcement"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ props.locale === 'es'
          ? `Sesión completada. Puntuación: ${score} de ${total} correctas, ${percentage} por ciento.`
          : `Session complete. Score: ${score} out of ${total} correct, ${percentage} percent.` }}
      </div>

      <div class="results__container" :class="{
        'results__container--no-incorrect': !hasIncorrectAnswers,
        'results__container--no-continent': !hasContinentData,
        'results__container--minimal': !hasIncorrectAnswers && !hasContinentData
      }">
        <!-- Left Column: Summary + Actions -->
        <div class="results__column-left">
          <!-- Summary Metrics Section -->
          <section class="results__summary" aria-labelledby="results-heading">
            <h1 id="results-heading" class="visually-hidden">
              {{ props.locale === 'es' ? 'Resultados de la sesión' : 'Session Results' }}
            </h1>

            <!-- Circular Progress Component -->
            <CircularProgress
              :percentage="percentage"
              :locale="props.locale"
              class="results__circular-progress"
            />
            
            <h2 class="results__message">{{ message }}</h2>

            <!-- Game Mode Badge -->
            <div v-if="gameModeName" class="results__mode-badge">
              {{ gameModeName }}
            </div>

            <div class="results__stats" role="group" aria-label="Score breakdown">
              <div class="results__stat">
                <span class="results__stat-value" aria-label="{{ props.locale === 'es' ? `${score} correctas` : `${score} correct` }}">{{ score }}</span>
                <span class="results__stat-label">{{ props.locale === 'es' ? 'Correctas' : 'Correct' }}</span>
              </div>
              <div class="results__stat-divider" aria-hidden="true"></div>
              <div class="results__stat">
                <span class="results__stat-value" aria-label="{{ props.locale === 'es' ? `${total - score} incorrectas` : `${total - score} incorrect` }}">{{ total - score }}</span>
                <span class="results__stat-label">{{ props.locale === 'es' ? 'Incorrectas' : 'Incorrect' }}</span>
              </div>
            </div>

            <div class="results__time-section">
              <div class="results__time" role="timer" :aria-label="props.locale === 'es' ? `Tiempo transcurrido: ${formattedTime}` : `Time elapsed: ${formattedTime}`">
                <span class="results__time-value">{{ formattedTime }}</span>
              </div>
              
              <!-- Blitz completion info - subtle placement below time -->
              <div v-if="isBlitz && blitzCompleted !== undefined && blitzTotal !== undefined" class="results__blitz-info">
                {{ blitzCompleted }} / {{ blitzTotal }}
                <span class="results__blitz-label">{{ props.locale === 'es' ? 'completadas' : 'completed' }}</span>
              </div>
            </div>
          </section>

          <!-- Action Buttons -->
          <nav class="results__actions" aria-label="Game actions">
            <button
              class="btn btn--primary"
              @click="emit('restart')"
              :aria-label="props.locale === 'es' ? 'Jugar de nuevo con la misma configuración' : 'Play again with same settings'"
            >
              {{ props.locale === 'es' ? 'Jugar de nuevo' : 'Play again' }}
            </button>
            <button
              class="btn btn--ghost"
              @click="emit('home')"
              :aria-label="props.locale === 'es' ? 'Volver a la pantalla de inicio' : 'Return to home screen'"
            >
              {{ props.locale === 'es' ? 'Volver al inicio' : 'Back to home' }}
            </button>
          </nav>
        </div>

        <!-- Right Column: Continent Performance + Incorrect Answers -->
        <div class="results__column-right" v-if="hasContinentData || hasIncorrectAnswers">
          <!-- Continent Performance Section - only show if data exists -->
          <section v-if="hasContinentData" class="results__section results__section--continent" aria-labelledby="continent-performance-heading">
            <ContinentPerformance
              :performance="continentPerformance"
              :locale="props.locale"
            />
          </section>

          <!-- Incorrect Answers Section - only show if incorrect answers exist -->
          <section v-if="hasIncorrectAnswers" class="results__section results__section--incorrect" aria-labelledby="incorrect-answers-heading">
            <IncorrectAnswers
              :incorrect="incorrectAnswers"
              :locale="props.locale"
            />
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Visually hidden but accessible to screen readers */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ARIA live region for screen reader announcements */
.results__announcement {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* Error state */
.results__error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  width: 100%;
  padding: 2rem;
}

.results__error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #ffffff;
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  max-width: 500px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8ebf0;
  gap: 1rem;
}

.results__error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1f3c;
  margin: 0;
}

.results__error-message {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.results {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 60vh;
  padding: 0;
  width: 100%;
}

/* Mobile Layout: Single Column Stack (<768px) */
.results__container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-card-gap);
  width: 100%;
  max-width: 1200px;
  padding: 0;
}

.results__column-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-card-gap);
}

.results__column-right {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-card-gap);
}

.results__summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-background);
  border-radius: var(--radius-xl);
  padding: 1.5rem 1rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  text-align: center;
  gap: var(--spacing-lg);
  /* Performance: Layout isolation to prevent reflow propagation */
  contain: layout;
}

.results__circular-progress {
  margin-bottom: var(--spacing-sm);
}

.results__section {
  background: var(--color-background);
  border-radius: var(--radius-xl);
  padding: 1.5rem 1rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  /* Performance: Layout isolation to prevent reflow propagation */
  contain: layout;
}

.results__message {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

.results__mode-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 0.8125rem;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.results__stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  width: 100%;
  justify-content: center;
}

.results__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.results__stat-value {
  font-size: var(--font-size-display-small);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text);
  line-height: 1;
}

.results__stat-label {
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.results__stat-divider {
  width: 1px;
  height: 2.5rem;
  background: var(--color-border);
}

.results__time-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
}

.results__time {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f8;
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-full);
}

.results__blitz-info {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-variant-numeric: tabular-nums;
}

.results__blitz-label {
  font-weight: var(--font-weight-normal);
  opacity: 0.8;
}

.results__time-value {
  font-size: var(--font-size-body-small);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.results__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 100%;
}

.btn {
  padding: 0.75rem var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body-small);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  border: none;
  transition: opacity 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
  min-height: 44px; /* Touch-friendly minimum on mobile */
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
  opacity: 0.85;
}

/* Focus states for keyboard navigation - WCAG AA compliant */
.btn:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn:focus:not(:focus-visible) {
  outline: none;
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(74, 90, 247, 0.2);
}

.btn--primary {
  background: var(--color-primary);
  color: var(--color-background);
}

.btn--primary:focus-visible {
  box-shadow: 0 0 0 4px rgba(74, 90, 247, 0.3);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.btn--ghost:focus-visible {
  outline-color: var(--color-text-secondary);
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.2);
}

/* Desktop Layout: Two-Column Flexbox (≥768px) */
@media (min-width: 768px) {
  .results {
    padding: 2rem;
  }

  .results__container {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-card-gap-desktop);
    padding: 0;
    align-items: flex-start;
  }

  /* Left column (summary + actions) - 40% width */
  .results__column-left {
    flex: 0 0 40%;
    min-width: 0;
  }

  /* Right column (continent + incorrect) - 60% width */
  .results__column-right {
    flex: 1;
    min-width: 0;
  }

  .btn {
    width: 100%;
  }
}
</style>
