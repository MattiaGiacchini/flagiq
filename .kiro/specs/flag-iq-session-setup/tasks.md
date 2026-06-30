# Implementation Plan: FlagIQ Session Setup

## Overview

Implement the Session Setup screen incrementally, starting from the data foundation (types, validation, store, flag catalogue), then layout scaffolding, then each panel sub-component, then wiring everything together through the router and App.vue. Property-based tests with `fast-check` and unit tests live close to the code they verify.

## Tasks

- [ ] 1. Install fast-check and set up type foundations
  - [ ] 1.1 Add `fast-check` as a dev dependency
    - Run `npm install --save-dev fast-check`
    - Verify it appears in `package.json` devDependencies
    - _Requirements: (testing infrastructure for all property tests)_
  - [x] 1.2 Create `src/types/session.ts` with all type definitions
    - Export `Continent`, `GameMode`, `QuestionCount`, `SessionConfig` types
    - Export `ALL_CONTINENTS`, `VALID_COUNTS`, `VALID_MODES` constant arrays
    - Export `DEFAULT_SESSION_CONFIG` constant
    - _Requirements: 8.1, 8.3_

- [x] 2. Implement validation utility and session store
  - [x] 2.1 Create `src/utils/sessionValidation.ts`
    - Implement `isValidSessionConfig(config: unknown): config is SessionConfig`
    - Guard: non-object, empty continents array, invalid continent values, invalid mode, invalid count, non-boolean blitz
    - _Requirements: 8.4_
  - [ ]* 2.2 Write unit tests for `sessionValidation.ts` (`src/__tests__/sessionValidation.spec.ts`)
    - Test each invalid shape (null, missing fields, empty continents, bad mode, bad count, non-boolean blitz)
    - Test a valid config returns `true`
    - _Requirements: 8.4_
  - [x] 2.3 Create `src/stores/session.ts` (replaces `counter.ts`)
    - Implement `useSessionStore` with `config`, `sessionActive` refs
    - Expose computed getters: `selectedContinents`, `selectedMode`, `selectedCount`, `blitzEnabled`
    - Implement `updateConfig`, `startSession`, `endSession` actions
    - Delete or leave `counter.ts` inert (do not import it anywhere)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ]* 2.4 Write unit tests for `useSessionStore` (`src/__tests__/sessionStore.spec.ts`)
    - Test default state matches `DEFAULT_SESSION_CONFIG`
    - Test `updateConfig` returns `true` and updates state for a valid config
    - Test `updateConfig` returns `false` and retains state for each invalid shape
    - Test `startSession` / `endSession` toggle `sessionActive`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ]* 2.5 Write property tests for the session store (`src/__tests__/properties/sessionStore.property.spec.ts`)
    - **Property 12: Store update round-trip** — for any valid `SessionConfig`, reading `config` after `updateConfig` must deep-equal the input
    - **Property 13: Store rejects invalid configs and retains previous state** — for any invalid config shape, `updateConfig` must return `false` and leave state unchanged
    - **Validates: Requirements 8.1, 8.2, 8.4**

- [x] 3. Create flag data catalogue
  - [x] 3.1 Create `src/data/flags.ts` with `Flag` interface and static flag array
    - Export `Flag` interface (`id`, `name`, `continent`, `emoji`, `svgPath?`)
    - Populate array with a representative set of flags covering all five continents
    - Export a `flagsByContinent(continents: Continent[]): Flag[]` helper
    - _Requirements: 3.4, 3.5_
  - [ ]* 3.2 Write unit tests for `flagsByContinent` (`src/__tests__/flags.spec.ts`)
    - Test all-continents filter returns full set
    - Test single-continent filter returns only that continent's flags
    - Test empty result when no flags match (edge case for future data gaps)
    - _Requirements: 3.4, 3.5_

- [ ] 4. Checkpoint — Ensure all data-layer tests pass
  - Run `npm run test:unit -- --run` and confirm all tests in steps 1–3 are green before continuing.

- [ ] 5. Implement layout components
  - [ ] 5.1 Create `src/components/layout/AppHeader.vue`
    - Display FlagIQ logo and application name
    - Import `useSessionStore`; conditionally render session controls when `sessionActive` is `true`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ]* 5.2 Write unit tests for `AppHeader.vue` (`src/__tests__/AppHeader.spec.ts`)
    - Test logo and name are present in the DOM
    - Test session controls are hidden when `sessionActive` is `false`
    - Test session controls are visible when `sessionActive` is `true`
    - _Requirements: 7.1, 7.3, 7.4_
  - [ ]* 5.3 Write property tests for `AppHeader.vue` (`src/__tests__/properties/appHeader.property.spec.ts`)
    - **Property 11: Header session controls visibility matches store session state** — for any `fc.boolean()` value of `sessionActive`, verify controls are shown iff `sessionActive === true`
    - **Validates: Requirements 7.3, 7.4**
  - [ ] 5.4 Create `src/components/layout/AppLayout.vue`
    - CSS Grid layout: `grid-template-columns: minmax(0, 30fr) minmax(0, 70fr)` on desktop, `1fr` on mobile (breakpoint 768 px)
    - Render `AppHeader` (sticky, `z-index: 100`) and `<router-view>` content slot
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6. Implement `ContinentFilter.vue`
  - [x] 6.1 Create `src/components/session/ContinentFilter.vue`
    - Props: `modelValue: Continent[]`; Emits: `update:modelValue`
    - Render "All Regions" chip and five continent chips with unique per-continent CSS colour classes
    - `isAllSelected` computed: `modelValue.length === 5`
    - Selecting "All Regions" → emit all five continents
    - Toggling a chip → normalise: if result is 0 or 5, emit all five (All Regions)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - [ ]* 6.2 Write unit tests for `ContinentFilter.vue` (`src/__tests__/ContinentFilter.spec.ts`)
    - Test initial render shows 6 chips; "All Regions" chip is selected
    - Test clicking "All Regions" emits all five continents
    - Test selecting all 5 individual chips transitions to All Regions state
    - Test deselecting last chip restores All Regions
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ]* 6.3 Write property tests for `ContinentFilter.vue` (`src/__tests__/properties/continentFilter.property.spec.ts`)
    - **Property 1: Continent selection reflects exactly the selected chips** — `fc.subarray(ALL_CONTINENTS, { minLength: 1 })` → verify emitted value equals input subset and All chip is deselected
    - **Property 2: Deselecting all chips restores All Regions state** — select random subset, deselect all one by one, verify reverts to all five
    - **Property 3: Continent chips have distinct colors** — render component, extract CSS classes, verify each continent chip has a unique class not shared with others
    - **Validates: Requirements 1.3, 1.4, 1.6**

- [x] 7. Implement `GameModeSelector.vue`
  - [-] 7.1 Create `src/components/session/GameModeSelector.vue` and `ModeCard.vue`
    - Props: `modelValue: GameMode`; Emits: `update:modelValue`
    - Static mode definitions: `type-it`, `choose-flag`, `find-on-map`, `name-it` — each with icon, title, subtitle (≤ 60 chars)
    - 2-column CSS grid of `ModeCard` sub-components; each receives `{ id, title, subtitle, icon, selected }` props
    - Clicking an unselected card emits new mode; clicking the selected card is a no-op
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ]* 7.2 Write unit tests for `GameModeSelector.vue` (`src/__tests__/GameModeSelector.spec.ts`)
    - Test exactly 4 cards are rendered
    - Test default selected card is "Name It"
    - Test clicking a different card emits correct mode value
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ]* 7.3 Write property tests for `GameModeSelector.vue` (`src/__tests__/properties/gameModeSelector.property.spec.ts`)
    - **Property 4: Exactly one Mode_Card is always selected** — `fc.array(fc.constantFrom(...VALID_MODES), { minLength: 1 })` click sequence; verify exactly one card is selected after each click and it matches the last clicked mode
    - **Property 5: Every Mode_Card renders required content within constraints** — verify all 4 static modes have non-empty icon, non-empty title, subtitle length ≤ 60
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 8. Implement `QuestionCountPicker.vue`
  - [-] 8.1 Create `src/components/session/QuestionCountPicker.vue`
    - Props: `modelValue: QuestionCount`, `availableFlags: number`; Emits: `update:modelValue`
    - Render four pill buttons: 10, 25, 50, "All"
    - Re-clicking the selected pill is a no-op
    - `effectiveCount` computed (exposed via `defineExpose`): if `'all'` → `availableFlags`; else → `Math.min(modelValue as number, availableFlags)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ]* 8.2 Write unit tests for `QuestionCountPicker.vue` (`src/__tests__/QuestionCountPicker.spec.ts`)
    - Test 4 pills render; default is 10
    - Test clicking a different pill emits new count
    - Test re-clicking selected pill emits nothing
    - Test `effectiveCount` caps to `availableFlags` when less than selected numeric count
    - _Requirements: 3.1, 3.2, 3.3, 3.5_
  - [ ]* 8.3 Write property tests for `QuestionCountPicker.vue` (`src/__tests__/properties/questionCountPicker.property.spec.ts`)
    - **Property 6: Exactly one pill selected + re-click idempotence** — `fc.array(fc.constantFrom(...VALID_COUNTS), { minLength: 1 })` click sequence; verify exactly one pill selected after each click; verify re-click leaves state unchanged
    - **Property 7: "All" pill count is reactive to continent filter** — `fc.subarray(ALL_CONTINENTS, { minLength: 1 })`; when "All" is selected, `effectiveCount` must equal flag count for that continent filter
    - **Property 8: Fixed count is capped to available flags** — `fc.integer({ min: 1, max: 49 })` × `fc.constantFrom(10, 25, 50)`; when `availableFlags < count`, `effectiveCount` must equal `availableFlags`
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5**

- [x] 9. Implement `BlitzModeToggle.vue`
  - [x] 9.1 Create `src/components/session/BlitzModeToggle.vue`
    - Props: `modelValue: boolean`; Emits: `update:modelValue`
    - Label "⚡ Blitz Mode" + subtitle "60-second trial"
    - PrimeVue `ToggleSwitch` as the toggle element
    - Show 60-second countdown badge when `modelValue` is `true`, hide it when `false`
    - Default state is `false` (off)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ]* 9.2 Write unit tests for `BlitzModeToggle.vue` (`src/__tests__/BlitzModeToggle.spec.ts`)
    - Test default state: toggle is off, badge is hidden
    - Test toggling on: emits `true`, badge becomes visible
    - Test toggling off: emits `false`, badge is hidden
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 10. Implement `StartSessionButton.vue`
  - [x] 10.1 Create `src/components/session/StartSessionButton.vue`
    - No props; Emits: `click:start`
    - Full-width `<button>` with CSS gradient `linear-gradient(90deg, #2B5CE6, #6B4EE6)` and `box-shadow` drop
    - Button is always enabled (no disabled attribute)
    - _Requirements: 5.1, 5.4_
  - [ ]* 10.2 Write unit tests for `StartSessionButton.vue` (`src/__tests__/StartSessionButton.spec.ts`)
    - Test button renders and is not disabled
    - Test click emits `click:start`
    - Test gradient CSS class is present on the button element
    - _Requirements: 5.1, 5.4_
  - [ ]* 10.3 Write property tests for `StartSessionButton.vue` (`src/__tests__/properties/startSessionButton.property.spec.ts`)
    - **Property 10: Start Session button is always enabled** — for any valid `SessionConfig` record passed as context, verify the button element is not disabled and responds to click events
    - **Validates: Requirements 5.4**

- [x] 11. Implement `SessionSetupPanel.vue`
  - [x] 11.1 Create `src/components/session/SessionSetupPanel.vue`
    - Internal reactive state: `selectedContinents`, `selectedMode`, `selectedCount`, `blitzEnabled` (initialised from `DEFAULT_SESSION_CONFIG`)
    - Derive `availableFlags` by filtering the flag catalogue with `flagsByContinent(selectedContinents).length`
    - Render all five sub-components: `ContinentFilter`, `GameModeSelector`, `QuestionCountPicker`, `BlitzModeToggle`, `StartSessionButton`
    - Wire `v-model` / event handlers so each sub-component updates local state
    - On `click:start` from `StartSessionButton`: call `sessionStore.updateConfig(currentConfig)`; if successful navigate to `/session` via `useRouter`
    - _Requirements: 1.1–1.6, 2.1–2.4, 3.1–3.5, 4.1–4.4, 5.1–5.4_
  - [ ]* 11.2 Write unit tests for `SessionSetupPanel.vue` (`src/__tests__/SessionSetupPanel.spec.ts`)
    - Test panel renders all five sub-components
    - Test continent change updates local state
    - Test mode change updates local state
    - Test count change updates local state
    - Test blitz toggle updates local state
    - Test "Start Session" calls `sessionStore.updateConfig` with the correct config
    - _Requirements: 1.1–1.6, 2.1–2.4, 3.1–3.5, 4.1–4.4, 5.1–5.4_
  - [ ]* 11.3 Write property tests for `SessionSetupPanel.vue` (`src/__tests__/properties/sessionSetupPanel.property.spec.ts`)
    - **Property 9: Start Session always commits the current config to the store before navigating** — `fc.record({ continents: fc.subarray(ALL_CONTINENTS, { minLength: 1 }), mode: fc.constantFrom(...VALID_MODES), count: fc.constantFrom(...VALID_COUNTS), blitz: fc.boolean() })`; verify `updateConfig` is called with the exact current config before any router push
    - **Validates: Requirements 5.2**

- [ ] 12. Checkpoint — Ensure all component tests pass
  - Run `npm run test:unit -- --run` and confirm all tests from steps 5–11 are green before continuing.

- [x] 13. Create `SessionView.vue` and configure router
  - [x] 13.1 Create `src/views/SessionView.vue`
    - Thin route component that renders `<SessionSetupPanel />`
    - _Requirements: (routing wiring)_
  - [x] 13.2 Update `src/router/index.ts`
    - Add route `{ path: '/', component: SessionView }` for the setup screen
    - Add placeholder route `{ path: '/session', component: () => import('../views/SessionView.vue') }` (temporary — same view until game screen exists)
    - _Requirements: 5.3_

- [x] 14. Wire `App.vue` with `AppLayout`
  - [-] 14.1 Update `src/App.vue`
    - Remove any scaffold content (counter, default template)
    - Import and render `<AppLayout />` as the single root element
    - `AppLayout` internally contains `AppHeader` and `<RouterView />`
    - _Requirements: 6.1, 6.2, 6.3, 7.2_

- [ ] 15. Add E2E test
  - [ ]* 15.1 Create `e2e/session-setup.spec.ts`
    - Test full flow: load `/`, verify panel sub-components are present, configure session (pick a continent, change mode, set count to 25, enable blitz), click "Start Session", verify navigation to `/session`
    - Test responsive layout: at 375 px width verify panel is full-width; at 1280 px verify sidebar layout
    - Test sticky header: scroll the panel past the header and verify the header remains visible
    - _Requirements: 5.2, 5.3, 6.1, 6.2, 6.3_

- [ ] 16. Final checkpoint — Ensure all tests pass
  - Run `npm run test:unit -- --run` and `npm run test:e2e` and confirm all suites are green.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- `fast-check` must be installed (task 1.1) before any property test task can run
- Property tests live in `src/__tests__/properties/` and use a minimum of 100 iterations per property
- Each property test file includes a comment header: `// Feature: flag-iq-session-setup, Property N: <property_text>`
- `counter.ts` can be deleted once `session.ts` is in place and no imports reference it
- The `/session` placeholder route intentionally reuses `SessionView` until the game screen feature is built
- Unit tests and property tests are complementary — unit tests cover concrete examples and edge cases, property tests verify universal invariants

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2"] },
    { "id": 3, "tasks": ["2.4", "2.5", "5.1", "5.4", "6.1", "7.1", "8.1", "9.1", "10.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "6.2", "6.3", "7.2", "7.3", "8.2", "8.3", "9.2", "10.2", "10.3"] },
    { "id": 5, "tasks": ["11.1"] },
    { "id": 6, "tasks": ["11.2", "11.3", "13.1", "13.2"] },
    { "id": 7, "tasks": ["14.1"] },
    { "id": 8, "tasks": ["15.1"] }
  ]
}
```
