<script setup lang="ts">
import { onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSessionStore } from '@/stores/session'
import { useGameStore } from '@/stores/game'
import { useLocaleStore } from '@/stores/locale'
import { flagLoader } from '@/services/flagLoader'
import GameProgressBar from '@/components/game/GameProgressBar.vue'
import NameItQuestion from '@/components/game/NameItQuestion.vue'
import ChooseFlagQuestion from '@/components/game/ChooseFlagQuestion.vue'
import TypeItQuestion from '@/components/game/TypeItQuestion.vue'
import FindOnMapQuestion from '@/components/game/FindOnMapQuestion.vue'
import GameResults from '@/components/game/GameResults.vue'

const router = useRouter()
const sessionStore = useSessionStore()
const gameStore = useGameStore()
const localeStore = useLocaleStore()

const { config } = storeToRefs(sessionStore)
const { currentQuestion, currentIndex, totalQuestions, score, streak, isFinished, elapsedMs, answers, blitzTimeLeft, isBlitzActive } = storeToRefs(gameStore)
const { current: locale } = storeToRefs(localeStore)

const t = computed(() => ({
  notEnough: locale.value === 'es'
    ? 'No hay suficientes banderas para los continentes seleccionados.'
    : 'Not enough flags for the selected continents.',
  soon: locale.value === 'es' ? 'Próximamente' : 'Coming soon',
  back: locale.value === 'es' ? 'Volver' : 'Back',
}))

onMounted(() => {
  if (!sessionStore.sessionActive) {
    router.replace('/')
    return
  }
  gameStore.startGame(config.value)
  
  // Preload first 3 flags when session starts (Requirement 4.5)
  if (gameStore.questions.length > 0) {
    flagLoader.initializeSession(gameStore.questions, 3)
  }
})

onBeforeUnmount(() => {
  // Clean up flag loader when leaving play view
  flagLoader.resetSession()
})

function handleAnswer(chosenId: string, hintUsed?: boolean) {
  gameStore.answer(chosenId, hintUsed)
  
  // Preload next 2 flags after each answer (Requirement 4.5)
  // Only preload if there are more questions remaining
  if (!gameStore.isFinished) {
    flagLoader.onQuestionAnswered(2)
  }
}

function handleRestart() {
  gameStore.startGame(config.value)
  
  // Re-initialize flag loader with new question set
  if (gameStore.questions.length > 0) {
    flagLoader.initializeSession(gameStore.questions, 3)
  }
}

function handleHome() {
  gameStore.reset()
  sessionStore.endSession()
  flagLoader.resetSession()
  router.push('/')
}
</script>

<template>
  <div class="play-view">
    <!-- Header bar -->
    <div class="play-header">
      <button class="back-btn" :aria-label="t.back" @click="handleHome">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>

      <GameProgressBar
        :current="Math.min(currentIndex + 1, totalQuestions)"
        :total="totalQuestions"
        :streak="streak"
        :locale="locale"
      />

      <!-- Blitz Mode Timer -->
      <div 
        v-if="isBlitzActive && !isFinished" 
        class="blitz-timer"
        :class="{ 'blitz-timer--warning': blitzTimeLeft <= 10 }"
        role="timer"
        :aria-live="blitzTimeLeft <= 10 ? 'assertive' : 'polite'"
        :aria-label="locale === 'es' 
          ? `Tiempo restante: ${blitzTimeLeft} segundos` 
          : `Time remaining: ${blitzTimeLeft} seconds`"
      >
        <span class="blitz-timer__icon">⚡</span>
        <span class="blitz-timer__time">{{ blitzTimeLeft }}s</span>
      </div>
    </div>

    <!-- Results screen -->
    <GameResults
      v-if="isFinished"
      :score="score"
      :total="totalQuestions"
      :elapsedMs="elapsedMs"
      :answers="answers"
      :locale="locale"
      @restart="handleRestart"
      @home="handleHome"
    />

    <!-- Question screen -->
    <template v-else-if="currentQuestion">
      <Transition name="slide" mode="out-in">
        <div :key="currentIndex" class="question-wrapper">
          <NameItQuestion
            v-if="config.mode === 'name-it'"
            :question="currentQuestion"
            :locale="locale"
            @answer="handleAnswer"
          />
          <ChooseFlagQuestion
            v-else-if="config.mode === 'choose-flag'"
            :question="currentQuestion"
            :locale="locale"
            @answer="handleAnswer"
          />
          <TypeItQuestion
            v-else-if="config.mode === 'type-it'"
            :question="currentQuestion"
            :locale="locale"
            @answer="handleAnswer"
          />
          <FindOnMapQuestion
            v-else-if="config.mode === 'find-on-map'"
            :question="currentQuestion"
            :locale="locale"
            @answer="handleAnswer"
          />
          <!-- fallback for unimplemented modes -->
          <div v-else class="mode-pending">
            <p>{{ t.soon }}</p>
            <button class="btn-home" @click="handleHome">{{ t.back }}</button>
          </div>
        </div>
      </Transition>
    </template>

    <!-- Empty pool guard -->
    <div v-else class="play-empty">
      <p>{{ t.notEnough }}</p>
      <button class="btn-home" @click="handleHome">{{ t.back }}</button>
    </div>
  </div>
</template>

<style scoped>
.play-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 1400px;
  padding-bottom: 2rem;
}

.play-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.625rem;
  border: 1.5px solid #e8ebf0;
  background: #ffffff;
  color: #6b7280;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.back-btn:hover {
  color: #1a1f3c;
  border-color: #c4c9d4;
}

/* Blitz timer in header */
.blitz-timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #f59e0b;
  border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.blitz-timer__icon {
  font-size: 1.125rem;
  line-height: 1;
}

.blitz-timer__time {
  font-size: 1rem;
  font-weight: 700;
  color: #92400e;
  font-variant-numeric: tabular-nums;
  min-width: 3ch;
  text-align: right;
}

.blitz-timer--warning {
  border-color: #ef4444;
  background: rgba(254, 242, 242, 0.95);
  animation: pulse 1s infinite;
}

.blitz-timer--warning .blitz-timer__time {
  color: #dc2626;
}

@keyframes pulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.9;
    transform: scale(1.05);
  }
}

.question-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.play-empty,
.mode-pending {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
  font-size: 0.9375rem;
  text-align: center;
  padding: 3rem 0;
}

.btn-home {
  padding: 0.625rem 1.5rem;
  background: #4a5af7;
  color: #ffffff;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
</style>
