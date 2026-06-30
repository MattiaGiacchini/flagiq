<script setup lang="ts">
import { continentName } from '@/utils/continentNames'
import type { ContinentStats } from '@/utils/continentPerformance'

withDefaults(
  defineProps<{
    performance: ContinentStats[]
    locale?: 'en' | 'es'
    compact?: boolean
  }>(),
  {
    locale: 'en',
    compact: false
  }
)

/**
 * Calculate performance color based on percentage thresholds
 * Green (100%), Blue (≥78%), Orange (50-77%), Red (<50%)
 */
function getPerformanceColor(percentage: number): string {
  // Handle NaN
  if (isNaN(percentage)) return 'low'
  
  if (percentage === 100) return 'perfect'
  if (percentage >= 78) return 'high'
  if (percentage >= 50) return 'medium'
  return 'low'
}

/**
 * Format percentage with fallback for NaN
 */
function formatPercentage(percentage: number): string {
  return isNaN(percentage) ? '0' : percentage.toString()
}
</script>

<template>
  <article class="continent-performance" :class="{ 'continent-performance--compact': compact }">
    <h3 id="continent-performance-heading" class="continent-performance__title">
      {{ locale === 'es' ? 'Rendimiento por continente' : 'Performance by Continent' }}
    </h3>
    <ul class="continent-performance__list" role="list">
      <li
        v-for="stat in performance"
        :key="stat.continent"
        class="continent-performance__item"
      >
        <div class="continent-performance__header">
          <span class="continent-performance__name">
            {{ continentName(stat.continent, locale) }}
          </span>
          <span class="continent-performance__stats" :aria-label="`${stat.correct} ${locale === 'es' ? 'de' : 'out of'} ${stat.total}`">
            {{ stat.correct }}/{{ stat.total }}
          </span>
        </div>
        <div
          class="continent-performance__bar"
          role="progressbar"
          :aria-valuenow="stat.percentage"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`${continentName(stat.continent, locale)}: ${formatPercentage(stat.percentage)}${locale === 'es' ? ' por ciento' : ' percent'}`"
        >
          <div
            class="continent-performance__bar-fill"
            :class="`continent-performance__bar-fill--${getPerformanceColor(stat.percentage)}`"
            :style="{ width: `${formatPercentage(stat.percentage)}%` }"
          >
            <span class="continent-performance__percentage-label" aria-hidden="true">
              {{ formatPercentage(stat.percentage) }}%
            </span>
          </div>
        </div>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.continent-performance {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Compact mode for right column rendering */
.continent-performance--compact {
  gap: var(--spacing-md);
}

.continent-performance__title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.02em;
}

.continent-performance--compact .continent-performance__title {
  font-size: var(--font-size-h3);
}

.continent-performance__list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.continent-performance--compact .continent-performance__list {
  gap: var(--spacing-md);
}

.continent-performance__item {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.continent-performance__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.continent-performance__name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.continent-performance__stats {
  font-size: var(--font-size-body-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* Progress bar container - adapts to content */
.continent-performance__bar {
  position: relative;
  width: 100%;
  height: auto;
  min-height: 1.5rem;
  background: #f3f4f6;
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.continent-performance--compact .continent-performance__bar {
  min-height: 1.25rem;
}

/* Progress bar fill with smooth animations and color coding */
.continent-performance__bar-fill {
  position: relative;
  height: 100%;
  min-height: 1.5rem;
  border-radius: var(--radius-sm);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), 
              background-color 0.3s ease,
              transform 0.2s ease;
  transform-origin: left;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: var(--spacing-sm);
  min-width: 3rem;
}

/* Inline percentage label within bars */
.continent-performance__percentage-label {
  font-size: 0.875rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-background);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* Hide label if bar is too narrow */
.continent-performance__bar-fill[style*="width: 0%"] .continent-performance__percentage-label,
.continent-performance__bar-fill[style*="width: 1%"] .continent-performance__percentage-label,
.continent-performance__bar-fill[style*="width: 2%"] .continent-performance__percentage-label,
.continent-performance__bar-fill[style*="width: 3%"] .continent-performance__percentage-label,
.continent-performance__bar-fill[style*="width: 4%"] .continent-performance__percentage-label,
.continent-performance__bar-fill[style*="width: 5%"] .continent-performance__percentage-label,
.continent-performance__bar-fill[style*="width: 6%"] .continent-performance__percentage-label,
.continent-performance__bar-fill[style*="width: 7%"] .continent-performance__percentage-label,
.continent-performance__bar-fill[style*="width: 8%"] .continent-performance__percentage-label,
.continent-performance__bar-fill[style*="width: 9%"] .continent-performance__percentage-label {
  display: none;
}

/* Subtle scale animation on hover for interactivity */
.continent-performance__item:hover .continent-performance__bar-fill {
  transform: scaleY(1.1);
}

/* Color coding based on performance percentage */
/* Green for perfect score (100%) */
.continent-performance__bar-fill--perfect {
  background: linear-gradient(135deg, var(--color-perfect) 0%, #059669 100%);
}

/* Blue for high performance (≥78%) */
.continent-performance__bar-fill--high {
  background: linear-gradient(135deg, var(--color-high) 0%, var(--color-primary-hover) 100%);
}

/* Orange for medium performance (50-77%) */
.continent-performance__bar-fill--medium {
  background: linear-gradient(135deg, var(--color-medium) 0%, #d97706 100%);
}

/* Red for low performance (<50%) */
.continent-performance__bar-fill--low {
  background: linear-gradient(135deg, var(--color-low) 0%, #dc2626 100%);
}

/* Mobile: Full width bars (default behavior) */
@media (max-width: 767px) {
  .continent-performance__bar {
    width: 100%;
  }
}

/* Desktop: Enhanced styling for better visual hierarchy */
@media (min-width: 768px) {
  .continent-performance {
    max-width: 600px;
  }
  
  .continent-performance__bar {
    width: 100%;
    min-height: 1.75rem;
  }

  .continent-performance--compact .continent-performance__bar {
    min-height: 1.5rem;
  }

  .continent-performance__bar-fill {
    min-height: 1.75rem;
  }

  .continent-performance--compact .continent-performance__bar-fill {
    min-height: 1.5rem;
  }
  
  .continent-performance__title {
    font-size: 1.75rem;
  }

  .continent-performance--compact .continent-performance__title {
    font-size: var(--font-size-h2);
  }

  .continent-performance__name {
    font-size: 1.0625rem;
  }
}
</style>
