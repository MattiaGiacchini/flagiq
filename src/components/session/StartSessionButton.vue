<script setup lang="ts">
import { computed } from 'vue'
import { useLocaleStore } from '@/stores/locale'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  'click:start': []
}>()

const localeStore = useLocaleStore()

// Translations
const translations = computed(() => {
  return localeStore.current === 'es'
    ? {
        startSession: 'Iniciar Sesión',
        selectRegion: 'Selecciona al menos una región'
      }
    : {
        startSession: 'Start Session',
        selectRegion: 'Select at least one region'
      }
})

function handleClick() {
  emit('click:start')
}
</script>

<template>
  <button
    type="button"
    class="start-session-button"
    :class="{ 'start-session-button--disabled': disabled }"
    :disabled="disabled"
    @click="handleClick"
  >
    {{ disabled ? translations.selectRegion : translations.startSession }}
  </button>
</template>

<style scoped>
.start-session-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 1rem;
  background: linear-gradient(135deg, #4a5af7, #7c5cfc);
  box-shadow: 0 4px 16px rgba(74, 90, 247, 0.35);
  color: #ffffff;
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: opacity 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
}

.start-session-button::after {
  content: '›';
  font-size: 1.25rem;
  font-weight: 400;
  line-height: 1;
}

.start-session-button:hover:not(:disabled) {
  opacity: 0.93;
  box-shadow: 0 6px 20px rgba(74, 90, 247, 0.5);
}

.start-session-button:active:not(:disabled) {
  opacity: 0.88;
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(74, 90, 247, 0.35);
}

.start-session-button--disabled {
  background: #e5e7eb;
  box-shadow: none;
  color: #9ca3af;
  cursor: not-allowed;
}

.start-session-button--disabled::after {
  content: '';
}
</style>
