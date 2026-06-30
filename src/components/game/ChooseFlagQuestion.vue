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

const gameStore = useGameStore()

type OptionState = 'idle' | 'correct' | 'wrong'
const chosen = ref<string | null>(null)
const optionStates = ref<Record<string, OptionState>>({})
const isMobile = ref(false)

// Blitz mode timer state from store
const blitzTimeLeft = computed(() => gameStore.blitzTimeLeft)
const isBlitzActive = computed(() => gameStore.isBlitzActive)

const modeLabel = computed(() =>
  props.locale === 'es'
    ? 'VER EL PAÍS · ELIGE LA BANDERA'
    : 'SEE THE COUNTRY · CHOOSE THE FLAG',
)

// Detect if time is critically low
const isLowTime = computed(() => 
  isBlitzActive.value && blitzTimeLeft.value <= 10
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

watch(
  () => props.question,
  () => {
    chosen.value = null
    optionStates.value = {}
  },
)

// Watch for game ending due to Blitz timer expiration
watch(
  () => gameStore.isActive,
  (active) => {
    if (!active && gameStore.blitzMode) {
      // Game ended by Blitz timeout
      // The router will handle navigation to results
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
  <div class="choose-flag">
    <p class="mode-label">{{ modeLabel }}</p>

    <div class="country-display">
      <h2 class="country-name">{{ flagName(question.correct, locale) }}</h2>
    </div>

    <div class="options" role="list">
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
        :aria-label="chosen !== null 
          ? flagName(opt, locale) 
          : (locale === 'es' ? 'Opción de bandera' : 'Flag option')"
        role="listitem"
        @click="pick(opt.id)"
      >
        <FlagImage
          :country-code="opt.id"
          :emoji="opt.emoji"
          :alt="chosen !== null ? flagName(opt, locale) : ''"
          eager
          :show-skeleton="isMobile"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.choose-flag {
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

.country-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.country-name {
  font-size: 3rem;
  font-weight: 800;
  color: #1a1f3c;
  margin: 0;
  text-align: center;
  letter-spacing: -0.02em;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
  width: 100%;
  max-width: 520px;
}

.option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 3 / 2;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  transition: transform 0.1s ease, box-shadow 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.option-btn:hover:not(.option-btn--disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(74, 90, 247, 0.25);
}

.option-btn--correct {
  box-shadow: 0 0 0 3px #10b981;
}

.option-btn--wrong {
  box-shadow: 0 0 0 3px #ef4444;
}

.option-btn--disabled {
  cursor: default;
}
</style>
