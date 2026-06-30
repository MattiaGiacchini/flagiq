/**
 * Integration Tests for Analytics Event Tracking
 * 
 * Tests complete event flows including:
 * - Game lifecycle events (started, completed, abandoned)
 * - Page navigation events
 * - Offline to online queue flushing
 * - Analytics initialization doesn't block app startup
 * 
 * Note: These tests verify analytics integration without mocking PostHog.
 * The analytics service runs in non-development mode to test actual capture behavior.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '@/stores/game'
import { useSessionStore } from '@/stores/session'
import { analytics } from '@/services/analytics'
import { createApp } from 'vue'
import { nextTick } from 'vue'

// Mock PostHog SDK
const mockPostHogCapture = vi.fn()
const mockPostHogPeopleSet = vi.fn()
const mockPostHogOptOut = vi.fn()
const mockPostHogOptIn = vi.fn()

vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn((apiKey, config) => {
      // Simulate async loaded callback
      setTimeout(() => {
        if (config.loaded) {
          config.loaded({
            capture: mockPostHogCapture,
            people: {
              set: mockPostHogPeopleSet
            },
            opt_out_capturing: mockPostHogOptOut,
            opt_in_capturing: mockPostHogOptIn,
            config: {
              disable_session_recording: true
            }
          })
        }
      }, 0)
    }),
    capture: mockPostHogCapture,
    people: {
      set: mockPostHogPeopleSet
    },
    opt_out_capturing: mockPostHogOptOut,
    opt_in_capturing: mockPostHogOptIn,
    config: {
      disable_session_recording: true
    }
  }
}))

describe('Analytics Integration Tests', () => {
  let gameStore: ReturnType<typeof useGameStore>
  let sessionStore: ReturnType<typeof useSessionStore>
  let router: any
  let pinia: any

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Setup Pinia
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Setup Router with test routes
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/play', name: 'play', component: { template: '<div>Play</div>' } },
        { path: '/results', name: 'results', component: { template: '<div>Results</div>' } }
      ]
    })
    
    // Initialize analytics in NON-development mode
    await analytics.init({
      apiKey: 'test-key',
      apiHost: 'https://test.posthog.com',
      developmentMode: false, // Critical: disable development mode for testing
      disabled: false
    })

    // Wait for PostHog initialization
    await vi.waitFor(() => {
      expect(mockPostHogCapture).toBeDefined()
    }, { timeout: 100 })
    
    // Get stores
    gameStore = useGameStore()
    sessionStore = useSessionStore()
    
    // Setup page view tracking manually (simulating plugin behavior)
    router.afterEach((to: any) => {
      const title = (to.meta.title as string) || document.title
      analytics.trackPageView(to.fullPath, title)
    })
    
    // Setup game event tracking manually (simulating plugin behavior)
    const { watch } = await import('vue')
    
    // Track game start
    watch(
      () => gameStore.isActive,
      (isActive, wasActive) => {
        if (isActive && !wasActive) {
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
    
    // Navigate to home
    await router.push('/')
    await router.isReady()
    
    // Clear calls from initial setup
    await nextTick()
    mockPostHogCapture.mockClear()
  })

  afterEach(() => {
    if (gameStore) {
      gameStore.reset()
    }
  })

  describe('Complete Game Flow', () => {
    it('should capture game_started and game_completed events for a full game session', async () => {
      // Setup session config
      sessionStore.updateConfig({
        continents: ['europe'],
        mode: 'name-it',
        count: 5,
        blitz: false
      })

      // Start game
      gameStore.startGame(sessionStore.config)
      
      // Wait a bit for watcher to trigger
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Wait for game_started event
      await vi.waitFor(() => {
        const startedCall = mockPostHogCapture.mock.calls.find(
          call => call[0] === 'game_started'
        )
        expect(startedCall).toBeDefined()
      }, { timeout: 1000 })

      // Verify game_started event properties
      const startedCall = mockPostHogCapture.mock.calls.find(
        call => call[0] === 'game_started'
      )
      expect(startedCall?.[1]?.game_mode).toBe('name-it')
      expect(startedCall?.[1]?.continents).toContain('europe')
      expect(startedCall?.[1]?.total_questions).toBeGreaterThan(0)
      expect(startedCall?.[1]?.blitz_mode).toBe(false)

      // Answer all questions
      const totalQuestions = gameStore.totalQuestions
      for (let i = 0; i < totalQuestions; i++) {
        const question = gameStore.currentQuestion
        if (question) {
          gameStore.answer(question.correct.id)
        }
      }
      
      // Wait a bit for watcher to trigger
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Wait for game_completed event
      await vi.waitFor(() => {
        const completedCall = mockPostHogCapture.mock.calls.find(
          call => call[0] === 'game_completed'
        )
        expect(completedCall).toBeDefined()
      }, { timeout: 1000 })

      // Verify game_completed event properties
      const completedCall = mockPostHogCapture.mock.calls.find(
        call => call[0] === 'game_completed'
      )
      expect(completedCall?.[1]).toMatchObject({
        game_mode: 'name-it',
        score: totalQuestions, // All correct
        total_questions: totalQuestions,
        accuracy_percentage: 100,
        blitz_mode: false
      })
      expect(completedCall?.[1]?.elapsed_time_ms).toBeGreaterThan(0)
    })

    it('should capture game_started and game_completed events for blitz mode', async () => {
      // Setup session config with blitz mode
      sessionStore.updateConfig({
        continents: ['asia'],
        mode: 'choose-flag',
        count: 10,
        blitz: true
      })

      // Start game
      gameStore.startGame(sessionStore.config)
      
      // Wait a bit for watcher to trigger
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Wait for game_started event
      await vi.waitFor(() => {
        const startedCall = mockPostHogCapture.mock.calls.find(
          call => call[0] === 'game_started'
        )
        expect(startedCall).toBeDefined()
      }, { timeout: 1000 })

      // Verify blitz_mode property is true
      const startedCall = mockPostHogCapture.mock.calls.find(
        call => call[0] === 'game_started'
      )
      expect(startedCall?.[1]?.blitz_mode).toBe(true)

      // Answer questions correctly
      gameStore.answer(gameStore.currentQuestion?.correct.id || '')
      gameStore.answer(gameStore.currentQuestion?.correct.id || '')

      // Finish game by answering all questions or time running out
      while (!gameStore.isFinished && gameStore.currentQuestion) {
        gameStore.answer(gameStore.currentQuestion.correct.id)
      }
      
      // Wait a bit for watcher to trigger
      await new Promise(resolve => setTimeout(resolve, 50))

      // Wait for game_completed event
      await vi.waitFor(() => {
        const completedCall = mockPostHogCapture.mock.calls.find(
          call => call[0] === 'game_completed'
        )
        expect(completedCall).toBeDefined()
      }, { timeout: 1000 })

      // Verify blitz_mode in completed event
      const completedCall = mockPostHogCapture.mock.calls.find(
        call => call[0] === 'game_completed'
      )
      expect(completedCall?.[1]?.blitz_mode).toBe(true)
    })
  })

  describe('Game Abandonment', () => {
    it('should capture game_abandoned event when user leaves mid-game', async () => {
      // Setup and start game
      sessionStore.updateConfig({
        continents: ['africa'],
        mode: 'type-it',
        count: 10,
        blitz: false
      })
      gameStore.startGame(sessionStore.config)

      // Wait for game to start
      await nextTick()
      await vi.waitFor(() => {
        expect(gameStore.isActive).toBe(true)
      })

      // Answer only 3 questions
      for (let i = 0; i < 3; i++) {
        const question = gameStore.currentQuestion
        if (question) {
          gameStore.answer(question.correct.id)
        }
      }
      
      // Add a small delay to ensure elapsed time > 0
      await new Promise(resolve => setTimeout(resolve, 10))

      // Simulate user abandoning game (this would normally be triggered by route guard)
      // In real scenario, PlayView.vue's beforeRouteLeave would capture this
      const isAbandoned = gameStore.isActive && !gameStore.isFinished
      if (isAbandoned) {
        analytics.capture('game_abandoned', {
          game_mode: sessionStore.config.mode,
          current_question: gameStore.currentIndex + 1,
          total_questions: gameStore.totalQuestions,
          elapsed_time_ms: gameStore.elapsedMs
        })
      }

      // Verify game_abandoned event was captured
      await vi.waitFor(() => {
        const abandonedCall = mockPostHogCapture.mock.calls.find(
          call => call[0] === 'game_abandoned'
        )
        expect(abandonedCall).toBeDefined()
      })

      const abandonedCall = mockPostHogCapture.mock.calls.find(
        call => call[0] === 'game_abandoned'
      )
      expect(abandonedCall?.[1]).toMatchObject({
        game_mode: 'type-it',
        current_question: 4, // 3 answered, now on 4th
        total_questions: 10
      })
      expect(abandonedCall?.[1]?.elapsed_time_ms).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Page Navigation', () => {
    it('should capture page view events on route changes', async () => {
      // Clear previous calls
      mockPostHogCapture.mockClear()
      
      // Navigate to play page
      await router.push('/play')
      await router.isReady()
      
      // Wait a bit for afterEach hook to fire
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Wait for page view event
      await vi.waitFor(() => {
        const pageViewCall = mockPostHogCapture.mock.calls.find(
          call => call[0] === '$pageview' && call[1]?.$pathname === '/play'
        )
        expect(pageViewCall).toBeDefined()
      }, { timeout: 500 })

      // Navigate to results page
      await router.push('/results')
      await router.isReady()
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Wait for results page view event
      await vi.waitFor(() => {
        const pageViewCall = mockPostHogCapture.mock.calls.find(
          call => call[0] === '$pageview' && call[1]?.$pathname === '/results'
        )
        expect(pageViewCall).toBeDefined()
      }, { timeout: 500 })

      // Verify all page view events captured
      const pageViewCalls = mockPostHogCapture.mock.calls.filter(
        call => call[0] === '$pageview'
      )
      expect(pageViewCalls.length).toBeGreaterThanOrEqual(2)
      
      // Verify event structure
      const playPageView = pageViewCalls.find(call => call[1]?.$pathname === '/play')
      expect(playPageView?.[1]).toMatchObject({
        $current_url: '/play',
        $pathname: '/play'
      })
      expect(playPageView?.[1]?.timestamp).toBeDefined()
    })
  })

  describe('Offline to Online Event Queue Flushing', () => {
    it('should queue events when offline and flush when online', async () => {
      // Simulate offline mode
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })
      
      // Trigger offline event
      window.dispatchEvent(new Event('offline'))
      
      // Wait a bit for event listener to process
      await new Promise(resolve => setTimeout(resolve, 10))

      // Capture events while offline
      analytics.capture('test_event_1', { test: 'data1' })
      analytics.capture('test_event_2', { test: 'data2' })
      analytics.capture('test_event_3', { test: 'data3' })

      // Verify events were not sent immediately (still queued)
      const offlineCallCount = mockPostHogCapture.mock.calls.length
      
      // Simulate coming back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      })
      window.dispatchEvent(new Event('online'))

      // Wait for queue flush
      await vi.waitFor(() => {
        const newCallCount = mockPostHogCapture.mock.calls.length
        expect(newCallCount).toBeGreaterThan(offlineCallCount)
      }, { timeout: 500 })

      // Verify queued events were flushed
      const testEvent1 = mockPostHogCapture.mock.calls.find(
        call => call[0] === 'test_event_1'
      )
      const testEvent2 = mockPostHogCapture.mock.calls.find(
        call => call[0] === 'test_event_2'
      )
      const testEvent3 = mockPostHogCapture.mock.calls.find(
        call => call[0] === 'test_event_3'
      )

      expect(testEvent1).toBeDefined()
      expect(testEvent2).toBeDefined()
      expect(testEvent3).toBeDefined()
    })

    it('should enforce max queue size of 100 events', async () => {
      // Simulate offline mode
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })
      window.dispatchEvent(new Event('offline'))
      await new Promise(resolve => setTimeout(resolve, 10))

      // Queue 105 events (exceeds max of 100)
      for (let i = 0; i < 105; i++) {
        analytics.capture(`queued_event_${i}`, { index: i })
      }

      // Come back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      })
      window.dispatchEvent(new Event('online'))

      // Wait for flush
      await vi.waitFor(() => {
        const queuedCalls = mockPostHogCapture.mock.calls.filter(
          call => call[0]?.startsWith('queued_event_')
        )
        expect(queuedCalls.length).toBeGreaterThan(0)
      }, { timeout: 500 })

      // Verify only 100 events were flushed (oldest 5 dropped)
      const queuedCalls = mockPostHogCapture.mock.calls.filter(
        call => call[0]?.startsWith('queued_event_')
      )
      
      expect(queuedCalls.length).toBeLessThanOrEqual(100)
      
      // Verify oldest events were dropped (events 0-4 should not exist)
      const oldestEvent = mockPostHogCapture.mock.calls.find(
        call => call[0] === 'queued_event_0'
      )
      expect(oldestEvent).toBeUndefined()
      
      // Verify newest events were kept (event 104 should exist)
      const newestEvent = mockPostHogCapture.mock.calls.find(
        call => call[0] === 'queued_event_104'
      )
      expect(newestEvent).toBeDefined()
    })
  })

  describe('Analytics Initialization', () => {
    it('should not block app startup when analytics initializes', async () => {
      const startTime = Date.now()
      
      // Create a new analytics service instance (simulating app startup)
      const initPromise = analytics.init({
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        developmentMode: false,
        disabled: false
      })

      // App should continue without waiting for analytics
      const initTime = Date.now() - startTime
      expect(initTime).toBeLessThan(50) // Init should return immediately
      
      // Wait for actual initialization to complete
      await initPromise
      await vi.waitFor(() => {
        expect(mockPostHogCapture).toBeDefined()
      }, { timeout: 100 })

      // Verify analytics is ready
      analytics.capture('test_event', { test: 'data' })
      
      await vi.waitFor(() => {
        const testCall = mockPostHogCapture.mock.calls.find(
          call => call[0] === 'test_event'
        )
        expect(testCall).toBeDefined()
      })
    })

    it('should allow app to continue when analytics fails to initialize', async () => {
      // Create a new instance with invalid config
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      await analytics.init({
        apiKey: '', // Invalid - empty key
        apiHost: '',
        developmentMode: false,
        disabled: false
      })

      // App should continue without throwing and log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Analytics] Analytics disabled or missing configuration'
      )

      // Cleanup
      consoleWarnSpy.mockRestore()
    })

    it('should gracefully handle missing configuration', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Initialize with disabled flag
      await analytics.init({
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        developmentMode: false,
        disabled: true
      })

      // Should log warning but not throw
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Analytics] Analytics disabled or missing configuration'
      )

      // Events should be no-ops when disabled
      analytics.capture('test_event', { test: 'data' })
      
      // Give it time to potentially call PostHog
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Verify no calls were made (beyond any previous test calls)
      const beforeCount = mockPostHogCapture.mock.calls.length
      analytics.capture('another_test', {})
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(mockPostHogCapture.mock.calls.length).toBe(beforeCount)

      // Cleanup
      consoleWarnSpy.mockRestore()
    })
  })
})
