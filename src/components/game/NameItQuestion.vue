<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import type { Question } from '@/stores/game'
import type { AppLocale } from '@/stores/locale'
import { flagName } from '@/data/flags'
import FlagImage from '@/components/common/FlagImage.vue'
import { useGameStore } from '@/stores/game'

const props = defineProps<{
  question: Question
  locale: AppLocale
}>()

const emit = defineEmits<{
  answer: [chosenId: string]
}>()

type OptionState = 'idle' | 'correct' | 'wrong'
const chosen = ref<string | null>(null)
const optionStates = ref<Record<string, OptionState>>({})
const isMobile = ref(false)

// Blitz mode timer
const gameStore = useGameStore()
const blitzTimeLeft = computed(() => gameStore.blitzTimeLeft)
const isBlitzActive = computed(() => gameStore.isBlitzActive)

const modeLabel = computed(() =>
  props.locale === 'es'
    ? 'VER LA BANDERA · ELIGE EL PAÍS'
    : 'SEE THE FLAG · CHOOSE THE COUNTRY',
)

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

// Watch for question changes and reset state
// Using explicit options to ensure proper reactivity
watch(
  () => props.question,
  () => {
    chosen.value = null
    optionStates.value = {}
  },
  { immediate: false, deep: false }
)

// Watch for game becoming inactive (timer expiration or game end)
watch(
  () => gameStore.isActive,
  (active) => {
    if (!active && gameStore.blitzMode) {
      // Game ended by Blitz timeout
      // Component will handle navigation through router or parent
    }
  }
)

function pick(id: string) {
  if (chosen.value !== null) return
  chosen.value = id

  const isCorrect = id === props.question.correct.id
  optionStates.value[id] = isCorrect ? 'correct' : 'wrong'
  if (!isCorrect) {
    optionStates.value[props.question.correct.id] = 'correct'
  }

  setTimeout(() => emit('answer', id), 400)
}
</script>

<template>
  <div class="name-it">
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

    <div class="options" role="list" :key="question.correct.id">
      <button
        v-for="opt in question.options"
        :key="opt.id"
        class="option-btn"
        :class="{
          'option-btn--correct': optionStates[opt.id] === 'correct',
          'option-btn--wrong': optionStates[opt.id] === 'wrong',
          'option-btn--disabled': chosen !== null,
        }"
        :disabled="chosen !== null"
        role="listitem"
        @click="pick(opt.id)"
      >
        <span class="option-btn__name">{{ flagName(opt, locale) }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.name-it {
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

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  width: 100%;
  max-width: 520px;
}

.option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.25rem;
  background: #ffffff;
  border: 2px solid #e8ebf0;
  border-radius: 0.875rem;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;
  text-align: center;
}

.option-btn:hover:not(.option-btn--disabled) {
  border-color: #4a5af7;
  background: #f8f9ff;
  transform: translateY(-1px);
}

.option-btn__name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1f3c;
}

.option-btn--correct {
  border-color: #10b981;
  background: #ecfdf5;
}

.option-btn--correct .option-btn__name {
  color: #065f46;
}

.option-btn--wrong {
  border-color: #ef4444;
  background: #fef2f2;
}

.option-btn--wrong .option-btn__name {
  color: #991b1b;
}

.option-btn--disabled {
  cursor: default;
}
</style>
