<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import type { Question } from '@/stores/game'
import type { AppLocale } from '@/stores/locale'
import { flagName } from '@/data/flags'
import { isCloseMatch } from '@/utils/normalize'
import FlagImage from '@/components/common/FlagImage.vue'
import { useGameStore } from '@/stores/game'

const props = defineProps<{
  question: Question
  locale: AppLocale
}>()

const emit = defineEmits<{
  answer: [chosenId: string]
}>()

type State = 'idle' | 'correct' | 'wrong'

const inputRef = ref<HTMLInputElement | null>(null)
const userInput = ref('')
const state = ref<State>('idle')
const correctAnswer = ref('')
const isMobile = ref(false)

// Blitz mode timer
const gameStore = useGameStore()
const blitzTimeLeft = computed(() => gameStore.blitzTimeLeft)
const isBlitzActive = computed(() => gameStore.isBlitzActive)

// Computed translations
const modeLabel = computed(() =>
  props.locale === 'es'
    ? 'VER LA BANDERA · ESCRIBE EL PAÍS'
    : 'SEE THE FLAG · TYPE THE COUNTRY',
)

const placeholder = computed(() =>
  props.locale === 'es' ? 'Escribe el país…' : 'Type the country…',
)

const submitText = computed(() =>
  props.locale === 'es' ? 'Confirmar' : 'Submit',
)

const correctRevealPrefix = computed(() =>
  props.locale === 'es' ? 'Era' : 'It was',
)

async function focusInput() {
  await nextTick()
  inputRef.value?.focus()
}

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

watch(
  () => props.question,
  async () => {
    state.value = 'idle'
    userInput.value = ''
    correctAnswer.value = ''
    await focusInput()
  },
  { immediate: true },
)

// Watch for Blitz timer expiration
watch(
  () => gameStore.isActive,
  (active) => {
    if (!active && gameStore.blitzMode) {
      // Game ended by Blitz timeout
      // The parent component will handle navigation to results
    }
  }
)

function submit() {
  if (state.value !== 'idle') return
  const raw = userInput.value.trim()
  if (!raw) return

  const target = flagName(props.question.correct, props.locale)
  const matched = isCloseMatch(raw, target)

  correctAnswer.value = target
  state.value = matched ? 'correct' : 'wrong'

  setTimeout(async () => {
    emit('answer', matched ? props.question.correct.id : '__wrong__')
    // Refocus after the next question renders
    await focusInput()
  }, 900)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') submit()
}
</script>

<template>
  <div class="type-it">
    <p class="mode-label">{{ modeLabel }}</p>

    <div class="flag-display" aria-label="Flag to identify">
      <FlagImage
        :country-code="question.correct.id"
        :emoji="question.correct.emoji"
        :alt="locale === 'es' 
          ? `Bandera de ${flagName(question.correct, locale)}` 
          : `Flag of ${flagName(question.correct, locale)}`"
        eager
        :show-skeleton="isMobile"
      />
    </div>

    <div class="input-area">
      <div
        class="input-wrapper"
        :class="{
          'input-wrapper--correct': state === 'correct',
          'input-wrapper--wrong': state === 'wrong',
        }"
      >
        <input
          ref="inputRef"
          v-model="userInput"
          class="text-input"
          type="text"
          :placeholder="placeholder"
          :disabled="state !== 'idle'"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          @keydown="handleKeydown"
        />

        <button
          v-if="state === 'idle'"
          class="submit-btn"
          :disabled="!userInput.trim()"
          @click="submit"
        >
          {{ submitText }} →
        </button>

        <span v-else class="state-icon">
          <template v-if="state === 'correct'">✓</template>
          <template v-else>✗</template>
        </span>
      </div>

      <!-- Show correct answer on wrong -->
      <Transition name="fade">
        <p v-if="state === 'wrong'" class="correct-reveal">
          {{ correctRevealPrefix }}
          <strong>{{ correctAnswer }}</strong>
        </p>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.type-it {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
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
}

/* Big flag — matches the screenshot proportions */
.flag-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 240px;
  height: auto;
  aspect-ratio: 3 / 2;
  background: transparent;
  padding: 0;
  overflow: visible;
}

.input-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 480px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  background: #ffffff;
  border: 2px solid #e8ebf0;
  border-radius: 1rem;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-wrapper:focus-within:not(.input-wrapper--correct):not(.input-wrapper--wrong) {
  border-color: #4a5af7;
  box-shadow: 0 0 0 3px rgba(74, 90, 247, 0.12);
}

.input-wrapper--correct {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.input-wrapper--wrong {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
}

.text-input {
  flex: 1;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #1a1f3c;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  min-width: 0; /* prevent overflow */
}

.text-input::placeholder {
  color: #c4c9d4;
  font-weight: 400;
}

.text-input:disabled {
  color: #6b7280;
  cursor: default;
}

/* Submit button — lives inside the input row */
.submit-btn {
  flex-shrink: 0;
  padding: 0.625rem 1.25rem;
  margin: 0.3125rem;
  background: #4a5af7;
  color: #ffffff;
  border: none;
  border-radius: 0.625rem;
  font-size: 0.9375rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s ease;
}

.submit-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  opacity: 0.88;
}

.state-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  margin: 0.25rem;
  flex-shrink: 0;
  font-size: 1.125rem;
  font-weight: 700;
  border-radius: 0.625rem;
}

.input-wrapper--correct .state-icon {
  color: #10b981;
  background: #ecfdf5;
}

.input-wrapper--wrong .state-icon {
  color: #ef4444;
  background: #fef2f2;
}

.correct-reveal {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
}

.correct-reveal strong {
  color: #1a1f3c;
  font-weight: 700;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
