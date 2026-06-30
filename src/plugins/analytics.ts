/**
 * Analytics Plugin for Vue
 * 
 * Provides device detection, page view tracking, and game event tracking
 * for PostHog analytics integration.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import type { App } from 'vue'
import type { Router } from 'vue-router'
import { analytics } from '@/services/analytics'
import { watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { useSessionStore } from '@/stores/session'

interface AnalyticsPluginOptions {
  router: Router
}

/**
 * Detect device type based on viewport width
 * 
 * @returns 'mobile' if viewport width < 768px, 'desktop' otherwise
 * 
 * Requirements: 3.1, 3.2, 3.3
 */
function detectDeviceType(): 'mobile' | 'desktop' {
  return window.innerWidth < 768 ? 'mobile' : 'desktop'
}

/**
 * Setup device type tracking with resize listener
 * Updates the device_type user property when viewport crosses 768px threshold
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
function setupDeviceTracking(): void {
  const updateDeviceType = () => {
    const deviceType = detectDeviceType()
    analytics.setUserProperty('device_type', deviceType)
  }

  // Set initial device type
  updateDeviceType()

  // Update on resize across 768px threshold
  let previousDeviceType = detectDeviceType()
  window.addEventListener('resize', () => {
    const currentDeviceType = detectDeviceType()
    if (currentDeviceType !== previousDeviceType) {
      previousDeviceType = currentDeviceType
      updateDeviceType()
    }
  })
}

/**
 * Setup page view tracking via router
 * Captures page view events on every route navigation using router.afterEach hook
 * 
 * @param router - Vue Router instance
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
function setupPageViewTracking(router: Router): void {
  router.afterEach((to) => {
    // Get page title from route meta or document.title
    const title = (to.meta.title as string) || document.title
    analytics.trackPageView(to.fullPath, title)
  })
}

/**
 * Setup game event tracking via store watchers
 * Monitors game store state changes to capture game lifecycle events
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
function setupGameEventTracking(): void {
  const gameStore = useGameStore()
  const sessionStore = useSessionStore()

  // Track game start
  watch(
    () => gameStore.isActive,
    (isActive, wasActive) => {
      if (isActive && !wasActive) {
        // Game just started
        const config = sessionStore.config
        analytics.capture('game_started', {
          game_mode: config.mode,
          continents: config.continents,
          total_questions: gameStore.totalQuestions,
          blitz_mode: config.blitz || false
        })
      }
    }
  )

  // Track game completion
  watch(
    () => gameStore.isFinished,
    (isFinished) => {
      if (isFinished) {
        const config = sessionStore.config
        const totalQuestions = gameStore.totalQuestions
        const correctAnswers = gameStore.score
        const accuracy = totalQuestions > 0 
          ? (correctAnswers / totalQuestions) * 100 
          : 0

        analytics.capture('game_completed', {
          game_mode: config.mode,
          score: correctAnswers,
          total_questions: totalQuestions,
          elapsed_time_ms: gameStore.elapsedMs,
          accuracy_percentage: Math.round(accuracy),
          blitz_mode: config.blitz || false
        })
      }
    }
  )
}

/**
 * Analytics plugin for Vue app
 * Initializes PostHog analytics and sets up tracking for device, page views, and game events
 * 
 * @param options - Plugin options including router instance
 * @returns Vue plugin object
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */
export function createAnalyticsPlugin(options: AnalyticsPluginOptions) {
  return {
    install(app: App) {
      // Initialize analytics service
      const config = {
        apiKey: import.meta.env.VITE_POSTHOG_API_KEY || '',
        apiHost: import.meta.env.VITE_POSTHOG_API_HOST || 'https://app.posthog.com',
        developmentMode: import.meta.env.DEV || false,
        disabled: !import.meta.env.VITE_POSTHOG_API_KEY
      }

      analytics.init(config).then(() => {
        // Setup tracking after initialization
        setupDeviceTracking()
        setupPageViewTracking(options.router)
        setupGameEventTracking()
      })

      // Provide analytics service to components (optional)
      app.provide('analytics', analytics)
    }
  }
}

export { analytics }
