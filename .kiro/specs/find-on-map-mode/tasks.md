# Implementation Plan: Find on Map Game Mode

## Overview

This implementation adds a new interactive game mode where players identify country locations on a world map by clicking on regions after seeing a flag. The feature integrates with the existing Game Store and Session Store, following the established game flow pattern used by other question modes (NameItQuestion, ChooseFlagQuestion, TypeItQuestion).

## Tasks

- [x] 1. Create map data structure and utilities
  - [x] 1.1 Create `src/data/mapPaths.ts` with MapCountry interface and country path data
    - Define `MapCountry` interface with id, pathData, continent, and optional centroid
    - Export `MAP_COUNTRIES` array with SVG path data for all 56 countries in FLAGS
    - Use simplified SVG path coordinates from a public domain world map (equirectangular or Miller projection)
    - Include centroid coordinates for small countries (Monaco, Vatican City, San Marino, Liechtenstein, Singapore, Malta, Maldives)
    - _Requirements: 2.1, 2.6_
  
  - [x] 1.2 Create `src/utils/continentNames.ts` utility for localized continent names
    - Define `CONTINENT_NAMES` constant with English and Spanish names for all 5 continents
    - Export `continentName(continent: Continent, locale: AppLocale)` function
    - _Requirements: 8.4_

- [x] 2. Implement InteractiveMap component
  - [x] 2.1 Create `src/components/game/InteractiveMap.vue` with SVG map rendering
    - Define props: `visibleContinents`, `highlightedCountries`, `disableInteraction`, `locale`
    - Define `CountryHighlight` interface with id and color ('correct' | 'wrong')
    - Render inline SVG with viewBox="0 0 1000 500"
    - Filter and render only `<path>` elements for countries in `visibleContinents`
    - Add ARIA attributes: role="application", aria-label="Interactive world map"
    - _Requirements: 2.1, 2.4_
  
  - [x] 2.2 Add click and keyboard interaction to InteractiveMap
    - Add `@click` handler on each path element to emit `countryClicked` with country ID
    - Add `tabindex="0"` and `role="button"` to each path for keyboard navigation
    - Add `@keydown.enter.space.prevent` handler for keyboard selection
    - Add ARIA labels using `flagName(country, locale)` for each path
    - Disable all interactions when `disableInteraction` prop is true
    - _Requirements: 2.2, 2.3, 10.1, 10.2, 10.3, 10.4_
  
  - [x] 2.3 Add visual feedback and styling to InteractiveMap
    - Implement `getCountryClass(countryId)` method to apply CSS classes based on `highlightedCountries` prop
    - Add hover effects with border color change and subtle scale transform
    - Add `.country--correct` class with green fill for correct answers
    - Add `.country--wrong` class with red fill for incorrect answers
    - Add focus-visible styles with clear focus ring
    - Add CSS transitions for smooth state changes
    - _Requirements: 2.2, 6.1, 6.2_
  
  - [x] 2.4 Add small country overlay circles for accessibility
    - Render circular overlays (`<circle>`) for countries in the small-countries list
    - Position circles at country centroid coordinates with r="10" (20px diameter)
    - Style circles with `fill="transparent"` and `pointer-events="all"`
    - Ensure overlays capture click events for small countries
    - _Requirements: 2.6_

- [x] 3. Implement FindOnMapQuestion component
  - [x] 3.1 Create `src/components/game/FindOnMapQuestion.vue` with basic structure
    - Define props: `question: Question`, `locale: AppLocale`, `blitzMode?: boolean`, `timeRemaining?: number`
    - Define local state refs: `chosen`, `hintRevealed`, `feedbackState`
    - Emit `answer` event with `chosenId: string`
    - Create template with mode label, flag display, hint button, and InteractiveMap slot
    - _Requirements: 3.1, 3.2, 3.5_
  
  - [x] 3.2 Add flag display and hint button to FindOnMapQuestion
    - Display flag emoji from `question.correct.emoji` with ARIA label
    - Create "Show Continent" button that's enabled when `!hintRevealed && !chosen`
    - On hint button click: set `hintRevealed = true` and display continent name using `continentName()` utility
    - Add translation keys for "Show Continent" button (en: "Show Continent", es: "Mostrar Continente")
    - Disable hint button after it's been revealed or after answer is chosen
    - _Requirements: 3.3, 5.1, 5.2, 5.5, 5.6, 8.1, 8.2, 8.4_
  
  - [x] 3.3 Add answer handling and visual feedback to FindOnMapQuestion
    - Listen to `countryClicked` event from InteractiveMap
    - Set `chosen.value = countryId` when user clicks a country
    - Determine if answer is correct: `countryId === question.correct.id`
    - Set `feedbackState` to 'correct' or 'wrong'
    - Pass `highlightedCountries` prop to InteractiveMap: correct answer always highlighted green, wrong answer highlighted red
    - Display correct country name when answer is wrong
    - After 1500ms delay, emit `answer` event with chosen ID
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3, 6.4, 6.5, 8.3_
  
  - [x] 3.4 Add blitz mode timer display to FindOnMapQuestion
    - Display countdown timer when `blitzMode` prop is true
    - Use `timeRemaining` prop to show remaining seconds
    - Add visual indicator (red color or pulsing animation) when time < 3 seconds
    - _Requirements: 3.4, 9.4, 9.5_
  
  - [x] 3.5 Add state reset on question change
    - Watch `question` prop and reset `chosen`, `hintRevealed`, and `feedbackState` when it changes
    - Ensure component is ready for the next question immediately after reset
    - _Requirements: 4.4_

- [x] 4. Integrate FindOnMapQuestion into PlayView
  - [x] 4.1 Update `src/views/PlayView.vue` to render FindOnMapQuestion for 'find-on-map' mode
    - Add import for FindOnMapQuestion component
    - Add conditional rendering: `v-if="sessionStore.config.mode === 'find-on-map'"`
    - Pass props: `question`, `locale`, `blitzMode`, `timeRemaining`
    - Listen to `answer` event and call `gameStore.answer(chosenId)`
    - _Requirements: 1.1, 7.1_

- [x] 5. Update GameModeSelector to include Find on Map option
  - [x] 5.1 Update `src/components/session/GameModeSelector.vue` to add 'find-on-map' mode card
    - Add ModeCard for 'find-on-map' with appropriate icon (🗺️ or similar)
    - Add mode title translations (en: "Find on Map", es: "Encuentra en el Mapa")
    - Add mode description translations explaining the gameplay
    - Ensure mode can be selected and stored in Session Store
    - _Requirements: 1.1_

- [x] 6. Checkpoint - Test basic integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Add Game Store integration for hint tracking (optional enhancement)
  - [x] 7.1 Extend AnsweredQuestion interface with optional `hintUsed` field
    - Modify `AnsweredQuestion` interface in `src/stores/game.ts` to add `hintUsed?: boolean`
    - Update FindOnMapQuestion to track hint usage and pass to answer event
    - Update PlayView to pass `hintUsed` to `gameStore.answer()`
    - _Requirements: 5.4_

- [ ]* 8. Write unit tests for InteractiveMap component
  - Test that only countries from `visibleContinents` are rendered
  - Test that `countryClicked` event is emitted on click
  - Test that `countryClicked` event is emitted on Enter/Space key
  - Test that events are not emitted when `disableInteraction` is true
  - Test that correct CSS classes are applied based on `highlightedCountries` prop
  - Test that ARIA labels are correctly set using `flagName()` function
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 10.3, 10.4_

- [ ]* 9. Write unit tests for FindOnMapQuestion component
  - Test that flag emoji is displayed from `question.correct`
  - Test that InteractiveMap receives correct `visibleContinents` prop
  - Test that "Show Continent" button shows/hides correctly
  - Test that continent name is displayed after hint button click
  - Test that `answer` event is emitted with correct `chosenId`
  - Test that visual feedback states (correct/wrong) are correctly applied
  - Test that state resets when `question` prop changes
  - Test that countdown timer displays when `blitzMode` is true
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 5.5, 6.4, 6.5_

- [ ]* 10. Write unit tests for continentName utility
  - Test English continent names for all 5 continents
  - Test Spanish continent names for all 5 continents
  - _Requirements: 8.4_

- [ ]* 11. Write integration tests for Game Store coordination
  - Test that Game Store generates questions with correct continent filters for find-on-map mode
  - Test that Game Store.answer() marks answer as 'correct' when chosenId matches
  - Test that Game Store.answer() marks answer as 'wrong' when chosenId doesn't match
  - Test that PlayView calls Game Store.answer() when FindOnMapQuestion emits 'answer'
  - _Requirements: 1.2, 4.2, 4.3, 7.1, 7.2, 7.3_

- [ ]* 12. Write end-to-end tests for find-on-map mode
  - Test happy path: configure session, play game, click correct countries, verify score
  - Test wrong answer path: click incorrect country, verify red/green highlights, verify correct name shown
  - Test hint usage: click "Show Continent", verify continent shown, verify button disabled
  - Test blitz mode: verify timer displays, verify timeout records wrong answer
  - Test keyboard navigation: tab through countries, press Enter, verify answer recorded
  - Test continent filtering: configure single continent, verify only that continent's countries visible
  - _Requirements: 1.2, 1.3, 1.4, 4.2, 4.3, 5.2, 5.6, 6.1, 6.2, 6.5, 9.1, 9.2, 9.3, 10.1, 10.2, 10.4_

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation follows the existing pattern used by NameItQuestion, ChooseFlagQuestion, and TypeItQuestion
- Map path data should be simplified to reduce file size while maintaining country recognizability
- Small countries with difficult-to-click regions get circular overlays for improved usability
- Visual feedback timing (1500ms) matches existing question components
- Accessibility is built-in from the start with ARIA labels and keyboard navigation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 3, "tasks": ["3.1", "5.1"] },
    { "id": 4, "tasks": ["3.2", "8.1", "8.2", "10.1"] },
    { "id": 5, "tasks": ["3.3", "3.4", "8.3"] },
    { "id": 6, "tasks": ["3.5", "7.1", "9.1"] },
    { "id": 7, "tasks": ["4.1", "11.1", "11.2"] },
    { "id": 8, "tasks": ["12.1"] }
  ]
}
```
