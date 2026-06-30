/**
 * Unit tests for Analytics Service utility methods
 * Tests setUserProperty, trackPageView, disable, and enable methods
 * 
 * **Validates: Requirements 7.4, 7.5**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { analytics } from './analytics'
import type { AnalyticsConfig } from './analytics'

// Mock posthog-js module
vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn((apiKey, config) => {
      // Simulate the loaded callback
      if (config.loaded) {
        const mockPosthog = {
          config: {
            disable_session_recording: config.disable_session_recording
          },
          capture: vi.fn(),
          people: {
            set: vi.fn()
          },
          opt_out_capturing: vi.fn(),
          opt_in_capturing: vi.fn()
        }
        config.loaded(mockPosthog)
      }
    }),
    capture: vi.fn(),
    people: {
      set: vi.fn()
    },
    opt_out_capturing: vi.fn(),
    opt_in_capturing: vi.fn()
  }
}))

describe('Analytics Service - Utility Methods', () => {
  let consoleLogSpy: any
  let consoleErrorSpy: any
  let consoleWarnSpy: any

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    vi.clearAllMocks()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  describe('setUserProperty', () => {
    it('should set user property using posthog.people.set()', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: false
      }

      await analytics.init(config)

      // Access the posthog instance via reflection
      const posthogInstance = (analytics as any).posthog

      analytics.setUserProperty('device_type', 'mobile')

      expect(posthogInstance.people.set).toHaveBeenCalledWith({
        device_type: 'mobile'
      })
    })

    it('should set multiple different user properties', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: false
      }

      await analytics.init(config)
      const posthogInstance = (analytics as any).posthog

      analytics.setUserProperty('device_type', 'desktop')
      analytics.setUserProperty('user_timezone', 'America/New_York')
      analytics.setUserProperty('preferred_language', 'en')

      expect(posthogInstance.people.set).toHaveBeenCalledTimes(3)
      expect(posthogInstance.people.set).toHaveBeenCalledWith({ device_type: 'desktop' })
      expect(posthogInstance.people.set).toHaveBeenCalledWith({ user_timezone: 'America/New_York' })
      expect(posthogInstance.people.set).toHaveBeenCalledWith({ preferred_language: 'en' })
    })

    it('should not set user property when analytics is disabled', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: true
      }

      await analytics.init(config)

      analytics.setUserProperty('device_type', 'mobile')

      // Should not have been called because analytics is disabled
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('should not set user property when not initialized', () => {
      // Create a fresh analytics instance without initializing
      const config: AnalyticsConfig = {
        apiKey: '',
        apiHost: '',
        disabled: false
      }

      analytics.init(config)
      analytics.setUserProperty('device_type', 'mobile')

      // Should not throw or cause errors
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Failed to set user property')
      )
    })

    it('should handle errors gracefully when posthog.people.set fails', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: false
      }

      await analytics.init(config)
      const posthogInstance = (analytics as any).posthog

      // Mock people.set to throw an error
      posthogInstance.people.set.mockImplementation(() => {
        throw new Error('Network error')
      })

      // Should not throw
      expect(() => {
        analytics.setUserProperty('device_type', 'mobile')
      }).not.toThrow()

      // Should log the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Analytics] Failed to set user property:',
        expect.any(Error)
      )
    })
  })

  describe('trackPageView', () => {
    it('should track page view with path and title', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: false
      }

      await analytics.init(config)
      const posthogInstance = (analytics as any).posthog

      analytics.trackPageView('/home', 'Home Page')

      expect(posthogInstance.capture).toHaveBeenCalledWith('$pageview', {
        $current_url: '/home',
        $pathname: '/home',
        $title: 'Home Page',
        timestamp: expect.any(Number)
      })
    })

    it('should track multiple page views with different paths', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: false
      }

      await analytics.init(config)
      const posthogInstance = (analytics as any).posthog

      analytics.trackPageView('/home', 'Home')
      analytics.trackPageView('/about', 'About Us')
      analytics.trackPageView('/play', 'Play Game')

      expect(posthogInstance.capture).toHaveBeenCalledTimes(3)
      expect(posthogInstance.capture).toHaveBeenNthCalledWith(1, '$pageview', expect.objectContaining({
        $pathname: '/home',
        $title: 'Home'
      }))
      expect(posthogInstance.capture).toHaveBeenNthCalledWith(2, '$pageview', expect.objectContaining({
        $pathname: '/about',
        $title: 'About Us'
      }))
      expect(posthogInstance.capture).toHaveBeenNthCalledWith(3, '$pageview', expect.objectContaining({
        $pathname: '/play',
        $title: 'Play Game'
      }))
    })

    it('should include timestamp in page view event', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: false
      }

      await analytics.init(config)
      const posthogInstance = (analytics as any).posthog

      const beforeTime = Date.now()
      analytics.trackPageView('/test', 'Test Page')
      const afterTime = Date.now()

      const callArgs = posthogInstance.capture.mock.calls[0]
      const properties = callArgs[1]

      expect(properties.timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(properties.timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('should handle page views when analytics is disabled', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: true
      }

      await analytics.init(config)

      // Should not throw
      expect(() => {
        analytics.trackPageView('/home', 'Home')
      }).not.toThrow()
    })

    it('should log page views in development mode', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: false,
        developmentMode: true
      }

      await analytics.init(config)

      analytics.trackPageView('/test', 'Test')

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        '$pageview',
        expect.objectContaining({
          $pathname: '/test',
          $title: 'Test'
        })
      )
    })
  })

  describe('disable', () => {
    it('should call posthog.opt_out_capturing()', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: false
      }

      await analytics.init(config)
      const posthogInstance = (analytics as any).posthog

      analytics.disable()

      expect(posthogInstance.opt_out_capturing).toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Tracking disabled')
    })

    it('should handle errors gracefully when opt_out_capturing fails', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: false
      }

      await analytics.init(config)
      const posthogInstance = (analytics as any).posthog

      // Mock opt_out_capturing to throw an error
      posthogInstance.opt_out_capturing.mockImplementation(() => {
        throw new Error('Failed to opt out')
      })

      // Should not throw
      expect(() => {
        analytics.disable()
      }).not.toThrow()

      // Should log the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Analytics] Failed to disable tracking:',
        expect.any(Error)
      )
    })

    it('should not throw when called before initialization', () => {
      const config: AnalyticsConfig = {
        apiKey: '',
        apiHost: '',
        disabled: false
      }

      analytics.init(config)

      // Should not throw
      expect(() => {
        analytics.disable()
      }).not.toThrow()
    })
  })

  describe('enable', () => {
    it('should call posthog.opt_in_capturing()', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: false
      }

      await analytics.init(config)
      const posthogInstance = (analytics as any).posthog

      analytics.enable()

      expect(posthogInstance.opt_in_capturing).toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics] Tracking enabled')
    })

    it('should handle errors gracefully when opt_in_capturing fails', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: false
      }

      await analytics.init(config)
      const posthogInstance = (analytics as any).posthog

      // Mock opt_in_capturing to throw an error
      posthogInstance.opt_in_capturing.mockImplementation(() => {
        throw new Error('Failed to opt in')
      })

      // Should not throw
      expect(() => {
        analytics.enable()
      }).not.toThrow()

      // Should log the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Analytics] Failed to enable tracking:',
        expect.any(Error)
      )
    })

    it('should not throw when called before initialization', () => {
      const config: AnalyticsConfig = {
        apiKey: '',
        apiHost: '',
        disabled: false
      }

      analytics.init(config)

      // Should not throw
      expect(() => {
        analytics.enable()
      }).not.toThrow()
    })

    it('should allow toggling between enable and disable', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: false
      }

      await analytics.init(config)
      const posthogInstance = (analytics as any).posthog

      analytics.disable()
      analytics.enable()
      analytics.disable()

      expect(posthogInstance.opt_out_capturing).toHaveBeenCalledTimes(2)
      expect(posthogInstance.opt_in_capturing).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error handling across all methods', () => {
    it('should never throw exceptions from any utility method', async () => {
      const config: AnalyticsConfig = {
        apiKey: 'test-key',
        apiHost: 'https://test.posthog.com',
        disabled: false
      }

      await analytics.init(config)
      const posthogInstance = (analytics as any).posthog

      // Make all methods throw errors
      posthogInstance.people.set.mockImplementation(() => {
        throw new Error('Mock error')
      })
      posthogInstance.capture.mockImplementation(() => {
        throw new Error('Mock error')
      })
      posthogInstance.opt_out_capturing.mockImplementation(() => {
        throw new Error('Mock error')
      })
      posthogInstance.opt_in_capturing.mockImplementation(() => {
        throw new Error('Mock error')
      })

      // None of these should throw
      expect(() => analytics.setUserProperty('test', 'value')).not.toThrow()
      expect(() => analytics.trackPageView('/test', 'Test')).not.toThrow()
      expect(() => analytics.disable()).not.toThrow()
      expect(() => analytics.enable()).not.toThrow()

      // All should log errors
      expect(consoleErrorSpy).toHaveBeenCalledTimes(4)
    })
  })
})
