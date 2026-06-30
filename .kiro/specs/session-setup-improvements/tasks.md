# Implementation Plan: Session Setup Improvements

## Overview

This implementation addresses four initialization and default value improvements in the SessionSetupPanel component. The changes restore saved preferences, enforce conscious mode selection, set appropriate regional defaults, and reorder question count options for better usability.

## Tasks

- [x] 1. Update session type constants
  - [x] 1.1 Modify VALID_COUNTS array order and DEFAULT_SESSION_CONFIG
    - Update `VALID_COUNTS` to `['all', 10, 25, 50]` in `src/types/session.ts`
    - Update `DEFAULT_SESSION_CONFIG.count` from `10` to `'all'`
    - Verify QuestionCountPicker renders options in new order automatically
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Implement saved configuration restoration
  - [x] 2.1 Update SessionSetupPanel initialization logic
    - Read `sessionStore.config` during component setup
    - Initialize `selectedContinents`, `selectedCount`, and `blitzEnabled` from store config
    - Change `selectedMode` type from `ref<GameMode>` to `ref<GameMode | null>`
    - Implement first-time detection: check if `localStorage.getItem('flagiq:sessionConfig')` is null
    - Set `selectedMode` to `null` for first-time users, otherwise use saved mode
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.5_
  
  - [ ]* 2.2 Write property test for saved config restoration
    - **Property 1: Config Restoration Preserves All Fields**
    - **Validates: Requirements 1.2, 1.4, 2.5, 3.3, 4.6**
    - Generate random valid SessionConfig using fast-check
    - Save config to localStorage, mount component, verify all state variables match
    - Test should cover all combinations of continents, modes, counts, and blitz settings

- [x] 3. Implement mode selection requirement
  - [x] 3.1 Update canStart computed property
    - Modify `canStart` to check both `selectedContinents.value.length > 0` AND `selectedMode.value !== null`
    - Add null guard in `handleStart()` function to prevent starting with null mode
    - _Requirements: 2.2, 2.4_
  
  - [ ]* 3.2 Write property test for mode selection state update
    - **Property 2: Mode Selection Updates State**
    - **Validates: Requirements 2.3**
    - For any GameMode, verify selecting it updates selectedMode state
    - Use fast-check to generate all possible GameMode values
  
  - [ ]* 3.3 Write property test for start button enabling logic
    - **Property 3: Start Button Enabled With Valid State**
    - **Validates: Requirements 2.4**
    - For any state with non-null mode and non-empty continents, verify button is enabled
    - Generate random valid combinations of mode and continents

- [x] 4. Checkpoint - Verify core functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Add component tests for UI state
  - [ ]* 5.1 Write property test for all continents selected state
    - **Property 4: All Continents Selected Shows Active State**
    - **Validates: Requirements 3.4**
    - When all 5 continents are selected, verify ContinentFilter renders "All Regions" button as active
    - May require adding `data-testid="all-regions-button"` to ContinentFilter component
  
  - [ ]* 5.2 Write unit tests for initialization scenarios
    - Test: No saved config → mode is null, count is 'all', all continents selected
    - Test: Saved config exists → all values restored from saved config
    - Test: Button disabled when mode is null
    - Test: Button disabled when continents is empty
    - Test: Button enabled when mode is set and continents is not empty
    - Test: QuestionCountPicker renders options in VALID_COUNTS order
    - _Requirements: 2.1, 2.2, 3.2, 4.4, 4.5_

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The project uses TypeScript, Vue 3 Composition API, Vitest, and fast-check
- Property-based tests validate universal correctness properties from the design
- Unit tests validate specific examples and edge cases
- All constants changes automatically propagate to child components via v-model bindings
- Saved configs with old defaults (count: 10) remain compatible after deployment

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3"] },
    { "id": 4, "tasks": ["5.1", "5.2"] }
  ]
}
```
