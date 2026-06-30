<script setup lang="ts">
defineProps<{
  current: number   // 1-based
  total: number
  streak: number
  locale?: 'en' | 'es'
}>()
</script>

<template>
  <div class="progress-bar-wrapper">
    <span class="progress-bar__label">{{ current }} / {{ total }}</span>

    <div class="progress-bar__track" role="progressbar" :aria-valuenow="current" :aria-valuemax="total">
      <div
        class="progress-bar__fill"
        :style="{ width: `${(current / total) * 100}%` }"
      />
    </div>

    <span v-if="streak >= 2" class="progress-bar__streak">
      ⚡ {{ streak }} {{ locale === 'es' ? 'racha' : 'streak' }}
    </span>
  </div>
</template>

<style scoped>
.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.progress-bar__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
  min-width: 3.5rem;
}

.progress-bar__track {
  flex: 1;
  height: 6px;
  background: #e8ebf0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, #4a5af7, #818cf8);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-bar__streak {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #f59e0b;
  white-space: nowrap;
  background: #fffbeb;
  padding: 0.2rem 0.625rem;
  border-radius: 999px;
  border: 1px solid #fde68a;
}
</style>
