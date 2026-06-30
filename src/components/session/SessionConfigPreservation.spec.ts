import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import * as fc from 'fast-check'
import GameProgressBar from '@/components/game/GameProgressBar.vue'
import ContinentFilter from '@/components/session/ContinentFilter.vue'
import SessionSetupPanel from '@/components/session/SessionSetupPanel.vue'
import { useSessionStore } from '@/stores/session'
import { ALL_CONTINENTS, VALID_MODES, VALID_COUNTS } from '@/types/session'
import type { Continent, SessionConfig, GameMode, QuestionCount } from '@/types/session'

/**
 * Preservation Property Tests - Session Config Fixes
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**
 * 
 * These tests capture the CURRENT BEHAVIOR on UNFIXED code for all non-buggy inputs.
 * They ensure that when we fix the bugs, we don't break existing functionality.
 * 
 * EXPECTED OUTCOME: All tests PASS on unfixed code (baseline behavior preserved)
 * 
 * After implementing fixes, these tests MUST STILL PASS to ensure no regressions.
 */

describe('Session Config Preservation Properties', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    localStorage.clear()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  afterEach(() => {
    localStorage.clear()
  })

  /**
   * Property 1: GameProgressBar Props Display Preservation
   * 
   * **Validates: Requirement 3.1**
   * 
   * For any combination of current, total, and streak values,
   * the GameProgressBar MUST correctly display all three values.
   */
  describe('Property 1: GameProgressBar Props Display Preservation', () => {
    it('should correctly display progress for various current/total combinations', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }), // current
          fc.integer({ min: 10, max: 50 }), // total
          fc.integer({ min: 0, max: 20 }), // streak
          (current, total, streak) => {
            // Ensure current <= total for valid progress
            const validCurrent = Math.min(current, total)

            const wrapper = mount(GameProgressBar, {
              props: {
                current: validCurrent,
                total: total,
                streak: streak,
                locale: 'en',
              },
            })

            // Check progress label displays correctly
            const label = wrapper.find('.progress-bar__label')
            expect(label.exists()).toBe(true)
            expect(label.text()).toBe(`${validCurrent} / ${total}`)

            // Check progress bar fill width calculation
            const fill = wrapper.find('.progress-bar__fill')
            expect(fill.exists()).toBe(true)
            const expectedWidth = (validCurrent / total) * 100
            const fillStyle = (fill.element as HTMLElement).style.width
            expect(fillStyle).toBe(`${expectedWidth}%`)

            // Check streak display (only shows when >= 2)
            const streakElement = wrapper.find('.progress-bar__streak')
            if (streak >= 2) {
              expect(streakElement.exists()).toBe(true)
              expect(streakElement.text()).toContain(String(streak))
              expect(streakElement.text()).toContain('streak')
            } else {
              expect(streakElement.exists()).toBe(false)
            }

            wrapper.unmount()
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should display streak in Spanish locale when streak >= 2', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 20 }), // streak >= 2
          (streak) => {
            const wrapper = mount(GameProgressBar, {
              props: {
                current: 5,
                total: 10,
                streak: streak,
                locale: 'es',
              },
            })

            const streakElement = wrapper.find('.progress-bar__streak')
            expect(streakElement.exists()).toBe(true)
            expect(streakElement.text()).toContain('racha')
            expect(streakElement.text()).toContain(String(streak))

            wrapper.unmount()
          }
        ),
        { numRuns: 10 }
      )
    })

    it('should calculate progress percentage correctly across range', () => {
      const testCases = [
        { current: 1, total: 10, expected: 10 },
        { current: 5, total: 10, expected: 50 },
        { current: 10, total: 10, expected: 100 },
        { current: 25, total: 50, expected: 50 },
        { current: 1, total: 50, expected: 2 },
      ]

      testCases.forEach(({ current, total, expected }) => {
        const wrapper = mount(GameProgressBar, {
          props: { current, total, streak: 0, locale: 'en' },
        })

        const fill = wrapper.find('.progress-bar__fill')
        expect((fill.element as HTMLElement).style.width).toBe(`${expected}%`)

        wrapper.unmount()
      })
    })
  })

  /**
   * Property 2: Individual Continent Toggle Preservation
   * 
   * **Validates: Requirement 3.3**
   * 
   * For any individual continent toggle button click,
   * the component MUST toggle that specific continent's selection state.
   */
  describe('Property 2: Individual Continent Toggle Preservation', () => {
    it('should toggle adding a continent to selection', async () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe', 'asia'] as Continent[],
        },
      })

      // Find and click Africa button (not currently selected)
      const buttons = wrapper.findAll('.chip')
      const africaButton = buttons.find(btn => btn.text().includes('Africa'))
      expect(africaButton).toBeDefined()
      
      await africaButton!.trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeDefined()
      const newSelection = emitted?.[0]?.[0] as Continent[]

      // Should now have Europe, Asia, and Africa
      expect(newSelection).toContain('europe')
      expect(newSelection).toContain('asia')
      expect(newSelection).toContain('africa')
      expect(newSelection).toHaveLength(3)

      wrapper.unmount()
    })

    it('should toggle removing a continent from selection (when more than 1 selected)', async () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe', 'asia', 'americas'] as Continent[],
        },
      })

      // Find and click Asia button (currently selected)
      const buttons = wrapper.findAll('.chip')
      const asiaButton = buttons.find(btn => btn.text().includes('Asia'))
      expect(asiaButton).toBeDefined()
      
      await asiaButton!.trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeDefined()
      const newSelection = emitted?.[0]?.[0] as Continent[]

      // Should now have only Europe and Americas (Asia removed)
      expect(newSelection).toContain('europe')
      expect(newSelection).toContain('americas')
      expect(newSelection).not.toContain('asia')
      expect(newSelection).toHaveLength(2)

      wrapper.unmount()
    })

    it('should preserve all continents when toggling various combinations', () => {
      // Test multiple toggle scenarios with property-based testing
      const testCases = [
        { initial: ['europe'], toggle: 'asia', expected: ['europe', 'asia'] },
        { initial: ['europe', 'asia', 'africa'], toggle: 'africa', expected: ['europe', 'asia'] },
        { initial: ['americas'], toggle: 'oceania', expected: ['americas', 'oceania'] },
        { initial: ['europe', 'asia', 'americas', 'africa'], toggle: 'americas', expected: ['europe', 'asia', 'africa'] },
      ]

      testCases.forEach(async ({ initial, toggle, expected }) => {
        const wrapper = mount(ContinentFilter, {
          props: {
            modelValue: initial as Continent[],
          },
        })

        const buttons = wrapper.findAll('.chip')
        const continentLabels: Record<string, string> = {
          europe: 'Europe',
          asia: 'Asia',
          americas: 'Americas',
          africa: 'Africa',
          oceania: 'Oceania',
        } as const
        
        const label = continentLabels[toggle]
        if (!label) return
        
        const targetButton = buttons.find(btn => btn.text().includes(label))
        if (targetButton) {
          await targetButton.trigger('click')

          const emitted = wrapper.emitted('update:modelValue')
          if (emitted && emitted.length > 0) {
            const newSelection = emitted?.[0]?.[0] as Continent[]
            expect(newSelection.sort()).toEqual(expected.sort())
          }
        }

        wrapper.unmount()
      })
    })
  })

  /**
   * Property 3: SessionSetupPanel Local Refs Reactivity Preservation
   * 
   * **Validates: Requirement 3.2**
   * 
   * For any user interaction changing configuration in SessionSetupPanel,
   * the local refs MUST update reactively.
   */
  describe('Property 3: SessionSetupPanel Local Refs Reactivity Preservation', () => {
    it('should update selectedContinents ref when ContinentFilter changes', async () => {
      const wrapper = mount(SessionSetupPanel, {
        global: {
          plugins: [pinia],
          stubs: {
            GameModeSelector: true,
            QuestionCountPicker: true,
            BlitzModeToggle: true,
            StartSessionButton: true,
          },
        },
      })

      const continentFilter = wrapper.findComponent(ContinentFilter)
      expect(continentFilter.exists()).toBe(true)

      // Emit a change from ContinentFilter
      const newContinents: Continent[] = ['europe', 'asia']
      await continentFilter.vm.$emit('update:modelValue', newContinents)
      await wrapper.vm.$nextTick()

      // The SessionSetupPanel's internal selectedContinents ref should update
      // We can verify this by checking the v-model binding propagates
      expect(continentFilter.props('modelValue')).toEqual(newContinents)

      wrapper.unmount()
    })
  })

  /**
   * Property 4: "All Regions" Button Selects All from Partial Selection
   * 
   * **Validates: Requirement 3.4**
   * 
   * For any partial selection (1-4 continents), clicking "All Regions"
   * MUST select all 5 continents. This is existing behavior to preserve.
   */
  describe('Property 4: "All Regions" Selects All from Partial Selection', () => {
    it('should select all continents when clicking "All Regions" from 1 continent', async () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['oceania'] as Continent[],
        },
      })

      const allRegionsButton = wrapper.find('.chip--all')
      expect(allRegionsButton.exists()).toBe(true)
      
      // Should not be active with partial selection
      expect(allRegionsButton.classes()).not.toContain('chip--all-active')

      await allRegionsButton.trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeDefined()
      const newSelection = emitted?.[0]?.[0] as Continent[]

      // Should now have all 5 continents
      expect(newSelection).toHaveLength(5)
      expect(newSelection).toEqual(expect.arrayContaining(ALL_CONTINENTS))

      wrapper.unmount()
    })

    it('should select all continents when clicking "All Regions" from 2 continents', async () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe', 'asia'] as Continent[],
        },
      })

      const allRegionsButton = wrapper.find('.chip--all')
      await allRegionsButton.trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      const newSelection = emitted?.[0]?.[0] as Continent[]

      expect(newSelection).toHaveLength(5)
      expect(newSelection).toEqual(expect.arrayContaining(ALL_CONTINENTS))

      wrapper.unmount()
    })

    it('should select all continents when clicking "All Regions" from 4 continents', async () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: ['europe', 'asia', 'americas', 'africa'] as Continent[],
        },
      })

      const allRegionsButton = wrapper.find('.chip--all')
      await allRegionsButton.trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      const newSelection = emitted?.[0]?.[0] as Continent[]

      expect(newSelection).toHaveLength(5)
      expect(newSelection).toEqual(expect.arrayContaining(ALL_CONTINENTS))

      wrapper.unmount()
    })

    it('should work for various partial selections using property-based approach', () => {
      const partialSelections = [
        ['europe'],
        ['asia', 'africa'],
        ['americas', 'oceania', 'europe'],
        ['africa', 'asia', 'americas', 'oceania'],
      ]

      partialSelections.forEach(async (partialSelection) => {
        const wrapper = mount(ContinentFilter, {
          props: {
            modelValue: partialSelection as Continent[],
          },
        })

        const allRegionsButton = wrapper.find('.chip--all')
        await allRegionsButton.trigger('click')

        const emitted = wrapper.emitted('update:modelValue')
        if (emitted && emitted.length > 0) {
          const newSelection = emitted?.[0]?.[0] as Continent[]
          expect(newSelection).toHaveLength(5)
        }

        wrapper.unmount()
      })
    })
  })

  /**
   * Property 5: Session Validation Logic Preservation
   * 
   * **Validates: Requirement 3.5**
   * 
   * For any SessionConfig with invalid constraints,
   * the validation MUST continue to enforce rules (min 1 continent, valid modes, etc.)
   */
  describe('Property 5: Session Validation Logic Preservation', () => {
    it('should accept valid configurations', () => {
      fc.assert(
        fc.property(
          fc.subarray(ALL_CONTINENTS, { minLength: 1, maxLength: 5 }),
          fc.constantFrom(...VALID_MODES),
          fc.constantFrom(...VALID_COUNTS),
          fc.boolean(),
          (continents, mode, count, blitz) => {
            const store = useSessionStore()

            const validConfig: SessionConfig = {
              continents,
              mode,
              count,
              blitz,
            }

            const result = store.updateConfig(validConfig)

            // Valid config should be accepted
            expect(result).toBe(true)
            expect(store.config.continents).toEqual(continents)
            expect(store.config.mode).toBe(mode)
            expect(store.config.count).toBe(count)
            expect(store.config.blitz).toBe(blitz)
          }
        ),
        { numRuns: 40 }
      )
    })

    it('should reject invalid configurations', () => {
      const store = useSessionStore()

      // Empty continents array (invalid)
      const invalidConfig1: SessionConfig = {
        continents: [],
        mode: 'name-it',
        count: 10,
        blitz: false,
      }

      const result1 = store.updateConfig(invalidConfig1)
      expect(result1).toBe(false)

      // Invalid mode
      const invalidConfig2: any = {
        continents: ['europe'],
        mode: 'invalid-mode',
        count: 10,
        blitz: false,
      }

      const result2 = store.updateConfig(invalidConfig2)
      expect(result2).toBe(false)
    })
  })

  /**
   * Property 6: Session Start Workflow Preservation
   * 
   * **Validates: Requirement 3.6**
   * 
   * For any valid session configuration, the workflow
   * updateConfig → startSession → router.push MUST remain functional.
   */
  describe('Property 6: Session Start Workflow Preservation', () => {
    it('should execute session start workflow successfully', () => {
      const store = useSessionStore()

      const config: SessionConfig = {
        continents: ['europe', 'asia'],
        mode: 'find-on-map',
        count: 25,
        blitz: true,
      }

      // Step 1: updateConfig
      const updateResult = store.updateConfig(config)
      expect(updateResult).toBe(true)
      expect(store.config).toEqual(config)

      // Step 2: startSession
      expect(store.sessionActive).toBe(false)
      store.startSession()
      expect(store.sessionActive).toBe(true)

      // Step 3: Verify config is available in store
      expect(store.selectedContinents).toEqual(['europe', 'asia'])
      expect(store.selectedMode).toBe('find-on-map')
      expect(store.selectedCount).toBe(25)
      expect(store.blitzEnabled).toBe(true)

      // Step 4: endSession should still work
      store.endSession()
      expect(store.sessionActive).toBe(false)
    })

    it('should handle multiple session cycles correctly', () => {
      const store = useSessionStore()

      // Session 1
      store.updateConfig({
        continents: ['africa'],
        mode: 'type-it',
        count: 10,
        blitz: false,
      })
      store.startSession()
      expect(store.sessionActive).toBe(true)
      store.endSession()
      expect(store.sessionActive).toBe(false)

      // Session 2
      store.updateConfig({
        continents: ['americas', 'oceania'],
        mode: 'choose-flag',
        count: 50,
        blitz: true,
      })
      store.startSession()
      expect(store.sessionActive).toBe(true)
      expect(store.config.continents).toEqual(['americas', 'oceania'])
    })
  })

  /**
   * Property 7: Progress Bar Styling and Transitions Preservation
   * 
   * **Validates: Requirement 3.7**
   * 
   * For any progress state, the progress bar MUST maintain
   * its styling, colors, transitions, and visual elements.
   */
  describe('Property 7: Progress Bar Styling and Transitions Preservation', () => {
    it('should maintain progress bar structure and CSS classes', () => {
      const wrapper = mount(GameProgressBar, {
        props: {
          current: 7,
          total: 20,
          streak: 5,
          locale: 'en',
        },
      })

      // Check all expected elements exist
      const progressBarWrapper = wrapper.find('.progress-bar-wrapper')
      const label = wrapper.find('.progress-bar__label')
      const track = wrapper.find('.progress-bar__track')
      const fill = wrapper.find('.progress-bar__fill')
      const streak = wrapper.find('.progress-bar__streak')

      expect(progressBarWrapper.exists()).toBe(true)
      expect(label.exists()).toBe(true)
      expect(track.exists()).toBe(true)
      expect(fill.exists()).toBe(true)
      expect(streak.exists()).toBe(true)

      // Check aria attributes on track
      expect(track.attributes('role')).toBe('progressbar')
      expect(track.attributes('aria-valuenow')).toBe('7')
      expect(track.attributes('aria-valuemax')).toBe('20')

      wrapper.unmount()
    })

    it('should apply proper CSS classes for styling', () => {
      const wrapper = mount(GameProgressBar, {
        props: {
          current: 3,
          total: 10,
          streak: 0,
          locale: 'en',
        },
      })

      const fill = wrapper.find('.progress-bar__fill')

      // Check that the CSS class is present (transition is in scoped styles)
      expect(fill.exists()).toBe(true)
      expect(fill.classes()).toContain('progress-bar__fill')

      // Verify it's inside the track element
      const track = wrapper.find('.progress-bar__track')
      expect(track.exists()).toBe(true)
      expect(track.find('.progress-bar__fill').exists()).toBe(true)

      wrapper.unmount()
    })

    it('should maintain streak display styling', () => {
      const wrapper = mount(GameProgressBar, {
        props: {
          current: 10,
          total: 25,
          streak: 8,
          locale: 'en',
        },
      })

      const streakElement = wrapper.find('.progress-bar__streak')
      expect(streakElement.exists()).toBe(true)

      // Check it has the correct class
      expect(streakElement.classes()).toContain('progress-bar__streak')

      // Verify emoji is present
      expect(streakElement.text()).toContain('⚡')

      wrapper.unmount()
    })
  })

  /**
   * Property 8: "All Regions" Button Active State for Partial Selections
   * 
   * **Validates: Requirement 3.5**
   * 
   * For any selection with less than 5 continents,
   * the "All Regions" button MUST NOT show active state.
   */
  describe('Property 8: "All Regions" Button Active State Logic', () => {
    it('should not show active state for partial selections', () => {
      fc.assert(
        fc.property(
          fc.subarray(ALL_CONTINENTS, { minLength: 1, maxLength: 4 }),
          (partialSelection) => {
            const wrapper = mount(ContinentFilter, {
              props: {
                modelValue: partialSelection,
              },
            })

            const allRegionsButton = wrapper.find('.chip--all')
            expect(allRegionsButton.exists()).toBe(true)

            // Should NOT have active class
            expect(allRegionsButton.classes()).not.toContain('chip--all-active')

            // Should have aria-pressed="false"
            expect(allRegionsButton.attributes('aria-pressed')).toBe('false')

            wrapper.unmount()
          }
        ),
        { numRuns: 20 }
      )
    })

    it('should show active state only when all 5 continents are selected', () => {
      const wrapper = mount(ContinentFilter, {
        props: {
          modelValue: [...ALL_CONTINENTS],
        },
      })

      const allRegionsButton = wrapper.find('.chip--all')
      
      // Should have active class
      expect(allRegionsButton.classes()).toContain('chip--all-active')

      // Should have aria-pressed="true"
      expect(allRegionsButton.attributes('aria-pressed')).toBe('true')

      wrapper.unmount()
    })
  })
})
