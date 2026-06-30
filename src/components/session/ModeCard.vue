<script setup lang="ts">
import type { GameMode } from '@/types/session'

defineProps<{
  id: GameMode
  title: string
  subtitle: string
  icon: string
  selected: boolean
}>()

const emit = defineEmits<{
  select: [id: GameMode]
}>()

function handleClick(id: GameMode, selected: boolean) {
  if (!selected) {
    emit('select', id)
  }
}
</script>

<template>
  <button
    type="button"
    class="mode-card"
    :class="{ 'mode-card--selected': selected }"
    :aria-pressed="selected"
    @click="handleClick(id, selected)"
  >
    <span class="mode-card__icon" aria-hidden="true" v-html="icon" />
    <span class="mode-card__text">
      <span class="mode-card__title">{{ title }}</span>
      <span class="mode-card__subtitle">{{ subtitle }}</span>
    </span>
  </button>
</template>

<style scoped>
.mode-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.125rem;
  border-radius: 1rem;
  border: 1.5px solid #e8ebf0;
  background-color: #ffffff;
  color: #374151;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
  width: 100%;
}

.mode-card:hover:not(.mode-card--selected) {
  border-color: #c7d2fe;
  background-color: #fafbff;
  box-shadow: 0 1px 4px rgba(74, 90, 247, 0.08);
}

.mode-card--selected {
  border-color: #4a5af7;
  background-color: #1a1f3c;
  color: #ffffff;
}

.mode-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.625rem;
  background-color: #f3f4f6;
  flex-shrink: 0;
  color: #6b7280;
}

.mode-card--selected .mode-card__icon {
  background-color: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.mode-card__icon :deep(svg) {
  width: 1.125rem;
  height: 1.125rem;
  color: inherit;
}

.mode-card__text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.mode-card__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: inherit;
  line-height: 1.2;
}

.mode-card__subtitle {
  font-size: 0.75rem;
  font-weight: 400;
  color: #9ca3af;
  line-height: 1.4;
}

.mode-card--selected .mode-card__subtitle {
  color: rgba(255, 255, 255, 0.6);
}
</style>
