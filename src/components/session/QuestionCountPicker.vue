<script setup lang="ts">
import { computed } from 'vue'
import { useLocaleStore } from '@/stores/locale'
import { VALID_COUNTS } from '@/types/session'
import type { QuestionCount } from '@/types/session'

const props = defineProps<{
  modelValue: QuestionCount
  availableFlags: number
}>()

const emit = defineEmits<{
  'update:modelValue': [count: QuestionCount]
}>()

const localeStore = useLocaleStore()

const effectiveCount = computed(() => {
  if (props.modelValue === 'all') {
    return props.availableFlags
  }
  return Math.min(props.modelValue as number, props.availableFlags)
})

defineExpose({ effectiveCount })

function handleSelect(count: QuestionCount) {
  if (count === props.modelValue) return
  emit('update:modelValue', count)
}

function pillLabel(count: QuestionCount): string {
  if (count === 'all') {
    return localeStore.current === 'es' ? 'Todas' : 'All'
  }
  return String(count)
}
</script>

<template>
  <div class="question-count-picker">
    <button
      v-for="count in VALID_COUNTS"
      :key="String(count)"
      class="pill"
      :class="{ 'pill--active': props.modelValue === count }"
      type="button"
      :aria-pressed="props.modelValue === count"
      @click="handleSelect(count)"
    >
      {{ pillLabel(count) }}
    </button>
  </div>
</template>

<style scoped>
.question-count-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  padding: 0.375rem 0.875rem;
  border-radius: 0.625rem;
  border: 1.5px solid #e5e7eb;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  background-color: #ffffff;
  color: #374151;
}

.pill:hover:not(.pill--active) {
  border-color: #c7d2fe;
  color: #4a5af7;
}

.pill--active {
  background-color: #1a1f3c;
  border-color: #1a1f3c;
  color: #ffffff;
}
</style>
