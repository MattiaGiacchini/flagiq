import type { Continent } from '@/types/session'
import type { AppLocale } from '@/stores/locale'

/**
 * Continent names in English and Spanish
 * Requirements: 8.4
 */
const CONTINENT_NAMES: Record<Continent, { en: string; es: string }> = {
  europe: { en: 'Europe', es: 'Europa' },
  asia: { en: 'Asia', es: 'Asia' },
  americas: { en: 'Americas', es: 'Américas' },
  africa: { en: 'Africa', es: 'África' },
  oceania: { en: 'Oceania', es: 'Oceanía' },
}

/**
 * Returns the localized continent name
 * @param continent - The continent identifier
 * @param locale - The current app locale ('en' or 'es')
 * @returns Localized continent name
 */
export function continentName(continent: Continent, locale: AppLocale): string {
  return CONTINENT_NAMES[continent][locale]
}
