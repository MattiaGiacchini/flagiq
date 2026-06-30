<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSessionStore } from '@/stores/session'
import { useGameStore } from '@/stores/game'
import { useLocaleStore } from '@/stores/locale'
import GameResults from '@/components/game/GameResults.vue'

const router = useRouter()
const sessionStore = useSessionStore()
const gameStore = useGameStore()
const localeStore = useLocaleStore()

const { config } = storeToRefs(sessionStore)
const { score, elapsedMs, answers, questions } = storeToRefs(gameStore)
const { current: locale } = storeToRefs(localeStore)

const totalQuestions = computed(() => questions.value.length)
const answeredCount = computed(() => answers.value.length)

onMounted(() => {
  // Redirect to home if no game was played
  if (answers.value.length === 0) {
    router.replace('/')
  }
})

function handleRestart() {
  router.push('/')
}

function handleHome() {
  gameStore.reset()
  sessionStore.endSession()
  router.push('/')
}
</script>

<template>
  <div class="results-view">
    <GameResults
      :score="score"
      :total="answeredCount"
      :elapsedMs="elapsedMs"
      :answers="answers"
      :locale="locale"
      :isBlitz="config.blitz"
      :blitzCompleted="answeredCount"
      :blitzTotal="totalQuestions"
      :gameMode="config.mode"
      @restart="handleRestart"
      @home="handleHome"
    />
  </div>
</template>

<style scoped>
.results-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: 2rem 1rem;
}
</style>
