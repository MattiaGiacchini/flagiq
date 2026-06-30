<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  score: number
  total: number
  elapsedMs: number
  locale?: 'en' | 'es'
}>()

const emit = defineEmits<{
  restart: []
  home: []
}>()

const percentage = computed(() => Math.round((props.score / props.total) * 100))

const message = computed(() => {
  const es = props.locale === 'es'
  if (percentage.value === 100) return es ? '¡Perfecto! 🏆' : 'Perfect! 🏆'
  if (percentage.value >= 80) return es ? '¡Muy bien! 🎉' : 'Great job! 🎉'
  if (percentage.value >= 60) return es ? 'Bien hecho 👍' : 'Well done 👍'
  if (percentage.value >= 40) return es ? 'Sigue practicando 💪' : 'Keep practicing 💪'
  return es ? 'A seguir estudiando 📚' : 'Keep studying 📚'
})

const formattedTime = computed(() => {
  const total = Math.round(props.elapsedMs / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s.toString().padStart(2, '0')}s`
})
</script>

<template>
  <div class="results">
    <div class="results__card">
      <p class="results__emoji">{{ percentage === 100 ? '🏆' : percentage >= 80 ? '🎉' : '📊' }}</p>
      <h2 class="results__message">{{ message }}</h2>

      <div class="results__score">
        <span class="results__score-number">{{ score }}</span>
        <span class="results__score-divider">/</span>
        <span class="results__score-total">{{ total }}</span>
      </div>

      <p class="results__percentage">{{ percentage }}% {{ props.locale === 'es' ? 'correcto' : 'correct' }}</p>

      <div class="results__time">
        <span class="results__time-icon">⏱</span>
        <span class="results__time-value">{{ formattedTime }}</span>
      </div>

      <div class="results__actions">
        <button class="btn btn--primary" @click="emit('restart')">
          {{ props.locale === 'es' ? 'Jugar de nuevo' : 'Play again' }}
        </button>
        <button class="btn btn--ghost" @click="emit('home')">
          {{ props.locale === 'es' ? 'Volver al inicio' : 'Back to home' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.results__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: #ffffff;
  border-radius: 1.5rem;
  padding: 3rem 2.5rem;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8ebf0;
  text-align: center;
  max-width: 380px;
  width: 100%;
}

.results__emoji {
  font-size: 3rem;
  margin: 0;
  line-height: 1;
}

.results__message {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1f3c;
  margin: 0;
}

.results__score {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.results__score-number {
  font-size: 3.5rem;
  font-weight: 800;
  color: #4a5af7;
  line-height: 1;
}

.results__score-divider {
  font-size: 2rem;
  color: #d1d5db;
  font-weight: 300;
}

.results__score-total {
  font-size: 2rem;
  font-weight: 600;
  color: #9ca3af;
}

.results__percentage {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
}

.results__time {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: #f0f2f8;
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
}

.results__time-icon {
  font-size: 0.9375rem;
}

.results__time-value {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1a1f3c;
  font-variant-numeric: tabular-nums;
}

.results__actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s ease, transform 0.1s ease;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn--primary {
  background: #4a5af7;
  color: #ffffff;
}

.btn--ghost {
  background: transparent;
  color: #6b7280;
  border: 1px solid #e8ebf0;
}
</style>
