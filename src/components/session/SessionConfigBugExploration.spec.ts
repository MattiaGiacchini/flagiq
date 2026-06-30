import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import GameProgressBar from '@/components/game/GameProgressBar.vue'
import ContinentFilter from '@/components/session/ContinentFilter.vue'
import { useSessionStore } from '@/stores/session'
import { ALL_CONTINENTS, DEFAULT_SESSION_CONFIG } from '@/types/session'
import type { Continent, SessionConfig } from '@/types/session'

/**
 * Bug Condition Exploration Test - Session Config Fixes
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 * 
 * This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the four bugs exist and provides counterexamples.
 * 
 * DO NOT FIX THIS TEST OR THE CODE when it fails.
 * Document the failures - they prove the bugs are real.
 * 
 * The test encodes the expected behavior - it will validate
 * the fix when it passes after implementation.
 */

describe('Session Config Bug Condition Exploration', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Create fresh Pinia instance
    pinia = createPinia()
    setActivePinia(pinia)
  })

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear()
  })

  /**
   * Bug 1: Progress Bar Width Restriction
   * 
   * Bug Condition C1: GameProgressBar rendered on screens wider than 640px
   * Expected Behavior P1: Progress bar occupies 100% of parent container width
   * 
   * EXPECTED OUTCOME: Test FAILS - progress bar is limited to 640px despite
   * having a 1200px parent container.
   * 
   * Root Cause: Hardcoded max-width: 640px in .progress-bar-wrapper CSS
   */
  describe('Bug 1: Progress Bar Width Restriction', () => {
    it('should allow progress bar to use full parent width on screens wider than 640px', () => {
      // Create a wide parent container (1200px)
      const parentDiv = document.createElement('div')
      parentDiv.style.width = '1200px'
      document.body.appendChild(parentDiv)

      const wrapper = mount(GameProgressBar, {
        props: {
          current: 5,
          total: 10,
          streak: 3,
          locale: 'en',
        },
        attachTo: parentDiv,
      })

      const progressBarWrapper = wrapper.find('.progress-bar-wrapper')
      expect(progressBarWrapper.exists()).toBe(true)

      // Get the computed styles
      const element = progressBarWrapper.element as HTMLElement
      const computedStyles = window.getComputedStyle(element)
      const maxWidth = computedStyles.getPropertyValue('max-width')

      console.log('=== BUG 1 EXPLORATION: Progress Bar Width ===')
      console.log('Parent container width: 1200px')
      console.log('Progress bar max-width CSS:', maxWidth)
      console.log('Expected: No max-width constraint (none)')
      console.log('Bug was: Limited to 640px')

      // EXPECTED TO FAIL: On unfixed code, maxWidth will be '640px'
      // On fixed code, this should pass with no max-width constraint
      // Note: We test the CSS property, not the rendered width, because
      // JSDOM doesn't fully calculate layout. The max-width constraint
      // is what limited the width in real browsers.
      expect(maxWidth).not.toBe('640px')
      expect(['none', '']).toContain(maxWidth)
      
      // Clean up
      wrapper.unmount()
      document.body.removeChild(parentDiv)
    })

    it('should scale progress bar on ultra-wide screens (1920px)', () => {
      const parentDiv = document.createElement('div')
      parentDiv.style.width = '1920px'
      document.body.appendChild(parentDiv)

      const wrapper = mount(GameProgressBar, {
        props: {
          current: 8,
          total: 50,
          streak: 0,
          locale: 'es',
        },
        attachTo: parentDiv,
      })

      const progressBarWrapper = wrapper.find('.progress-bar-wrapper')
      const element = progressBarWrapper.element as HTMLElement
      const computedStyles = window.getComputedStyle(element)
      const maxWidth = computedStyles.getPropertyValue('max-width')

      console.log('=== BUG 1 EXPLORATION: Ultra-wide Screen (1920px) ===')
      console.log('Progress bar max-width:', maxWidth)
      console.log('Expected: No constraint (should adapt to parent)')

      // EXPECTED TO FAIL: maxWidth will be '640px' on unfixed code
      expect(maxWidth).not.toBe('640px')

      wrapper.unmount()
      document.body.removeChild(parentDiv)
    })
  })

  /**
   * Bug 2: Configuration Persistence
   * 
   * Bug Condition C2: Page reload with previously configured session settings
   * Expected Behavior P2: Configuration persists across page reloads
   * 
   * EXPECTED OUTCOME: Test FAILS - configuration resets to DEFAULT_SESSION_CONFIG
   * after reload, losing user's custom settings.
   * 
   * Root Cause: SessionStore doesn't integrate with localStorage for persistence
   */
  describe('Bug 2: Configuration Persistence', () => {
    it('should persist custom config to localStorage after updateConfig', () => {
      const store = useSessionStore()

      // Custom configuration: Europe + Asia only, 50 questions, blitz enabled
      const customConfig: SessionConfig = {
        continents: ['europe', 'asia'],
        mode: 'type-it',
        count: 50,
        blitz: true,
      }

      store.updateConfig(customConfig)

      console.log('=== BUG 2 EXPLORATION: Persistence ===')
      console.log('Custom config set:', customConfig)
      console.log('localStorage keys:', Object.keys(localStorage))
      console.log('localStorage flagiq:sessionConfig:', localStorage.getItem('flagiq:sessionConfig'))

      // EXPECTED TO FAIL: localStorage will be empty on unfixed code
      const storedValue = localStorage.getItem('flagiq:sessionConfig')
      expect(storedValue).not.toBeNull()

      if (storedValue) {
        const parsed = JSON.parse(storedValue)
        expect(parsed.continents).toEqual(['europe', 'asia'])
        expect(parsed.mode).toBe('type-it')
        expect(parsed.count).toBe(50)
        expect(parsed.blitz).toBe(true)
      }
    })

    it('should restore config from localStorage on store initialization', () => {
      // Simulate a user's saved configuration in localStorage
      const savedConfig: SessionConfig = {
        continents: ['americas', 'africa'],
        mode: 'find-on-map',
        count: 25,
        blitz: false,
      }

      localStorage.setItem('flagiq:sessionConfig', JSON.stringify(savedConfig))

      // Create a new store instance (simulating page reload)
      const freshPinia = createPinia()
      setActivePinia(freshPinia)
      const store = useSessionStore()

      console.log('=== BUG 2 EXPLORATION: Restoration ===')
      console.log('localStorage config:', savedConfig)
      console.log('Store config after init:', store.config)
      console.log('Expected: Restored from localStorage')
      console.log('Current bug: Resets to DEFAULT_SESSION_CONFIG')

      // EXPECTED TO FAIL: store.config will be DEFAULT_SESSION_CONFIG on unfixed code
      expect(store.config.continents).toEqual(['americas', 'africa'])
      expect(store.config.mode).toBe('find-on-map')
      expect(store.config.count).toBe(25)
      expect(store.config.blitz).toBe(false)
    })

    it('should handle page reload scenario with custom settings', () => {
      // Phase 1: User configures session
      const store1 = useSessionStore()
      const userConfig: SessionConfig = {
        continents: ['oceania'],
        mode: 'choose-flag',
        count: 10,
        blitz: true,
      }
      store1.updateConfig(userConfig)

      console.log('=== BUG 2 EXPLORATION: Page Reload Scenario ===')
      console.log('Phase 1 - User sets config:', userConfig)

      // Phase 2: Simulate page reload (new Pinia instance)
      const freshPinia = createPinia()
      setActivePinia(freshPinia)
      const store2 = useSessionStore()

      console.log('Phase 2 - After reload, config is:', store2.config)
      console.log('Expected: Same as userConfig')
      console.log('Current bug: DEFAULT_SESSION_CONFIG with all continents')

      // EXPECTED TO FAIL: Config will be reset to default
      expect(store2.config.continents).toEqual(['oceania'])
      expect(store2.config.mode).toBe('choose-flag')
      expect(store2.config.blitz).toBe(true)
    })
  })

  /**
   * Bug 3: "All Regions" Initial Active State
   * 
   * Bug Condition C3: App initialization with DEFAULT_SESSION_CONFIG (all continents selected)
   * Expected Behavior P3: "All Regions" button shows active state on initialization
   * 
   * ACTUAL OUTCOME: Test PASSED - Bug does NOT exist!
   * The component correctly applies chip--all-active class on initialization.
   * 
   * CONCLUSION: Bug 3 described in bugfix.md does not manifest in unit tests.
   * The reactive binding works correctly. No fix needed for Bug 3.
   * 
   * These tests are kept to verify the behavior remains correct after other fixes.
   */
  describe('Bug 3: "All Regions" Initial Active State - VERIFIED WORKING', () => {
    it('PASSES - button correctly shows active state when all continents selected on init', () => {
      // Initialize with all continents (DEFAULT_SESSION_CONFIG behavior)
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: [...ALL_CONTINENTS], // All 5 continents selected
        },
      })

      const allRegionsButton = wrapper.find('.chip--all')
      expect(allRegionsButton.exists()).toBe(true)

      const hasActiveClass = allRegionsButton.classes().includes('chip--all-active')
      const ariaPressedValue = allRegionsButton.attributes('aria-pressed')

      console.log('=== BUG 3 EXPLORATION: Initial Active State ===')
      console.log('modelValue on init:', ALL_CONTINENTS)
      console.log('All continents selected: true')
      console.log('"All Regions" has chip--all-active class:', hasActiveClass)
      console.log('"All Regions" aria-pressed:', ariaPressedValue)
      console.log('✓ RESULT: Bug 3 does NOT exist - component works correctly')

      // PASSES: Component already works correctly
      expect(hasActiveClass).toBe(true)
      expect(ariaPressedValue).toBe('true')
    })

    it('PASSES - reflects active state correctly when component mounts with all continents', () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe', 'asia', 'americas', 'africa', 'oceania'] as Continent[],
        },
      })

      const allRegionsButton = wrapper.find('.chip--all')
      const classes = allRegionsButton.classes()

      console.log('=== BUG 3 EXPLORATION: Mount with All Continents ===')
      console.log('Button classes:', classes)
      console.log('✓ Contains chip--all-active correctly')

      // PASSES: Component works correctly
      expect(classes).toContain('chip--all-active')
    })
  })

  /**
   * Bug 4: "All Regions" Toggle Behavior
   * 
   * Bug Condition C4: Click on "All Regions" button when all continents are already selected
   * Expected Behavior P4: "All Regions" button deselects to 1 continent (toggle behavior)
   * 
   * EXPECTED OUTCOME: Test FAILS - clicking "All Regions" when all are selected
   * emits the same array (no deselection occurs).
   * 
   * Root Cause: selectAll() function lacks toggle logic - only performs selection
   */
  describe('Bug 4: "All Regions" Toggle Behavior', () => {
    it('should deselect to 1 continent when "All Regions" is clicked with all selected', async () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: [...ALL_CONTINENTS], // All 5 continents already selected
        },
      })

      const allRegionsButton = wrapper.find('.chip--all')
      
      console.log('=== BUG 4 EXPLORATION: Toggle Behavior ===')
      console.log('Initial state: All 5 continents selected')
      console.log('User action: Click "All Regions" button')

      // Click the button
      await allRegionsButton.trigger('click')

      // Check emitted event
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeDefined()
      expect(emitted).toHaveLength(1)

      const emittedValue = emitted?.[0]?.[0] as Continent[]
      
      console.log('Emitted value:', emittedValue)
      console.log('Emitted length:', emittedValue.length)
      console.log('Expected: 1 continent (deselection)')
      console.log('Current bug: 5 continents (no change)')

      // EXPECTED TO FAIL: emittedValue will still have 5 continents on unfixed code
      expect(emittedValue.length).toBe(1)
      expect(emittedValue[0]).toBe('europe') // First continent by convention
    })

    it('should toggle from all-selected to deselected state', async () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe', 'asia', 'americas', 'africa', 'oceania'] as Continent[],
        },
      })

      const allRegionsButton = wrapper.find('.chip--all')

      console.log('=== BUG 4 EXPLORATION: Bidirectional Toggle ===')
      console.log('Before click: 5 continents selected')

      await allRegionsButton.trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      const emittedValue = emitted?.[0]?.[0] as Continent[]

      console.log('After click: emitted', emittedValue.length, 'continents')
      console.log('Expected behavior: Toggle to minimal selection (1 continent)')
      console.log('Current bug: No toggle (remains 5 continents)')

      // EXPECTED TO FAIL: Will emit 5 continents instead of 1
      expect(emittedValue).toHaveLength(1)
    })

    it('should still select all when not all continents are selected (preserve existing behavior)', async () => {
      // This test verifies that the partial → all selection behavior is preserved
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe', 'asia'] as Continent[], // Only 2 continents
        },
      })

      const allRegionsButton = wrapper.find('.chip--all')

      console.log('=== BUG 4 EXPLORATION: Partial → All Selection (Should Work) ===')
      console.log('Initial: 2 continents selected')

      await allRegionsButton.trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      const emittedValue = emitted?.[0]?.[0] as Continent[]

      console.log('After click: emitted', emittedValue.length, 'continents')
      console.log('Expected: 5 continents (select all)')
      console.log('This behavior should be preserved (not a bug)')

      // This should PASS even on unfixed code (existing functionality)
      expect(emittedValue).toHaveLength(5)
      expect(emittedValue).toEqual(expect.arrayContaining(ALL_CONTINENTS))
    })
  })
})
