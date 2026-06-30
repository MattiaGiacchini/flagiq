<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import type { GameMode } from '@/types/session'
import ModeCard from './ModeCard.vue'

const props = defineProps<{
  modelValue: GameMode | null
}>()

const emit = defineEmits<{
  'update:modelValue': [mode: GameMode]
}>()

const localeStore = useLocaleStore()
const { current: locale } = storeToRefs(localeStore)

interface ModeDefinition {
  id: GameMode
  titleEn: string
  titleEs: string
  subtitleEn: string
  subtitleEs: string
  icon: string
}

const MODE_DEFINITIONS: ModeDefinition[] = [
  {
    id: 'type-it',
    titleEn: 'Type It',
    titleEs: 'Escríbelo',
    subtitleEn: 'Type the country name from memory',
    subtitleEs: 'Escribe el nombre del país de memoria',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>`,
  },
  {
    id: 'choose-flag',
    titleEn: 'Choose Flag',
    titleEs: 'Elige la Bandera',
    subtitleEn: 'Pick the correct flag from four options',
    subtitleEs: 'Elige la bandera correcta entre cuatro opciones',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>`,
  },
  {
    id: 'find-on-map',
    titleEn: 'Find on Map',
    titleEs: 'Encuentra en el Mapa',
    subtitleEn: 'Tap the country on a world map',
    subtitleEs: 'Toca el país en un mapa mundial',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>`,
  },
  {
    id: 'name-it',
    titleEn: 'Name It',
    titleEs: 'Nómbralo',
    subtitleEn: 'See the flag, name the country',
    subtitleEs: 'Ve la bandera, nombra el país',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`,
  },
]

const modes = computed(() => MODE_DEFINITIONS.map(def => ({
  id: def.id,
  title: locale.value === 'es' ? def.titleEs : def.titleEn,
  subtitle: locale.value === 'es' ? def.subtitleEs : def.subtitleEn,
  icon: def.icon,
})))

function handleSelect(mode: GameMode) {
  emit('update:modelValue', mode)
}
</script>

<template>
  <div class="game-mode-selector">
    <ModeCard
      v-for="mode in modes"
      :key="mode.id"
      :id="mode.id"
      :title="mode.title"
      :subtitle="mode.subtitle"
      :icon="mode.icon"
      :selected="props.modelValue === mode.id"
      @select="handleSelect"
    />
  </div>
</template>

<style scoped>
.game-mode-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
}
</style>
