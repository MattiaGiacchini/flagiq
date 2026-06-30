<script setup lang="ts">
import ToggleSwitch from 'primevue/toggleswitch'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [enabled: boolean]
}>()

function handleChange(value: boolean) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="similarity-toggle">
    <div class="similarity-toggle__content">
      <div class="similarity-toggle__labels">
        <span class="similarity-toggle__title">🎯 Similar Flags</span>
        <span class="similarity-toggle__subtitle">Harder options</span>
      </div>
      <ToggleSwitch
        :modelValue="props.modelValue"
        @update:modelValue="handleChange"
      />
    </div>
    <div v-if="props.modelValue" class="similarity-toggle__badge">
      <span class="similarity-toggle__badge-text">Challenge</span>
    </div>
  </div>
</template>

<style scoped>
.similarity-toggle {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
  justify-content: center;
}

.similarity-toggle__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.similarity-toggle__labels {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.similarity-toggle__title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1f3c;
}

.similarity-toggle__subtitle {
  font-size: 0.75rem;
  color: #9ca3af;
}

.similarity-toggle__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background-color: #dbeafe;
  color: #1e40af;
  font-size: 0.8125rem;
  font-weight: 700;
}
</style>
