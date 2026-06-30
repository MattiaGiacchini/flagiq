# Implementation Plan: Enhanced Game Results

## Overview

This implementation enhances the game results screen with comprehensive performance analytics, including incorrect answer review, continent-based performance breakdowns, and improved SVG loading experience. The work is broken down into four main phases: core results enhancements, SVG loading improvements, randomization, and similarity matrix system.

## Tasks

- [x] 1. Set up core data structures and utilities
  - [x] 1.1 Create continent performance calculation utility function
    - Create `src/utils/continentPerformance.ts` with `calculateContinentPerformance` function
    - Function accepts `AnsweredQuestion[]` and returns `ContinentStats[]`
    - Implement aggregation logic: group by continent, count correct/total, calculate percentage
    - Sort results alphabetically by continent name
    - _Requirements: 2.2, 2.3, 2.4, 2.8_

  - [x] 1.2 Create incorrect answers extraction utility function
    - Create `src/utils/incorrectAnswers.ts` with `extractIncorrectAnswers` function
    - Function accepts `AnsweredQuestion[]` and `Flag[]` (for lookup)
    - Filter for `result === 'wrong'`
    - Map to `{ correctFlag, chosenFlag, continent }` structure
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x]* 1.3 Write unit tests for continent performance calculation
    - Test with single continent, multiple continents
    - Test with all correct, all wrong, mixed performance
    - Test alphabetical sorting
    - Test percentage rounding
    - _Requirements: 2.2, 2.3, 2.4, 2.8_

  - [x]* 1.4 Write unit tests for incorrect answers extraction
    - Test with no wrong answers (empty array)
    - Test with all wrong answers
    - Test with mixed results
    - Verify correct flag lookup by ID
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Create ContinentPerformance component
  - [x] 2.1 Implement ContinentPerformance.vue component structure
    - Create `src/components/game/ContinentPerformance.vue`
    - Define props interface: `performance` array and `locale`
    - Implement template with performance bar for each continent
    - Add localized continent names using translation helper
    - Display format: "{correct}/{total} {percentage}%"
    - _Requirements: 2.1, 2.5, 2.6_

  - [x] 2.2 Add visual progress bar styling
    - Implement CSS for progress bar container and fill
    - Add color coding: green (100%), blue (≥80%), amber (60-79%), neutral (<60%)
    - Make bars responsive: full width on mobile, constrained on desktop
    - Add smooth transition animations
    - _Requirements: 2.7, 2.9, 2.10, 8.5, 8.6_

  - [x]* 2.3 Write unit tests for ContinentPerformance component
    - Test rendering with single continent
    - Test rendering with multiple continents
    - Test color coding logic for different percentages
    - Test localization (en vs es)
    - Test empty performance array
    - _Requirements: 2.1, 2.5, 2.6, 2.7, 2.9, 2.10_

- [x] 3. Create IncorrectAnswers component
  - [x] 3.1 Implement IncorrectAnswers.vue component structure
    - Create `src/components/game/IncorrectAnswers.vue`
    - Define props interface: `incorrect` array and `locale`
    - Implement template with list of incorrect answers
    - Format English: "{Correct Name} - You answered: {Chosen Name}, {Continent}"
    - Format Spanish: "{Correct Name} - Respondiste: {Chosen Name}, {Continente}"
    - Add conditional rendering: only show if array has items
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 3.2 Add styling for incorrect answers list
    - Style list items with proper spacing
    - Add subtle borders or separators
    - Ensure readable font sizes (≥14px)
    - Make responsive for mobile and desktop
    - _Requirements: 8.8_

  - [x]* 3.3 Write unit tests for IncorrectAnswers component
    - Test rendering with single incorrect answer
    - Test rendering with multiple incorrect answers
    - Test English formatting
    - Test Spanish formatting
    - Test conditional rendering (no render when empty)
    - _Requirements: 1.5, 1.6, 1.7_

- [x] 4. Enhance GameResults component
  - [x] 4.1 Update GameResults props and computed properties
    - Add `answers: AnsweredQuestion[]` to props interface
    - Add `incorrectAnswers` computed property using extraction utility
    - Add `continentPerformance` computed property using calculation utility
    - Keep existing computed properties (percentage, message, formattedTime)
    - _Requirements: 1.1, 2.1, 3.1, 3.2, 3.3, 3.4_

  - [x] 4.2 Update GameResults template with new sections
    - Import and add `<ContinentPerformance>` component
    - Import and add `<IncorrectAnswers>` component
    - Pass computed data to child components
    - Maintain existing summary metrics section
    - _Requirements: 1.1, 2.1, 3.1, 3.2, 3.3, 3.4_

  - [x] 4.3 Implement responsive layout structure
    - Add mobile layout (<768px): single column stack (summary → continent → incorrect → actions)
    - Add desktop layout (≥768px): grid with summary prominent, continent and incorrect side-by-side
    - Use CSS Grid or Flexbox for responsive switching
    - Ensure proper spacing (1rem mobile, 1.5rem desktop)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 4.4 Ensure touch-friendly buttons and minimum font sizes
    - Set minimum button size to 44x44px on mobile
    - Set minimum body text font-size to 14px
    - Test button padding and spacing
    - _Requirements: 8.7, 8.8_

  - [ ]* 4.5 Write integration tests for enhanced GameResults
    - Test with complete answer history (mixed results, multiple continents)
    - Verify all sections render correctly
    - Test with all correct (no incorrect section)
    - Test responsive layout at different viewports
    - Test locale switching (en → es)
    - _Requirements: 1.1, 2.1, 3.1, 3.2, 3.3, 3.4, 8.1, 8.2_

- [ ] 5. Update GameView to pass answers data
  - [-] 5.1 Modify GameView.vue to pass answers prop to GameResults
    - Update GameResults component call to include `:answers="gameStore.answers"`
    - Update locale prop to use locale store
    - Verify gameStore.answers is accessible
    - _Requirements: 1.1, 2.1_

- [~] 6. Checkpoint - Test enhanced results display
  - Manually test game session with mixed results
  - Verify continent performance displays correctly
  - Verify incorrect answers format correctly in both locales
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create FlagLoader service with preloading and caching
  - [x] 7.1 Implement FlagLoader class with cache and preload queue
    - Create `src/services/flagLoader.ts`
    - Implement in-memory cache using `Map<string, string>` (id → blob URL)
    - Add `preload(ids: string[]): Promise<void>` method
    - Add `load(id: string): Promise<string>` method with cache check
    - Implement 3-second timeout for load attempts
    - Add error handling and logging
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 7.2 Implement preload strategy for question queue
    - Add method to preload current + next N questions
    - Integrate with game store to access question order
    - Preload first 3 questions on session start
    - Preload next 2 questions on each answer
    - _Requirements: 4.4, 4.5_

  - [x]* 7.3 Write unit tests for FlagLoader service
    - Test cache hit and miss scenarios
    - Test preload queue processing
    - Test timeout handling
    - Test error handling for missing files
    - Mock fetch API for consistent testing
    - _Requirements: 4.3, 4.6, 4.7_

- [x] 8. Enhance FlagImage component with skeleton loading
  - [x] 8.1 Add skeleton loading state to FlagImage
    - Add `showSkeleton?: boolean` prop
    - Create skeleton placeholder component/element
    - Implement loading state machine: skeleton → image → emoji (on error)
    - Show skeleton during loading when `showSkeleton=true`
    - Show emoji immediately when `showSkeleton=false` (existing behavior)
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 8.2 Add skeleton placeholder styling
    - Create CSS for skeleton with pulse animation
    - Use gray gradient: `linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)`
    - Add smooth animation: `skeleton-pulse 1.5s ease-in-out infinite`
    - Round corners to match flag image styling
    - _Requirements: 4.1_

  - [x] 8.3 Integrate FlagLoader with FlagImage component
    - Import and use FlagLoader service
    - Replace direct image src with preloaded blob URL when available
    - Fall back to direct path if preload not available
    - Maintain existing error handling for emoji fallback
    - _Requirements: 4.2, 4.3, 4.6_

  - [x]* 8.4 Write unit tests for enhanced FlagImage
    - Test skeleton display during loading
    - Test transition from skeleton to image
    - Test transition from skeleton to emoji on error
    - Test with `showSkeleton=true` and `showSkeleton=false`
    - Test timeout handling
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 9. Update question components to use preloading
  - [x] 9.1 Add eager loading to current question flags
    - Update all question components to pass `eager=true` for current question
    - Update to pass `showSkeleton=true` for mobile viewport
    - Files to update: `ChooseFlagQuestion.vue`, `FindOnMapQuestion.vue`, `NameItQuestion.vue`, `TypeItQuestion.vue`
    - _Requirements: 4.1, 4.4_

  - [x] 9.2 Trigger preload on game start and answer events
    - Call FlagLoader preload on game session start (first 3 flags)
    - Call FlagLoader preload on each answer submission (next 2 flags)
    - Handle edge cases: fewer than 3 remaining questions
    - _Requirements: 4.4, 4.5_

- [~] 10. Checkpoint - Test SVG loading improvements
  - Test on mobile device with slow network throttling
  - Verify skeleton appears instead of emoji during load
  - Verify smooth transition to SVG image
  - Verify emoji fallback appears after 3s timeout on error
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement question pool randomization
  - [x] 11.1 Update buildQuestions shuffle algorithm in game store
    - Modify `buildQuestions` function in `src/stores/game.ts`
    - Shuffle entire pool before selecting questions
    - For `count='all'`: shuffle and return all
    - For numeric count: shuffle, then slice to limit
    - Maintain existing distractor selection logic
    - _Requirements: 5.1, 5.2, 5.3, 5.6_

  - [x]* 11.2 Write property-based test for randomization uniformity
    - **Property 10: Question Pool Randomization**
    - **Validates: Requirements 5.1, 5.4, 5.5, 5.6**
    - Generate 20 sessions with identical config
    - Verify at least 95% produce unique question orders
    - Minimum 100 iterations using fast-check
    - _Requirements: 5.1, 5.4, 5.5_

  - [x]* 11.3 Write unit tests for question pool size correctness
    - **Property 11: Question Pool Size Correctness**
    - **Validates: Requirements 5.2, 5.3**
    - Test with `count='all'`: verify length equals available flags
    - Test with numeric count: verify length equals min(count, available)
    - Test with various continent filters
    - _Requirements: 5.2, 5.3_

- [x] 12. Create flag similarity data structure and utilities
  - [x] 12.1 Define similarity matrix types and interfaces
    - Create `src/data/flagSimilarity.ts`
    - Define `SimilarityScore` interface: flagA, flagB, score (0-1), optional factors
    - Define `SimilarityMatrix` interface: version, scores array, optional metadata
    - Define `Result<T, E>` type for error handling
    - _Requirements: 6.1_

  - [x] 12.2 Implement similarity query functions
    - Implement `getSimilarFlags(targetId, matrix, limit)` function
    - Filter scores to find matches for targetId
    - Sort by score descending
    - Return top N flag IDs
    - _Requirements: 6.2, 6.7_

  - [x] 12.3 Create similarity parser and printer utilities
    - Create `src/utils/similarityParser.ts`
    - Implement `parseSimilarityConfig(json: string): Result<SimilarityMatrix, string>`
    - Validate JSON structure, required fields
    - Validate scores are in [0, 1] range
    - Validate flag IDs exist in FLAGS dataset
    - Implement `printSimilarityConfig(matrix: SimilarityMatrix): string`
    - _Requirements: 7.1, 7.2, 7.5, 7.6, 7.7_

  - [x]* 12.4 Write property-based test for parser round-trip
    - **Property 12: Similarity Parser Round-Trip**
    - **Validates: Requirements 7.1, 7.3, 7.4**
    - For any valid SimilarityMatrix, parse(print(matrix)) equals matrix
    - Use arbitrary generator for SimilarityMatrix
    - Minimum 100 iterations using fast-check
    - _Requirements: 7.3, 7.4_

  - [x]* 12.5 Write unit tests for similarity parser validation
    - **Property 13: Similarity Parser Validation**
    - **Validates: Requirements 7.2, 7.5, 7.6**
    - Test with invalid JSON: expect descriptive error
    - Test with missing required fields: expect descriptive error
    - Test with scores outside [0, 1]: expect descriptive error
    - Test with unknown flag IDs: expect descriptive error
    - Test with valid input: expect success
    - _Requirements: 7.2, 7.5, 7.6_

- [x] 13. Integrate similarity-based distractor selection
  - [x] 13.1 Add similarity config to session configuration
    - Update `SessionConfig` type in `src/types/session.ts`
    - Add optional `useSimilarity?: boolean` field
    - Default to false for backward compatibility
    - _Requirements: 6.8_

  - [x] 13.2 Implement similarity-based distractor selection algorithm
    - Update `pickDistractors` function in `src/stores/game.ts`
    - Check if `config.useSimilarity` is enabled
    - Load similarity matrix (create empty placeholder initially)
    - Get similar flags for correct answer
    - Filter similar flags to only include those in continent pool
    - Select at least 2 out of 3 distractors from similar flags when available
    - Fall back to random selection if insufficient similar flags
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

  - [x]* 13.3 Write property-based test for similarity-based selection
    - **Property 16: Similarity-Based Distractor Selection**
    - **Validates: Requirements 6.2, 6.7**
    - For any question with similarity enabled and 3+ similar flags available
    - Verify at least 2 out of 3 distractors come from high similarity scores
    - Test with various similarity matrices
    - Minimum 100 iterations using fast-check
    - _Requirements: 6.2, 6.7_

  - [x]* 13.4 Write unit tests for distractor fallback logic
    - Test with similarity enabled but no similar flags available
    - Verify falls back to random selection
    - Test with similarity disabled
    - Verify uses random selection
    - _Requirements: 6.6, 6.9_

- [ ] 14. Add similarity toggle to session setup UI (optional enhancement)
  - [-] 14.1 Add similarity toggle to session configuration components
    - Update `SessionSetup.vue` or related component
    - Add toggle switch for "Use similar flags"
    - Store in session config state
    - Pass to game store on session start
    - _Requirements: 6.8_

- [ ] 15. Final checkpoint and integration testing
  - [ ]* 15.1 Write integration test for complete enhanced results flow
    - Start game session with multiple continents
    - Answer questions with mixed results
    - Verify GameResults receives and displays all data correctly
    - Verify continent performance calculation matches expected
    - Verify incorrect answers list matches expected
    - Test in both English and Spanish locales
    - _Requirements: 1.1, 2.1, 3.1_

  - [ ]* 15.2 Write property-based test for continent performance sum invariant
    - **Property 5: Continent Performance Sum Invariant**
    - **Validates: Requirements 2.2, 2.3**
    - For any game session, sum of correct across continents equals total score
    - For any game session, sum of total across continents equals total questions
    - Minimum 100 iterations using fast-check
    - _Requirements: 2.2, 2.3_

  - [ ]* 15.3 Write responsive layout tests
    - **Property 17: Minimum Touch Target Size on Mobile**
    - **Validates: Requirements 8.7**
    - Test all buttons on mobile viewport have ≥44px width and height
    - Test with viewport width < 768px
    - _Requirements: 8.7_

  - [ ]* 15.4 Write font size validation tests
    - **Property 18: Minimum Font Size**
    - **Validates: Requirements 8.8**
    - Test all body text elements have font-size ≥14px
    - Test at various viewport widths
    - _Requirements: 8.8_

  - [~] 15.5 Manual testing checklist
    - Test complete game flow on mobile device
    - Test complete game flow on desktop
    - Verify skeleton loader appears on slow network
    - Test with all correct answers (no incorrect section)
    - Test with all wrong answers (full incorrect section)
    - Test with multiple continents (verify performance breakdown)
    - Test locale switching (English ↔ Spanish)
    - Test responsive breakpoint at 768px
    - Verify touch targets are accessible on mobile
    - Ensure all automated tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property-based tests validate universal correctness properties from the design
- Unit tests validate specific examples and edge cases
- The similarity matrix system (tasks 12-14) is an optional enhancement that can be implemented later
- SVG preloading improvements (tasks 7-10) significantly enhance mobile UX
- Randomization (task 11) ensures variety in gameplay experience
- Focus first on core results enhancements (tasks 1-6) for immediate value

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "12.1"] },
    { "id": 1, "tasks": ["1.3", "1.4", "2.1", "3.1", "7.1", "12.2", "12.3"] },
    { "id": 2, "tasks": ["2.2", "3.2", "7.2", "12.4", "12.5"] },
    { "id": 3, "tasks": ["2.3", "3.3", "4.1", "7.3", "8.1"] },
    { "id": 4, "tasks": ["4.2", "8.2", "11.1", "13.1"] },
    { "id": 5, "tasks": ["4.3", "8.3", "11.2", "11.3", "13.2"] },
    { "id": 6, "tasks": ["4.4", "8.4", "9.1", "13.3", "13.4"] },
    { "id": 7, "tasks": ["4.5", "5.1", "9.2", "14.1"] },
    { "id": 8, "tasks": ["15.1", "15.2", "15.3", "15.4"] },
    { "id": 9, "tasks": ["15.5"] }
  ]
}
```
