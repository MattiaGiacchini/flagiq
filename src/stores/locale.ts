import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export type AppLocale = 'en' | 'es'

const STORAGE_KEY = 'flagiq-locale'

function readStoredLocale(): AppLocale {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'en' || v === 'es') return v
  } catch {
    // localStorage not available (SSR / private mode edge cases)
  }
  return 'es'
}

export const useLocaleStore = defineStore('locale', () => {
  const current = ref<AppLocale>(readStoredLocale())

  const isSpanish = computed(() => current.value === 'es')

  function setLocale(locale: AppLocale) {
    current.value = locale
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      // ignore
    }
  }

  function toggle() {
    setLocale(current.value === 'en' ? 'es' : 'en')
  }

  return { current, isSpanish, setLocale, toggle }
})
