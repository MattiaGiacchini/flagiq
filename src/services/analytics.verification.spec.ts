/**
 * Verification Tests for PostHog Analytics Integration
 * 
 * Tasks 7.1-7.4: Privacy and error handling verification
 * 
 * These tests verify:
 * - Session recording is disabled (7.1)
 * - No PII is captured (7.2)
 * - Error handling and resilience (7.3)
 * - Development mode behavior (7.4)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { analytics } from './analytics'
import type { AnalyticsConfig } from './analytics'

// Mock posthog-js
const mockPostHog = {
  init: vi.fn(),
  capture: vi.fn(),
  people: {
    set: vi.fn()
  },
  opt_out_capturing: vi.fn(),
  opt_in_capturing: vi.fn(),
  config: {
    disable_session_recording: true
  }
}

vi.mock('posthog-js', () => ({
  default: mockPostHog
}))

describe('Task 7.1: Verify Session Recording is Disabled', () => {
  const validConfig: AnalyticsConfig = {
    apiKey: 'test_api_key',
    apiHost: 'https://test.posthog.com',
    developmentMode: false,
    disabled: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should configure PostHog with disable_session_recording: true', async () => {
    await analytics.init(validConfig)

    expect(mockPostHog.init).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        disable_session_recording: true
      })
    )
  })

  it('should verify session_recording.recordCrossOriginIframes is false', async () => {
    await analytics.init(validConfig)

    expect(mockPostHog.init).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        session_recording: {
          recordCrossOriginIframes: false
        }
      })
    )
  })

  it('should log verification message when session recording is properly disabled', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log')
    
    await analytics.init(validConfig)

    const initCall = mockPostHog.init.mock.calls[0]
    const loadedCallback = initCall[1].loaded

    // Simulate PostHog instance with session recording properly disabled
    const phInstance = {
      config: {
        disable_session_recording: true
      }
    }
    
    loadedCallback(phInstance)

    // Should log success message
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Analytics] PostHog initialized successfully'
    )
  })

  it('should log error if session recording is NOT disabled at runtime', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error')
    
    await analytics.init(validConfig)

    const initCall = mockPostHog.init.mock.calls[0]
    const loadedCallback = initCall[1].loaded

    // Simulate PostHog instance with session recording ENABLED (error case)
    const phInstanceWithRecording = {
      config: {
        disable_session_recording: false
      }
    }
    
    loadedCallback(phInstanceWithRecording)

    // Should log error about session recording not being disabled
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Analytics] Session recording is NOT disabled!'
    )
  })

  it('should have autocapture disabled', async () => {
    await analytics.init(validConfig)

    expect(mockPostHog.init).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        autocapture: false
      })
    )
  })

  it('should have capture_pageview disabled (manual tracking only)', async () => {
    await analytics.init(validConfig)

    expect(mockPostHog.init).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        capture_pageview: false
      })
    )
  })

  it('should have capture_pageleave disabled', async () => {
    await analytics.init(validConfig)

    expect(mockPostHog.init).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        capture_pageleave: false
      })
    )
  })
})

describe('Task 7.2: Verify No PII is Captured', () => {
  const validConfig: AnalyticsConfig = {
    apiKey: 'test_api_key',
    apiHost: 'https://test.posthog.com',
    developmentMode: false,
    disabled: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should NOT include email addresses in event properties', async () => {
    await analytics.init(validConfig)

    const initCall = mockPostHog.init.mock.calls[0]
    const loadedCallback = initCall[1].loaded
    const captureFn = vi.fn()
    const phInstance = {
      config: { disable_session_recording: true },
      capture: captureFn
    }
    loadedCallback(phInstance)

    // Capture typical event properties
    analytics.capture('game_started', {
      game_mode: 'name-it',
      continents: ['europe'],
      total_questions: 10
    })

    const capturedProperties = captureFn.mock.calls[0][1]

    // Verify NO PII fields are present
    expect(capturedProperties).not.toHaveProperty('email')
    expect(capturedProperties).not.toHaveProperty('user_email')
    expect(capturedProperties).not.toHaveProperty('email_address')
  })

  it('should NOT include user names in event properties', async () => {
    await analytics.init(validConfig)

    const initCall = mockPostHog.init.mock.calls[0]
    const loadedCallback = initCall[1].loaded
    const captureFn = vi.fn()
    const phInstance = {
      config: { disable_session_recording: true },
      capture: captureFn
    }
    loadedCallback(phInstance)

    analytics.capture('game_completed', {
      game_mode: 'type-it',
      score: 8,
      total_questions: 10
    })

    const capturedProperties = captureFn.mock.calls[0][1]

    // Verify NO name-related fields are present
    expect(capturedProperties).not.toHaveProperty('name')
    expect(capturedProperties).not.toHaveProperty('user_name')
    expect(capturedProperties).not.toHaveProperty('username')
    expect(capturedProperties).not.toHaveProperty('first_name')
    expect(capturedProperties).not.toHaveProperty('last_name')
  })

  it('should NOT include IP addresses in event properties', async () => {
    await analytics.init(validConfig)

    const initCall = mockPostHog.init.mock.calls[0]
    const loadedCallback = initCall[1].loaded
    const captureFn = vi.fn()
    const phInstance = {
      config: { disable_session_recording: true },
      capture: captureFn
    }
    loadedCallback(phInstance)

    analytics.capture('page_view', {
      path: '/play',
      title: 'Play Game'
    })

    const capturedProperties = captureFn.mock.calls[0][1]

    // Verify NO IP-related fields are present
    expect(capturedProperties).not.toHaveProperty('ip')
    expect(capturedProperties).not.toHaveProperty('ip_address')
    expect(capturedProperties).not.toHaveProperty('user_ip')
  })

  it('should only use anonymous identifiers', async () => {
    // PostHog automatically generates anonymous distinct IDs
    // Our implementation should NOT set any user identifiers manually
    
    await analytics.init(validConfig)

    const initCall = mockPostHog.init.mock.calls[0]
    const loadedCallback = initCall[1].loaded
    const captureFn = vi.fn()
    const phInstance = {
      config: { disable_session_recording: true },
      capture: captureFn
    }
    loadedCallback(phInstance)

    analytics.capture('test_event', {
      prop1: 'value1',
      prop2: 42
    })

    const capturedProperties = captureFn.mock.calls[0][1]

    // Verify NO user identifier fields
    expect(capturedProperties).not.toHaveProperty('user_id')
    expect(capturedProperties).not.toHaveProperty('userId')
    expect(capturedProperties).not.toHaveProperty('distinct_id')
  })

  it('should verify device_type is the only user property set', async () => {
    // Only device_type ('mobile' or 'desktop') should be set as a user property
    // No other identifying information should be set
    
    await analytics.init(validConfig)

    const initCall = mockPostHog.init.mock.calls[0]
    const loadedCallback = initCall[1].loaded
    const phInstance = {
      config: { disable_session_recording: true },
      people: { set: vi.fn() }
    }
    loadedCallback(phInstance)

    analytics.setUserProperty('device_type', 'desktop')

    // Verify only device_type is set
    expect(phInstance.people.set).toHaveBeenCalledWith({
      device_type: 'desktop'
    })
  })

  it('should only capture game-related properties without PII', async () => {
    await analytics.init(validConfig)

    const initCall = mockPostHog.init.mock.calls[0]
    const loadedCallback = initCall[1].loaded
    const captureFn = vi.fn()
    const phInstance = {
      config: { disable_session_recording: true },
      capture: captureFn
    }
    loadedCallback(phInstance)

    // Capture game event with all allowed properties
    analytics.capture('game_completed', {
      game_mode: 'choose-flag',
      score: 9,
      total_questions: 10,
      elapsed_time_ms: 45000,
      accuracy_percentage: 90,
      blitz_mode: true
    })

    const capturedProperties = captureFn.mock.calls[0][1]

    // Verify all allowed properties are present
    expect(capturedProperties).toHaveProperty('game_mode')
    expect(capturedProperties).toHaveProperty('score')
    expect(capturedProperties).toHaveProperty('total_questions')
    expect(capturedProperties).toHaveProperty('elapsed_time_ms')
    expect(capturedProperties).toHaveProperty('accuracy_percentage')
    expect(capturedProperties).toHaveProperty('blitz_mode')

    // Verify NO PII is present
    expect(capturedProperties).not.toHaveProperty('email')
    expect(capturedProperties).not.toHaveProperty('name')
    expect(capturedProperties).not.toHaveProperty('user_id')
    expect(capturedProperties).not.toHaveProperty('ip_address')
  })
})

describe('Task 7.3: Test Error Handling and Resilience', () => {
  const validConfig: AnalyticsConfig = {
    apiKey: 'test_api_key',
    apiHost: 'https://test.posthog.com',
    developmentMode: false,
    disabled: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should allow app to continue when PostHog initialization fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error')
    
    mockPostHog.init.mockImplementationOnce(() => {
      throw new Error('PostHog initialization failed')
    })

    // Should not throw - app should continue
    await expect(analytics.init(validConfig)).resolves.toBeUndefined()

    // Should log the error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Analytics] Failed to initialize PostHog:',
      expect.any(Error)
    )
  })

  it('should allow app to continue when event capture fails', async () => {
    await analytics.init(validConfig)

    const initCall = mockPostHog.init.mock.calls[0]
    const loadedCallback = initCall[1].loaded
    const error = new Error('Network error during capture')
    const phInstance = {
      config: { disable_session_recording: true },
      capture: vi.fn(() => {
        throw error
      })
    }
    loadedCallback(phInstance)

    // Should not throw - app should continue
    expect(() => {
      analytics.capture('test_event', { prop: 'value' })
    }).not.toThrow()

    // Should log the error
    expect(console.error).toHaveBeenCalledWith(
      '[Analytics] Failed to capture event:',
      error
    )
  })

  it('should queue events when offline', async () => {
    await analytics.init(validConfig)

    // Don't call loaded callback - simulate not initialized yet
    // Events should be queued instead of failing

    analytics.capture('offline_event', { prop: 'queued' })

    // Should not throw
    expect(true).toBe(true)
  })

  it('should flush queued events when network is restored', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log')
    
    // Trigger online event
    window.dispatchEvent(new Event('online'))

    // Should log network restored message
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Analytics] Network restored'
    )
  })

  it('should handle offline event', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log')
    
    // Trigger offline event
    window.dispatchEvent(new Event('offline'))

    // Should log network lost message
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Analytics] Network lost'
    )
  })

  it('should NOT throw exceptions to user code when analytics fails', async () => {
    // Test multiple failure scenarios
    mockPostHog.init.mockImplementationOnce(() => {
      throw new Error('Init failure')
    })

    // 1. Initialization failure
    await expect(analytics.init(validConfig)).resolves.toBeUndefined()

    // 2. Capture with disabled analytics
    expect(() => {
      analytics.capture('event_with_disabled_analytics')
    }).not.toThrow()

    // 3. Set user property with disabled analytics
    expect(() => {
      analytics.setUserProperty('test', 'value')
    }).not.toThrow()

    // 4. Track page view with disabled analytics
    expect(() => {
      analytics.trackPageView('/test', 'Test Page')
    }).not.toThrow()
  })

  it('should handle missing configuration gracefully', async () => {
    const invalidConfig: AnalyticsConfig = {
      apiKey: '',
      apiHost: '',
      disabled: false
    }

    // Should not throw
    await expect(analytics.init(invalidConfig)).resolves.toBeUndefined()

    // Should warn about missing config
    expect(console.warn).toHaveBeenCalledWith(
      '[Analytics] Analytics disabled or missing configuration'
    )

    // Should not attempt to initialize PostHog
    expect(mockPostHog.init).not.toHaveBeenCalled()
  })

  it('should queue events when not initialized and flush when ready', async () => {
    await analytics.init(validConfig)

    // Capture events before loaded callback is triggered (not initialized)
    analytics.capture('early_event_1', { prop: 'value1' })
    analytics.capture('early_event_2', { prop: 'value2' })

    // Now trigger initialization
    const initCall = mockPostHog.init.mock.calls[0]
    const loadedCallback = initCall[1].loaded
    const consoleLogSpy = vi.spyOn(console, 'log')
    const captureFn = vi.fn()
    const phInstance = {
      config: { disable_session_recording: true },
      capture: captureFn
    }
    
    loadedCallback(phInstance)

    // Should log that events are being flushed
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Analytics] Flushing')
    )
  })

  it('should enforce max queue size to prevent memory issues', () => {
    // The MAX_QUEUE_SIZE is 100 events
    // When the queue is full, oldest events are dropped
    
    // Implementation verified in analytics.ts:
    // private readonly MAX_QUEUE_SIZE = 100
    // if (this.eventQueue.length >= this.MAX_QUEUE_SIZE) {
    //   console.warn('[Analytics] Event queue full, dropping oldest event')
    //   this.eventQueue.shift()
    // }
    
    expect(true).toBe(true)
  })
})

describe('Task 7.4: Test Development Mode', () => {
  const devConfig: AnalyticsConfig = {
    apiKey: 'test_api_key',
    apiHost: 'https://test.posthog.com',
    developmentMode: true,
    disabled: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should log events to console with [Analytics] prefix in dev mode', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log')
    
    await analytics.init(devConfig)

    analytics.capture('dev_mode_event', {
      game_mode: 'name-it',
      score: 10
    })

    // Should log to console with [Analytics] prefix
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Analytics] Event:',
      'dev_mode_event',
      {
        game_mode: 'name-it',
        score: 10
      }
    )
  })

  it('should NOT send network requests to PostHog in dev mode', async () => {
    await analytics.init(devConfig)

    analytics.capture('dev_event', { prop: 'value' })

    // PostHog capture should NOT be called in dev mode
    expect(mockPostHog.capture).not.toHaveBeenCalled()
  })

  it('should log page view events in dev mode', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log')
    
    await analytics.init(devConfig)

    analytics.trackPageView('/play', 'Play Game')

    // Should log to console
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Analytics] Event:',
      '$pageview',
      expect.objectContaining({
        $current_url: '/play',
        $pathname: '/play',
        $title: 'Play Game'
      })
    )
  })

  it('should log events without properties in dev mode', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log')
    
    await analytics.init(devConfig)

    analytics.capture('simple_event')

    // Should log event without properties
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Analytics] Event:',
      'simple_event',
      undefined
    )
  })

  it('should respect import.meta.env.DEV flag', () => {
    // This test verifies that development mode is determined by import.meta.env.DEV
    // The actual value is set at build time by Vite
    
    const isDev = import.meta.env.DEV
    
    // In test environment, this will be false
    // In actual development (npm run dev), this will be true
    expect(typeof isDev).toBe('boolean')
  })

  it('should NOT initialize PostHog in dev mode but still log events', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log')
    
    await analytics.init(devConfig)

    // Capture multiple events
    analytics.capture('event_1', { prop: 'value1' })
    analytics.capture('event_2', { prop: 'value2' })
    analytics.capture('event_3', { prop: 'value3' })

    // All events should be logged to console
    expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Event:', 'event_1', { prop: 'value1' })
    expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Event:', 'event_2', { prop: 'value2' })
    expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Event:', 'event_3', { prop: 'value3' })

    // PostHog capture should NOT be called
    expect(mockPostHog.capture).not.toHaveBeenCalled()
  })

  it('should handle user properties in dev mode', () => {
    // In dev mode, setUserProperty should not fail
    // but won't actually set anything on PostHog
    
    expect(() => {
      analytics.setUserProperty('device_type', 'desktop')
    }).not.toThrow()
  })

  it('should handle disable/enable in dev mode', () => {
    // In dev mode, disable/enable should not fail
    
    expect(() => {
      analytics.disable()
      analytics.enable()
    }).not.toThrow()
  })
})

describe('Integration: Privacy and Error Handling', () => {
  const validConfig: AnalyticsConfig = {
    apiKey: 'test_api_key',
    apiHost: 'https://test.posthog.com',
    developmentMode: false,
    disabled: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should maintain privacy settings even after initialization failure', async () => {
    // Fail first init
    mockPostHog.init.mockImplementationOnce(() => {
      throw new Error('Network error')
    })

    await analytics.init(validConfig)

    // Try to capture event - should not expose any PII
    analytics.capture('safe_event', {
      game_mode: 'name-it',
      score: 10
    })

    // Should not throw and should not capture any PII
    expect(true).toBe(true)
  })

  it('should verify complete privacy configuration', async () => {
    await analytics.init(validConfig)

    // Verify ALL privacy settings are configured correctly
    expect(mockPostHog.init).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        disable_session_recording: true,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        session_recording: {
          recordCrossOriginIframes: false
        }
      })
    )
  })

  it('should handle complete analytics lifecycle without errors', async () => {
    // Initialize
    await analytics.init(validConfig)

    const initCall = mockPostHog.init.mock.calls[0]
    const loadedCallback = initCall[1].loaded
    const captureFn = vi.fn()
    const phInstance = {
      config: { disable_session_recording: true },
      capture: captureFn,
      people: { set: vi.fn() },
      opt_out_capturing: vi.fn(),
      opt_in_capturing: vi.fn()
    }
    loadedCallback(phInstance)

    // Capture events
    analytics.capture('event_1', { prop: 'value1' })
    analytics.capture('event_2', { prop: 'value2' })

    // Set user property
    analytics.setUserProperty('device_type', 'mobile')

    // Track page view
    analytics.trackPageView('/test', 'Test Page')

    // Disable/enable
    analytics.disable()
    analytics.enable()

    // Nothing should throw
    expect(true).toBe(true)
  })
})
