<script setup lang="ts">
import FlagImage from '@/components/common/FlagImage.vue'
import type { IncorrectAnswer } from '@/utils/incorrectAnswers'

const props = withDefaults(
  defineProps<{
    incorrect: IncorrectAnswer[]
    locale?: 'en' | 'es'
    showFlags?: boolean
  }>(),
  {
    showFlags: true
  }
)

// Continent name translations
const continentNames: Record<string, { en: string; es: string }> = {
  africa: { en: 'Africa', es: 'África' },
  americas: { en: 'Americas', es: 'Américas' },
  asia: { en: 'Asia', es: 'Asia' },
  europe: { en: 'Europe', es: 'Europa' },
  oceania: { en: 'Oceania', es: 'Oceanía' }
}

function getContinentName(continent: string): string {
  const locale = props.locale ?? 'en'
  return continentNames[continent]?.[locale] ?? continent
}

function getCorrectName(item: IncorrectAnswer): string {
  const locale = props.locale ?? 'en'
  return locale === 'es' ? item.correctFlag.nameEs : item.correctFlag.name
}

function getChosenName(item: IncorrectAnswer): string {
  const locale = props.locale ?? 'en'
  return locale === 'es' ? item.chosenFlag.nameEs : item.chosenFlag.name
}

function getAnsweredLabel(): string {
  const locale = props.locale ?? 'en'
  return locale === 'es' ? 'Respondiste' : 'You answered'
}
</script>

<template>
  <div v-if="incorrect.length > 0" class="incorrect-answers">
    <h3 id="incorrect-answers-heading" class="incorrect-answers__title">
      {{ locale === 'es' ? 'Respuestas incorrectas' : 'Incorrect Answers' }}
    </h3>
    <ul class="incorrect-answers__list" role="list">
      <li
        v-for="(item, index) in incorrect"
        :key="`${item.correctFlag.id}-${index}`"
        class="incorrect-answers__card"
      >
        <!-- Correct flag image (prominent) -->
        <div v-if="showFlags" class="incorrect-answers__flag-container">
          <FlagImage
            :country-code="item.correctFlag.id.toLowerCase()"
            :emoji="item.correctFlag.emoji"
            :alt="`${getCorrectName(item)} ${locale === 'es' ? 'bandera' : 'flag'}`"
            :eager="index < 3"
            :show-skeleton="false"
            class="incorrect-answers__flag"
          />
        </div>
        
        <!-- Text content -->
        <div class="incorrect-answers__content">
          <div class="incorrect-answers__correct">
            <strong>{{ getCorrectName(item) }}</strong>
          </div>
          <div class="incorrect-answers__chosen">
            {{ getAnsweredLabel() }}: {{ getChosenName(item) }}
          </div>
          <div class="incorrect-answers__continent">
            {{ getContinentName(item.continent) }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.incorrect-answers {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.incorrect-answers__title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

.incorrect-answers__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.incorrect-answers__card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-background-subtle);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-error);
  transition: all 0.2s ease;
  cursor: default;
}

.incorrect-answers__card:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.incorrect-answers__flag-container {
  flex-shrink: 0;
  width: 4rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs);
  box-shadow: var(--shadow-sm);
}

.incorrect-answers__flag {
  width: 100%;
  height: 100%;
}

.incorrect-answers__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.incorrect-answers__correct {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  line-height: 1.4;
}

.incorrect-answers__chosen {
  font-size: var(--font-size-body-small);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.incorrect-answers__continent {
  font-size: 0.875rem;
  color: #9ca3af;
  line-height: 1.4;
  font-weight: var(--font-weight-medium);
}

/* Mobile optimization */
@media (max-width: 767px) {
  .incorrect-answers {
    gap: var(--spacing-md);
  }
  
  .incorrect-answers__card {
    padding: 0.875rem;
    gap: 0.875rem;
  }
  
  .incorrect-answers__flag-container {
    width: 3.5rem;
    height: 2.625rem;
  }
  
  .incorrect-answers__correct {
    font-size: var(--font-size-body-small);
  }
  
  .incorrect-answers__chosen {
    font-size: 0.875rem;
  }
  
  .incorrect-answers__continent {
    font-size: 0.8125rem;
  }
}

/* Desktop optimization */
@media (min-width: 768px) {
  .incorrect-answers {
    gap: var(--spacing-lg);
  }
  
  .incorrect-answers__list {
    gap: var(--spacing-md);
  }
  
  .incorrect-answers__card {
    padding: 1.25rem;
    gap: 1.25rem;
  }
  
  .incorrect-answers__flag-container {
    width: 4.5rem;
    height: 3.375rem;
  }
}
</style>
