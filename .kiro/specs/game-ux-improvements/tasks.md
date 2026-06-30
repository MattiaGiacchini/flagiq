# Implementation Plan: Game UX Improvements

## Overview

This implementation plan breaks down six UX improvements to the FlagIQ application into actionable coding tasks. The improvements cover Spanish translation completeness, disabling Similar Flags functionality, extending Blitz mode to all game modes, improving All Regions toggle behavior, locking dark mode, and fixing a visual selection bug in Name It mode.

The implementation uses Vue 3 + TypeScript and follows the existing component architecture and state management patterns.

## Tasks

- [x] 1. Lock dark mode and remove theme toggle controls
  - [x] 1.1 Remove dark mode CSS variables and theme toggle from App.vue
    - Remove any `@media (prefers-color-scheme: dark)` queries from App.vue
    - Remove theme toggle UI elements if present
    - Ensure only light mode CSS variables are active
    - Add documentation comment indicating dark mode is intentionally disabled
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2. Disable Similar Flags functionality
  - [x] 2.1 Hide SimilarityToggle component and force useSimilarity to false
    - Remove SimilarityToggle component from SessionSetupPanel.vue template
    - Remove SimilarityToggle import statement
    - Force `useSimilarity: false` in `handleStart()` method
    - Update DEFAULT_SESSION_CONFIG in session.ts store to have `useSimilarity: false`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Improve All Regions toggle behavior with minimum selection enforcement
  - [x] 3.1 Implement toggle logic in ContinentFilter component
    - Update `selectAll()` to toggle between all selected and minimum (1) selected
    - Modify `toggleContinent()` to prevent deselecting the last continent
    - Add disabled state styling for locked continent chips (when only 1 selected)
    - Add visual indication using `:disabled` attribute and CSS classes
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7_

  - [x] 3.2 Add continent selection validation in SessionSetupPanel
    - Implement validation in `handleStart()` to ensure at least one continent selected
    - Log error and prevent navigation if no continents selected
    - _Requirements: 4.5, 4.6_

- [x] 4. Fix Name It mode visual selection bug
  - [x] 4.1 Strengthen state reset logic in NameItQuestion component
    - Verify watcher on `props.question` properly resets `chosen` and `optionStates`
    - Add explicit watcher options if needed
    - Add `:key` attribute to options container to force DOM re-render on question change
    - Verify CSS class bindings are purely reactive
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 5. Checkpoint - Verify isolated fixes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement centralized Blitz mode timer in GameStore
  - [x] 6.1 Add Blitz timer state and methods to game.ts store
    - Add reactive state: `blitzMode`, `blitzTimeLeft`, `blitzTimerId`
    - Add computed property: `isBlitzActive`
    - Implement `startBlitzTimer()` method with 60-second countdown
    - Implement `stopBlitzTimer()` method with cleanup
    - Update `reset()` to clean up timer state
    - Update `startGame()` to start timer when `config.blitz === true`
    - Ensure timer ends game by setting `finishedAt` and `isActive` when time expires
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 6.2 Write unit tests for Blitz timer logic
    - Test timer starts correctly when blitz mode enabled
    - Test timer decrements every second
    - Test timer cleanup on stop
    - Test game ends when timer reaches zero
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 7. Integrate Blitz timer in NameItQuestion component
  - [x] 7.1 Add Blitz timer UI and logic to NameItQuestion
    - Import and consume `blitzTimeLeft` and `isBlitzActive` from gameStore
    - Add timer UI display (only shown when Blitz is active)
    - Add watcher for `gameStore.isActive` to detect timer expiration
    - Implement timer cleanup with `onUnmounted` hook
    - Add CSS styling for `.blitz-timer` and related classes
    - _Requirements: 3.1, 3.5, 3.6_

- [x] 8. Integrate Blitz timer in ChooseFlagQuestion component
  - [x] 8.1 Add Blitz timer UI and logic to ChooseFlagQuestion
    - Import and consume `blitzTimeLeft` and `isBlitzActive` from gameStore
    - Add timer UI display (only shown when Blitz is active)
    - Add watcher for `gameStore.isActive` to detect timer expiration
    - Implement timer cleanup with `onUnmounted` hook
    - Add CSS styling for `.blitz-timer` and related classes
    - _Requirements: 3.2, 3.5, 3.6_

- [x] 9. Integrate Blitz timer in TypeItQuestion component
  - [x] 9.1 Add Blitz timer UI and logic to TypeItQuestion
    - Import and consume `blitzTimeLeft` and `isBlitzActive` from gameStore
    - Add timer UI display (only shown when Blitz is active)
    - Add watcher for `gameStore.isActive` to detect timer expiration
    - Implement timer cleanup with `onUnmounted` hook
    - Add CSS styling for `.blitz-timer` and related classes
    - _Requirements: 3.3, 3.5, 3.6_

- [x] 10. Refactor FindOnMapQuestion to use centralized Blitz timer
  - [x] 10.1 Replace component-local timer with GameStore timer
    - Remove component-local timer state variables
    - Remove component-local timer logic
    - Import and consume `blitzTimeLeft` and `isBlitzActive` from gameStore
    - Update timer UI to use store values
    - Remove manual timer cleanup code (now handled by store)
    - _Requirements: 3.4, 3.5, 3.6_

- [x] 11. Checkpoint - Verify Blitz mode works in all game modes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Complete Spanish translation for SessionSetupPanel
  - [x] 12.1 Add Spanish translations to SessionSetupPanel component
    - Import or access localeStore for current locale
    - Add conditional rendering for panel header title and subtitle
    - Add Spanish translations for section headings: "Continent Filter", "Game Mode", "Questions"
    - Implement translation object or inline conditionals based on locale
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 13. Complete Spanish translation for game configuration components
  - [x] 13.1 Add Spanish translations to ContinentFilter component
    - Add Spanish translation for section label if present
    - _Requirements: 1.1, 1.3_

  - [x] 13.2 Add Spanish translations to GameModeSelector component
    - Import or access localeStore for current locale
    - Add conditional rendering for game mode labels and descriptions
    - _Requirements: 1.1, 1.4_

  - [x] 13.3 Add Spanish translations to QuestionCountPicker component
    - Import or access localeStore for current locale
    - Add conditional rendering for question count labels
    - _Requirements: 1.1, 1.5_

  - [x] 13.4 Add Spanish translations to BlitzModeToggle component
    - Add conditional rendering for title: "⚡ Blitz Mode" → "⚡ Modo Relámpago"
    - Add conditional rendering for subtitle: "60-second trial" → "Prueba de 60 segundos"
    - _Requirements: 1.1, 1.6_

  - [x] 13.5 Add Spanish translations to StartSessionButton component
    - Add conditional rendering for button text: "Start Session" → "Iniciar Sesión"
    - _Requirements: 1.1, 1.8_

- [ ] 14. Complete Spanish translation for game mode components
  - [ ] 14.1 Add Spanish translations to NameItQuestion component
    - Add conditional rendering for mode label and instructions
    - Example: "SEE THE FLAG · CHOOSE THE COUNTRY" → "VER LA BANDERA · ELIGE EL PAÍS"
    - _Requirements: 1.1, 1.10_

  - [ ] 14.2 Add Spanish translations to ChooseFlagQuestion component
    - Add conditional rendering for mode label and instructions
    - _Requirements: 1.1, 1.10_

  - [ ] 14.3 Add Spanish translations to TypeItQuestion component
    - Add conditional rendering for mode label and instructions
    - _Requirements: 1.1, 1.10_

  - [ ] 14.4 Add Spanish translations to FindOnMapQuestion component
    - Add conditional rendering for mode label and instructions
    - _Requirements: 1.1, 1.10_

- [ ] 15. Verify Spanish translations in GameResults component
  - [ ] 15.1 Confirm GameResults already has comprehensive Spanish support
    - Review existing Spanish translations in GameResults.vue
    - Verify all result labels, statistics, and buttons have Spanish translations
    - Test that all error and validation messages display correctly in Spanish
    - _Requirements: 1.1, 1.9, 1.10_

- [ ] 16. Add accessibility attributes for Spanish content
  - [ ] 16.1 Add aria-label translations for timer and interactive elements
    - Add locale-aware `aria-label` for Blitz timer
    - Add locale-aware `aria-label` for continent selection buttons
    - Add `aria-live` regions for timer announcements
    - _Requirements: 1.1_

- [ ] 17. Final checkpoint and integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The design document uses TypeScript with Vue 3, so all implementation will use these technologies
- Blitz mode timer is implemented centrally in the game store for consistency across all game modes
- Spanish translations use inline conditional rendering based on locale rather than a separate translation file
- The Similar Flags feature is disabled but not removed, allowing for future re-enablement
- Each task references specific requirements from the requirements document for traceability
- Checkpoints ensure incremental validation at logical break points

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "2.1"]
    },
    {
      "id": 1,
      "tasks": ["3.1", "4.1"]
    },
    {
      "id": 2,
      "tasks": ["3.2", "6.1"]
    },
    {
      "id": 3,
      "tasks": ["6.2", "7.1", "8.1", "9.1", "10.1"]
    },
    {
      "id": 4,
      "tasks": ["12.1"]
    },
    {
      "id": 5,
      "tasks": ["13.1", "13.2", "13.3", "13.4", "13.5"]
    },
    {
      "id": 6,
      "tasks": ["14.1", "14.2", "14.3", "14.4", "15.1"]
    },
    {
      "id": 7,
      "tasks": ["16.1"]
    }
  ]
}
```
