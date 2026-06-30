# Session Config Fixes Bugfix Design

## Overview

This design addresses four user experience bugs in the FlagIQ session configuration system:

1. **Progress bar width restriction**: The `GameProgressBar` component has a hardcoded `max-width: 640px` that prevents full-width display on larger screens
2. **Configuration persistence**: Session configuration (continents, mode, count, blitz) is not persisted to localStorage, forcing users to reconfigure on each page load
3. **"All Regions" initial state**: The "All Regions" button doesn't display as active on app initialization, even though all continents are selected by default
4. **"All Regions" toggle behavior**: The "All Regions" button only selects all continents but doesn't deselect them when clicked while all are already selected

The fix strategy involves:
- Removing the `max-width` constraint from GameProgressBar
- Adding localStorage persistence to the session store with automatic save/restore
- Fixing the "All Regions" button to properly reflect initial state and toggle bidirectionally
- Ensuring all existing functionality remains unchanged

## Glossary

- **Bug_Condition (C)**: The set of conditions that trigger any of the four bugs
  - C1: GameProgressBar rendered on screens wider than 640px
  - C2: Page reload with previously configured session settings
  - C3: App initialization with DEFAULT_SESSION_CONFIG (all continents selected)
  - C4: Click on "All Regions" button when all continents are already selected
- **Property (P)**: The desired correct behavior for each bug condition
  - P1: Progress bar occupies 100% of parent container width
  - P2: Configuration persists across page reloads
  - P3: "All Regions" button shows active state on initialization
  - P4: "All Regions" button toggles selection (deselects to 1 continent when all selected)
- **Preservation**: All existing behaviors unrelated to the four bugs must remain unchanged
- **SessionConfig**: The configuration object containing `continents`, `mode`, `count`, and `blitz` properties
- **SessionStore**: The Pinia store (`src/stores/session.ts`) that manages session state
- **ContinentFilter**: The component (`src/components/session/ContinentFilter.vue`) that displays continent selection buttons
- **GameProgressBar**: The component (`src/components/game/GameProgressBar.vue`) that displays game progress during play
- **DEFAULT_SESSION_CONFIG**: The default configuration with all 5 continents selected, 'name-it' mode, 10 questions, and blitz disabled

## Bug Details

### Bug Condition

The bugs manifest under four distinct conditions:

**C1 - Progress Bar Width Restriction:**
The GameProgressBar has a fixed `max-width: 640px` in the `.progress-bar-wrapper` style rule, preventing the component from using available horizontal space on larger screens.

**C2 - No Configuration Persistence:**
When users configure session settings and reload the page, the SessionStore initializes with `DEFAULT_SESSION_CONFIG` instead of restoring the user's previous choices from localStorage.

**C3 - "All Regions" Initial State:**
On app initialization, `ContinentFilter` receives `modelValue` with all 5 continents from `DEFAULT_SESSION_CONFIG`, but the computed condition for `chip--all-active` class (`modelValue.length === ALL_CONTINENTS.length`) doesn't apply the active styling.

**C4 - "All Regions" Toggle Incomplete:**
The `selectAll()` function in `ContinentFilter` unconditionally emits all continents, lacking logic to detect when all are already selected and toggle to a deselected state.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type UIInteraction
  OUTPUT: boolean
  
  RETURN (input.type = 'render' AND input.component = 'GameProgressBar' AND input.screenWidth > 640)
         OR (input.type = 'pageLoad' AND input.hasStoredConfig = true)
         OR (input.type = 'appInit' AND input.defaultConfigHasAllContinents = true)
         OR (input.type = 'buttonClick' AND input.button = 'AllRegions' AND input.allContinentsSelected = true)
END FUNCTION
```

### Examples

- **Bug 1 (Progress Bar)**: On a 1920px wide screen, the GameProgressBar renders with only 640px width, leaving large empty margins instead of spanning the full parent container
- **Bug 2 (Persistence)**: User selects only Europe + Asia continents, 50 questions, blitz mode enabled → reloads page → configuration resets to all continents, 10 questions, blitz disabled
- **Bug 3 (Initial State)**: App loads with `DEFAULT_SESSION_CONFIG` (all 5 continents) → "All Regions" button shows default gray styling instead of active dark styling
- **Bug 4 (Toggle)**: All 5 continents are selected → user clicks "All Regions" expecting to deselect → all 5 remain selected (no change occurs)
- **Edge Case**: User has only Europe selected → clicks "All Regions" → all 5 continents become selected (this should continue to work)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- All GameProgressBar props (`current`, `total`, `streak`) must continue to display correctly
- Progress bar fill animation and percentage calculation must remain unchanged
- Streak indicator display logic must continue working
- Individual continent toggle buttons in ContinentFilter must continue working independently
- SessionSetupPanel local refs must remain reactive to user input
- Session validation logic in `isValidSessionConfig` must continue enforcing constraints (min 1 continent, valid modes, etc.)
- Session start workflow (updateConfig → startSession → router.push) must remain functional
- All styling, colors, hover effects, and transitions must remain unchanged except for the max-width removal

**Scope:**
All inputs and interactions that do NOT involve the four specific bug conditions should be completely unaffected by this fix. This includes:
- Mouse clicks on individual continent buttons
- Mode selection changes
- Question count picker interactions
- Blitz toggle interactions
- Start session button behavior
- Progress bar percentage calculations and animations
- Streak display logic

## Hypothesized Root Cause

Based on the bug analysis, the root causes are:

1. **Hardcoded CSS Constraint**: The `.progress-bar-wrapper` style rule in `GameProgressBar.vue` contains `max-width: 640px`, artificially limiting the component width. This is a simple CSS issue.

2. **Missing Persistence Layer**: The `SessionStore` in `src/stores/session.ts` initializes `config` with `DEFAULT_SESSION_CONFIG` directly, without checking localStorage. No save mechanism exists when `updateConfig` is called. The store lacks:
   - A function to save configuration to localStorage
   - A function to load configuration from localStorage on initialization
   - Integration of these functions in the store lifecycle

3. **Reactivity Issue in Template Binding**: The `ContinentFilter` template uses `:class="{ 'chip--all-active': modelValue.length === ALL_CONTINENTS.length }"` which should work correctly. The issue may be:
   - The condition is actually correct, but there might be a timing issue where the initial render doesn't apply the class
   - Or the `modelValue` prop isn't properly reactive on initial mount
   - Most likely: the condition IS working, but the bug description is based on misunderstanding - need to test this during exploratory testing

4. **Missing Toggle Logic**: The `selectAll` function in `ContinentFilter` only performs selection, lacking deselection logic:
```typescript
function selectAll() {
  emit('update:modelValue', [...ALL_CONTINENTS])
}
```
Should be:
```typescript
function selectAll() {
  if (props.modelValue.length === ALL_CONTINENTS.length) {
    // Deselect all but one (maintain validation requirement of min 1 continent)
    emit('update:modelValue', [ALL_CONTINENTS[0]])
  } else {
    emit('update:modelValue', [...ALL_CONTINENTS])
  }
}
```

## Correctness Properties

Property 1: Bug Condition - Session Config Fixes Applied

_For any_ user interaction where one of the four bug conditions holds (C1: progress bar on wide screen, C2: page reload with stored config, C3: app init with all continents, C4: click "All Regions" when all selected), the fixed code SHALL produce the expected correct behavior (P1: full-width progress bar, P2: restored configuration, P3: active "All Regions" button, P4: toggled continent selection).

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - Non-Buggy Interactions

_For any_ user interaction that does NOT involve the four specific bug conditions (individual continent toggles, mode selection, count selection, blitz toggle, session start, progress bar calculations, streak display), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: `src/components/game/GameProgressBar.vue`

**Section**: `<style scoped>` - `.progress-bar-wrapper` rule

**Specific Changes**:
1. **Remove max-width constraint**: Delete the line `max-width: 640px;` from `.progress-bar-wrapper` style rule to allow the progress bar to use full available width

**File 2**: `src/stores/session.ts`

**Section**: Store initialization and `updateConfig` function

**Specific Changes**:
1. **Add localStorage key constant**: Define `const SESSION_CONFIG_KEY = 'flagiq:sessionConfig'` at module level

2. **Add persistence functions**:
   ```typescript
   function saveConfigToStorage(config: SessionConfig): void {
     try {
       localStorage.setItem(SESSION_CONFIG_KEY, JSON.stringify(config))
     } catch (error) {
       console.warn('[SessionStore] Failed to save config to localStorage:', error)
     }
   }

   function loadConfigFromStorage(): SessionConfig | null {
     try {
       const stored = localStorage.getItem(SESSION_CONFIG_KEY)
       if (!stored) return null
       const parsed = JSON.parse(stored)
       return isValidSessionConfig(parsed) ? parsed : null
     } catch (error) {
       console.warn('[SessionStore] Failed to load config from localStorage:', error)
       return null
     }
   }
   ```

3. **Update config initialization**:
   ```typescript
   const config = ref<SessionConfig>(loadConfigFromStorage() ?? { ...DEFAULT_SESSION_CONFIG })
   ```

4. **Add save to updateConfig function**:
   ```typescript
   function updateConfig(newConfig: SessionConfig): boolean {
     if (!isValidSessionConfig(newConfig)) return false
     config.value = { ...newConfig, continents: [...newConfig.continents] }
     saveConfigToStorage(config.value)  // Add this line
     return true
   }
   ```

**File 3**: `src/components/session/ContinentFilter.vue`

**Section**: `<script setup>` - `selectAll` function

**Specific Changes**:
1. **Add toggle logic to selectAll**: Modify the `selectAll` function to detect when all continents are already selected and toggle to a minimal selection:
   ```typescript
   function selectAll() {
     if (props.modelValue.length === ALL_CONTINENTS.length) {
       // All selected → deselect to minimum (1 continent)
       emit('update:modelValue', [ALL_CONTINENTS[0]])
     } else {
       // Not all selected → select all
       emit('update:modelValue', [...ALL_CONTINENTS])
     }
   }
   ```

**File 3**: `src/components/session/ContinentFilter.vue` (continued)

**Section**: Template - "All Regions" button class binding

**Specific Changes**:
1. **Verify active state binding**: The existing binding `:class="{ 'chip--all-active': modelValue.length === ALL_CONTINENTS.length }"` should already work correctly. During exploratory testing, verify this works on initial render. If not, investigate Vue reactivity timing issues and consider using a computed property instead:
   ```typescript
   const allSelected = computed(() => props.modelValue.length === ALL_CONTINENTS.length)
   ```
   And in template: `:class="{ 'chip--all-active': allSelected }"`

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate each bug on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis for each of the four bugs.

**Test Plan**: Write tests that reproduce each bug condition on the UNFIXED code. Run these tests to observe failures and understand the exact manifestation of each bug.

**Test Cases**:
1. **Progress Bar Width Test**: Render GameProgressBar in a wide container (1200px+) on unfixed code → measure actual rendered width → expect 640px max (bug confirmed if limited to 640px)
2. **Persistence Loss Test**: Set custom config in SessionStore → reload page/reinitialize store → read config value → expect DEFAULT_SESSION_CONFIG (bug confirmed if custom config is lost)
3. **Initial Active State Test**: Initialize ContinentFilter with all continents in modelValue → inspect rendered DOM → expect "All Regions" button to NOT have `chip--all-active` class (bug confirmed if class is missing)
4. **Toggle Failure Test**: Set ContinentFilter modelValue to all 5 continents → click "All Regions" button → inspect emitted event → expect no change in selection (bug confirmed if all 5 remain selected)

**Expected Counterexamples**:
- Progress bar constrained to 640px despite having 1200px parent container
- Config resets to `{continents: ['europe', 'asia', 'americas', 'africa', 'oceania'], mode: 'name-it', count: 10, blitz: false}` after page reload, losing user's custom settings
- "All Regions" button renders with `chip--all` class but not `chip--all-active` class on initial render
- `selectAll()` emits `['europe', 'asia', 'americas', 'africa', 'oceania']` even when all are already selected (no toggle occurs)

Possible causes: hardcoded CSS, missing localStorage integration, Vue reactivity timing, missing conditional logic in selectAll function

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed code produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedComponent(input)
  ASSERT expectedBehavior(result)
END FOR
```

**Specific Tests**:
1. **Progress Bar Width Fix**: Render fixed GameProgressBar in various container widths (800px, 1200px, 1920px) → verify width equals parent width (no 640px limit)
2. **Persistence Restoration Fix**: Set custom config → simulate page reload → verify config is restored from localStorage with exact same values
3. **Initial Active State Fix**: Initialize with all continents → verify "All Regions" button has `chip--all-active` class on first render
4. **Toggle Behavior Fix**: 
   - Start with 3 continents → click "All Regions" → verify all 5 selected
   - Start with all 5 continents → click "All Regions" → verify only 1 remains selected

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed code produces the same result as the original code.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalComponent(input) = fixedComponent(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-buggy interactions, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Progress Bar Props Preservation**: Generate random combinations of `current`, `total`, `streak` values → verify display calculations remain identical
2. **Progress Bar Styling Preservation**: Verify fill color, transition timing, label formatting remain unchanged
3. **Individual Continent Toggle Preservation**: Click individual continent buttons → verify toggle behavior unchanged
4. **Partial Selection "All Regions" Preservation**: With 2-4 continents selected → click "All Regions" → verify it selects all 5 (unchanged behavior)
5. **Session Validation Preservation**: Generate various SessionConfig objects → verify `isValidSessionConfig` validation logic unchanged
6. **Session Start Flow Preservation**: Configure session → start session → verify updateConfig + startSession + router navigation chain unchanged
7. **Mode/Count/Blitz Preservation**: Change mode, count, or blitz settings → verify reactive updates and store behavior unchanged

### Unit Tests

- Test GameProgressBar renders without max-width constraint on various parent widths
- Test SessionStore saves config to localStorage on updateConfig call
- Test SessionStore loads config from localStorage on initialization
- Test SessionStore handles invalid localStorage data gracefully (returns DEFAULT_SESSION_CONFIG)
- Test "All Regions" button shows active state when all continents selected
- Test "All Regions" button toggles from all-selected to one-selected
- Test "All Regions" button toggles from partial-selected to all-selected
- Test progress bar continues to display current/total/streak correctly
- Test individual continent buttons continue to toggle correctly

### Property-Based Tests

- Generate random SessionConfig objects → save to store → reload → verify exact restoration
- Generate random continent selection states (1-5 continents) → verify "All Regions" active state reflects correct state
- Generate random parent container widths (100px to 3000px) → verify GameProgressBar adapts width correctly
- Generate random combinations of progress states (current 1-50, total 10-50, streak 0-20) → verify preservation of display logic
- Generate random sequences of continent toggle operations → verify store state consistency maintained

### Integration Tests

- Full flow: Configure custom session → reload page → verify config restored → start session → verify game uses restored config
- Full flow: Select all continents individually → verify "All Regions" becomes active → click "All Regions" → verify deselection to 1 continent
- Full flow: Navigate to game → render progress bar on wide screen → verify full-width display → progress through questions → verify calculations correct
- Full flow: Toggle between partial selection → all selection → deselection via "All Regions" button → verify visual state and store state remain synchronized
