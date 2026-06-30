<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  duration?: number
  color?: string
  locale?: 'en' | 'es'
}

const props = withDefaults(defineProps<CircularProgressProps>(), {
  size: 200,
  strokeWidth: 12,
  duration: 1000,
  color: '#4a5af7',
  locale: 'en'
})

// Validate and clamp percentage to 0-100 range
const validatedPercentage = computed(() => {
  return Math.max(0, Math.min(100, props.percentage))
})

// Compute aria-label based on locale
const ariaLabel = computed(() => {
  if (props.locale === 'es') {
    return `Puntuación: ${validatedPercentage.value} por ciento`
  }
  return `Score: ${validatedPercentage.value} percent`
})

// Calculate circle geometry
const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const center = computed(() => props.size / 2)

// Calculate dash offset for the given percentage
const dashOffset = computed(() => {
  return circumference.value * (1 - validatedPercentage.value / 100)
})

// Animation state
const isAnimated = ref(false)

onMounted(() => {
  // Trigger animation on next frame to ensure CSS transition works
  requestAnimationFrame(() => {
    isAnimated.value = true
  })
})
</script>

<template>
  <div class="circular-progress" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      class="circular-progress__svg"
      :aria-label="ariaLabel"
      role="img"
    >
      <!-- Background circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="strokeWidth"
        class="circular-progress__background"
      />
      
      <!-- Progress circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="strokeWidth"
        :stroke="color"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="isAnimated ? dashOffset : circumference"
        class="circular-progress__fill"
        :style="{
          '--circumference': circumference,
          '--dash-offset': dashOffset,
          '--duration': `${duration}ms`
        }"
      />
    </svg>
    
    <!-- Center text -->
    <div class="circular-progress__text">
      <span class="circular-progress__percentage">{{ validatedPercentage }}%</span>
    </div>
  </div>
</template>

<style scoped>
.circular-progress {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.circular-progress__svg {
  transform: rotate(-90deg);
}

.circular-progress__background {
  fill: none;
  stroke: var(--color-border);
}

.circular-progress__fill {
  fill: none;
  stroke-linecap: round;
  transition: stroke-dashoffset var(--duration, 1000ms) cubic-bezier(0.4, 0, 0.2, 1);
  will-change: stroke-dashoffset;
}

.circular-progress__text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.circular-progress__percentage {
  font-size: var(--font-size-display-small);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text);
  line-height: 1;
}

/* Responsive sizing */
@media (max-width: 768px) {
  .circular-progress__percentage {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .circular-progress__percentage {
    font-size: var(--font-size-h2);
  }
}
</style>
