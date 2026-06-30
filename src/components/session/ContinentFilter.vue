<script setup lang="ts">
import { ALL_CONTINENTS } from '@/types/session'
import type { Continent } from '@/types/session'

const props = defineProps<{
  modelValue: Continent[]
}>()

const emit = defineEmits<{
  'update:modelValue': [continents: Continent[]]
}>()

function selectAll() {
  if (props.modelValue.length === ALL_CONTINENTS.length) {
    // All selected → deselect to minimum (1 continent)
    const firstContinent = ALL_CONTINENTS[0]
    if (firstContinent) {
      emit('update:modelValue', [firstContinent])
    }
  } else {
    // Not all selected → select all
    emit('update:modelValue', [...ALL_CONTINENTS])
  }
}

function toggleContinent(continent: Continent) {
  const isSelected = props.modelValue.includes(continent)

  const next = isSelected
    ? props.modelValue.filter((c) => c !== continent)
    : [...props.modelValue, continent]

  emit('update:modelValue', next)
}

const continentConfig: Record<Continent, { label: string; emoji: string; activeBg: string; activeText: string; activeBorder: string }> = {
  europe: {
    label: 'Europe',
    emoji: '🌍',
    activeBg: '#ede9fe',
    activeText: '#5b21b6',
    activeBorder: '#8b5cf6',
  },
  asia: {
    label: 'Asia',
    emoji: '🌏',
    activeBg: '#fef3c7',
    activeText: '#92400e',
    activeBorder: '#f59e0b',
  },
  americas: {
    label: 'Americas',
    emoji: '🌎',
    activeBg: '#dcfce7',
    activeText: '#166534',
    activeBorder: '#22c55e',
  },
  africa: {
    label: 'Africa',
    emoji: '🌍',
    activeBg: '#fee2e2',
    activeText: '#991b1b',
    activeBorder: '#ef4444',
  },
  oceania: {
    label: 'Oceania',
    emoji: '🏝️',
    activeBg: '#ccfbf1',
    activeText: '#065f46',
    activeBorder: '#14b8a6',
  },
}
</script>

<template>
  <div class="continent-filter">
    <!-- All Regions shortcut -->
    <button
      class="chip chip--all"
      :class="{ 'chip--all-active': modelValue.length === ALL_CONTINENTS.length }"
      type="button"
      :aria-pressed="modelValue.length === ALL_CONTINENTS.length"
      @click="selectAll"
    >
      All Regions
    </button>

    <!-- Individual continent toggles -->
    <button
      v-for="continent in ALL_CONTINENTS"
      :key="continent"
      class="chip"
      :class="modelValue.includes(continent) ? 'chip--on' : 'chip--off'"
      :style="modelValue.includes(continent) ? {
        '--active-bg': continentConfig[continent].activeBg,
        '--active-text': continentConfig[continent].activeText,
        '--active-border': continentConfig[continent].activeBorder,
      } : {}"
      type="button"
      :aria-pressed="modelValue.includes(continent)"
      @click="toggleContinent(continent)"
    >
      {{ continentConfig[continent].emoji }} {{ continentConfig[continent].label }}
    </button>
  </div>
</template>

<style scoped>
.continent-filter {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.625rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1.5px solid transparent;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  gap: 0.375rem;
}

/* All Regions */
.chip--all {
  background-color: #e5e7eb;
  color: #6b7280;
  border-color: #e5e7eb;
  grid-column: 1;
}

.chip--all-active {
  background-color: #1a1f3c;
  color: #ffffff;
  border-color: #1a1f3c;
}

.chip--all:hover:not(.chip--all-active) {
  background-color: #d1d5db;
  border-color: #d1d5db;
}

/* ON: continent is selected */
.chip--on {
  background-color: var(--active-bg);
  border-color: var(--active-border);
  color: var(--active-text);
}

.chip--on:hover {
  filter: brightness(0.96);
}

/* OFF: continent is not selected — clearly dimmed */
.chip--off {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
  color: #d1d5db;
}

.chip--off:hover {
  background-color: #e9eaec;
  color: #9ca3af;
  border-color: #d1d5db;
}
</style>
