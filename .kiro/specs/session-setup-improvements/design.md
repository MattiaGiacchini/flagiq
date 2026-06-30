# Design Document: Session Setup Improvements

## Overview

This design addresses four initialization and default value improvements in the SessionSetupPanel component. The changes enhance user experience by restoring saved preferences, enforcing conscious mode selection, setting appropriate regional defaults, and reordering question count options for better usability.

## Architecture

### Component Structure

The SessionSetupPanel is a Vue 3 composition API component that manages local state for session configuration and synchronizes with the Pinia session store. The component follows a controlled component pattern where local state (`ref` variables) represents the working configuration, which is committed to the store only when the user starts a session.

```
SessionSetupPanel (Parent)
├── ContinentFilter (Child - v-model: selectedContinents)
├── GameModeSelector (Child - v-model: selectedMode)
├── QuestionCountPicker (Child - v-model: selectedCount)
├── BlitzModeToggle (Child - v-model: blitzEnabled)
└── StartSessionButton (Child - event: @click:start)
```

### State Management

**Local Component State (TypeScript refs):**
```typescript
const selectedContinents = ref<Continent[]>([])
const selectedMode = ref<GameMode | null>(null)
const selectedCount = ref<QuestionCount>('all')
const blitzEnabled = ref<boolean>(false)
```

**Store Integration:**
- SessionStore (`useSessionStore`) provides `loadConfigFromStorage()` method
- On initialization, panel reads from store's persisted config
- On session start, panel commits local state to store via `updateConfig()`

### Data Flow

1. **Initialization Flow:**
   ```
   Component Mount
   → Read sessionStore.config (which loads from localStorage)
   → Initialize local refs with store config values
   → Render child components with v-model bindings
   ```

2. **User Interaction Flow:**
   ```
   User Changes Setting
   → Child component emits update:modelValue
   → Parent updates local ref
   → Computed properties recalculate (canStart, availableFlags)
   → UI updates reactively
   ```

3. **Session Start Flow:**
   ```
   User Clicks Start
   → handleStart() creates SessionConfig from local refs
   → sessionStore.updateConfig(config) validates and saves
   → sessionStore.startSession() sets active flag
   → Router navigates to /play
   ```

## Component Changes

### SessionSetupPanel.vue

**Modified Initialization Logic:**

```typescript
// Before (current implementation)
const selectedContinents = ref<Continent[]>([...DEFAULT_SESSION_CONFIG.continents])
const selectedMode = ref<GameMode>(DEFAULT_SESSION_CONFIG.mode)
const selectedCount = ref<QuestionCount>(DEFAULT_SESSION_CONFIG.count)
const blitzEnabled = ref<boolean>(DEFAULT_SESSION_CONFIG.blitz)

// After (new implementation)
const sessionStore = useSessionStore()
const savedConfig = sessionStore.config // Already loaded from localStorage on store initialization

const selectedContinents = ref<Continent[]>([...savedConfig.continents])
const selectedMode = ref<GameMode | null>(
  savedConfig === DEFAULT_SESSION_CONFIG ? null : savedConfig.mode
)
const selectedCount = ref<QuestionCount>(savedConfig.count)
const blitzEnabled = ref<boolean>(savedConfig.blitz)
```

**Type Changes:**
- `selectedMode` type changes from `ref<GameMode>` to `ref<GameMode | null>`
- This allows null state to represent "no mode selected"

**Modified Computed Property:**

```typescript
// Before
const canStart = computed(() => selectedContinents.value.length > 0)

// After
const canStart = computed(() => 
  selectedContinents.value.length > 0 && selectedMode.value !== null
)
```

**Initialization Logic:**

The panel needs to distinguish between two scenarios:
1. **First-time user** (no saved config → store has DEFAULT_SESSION_CONFIG): Initialize with all continents, count='all', blitz=false, **mode=null**
2. **Returning user** (saved config exists): Initialize with all saved values including mode

Detection strategy:
```typescript
// The store's config will either be:
// 1. The loaded saved config (if it existed and was valid)
// 2. DEFAULT_SESSION_CONFIG (if no saved config or invalid)

// We can detect first-time by checking if config equals DEFAULT_SESSION_CONFIG
// But we need to update DEFAULT_SESSION_CONFIG first
```

### types/session.ts

**Modified Constants:**

```typescript
// Before
export const VALID_COUNTS: QuestionCount[] = [10, 25, 50, 'all']

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  continents: [...ALL_CONTINENTS],
  mode: 'name-it',
  count: 10,
  blitz: false,
}

// After
export const VALID_COUNTS: QuestionCount[] = ['all', 10, 25, 50]

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  continents: [...ALL_CONTINENTS],
  mode: 'name-it',
  count: 'all',
  blitz: false,
}
```

**Note:** The `mode` field in DEFAULT_SESSION_CONFIG remains a valid GameMode (not null) because the SessionConfig type interface requires it. The SessionSetupPanel component will override this with null for first-time users during initialization.

### stores/session.ts

**No changes required.** The store already:
- Loads config from localStorage on initialization via `loadConfigFromStorage()`
- Provides `config` ref that components can read
- Falls back to DEFAULT_SESSION_CONFIG if no saved config exists

The store's initialization happens before component mounting (Pinia store initialization), so `sessionStore.config` will always be populated when SessionSetupPanel reads it.

## Implementation Strategy

### Phase 1: Update Constants
1. Modify `VALID_COUNTS` order in `types/session.ts`
2. Update `DEFAULT_SESSION_CONFIG.count` to `'all'`
3. Verify QuestionCountPicker renders options in new order (no code change needed - it iterates VALID_COUNTS)

### Phase 2: Update SessionSetupPanel Initialization
1. Change `selectedMode` type to `ref<GameMode | null>`
2. Read `sessionStore.config` during initialization
3. Initialize `selectedContinents`, `selectedCount`, `blitzEnabled` from store config
4. Initialize `selectedMode`:
   - Check if store config is a "new" config (matches DEFAULT_SESSION_CONFIG reference or has never been saved)
   - If new: set to `null`
   - If saved: set to `sessionStore.config.mode`
5. Update `canStart` computed to check both continents and mode

### Phase 3: First-Time Detection Logic

Since we need to detect "first-time user" vs "returning user", we have options:

**Option A: Compare with DEFAULT_SESSION_CONFIG (Brittle)**
```typescript
const isFirstTime = JSON.stringify(savedConfig) === JSON.stringify(DEFAULT_SESSION_CONFIG)
```
Problem: Brittle, breaks if defaults change

**Option B: Store Metadata (Recommended)**
Add a flag to localStorage to indicate if config has ever been saved by user:
```typescript
// In stores/session.ts
const HAS_SAVED_KEY = 'flagiq:hasCustomConfig'

function saveConfigToStorage(config: SessionConfig): void {
  try {
    localStorage.setItem(SESSION_CONFIG_KEY, JSON.stringify(config))
    localStorage.setItem(HAS_SAVED_KEY, 'true')
  } catch (error) {
    console.warn('[SessionStore] Failed to save config to localStorage:', error)
  }
}

function hasCustomConfig(): boolean {
  return localStorage.getItem(HAS_SAVED_KEY) === 'true'
}

// Export for component use
return {
  // ... existing
  hasCustomConfig,
}
```

**Option C: Check localStorage Directly (Simple)**
```typescript
// In SessionSetupPanel
const hasSavedConfig = localStorage.getItem('flagiq:sessionConfig') !== null
const selectedMode = ref<GameMode | null>(
  hasSavedConfig ? savedConfig.mode : null
)
```

**Recommended: Option C** - Direct localStorage check is simple, clear, and doesn't require store changes.

## Error Handling

### Invalid Saved Config
The store already handles this via `isValidSessionConfig()` check in `loadConfigFromStorage()`. If validation fails, store falls back to DEFAULT_SESSION_CONFIG.

### Null Mode on Start
The `canStart` computed property prevents starting with null mode, so `handleStart()` will never receive a null mode. TypeScript will still see `GameMode | null`, so we can add a guard:

```typescript
function handleStart() {
  if (selectedMode.value === null) {
    console.warn('[SessionSetupPanel] Cannot start with null mode')
    return
  }
  
  const currentConfig: SessionConfig = {
    continents: selectedContinents.value,
    mode: selectedMode.value, // TypeScript knows this is GameMode here
    count: selectedCount.value,
    blitz: blitzEnabled.value,
  }
  // ... rest of logic
}
```

## Testing Strategy

### Unit Tests

**Constant Validation Tests:**
- Verify `VALID_COUNTS[0] === 'all'`
- Verify `VALID_COUNTS` equals `['all', 10, 25, 50]`
- Verify `DEFAULT_SESSION_CONFIG.count === 'all'`
- Verify `DEFAULT_SESSION_CONFIG.continents` equals `ALL_CONTINENTS`

**Component Initialization Tests:**
- Test: No saved config → component initializes with mode=null
- Test: Saved config exists → component initializes with saved mode
- Test: No saved config → QuestionCountPicker shows 'all' selected
- Test: Button disabled when mode is null
- Test: Button disabled when continents is empty
- Test: Button enabled when mode is set and continents is not empty
- Test: QuestionCountPicker renders options in VALID_COUNTS order
- Test: ContinentFilter shows "All Regions" active when all 5 continents selected

### Property-Based Tests

#### Property 1: Config Restoration Preserves All Fields

**Property Statement:**
*For any* valid SessionConfig, if it is saved to sessionStore and the SessionSetupPanel is mounted, then all component state variables (selectedContinents, selectedMode, selectedCount, blitzEnabled) SHALL equal the saved config values.

**Validates: Requirements 1.2, 1.4, 2.5, 3.3, 4.6**

**Test Implementation:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useSessionStore } from '@/stores/session'
import SessionSetupPanel from '@/components/session/SessionSetupPanel.vue'
import * as fc from 'fast-check'
import type { SessionConfig, Continent, GameMode, QuestionCount } from '@/types/session'

// Arbitraries for generating random valid configs
const continentArb = fc.constantFrom<Continent>(
  'europe', 'asia', 'americas', 'africa', 'oceania'
)

const continentsArb = fc.uniqueArray(continentArb, { minLength: 1, maxLength: 5 })

const gameModeArb = fc.constantFrom<GameMode>(
  'type-it', 'choose-flag', 'find-on-map', 'name-it'
)

const questionCountArb = fc.constantFrom<QuestionCount>('all', 10, 25, 50)

const sessionConfigArb: fc.Arbitrary<SessionConfig> = fc.record({
  continents: continentsArb,
  mode: gameModeArb,
  count: questionCountArb,
  blitz: fc.boolean(),
})

describe('Property 1: Config Restoration', () => {
  it('should restore all config fields from saved config', () => {
    fc.assert(
      fc.property(sessionConfigArb, (config) => {
        // Arrange: Save config to localStorage
        localStorage.setItem('flagiq:sessionConfig', JSON.stringify(config))
        
        // Create fresh store and component
        const pinia = createPinia()
        setActivePinia(pinia)
        
        // Act: Mount component (triggers initialization)
        const wrapper = mount(SessionSetupPanel, {
          global: { plugins: [pinia] }
        })
        
        // Assert: All fields match saved config
        const vm = wrapper.vm as any
        expect(vm.selectedContinents).toEqual(config.continents)
        expect(vm.selectedMode).toBe(config.mode)
        expect(vm.selectedCount).toBe(config.count)
        expect(vm.blitzEnabled).toBe(config.blitz)
        
        // Cleanup
        wrapper.unmount()
        localStorage.clear()
      }),
      { numRuns: 100 }
    )
  })
})
```

#### Property 2: Mode Selection Updates State

**Property Statement:**
*For any* GameMode, when a user selects that mode in the GameModeSelector, the SessionSetupPanel's selectedMode state SHALL update to that GameMode.

**Validates: Requirements 2.3**

**Test Implementation:**
```typescript
describe('Property 2: Mode Selection', () => {
  it('should update selectedMode for any game mode selection', () => {
    fc.assert(
      fc.property(gameModeArb, (mode) => {
        // Arrange: Mount component with no saved config
        localStorage.clear()
        const pinia = createPinia()
        setActivePinia(pinia)
        const wrapper = mount(SessionSetupPanel, {
          global: { plugins: [pinia] }
        })
        
        // Act: Select mode
        const modeSelector = wrapper.findComponent({ name: 'GameModeSelector' })
        modeSelector.vm.$emit('update:modelValue', mode)
        await wrapper.vm.$nextTick()
        
        // Assert: State updated
        const vm = wrapper.vm as any
        expect(vm.selectedMode).toBe(mode)
        
        // Cleanup
        wrapper.unmount()
        localStorage.clear()
      }),
      { numRuns: 100 }
    )
  })
})
```

#### Property 3: Start Button Enabled With Valid State

**Property Statement:**
*For any* component state where selectedMode is not null AND selectedContinents is not empty, the Start button SHALL be enabled.

**Validates: Requirements 2.4**

**Test Implementation:**
```typescript
describe('Property 3: Button Enabling Logic', () => {
  it('should enable start button for any valid state', () => {
    fc.assert(
      fc.property(
        gameModeArb,
        continentsArb,
        (mode, continents) => {
          // Arrange: Mount component
          localStorage.clear()
          const pinia = createPinia()
          setActivePinia(pinia)
          const wrapper = mount(SessionSetupPanel, {
            global: { plugins: [pinia] }
          })
          
          // Act: Set state to valid values
          const vm = wrapper.vm as any
          vm.selectedMode = mode
          vm.selectedContinents = continents
          await wrapper.vm.$nextTick()
          
          // Assert: Button is enabled
          const startButton = wrapper.findComponent({ name: 'StartSessionButton' })
          expect(startButton.props('disabled')).toBe(false)
          
          // Cleanup
          wrapper.unmount()
          localStorage.clear()
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

#### Property 4: All Continents Selected Shows Active State

**Property Statement:**
*For any* component state where all 5 continents are selected, the ContinentFilter SHALL render the "All Regions" button in an active state.

**Validates: Requirements 3.4**

**Test Implementation:**
```typescript
import { ALL_CONTINENTS } from '@/types/session'

describe('Property 4: All Continents UI State', () => {
  it('should show All Regions active when all continents selected', () => {
    fc.assert(
      fc.property(
        questionCountArb,
        gameModeArb,
        fc.boolean(),
        (count, mode, blitz) => {
          // Arrange: Create config with all continents
          const config: SessionConfig = {
            continents: [...ALL_CONTINENTS],
            mode,
            count,
            blitz,
          }
          localStorage.setItem('flagiq:sessionConfig', JSON.stringify(config))
          
          const pinia = createPinia()
          setActivePinia(pinia)
          
          // Act: Mount component
          const wrapper = mount(SessionSetupPanel, {
            global: { plugins: [pinia] }
          })
          
          // Assert: All Regions button is active
          const continentFilter = wrapper.findComponent({ name: 'ContinentFilter' })
          const allRegionsButton = continentFilter.find('[data-testid="all-regions-button"]')
          expect(allRegionsButton.classes()).toContain('active')
          
          // Cleanup
          wrapper.unmount()
          localStorage.clear()
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

**Note:** Property 4 test assumes ContinentFilter has a `data-testid="all-regions-button"` attribute. This may need to be added during implementation.

## Migration and Rollout

### Backward Compatibility

**Existing Saved Configs:**
Users with saved configs that have `count: 10` (or 25, 50) will continue to work correctly. The component will load their saved count value, even though the default has changed to `'all'`.

**VALID_COUNTS Reordering:**
The QuestionCountPicker iterates over `VALID_COUNTS` to render buttons, so reordering the array will automatically reorder the UI. No breaking changes.

**Mode Null Handling:**
Existing saved configs have valid `mode` values, so returning users will not see null mode. Only first-time users (no saved config) will start with null mode.

### Deployment Steps

1. Deploy constant changes (VALID_COUNTS, DEFAULT_SESSION_CONFIG) - no user impact
2. Deploy SessionSetupPanel changes - first-time users will experience new behavior, returning users unaffected
3. Monitor for initialization errors in production logs
4. Verify localStorage structure remains compatible

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Config Restoration Preserves All Fields

*For any* valid SessionConfig, if it is saved to sessionStore and the SessionSetupPanel is mounted, then all component state variables (selectedContinents, selectedMode, selectedCount, blitzEnabled) SHALL equal the saved config values.

**Validates: Requirements 1.2, 1.4, 2.5, 3.3, 4.6**

### Property 2: Mode Selection Updates State

*For any* GameMode, when a user selects that mode in the GameModeSelector, the SessionSetupPanel's selectedMode state SHALL update to that GameMode.

**Validates: Requirements 2.3**

### Property 3: Start Button Enabled With Valid State

*For any* component state where selectedMode is not null AND selectedContinents is not empty, the Start button SHALL be enabled.

**Validates: Requirements 2.4**

### Property 4: All Continents Selected Shows Active State

*For any* component state where all 5 continents are selected, the ContinentFilter SHALL render the "All Regions" button in an active state.

**Validates: Requirements 3.4**

## Appendix: Alternative Designs Considered

### Alternative 1: Mode Defaults to First Option
Instead of null, default mode to the first GameMode in VALID_MODES. 
**Rejected:** Requirement 2.1 explicitly requires null to force conscious selection.

### Alternative 2: Disable All Controls Until Mode Selected
Lock continent and count pickers until mode is selected.
**Rejected:** Overly restrictive UX; users should be able to configure in any order.

### Alternative 3: Store Mode=Null in SessionConfig
Change SessionConfig.mode type to `GameMode | null`.
**Rejected:** Breaks type safety for the store and game logic which requires valid mode. Null mode is a UI-only concept for the setup panel.
