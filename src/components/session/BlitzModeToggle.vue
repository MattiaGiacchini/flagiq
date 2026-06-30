<script setup lang="ts">
import { computed } from 'vue'
import ToggleSwitch from 'primevue/toggleswitch'
import { useLocaleStore } from '@/stores/locale'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [enabled: boolean]
}>()

const localeStore = useLocaleStore()
const locale = computed(() => localeStore.current)

const title = computed(() => 
  locale.value === 'es' ? '⚡ Modo Relámpago' : '⚡ Blitz Mode'
)

const subtitle = computed(() => 
  locale.value === 'es' ? 'Prueba de 30 segundos' : '30-second trial'
)

function handleChange(value: boolean) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="blitz-mode-toggle">
    <div class="blitz-mode-toggle__content">
      <div class="blitz-mode-toggle__labels">
        <span class="blitz-mode-toggle__title">{{ title }}</span>
        <span class="blitz-mode-toggle__subtitle">{{ subtitle }}</span>
      </div>
      <ToggleSwitch
        :modelValue="props.modelValue"
        @update:modelValue="handleChange"
      />
    </div>
  </div>
</template>

<style scoped>
.blitz-mode-toggle {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
  justify-content: center;
}

.blitz-mode-toggle__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.blitz-mode-toggle__labels {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.blitz-mode-toggle__title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1f3c;
}

.blitz-mode-toggle__subtitle {
  font-size: 0.75rem;
  color: #9ca3af;
}

.blitz-mode-toggle__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background-color: #fef3c7;
  color: #92400e;
  font-size: 0.8125rem;
  font-weight: 700;
}
</style>
