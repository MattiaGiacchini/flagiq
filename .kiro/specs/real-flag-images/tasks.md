# Implementation Plan: Real Flag Images

## Overview

This implementation plan converts the design for real flag images into actionable coding tasks. The implementation will replace emoji flags with high-quality flag images downloaded locally to `public/flags/`, eliminating CDN dependencies and ensuring instant loading and offline availability.

Key aspects:
- Download all 197 flag images locally using a one-time script
- Create reusable FlagImage component with SVG→PNG→emoji fallback chain
- Update utility functions for local file paths
- Replace emoji rendering in all game components
- Eliminate vertical scrolling during gameplay

## Tasks

- [x] 0. Download flag images locally
  - [x] 0.1 Create download script `scripts/downloadFlags.ts`
    - Implement `downloadFlag(countryCode: string)` function with retry logic (3 attempts)
    - Try SVG first from `https://flagcdn.com/{code}.svg`
    - Fallback to PNG from `https://flagcdn.com/w640/{code}.png` if SVG fails
    - Save files to `public/flags/{code}.svg` or `public/flags/{code}.png`
    - Implement `downloadAllFlags()` main function that processes all 197 flags from flags.ts
    - Add progress logging: "Downloaded 150/197 flags..."
    - Add final summary with success/failure counts
    - Create `public/flags/` directory if it doesn't exist
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [x] 0.2 Execute download script
    - Run `npx tsx scripts/downloadFlags.ts`
    - Verify all 197 flags downloaded successfully
    - Review summary output for any failures
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [x] 0.3 Verify downloaded files
    - Check that `public/flags/` directory contains 197 files
    - Verify files are valid SVG or PNG format
    - Verify file sizes are reasonable (<100KB each)
    - _Requirements: 2.2, 2.3_

- [x] 1. Create utility functions for local paths
  - [x] 1.1 Create `src/utils/flagImages.ts` with local path helpers
    - Implement `getLocalFlagPath(countryCode: string): string` → returns `/flags/{code}.svg`
    - Implement `getFallbackFlagPath(countryCode: string): string` → returns `/flags/{code}.png`
    - Remove old CDN functions: getFlagImageUrl, getResponsiveFlagUrl, preloadFlagImage
    - All functions should use lowercase country codes
    - _Requirements: 6.4, 6.5_
  
  - [ ]* 1.2 Write unit tests for flagImages.ts utilities
    - Test `getLocalFlagPath()` returns correct SVG path
    - Test `getFallbackFlagPath()` returns correct PNG path
    - Test lowercase conversion for country codes
    - _Requirements: 6.4, 6.5_
  
  - [ ]* 1.3 Write test to verify all flag files exist
    - Create test that checks all 197 flags from flags.ts have corresponding files in `public/flags/`
    - Verify each file exists as .svg or .png
    - Fail test if any flag file is missing
    - _Requirements: 2.2, 2.3_

- [x] 2. Create FlagImage component (simplified for local files)
  - [x] 2.1 Create `src/components/common/FlagImage.vue`
    - Implement props: countryCode, emoji, alt, eager (boolean)
    - **REMOVE size prop** (SVG scales automatically to container)
    - Implement state: imageLoaded, showFallback, currentSrc
    - Start with emoji visible (showFallback=true) while image loads
    - Try SVG first from getLocalFlagPath()
    - On SVG error: try PNG from getFallbackFlagPath()
    - On PNG error: stay on emoji fallback, log warning
    - Use native lazy loading unless eager prop is true
    - Apply object-fit: cover to prevent white borders
    - Apply width: 100%, height: 100% to fill container
    - Use border-radius: inherit from parent
    - _Requirements: 1.1, 1.2, 1.4, 2.1, 4.1, 4.2, 4.3, 5.1, 8.2, 8.3, 8.7_
  
  - [ ]* 2.2 Write unit tests for FlagImage component
    - Test SVG load success (shows image, hides emoji)
    - Test SVG load error triggers PNG fallback
    - Test PNG fallback error shows emoji fallback
    - Test lazy loading attribute applied correctly
    - Test eager loading when prop is true
    - Test accessibility attributes (alt text)
    - _Requirements: 1.1, 4.1, 4.2, 5.1_

- [x] 3. Update FindOnMapQuestion component
  - [x] 3.1 Replace emoji with FlagImage in FindOnMapQuestion.vue
    - Import and use FlagImage component
    - Pass countryCode, emoji, alt props
    - **REMOVE size prop** (no longer needed with SVG)
    - Set eager=true for immediate loading
    - Remove .flag-emoji span element
    - Maintain existing .flag-display container styling (aspect-ratio: 3/2)
    - Ensure .flag-display has width/height for FlagImage to fill
    - _Requirements: 1.1, 7.1, 8.1, 8.4, 8.7_

- [x] 4. Update ChooseFlagQuestion component
  - [x] 4.1 Replace emojis with FlagImage in ChooseFlagQuestion.vue
    - Import and use FlagImage component
    - Replace emoji spans in .option-btn with FlagImage
    - Pass countryCode, emoji, alt for each option
    - **REMOVE size prop** (no longer needed with SVG)
    - Use lazy loading (default behavior)
    - Ensure .option-btn maintains aspect-ratio: 4/3
    - _Requirements: 1.1, 7.2, 8.1, 8.4, 8.7_

- [x] 5. Update NameItQuestion component
  - [x] 5.1 Replace emoji with FlagImage in NameItQuestion.vue
    - Import and use FlagImage component
    - Replace .flag-emoji with FlagImage
    - **REMOVE size prop** (no longer needed with SVG)
    - Set eager=true for immediate loading
    - Update alt text with country name in current locale
    - Ensure .flag-display has explicit width/height (e.g., 200px × 140px)
    - _Requirements: 1.1, 7.3, 8.1, 8.4, 8.7_

- [x] 6. Update TypeItQuestion component
  - [x] 6.1 Replace emoji with FlagImage in TypeItQuestion.vue
    - Import and use FlagImage component
    - Replace large .flag-emoji with FlagImage
    - **REMOVE size prop** (no longer needed with SVG)
    - Set eager=true for immediate loading
    - Ensure .flag-display container maintains width: 340px, height: 240px
    - Add overflow: hidden to .flag-display
    - _Requirements: 1.1, 7.4, 8.1, 8.4, 8.7_

- [x] 7. Checkpoint - Verify flag images rendering
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Fix vertical scroll during gameplay
  - [ ] 8.1 Update PlayView.vue to prevent vertical scroll
    - Add height: calc(100vh - 80px) to .play-view container (subtract header height)
    - Add overflow: hidden to .play-view
    - Add display: flex, flex-direction: column to .play-view
    - Add watch to reset scroll position on question change: window.scrollTo(0, 0)
    - Add mobile-specific viewport height handling: height: 100dvh for @media (max-width: 767px)
    - Add min-height: -webkit-fill-available for iOS Safari fallback
    - _Requirements: 9.1, 9.3, 9.4, 9.5, 9.7_
  
  - [ ] 8.2 Add overflow hidden to question component containers
    - Update ChooseFlagQuestion.vue: add overflow: hidden, height: 100%, display: flex, flex-direction: column, justify-content: center
    - Update NameItQuestion.vue: add overflow: hidden, height: 100%, display: flex, flex-direction: column, justify-content: center
    - Update TypeItQuestion.vue: add overflow: hidden, height: 100%, display: flex, flex-direction: column, justify-content: center
    - Update FindOnMapQuestion.vue: add overflow: hidden, height: 100%, display: flex, flex-direction: column
    - _Requirements: 9.2, 9.5_

- [ ] 9. Final checkpoint - End-to-end testing
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 10. Write integration tests
  - [ ]* 10.1 Test flag images in all game modes
    - Test FindOnMap shows local flag image correctly
    - Test ChooseFlag shows 4 local flag images correctly
    - Test NameIt shows local flag image correctly
    - Test TypeIt shows local flag image correctly
    - _Requirements: 1.1, 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 10.2 Test fallback behavior
    - Test PNG fallback when SVG file missing
    - Test emoji fallback when both SVG and PNG fail
    - Test error logging in console
    - Test UI does not freeze on error
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 10.3 Test no vertical scroll during gameplay
    - Test no scrollbar appears in each game mode
    - Test scroll position resets on question change
    - Test mobile keyboard does not cause scroll issues
    - _Requirements: 9.1, 9.3, 9.7_
  
  - [ ]* 10.4 Test offline functionality
    - Test flags load correctly without network connection
    - Test all 197 flags available from local storage
    - Verify load times < 50ms for local files
    - _Requirements: 2.1, 2.2_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Testing tasks validate correctness properties from the design document
- The implementation follows a bottom-up approach: download → utilities → component → integration
- No white borders requirement (8.2, 8.3, 8.7) is achieved through object-fit: cover in FlagImage component
- Local file storage eliminates CDN latency and provides instant loading (<50ms)
- SVG format provides scalability without quality loss, removing need for size prop
- **Removed preloading task** - local files load instantly, no preloading needed

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["0.1"] },
    { "id": 1, "tasks": ["0.2"] },
    { "id": 2, "tasks": ["0.3", "1.1"] },
    { "id": 3, "tasks": ["1.2", "1.3", "2.1"] },
    { "id": 4, "tasks": ["2.2", "3.1", "4.1", "5.1", "6.1"] },
    { "id": 5, "tasks": ["8.1"] },
    { "id": 6, "tasks": ["8.2"] },
    { "id": 7, "tasks": ["10.1", "10.2", "10.3", "10.4"] }
  ]
}
```
