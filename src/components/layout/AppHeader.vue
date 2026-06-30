<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'

const localeStore = useLocaleStore()
const { current: locale } = storeToRefs(localeStore)
</script>

<template>
  <header class="app-header">
    <div class="app-header__brand">
      <span class="app-header__logo-box" aria-hidden="true">
        <img src="/logo.svg"  alt="Logo"/>
      </span>
      <span class="app-header__name">VexIQ</span>
    </div>

    <div class="app-header__right">
      <!-- Language toggle -->
      <div class="lang-toggle" role="group" :aria-label="locale === 'es' ? 'Idioma' : 'Language'">
        <button
          class="lang-btn"
          :class="{ 'lang-btn--active': locale === 'en' }"
          @click="localeStore.setLocale('en')"
        >
          EN
        </button>
        <button
          class="lang-btn"
          :class="{ 'lang-btn--active': locale === 'es' }"
          @click="localeStore.setLocale('es')"
        >
          ES
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e8ebf0;
  grid-column: 1 / -1;
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.app-header__logo-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  color: #ffffff;
}

.app-header__logo-box img {
  width: 2rem;
  height: 2rem;
}

.app-header__name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1f3c;
  letter-spacing: 0.01em;
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Language toggle */
.lang-toggle {
  display: flex;
  align-items: center;
  background: #f0f2f8;
  border-radius: 0.5rem;
  padding: 0.1875rem;
  gap: 0.125rem;
}

.lang-btn {
  padding: 0.25rem 0.625rem;
  border-radius: 0.3125rem;
  border: none;
  background: transparent;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #6b7280;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
  font-family: inherit;
}

.lang-btn:hover:not(.lang-btn--active) {
  color: #1a1f3c;
}

.lang-btn--active {
  background: #ffffff;
  color: #4a5af7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
