<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Continent } from '@/types/session'
import type { AppLocale } from '@/stores/locale'
import { MAP_COUNTRIES } from '@/data/mapPaths'
import { FLAGS, flagName } from '@/data/flags'

export interface CountryHighlight {
  id: string
  color: 'correct' | 'wrong'
}

const props = withDefaults(
  defineProps<{
    visibleContinents: Continent[]
    highlightedCountries?: CountryHighlight[]
    disableInteraction?: boolean
    locale: AppLocale
  }>(),
  {
    highlightedCountries: () => [],
    disableInteraction: false,
  },
)

const emit = defineEmits<{
  countryClicked: [countryId: string]
}>()

// Pan & Zoom state
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isPanning = ref(false)
const startPanX = ref(0)
const startPanY = ref(0)

// Continent bounding boxes (viewBox coordinates for zooming)
// Calculated from actual SVG path data with 10% padding
const continentBounds: Record<Continent, { x: number; y: number; width: number; height: number }> = {
  europe: { x: 450, y: 0, width: 603, height: 346 },
  asia: { x: 538, y: 77, width: 403, height: 222 },
  africa: { x: 406, y: 122, width: 279, height: 283 },
  americas: { x: 0, y: 0, width: 443, height: 500 },
  oceania: { x: 797, y: 200, width: 203, height: 221 },
}

// Filter countries to only show those in visible continents
const visibleCountries = computed(() =>
  MAP_COUNTRIES.filter((country) => props.visibleContinents.includes(country.continent)),
)

// Calculate dynamic viewBox based on selected continents
const baseViewBox = computed(() => {
  // If all continents or multiple continents, use default world view
  if (props.visibleContinents.length !== 1) {
    return { x: 0, y: 0, width: 1000, height: 500 }
  }

  // Single continent: zoom to that continent
  const continent = props.visibleContinents[0]
  if (!continent) {
    return { x: 0, y: 0, width: 1000, height: 500 }
  }
  return continentBounds[continent]
})

// Apply pan and zoom transformations
const viewBox = computed(() => {
  const base = baseViewBox.value
  const w = base.width / scale.value
  const h = base.height / scale.value
  const x = base.x - translateX.value / scale.value + (base.width - w) / 2
  const y = base.y - translateY.value / scale.value + (base.height - h) / 2
  
  return `${x} ${y} ${w} ${h}`
})

// Reset pan & zoom when continents change
watch(() => props.visibleContinents, () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
})

// Get CSS class for a country based on highlight state
function getCountryClass(countryId: string): string {
  const highlight = props.highlightedCountries?.find((h) => h.id === countryId)
  if (!highlight) return 'country-path'

  return highlight.color === 'correct'
    ? 'country-path country-path--correct'
    : 'country-path country-path--wrong'
}

// Get country name for ARIA label
function getCountryAriaLabel(countryId: string): string {
  const flag = FLAGS.find((f) => f.id === countryId)
  if (!flag) return countryId
  return flagName(flag, props.locale)
}

// Handle country click
function handleCountryClick(countryId: string) {
  if (props.disableInteraction || isPanning.value) return
  emit('countryClicked', countryId)
}

// Handle keyboard events
function handleKeyDown(event: KeyboardEvent, countryId: string) {
  if (props.disableInteraction) return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('countryClicked', countryId)
  }
}

// Pan & Zoom handlers
function handleWheel(event: WheelEvent) {
  event.preventDefault()
  const delta = -event.deltaY / 1000
  scale.value = Math.max(0.5, Math.min(5, scale.value + delta))
}

function handleMouseDown(event: MouseEvent) {
  if (event.button !== 0) return // Only left button
  isPanning.value = true
  startPanX.value = event.clientX - translateX.value
  startPanY.value = event.clientY - translateY.value
}

function handleMouseMove(event: MouseEvent) {
  if (!isPanning.value) return
  translateX.value = event.clientX - startPanX.value
  translateY.value = event.clientY - startPanY.value
}

function handleMouseUp() {
  isPanning.value = false
}

function handleMouseLeave() {
  isPanning.value = false
}
</script>

<template>
  <svg
    :viewBox="viewBox"
    class="interactive-map"
    :class="{ 'interactive-map--panning': isPanning }"
    role="application"
    aria-label="Interactive world map"
    preserveAspectRatio="xMidYMid meet"
    @wheel.prevent="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
  >
    <path
      v-for="country in visibleCountries"
      :key="country.id"
      :id="country.id"
      :d="country.pathData"
      :class="getCountryClass(country.id)"
      :aria-label="getCountryAriaLabel(country.id)"
      :tabindex="disableInteraction ? -1 : 0"
      role="button"
      @click="handleCountryClick(country.id)"
      @keydown="(e) => handleKeyDown(e, country.id)"
    />

    <!-- Small country overlays for countries with centroids -->
    <circle
      v-for="country in visibleCountries.filter((c) => c.centroid)"
      :key="`${country.id}-overlay`"
      :cx="country.centroid![0]"
      :cy="country.centroid![1]"
      r="10"
      class="country-overlay"
      :aria-hidden="true"
      @click="handleCountryClick(country.id)"
    />
  </svg>
</template>

<style scoped>
.interactive-map {
  width: 100%;
  height: 100%;
  display: block;
  background: #b3d9e8; /* Ocean blue color */
  cursor: grab;
  user-select: none;
}

.interactive-map--panning {
  cursor: grabbing;
}

.country-path {
  fill: #a8d5a8; /* Light green for continents */
  stroke: #ffffff;
  stroke-width: 0.5;
  cursor: pointer;
  transition: fill 0.2s ease, stroke 0.2s ease;
  outline: none;
}

.country-path:hover:not(.country-path--correct):not(.country-path--wrong) {
  fill: #8fc98f; /* Slightly darker green on hover */
  stroke: #4a5af7;
  stroke-width: 1;
}

.country-path:focus {
  outline: none;
}

.country-path:focus-visible {
  stroke: #4a5af7;
  stroke-width: 2;
  outline: none;
}

.country-path--correct {
  fill: #10b981;
  stroke: #059669;
  stroke-width: 2;
  cursor: default;
  outline: none;
}

.country-path--wrong {
  fill: #ef4444;
  stroke: #dc2626;
  stroke-width: 2;
  cursor: default;
  outline: none;
}

.country-overlay {
  fill: transparent;
  pointer-events: all;
  cursor: pointer;
}
</style>
