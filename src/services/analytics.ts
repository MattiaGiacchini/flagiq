/**
 * Analytics Service
 * 
 * Singleton service for managing PostHog analytics integration.
 * Handles event capture, offline queueing, and privacy-focused configuration.
 * 
 * Requirements: 1.4
 */

/**
 * Configuration options for the Analytics Service
 */
export interface AnalyticsConfig {
  apiKey: string
  apiHost: string
  developmentMode?: boolean
  disabled?: boolean
}

/**
 * Properties that can be attached to analytics events
 */
export interface EventProperties {
  [key: string]: string | number | boolean | string[] | undefined
}

/**
 * Event queued for later transmission when offline
 */
export interface QueuedEvent {
  eventName: string
  properties: EventProperties
  timestamp: number
}

/**
 * AnalyticsService - Singleton service for PostHog analytics integration
 * 
 * Features:
 * - Singleton pattern ensures single PostHog instance
 * - Automatic event queuing when offline (max 100 events)
 * - Development mode logs events to console instead of sending
 * - Graceful degradation on initialization failure
 * - Network online/offline detection and auto-flush
 * - Privacy-first configuration (session recording disabled)
 * 
 * Requirements: 1.4
 */
class AnalyticsService {
  private static instance: AnalyticsService | null = null
  private posthog: any = null
  private isInitialized = false
  private config: AnalyticsConfig | null = null
  private eventQueue: QueuedEvent[] = []
  private readonly MAX_QUEUE_SIZE = 100
  private isOnline = navigator.onLine

  /**
   * Private constructor for singleton pattern
   * Sets up network online/offline listeners
   */
  private constructor() {
    this.setupNetworkListeners()
  }

  /**
   * Get the singleton instance of AnalyticsService
   * Creates instance on first call, returns existing instance on subsequent calls
   * 
   * Requirements: 1.4
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  /**
   * Initialize PostHog SDK with configuration
   * 
   * @param config - Analytics configuration (API key, host, mode settings)
   * @returns Promise that resolves when initialization completes
   * 
   * Requirements: 1.4
   */
  public async init(config: AnalyticsConfig): Promise<void> {
    this.config = config

    // Skip initialization if disabled or missing credentials
    if (config.disabled || !config.apiKey || !config.apiHost) {
      console.warn('[Analytics] Analytics disabled or missing configuration')
      return
    }

    try {
      // Dynamic import of PostHog SDK
      const posthog = await import('posthog-js')
      
      // Initialize PostHog with privacy-focused settings
      posthog.init('phc_Bdmz4pGPXd4RfIQj9NMs41pzbAL5NxNhLN9vBiiMGpl', {
        api_host: 'https://eu.i.posthog.com',
        defaults: '2026-05-30',
        disable_session_recording: true,     // Critical: disable session recording
        autocapture: false,                  // Only manual events
        capture_pageview: false,             // Manual page view tracking
        capture_pageleave: false,
        session_recording: {
          recordCrossOriginIframes: false
        },
        loaded: (ph) => {
          this.posthog = ph
          this.isInitialized = true
          console.log('[Analytics] PostHog initialized successfully')
          
          // Verify session recording is disabled
          if (ph.config.disable_session_recording !== true) {
            console.error('[Analytics] Session recording is NOT disabled!')
          }
          
          // Flush any queued events
          this.flushQueue()
        }
      })
    } catch (error) {
      console.error('[Analytics] Failed to initialize PostHog:', error)
      // Allow app to continue without analytics
    }
  }

  /**
   * Capture a custom analytics event
   * 
   * @param eventName - Name of the event to capture
   * @param properties - Optional properties to attach to the event
   * 
   * Requirements: 1.4
   */
  public capture(eventName: string, properties?: EventProperties): void {
    // Skip if disabled
    if (this.config?.disabled) return

    // Development mode: log to console
    if (this.config?.developmentMode) {
      console.log('[Analytics] Event:', eventName, properties)
      return
    }

    // Queue event if offline or not initialized
    if (!this.isOnline || !this.isInitialized) {
      this.queueEvent(eventName, properties || {})
      return
    }

    // Capture event
    try {
      this.posthog?.capture(eventName, properties)
    } catch (error) {
      console.error('[Analytics] Failed to capture event:', error)
      // Queue for retry
      this.queueEvent(eventName, properties || {})
    }
  }

  /**
   * Set a user property that persists across events
   * 
   * @param key - Property key
   * @param value - Property value
   * 
   * Requirements: 1.4
   */
  public setUserProperty(key: string, value: any): void {
    if (this.config?.disabled || !this.isInitialized) return

    try {
      this.posthog?.people.set({ [key]: value })
    } catch (error) {
      console.error('[Analytics] Failed to set user property:', error)
    }
  }

  /**
   * Track a page view event
   * 
   * @param path - Page path
   * @param title - Page title
   * 
   * Requirements: 1.4
   */
  public trackPageView(path: string, title: string): void {
    this.capture('$pageview', {
      $current_url: path,
      $pathname: path,
      $title: title,
      timestamp: Date.now()
    })
  }

  /**
   * Disable analytics tracking (user opt-out)
   * 
   * Requirements: 1.4
   */
  public disable(): void {
    try {
      this.posthog?.opt_out_capturing()
      console.log('[Analytics] Tracking disabled')
    } catch (error) {
      console.error('[Analytics] Failed to disable tracking:', error)
    }
  }

  /**
   * Enable analytics tracking (user opt-in)
   * 
   * Requirements: 1.4
   */
  public enable(): void {
    try {
      this.posthog?.opt_in_capturing()
      console.log('[Analytics] Tracking enabled')
    } catch (error) {
      console.error('[Analytics] Failed to enable tracking:', error)
    }
  }

  /**
   * Queue an event for later transmission when offline
   * Enforces max queue size by dropping oldest events
   * 
   * @param eventName - Name of the event
   * @param properties - Event properties
   * 
   * Requirements: 1.4
   */
  private queueEvent(eventName: string, properties: EventProperties): void {
    // Enforce max queue size
    if (this.eventQueue.length >= this.MAX_QUEUE_SIZE) {
      console.warn('[Analytics] Event queue full, dropping oldest event')
      this.eventQueue.shift()
    }

    this.eventQueue.push({
      eventName,
      properties,
      timestamp: Date.now()
    })
  }

  /**
   * Flush all queued events to PostHog
   * Called when network connection is restored
   * 
   * Requirements: 1.4
   */
  private flushQueue(): void {
    if (this.eventQueue.length === 0) return

    console.log(`[Analytics] Flushing ${this.eventQueue.length} queued events`)

    const eventsToFlush = [...this.eventQueue]
    this.eventQueue = []

    eventsToFlush.forEach(event => {
      this.capture(event.eventName, event.properties)
    })
  }

  /**
   * Setup network online/offline listeners for automatic queue management
   * 
   * Requirements: 1.4
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('[Analytics] Network restored')
      this.isOnline = true
      this.flushQueue()
    })

    window.addEventListener('offline', () => {
      console.log('[Analytics] Network lost')
      this.isOnline = false
    })
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance()
