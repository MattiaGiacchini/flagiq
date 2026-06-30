est# Implementation Plan

## Overview

This implementation plan addresses multiple visual and UX bugs in the "Find on Map" game mode. The approach follows the exploratory bugfix workflow: first writing tests to understand and validate the bugs exist (exploration), then writing tests to preserve non-buggy behavior (preservation), and finally implementing fixes with validation. The four issues to fix are: (1) incorrect map centering for single-continent selections, (2) visual inconsistency in desktop gap color, (3) poor mobile layout compressing the map, and (4) map distortion in Asia/Oceania/Europe regions.

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Find on Map Visual and UX Issues
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the four bugs exist
  - **Scoped PBT Approach**: Test specific cases for each bug to ensure reproducibility
  - Test implementation details from Bug Condition in design:
    - Bug 1: Single continent (Europe, Oceania, Africa) not centered - verify viewBox calculation
    - Bug 2: Desktop gap color is white (#ffffff) instead of #f0f2f8
    - Bug 3: Mobile layout compresses map (map height < 60% of viewport)
    - Bug 4: Countries in Asia/Oceania/Europe display with distorted shapes
  - The test assertions should match the Expected Behavior Properties from design:
    - Single continent viewBox should center the continent properly
    - Desktop background should be #f0f2f8
    - Mobile map should occupy >= 60% viewport height
    - Asia/Oceania/Europe countries should have correct geographical shapes
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bugs exist)
  - Document counterexamples found to understand root cause:
    - Record actual viewBox values for single continents vs expected centered values
    - Record actual background color vs expected #f0f2f8
    - Record actual mobile map height percentage vs expected >= 60%
    - Record geometric deviations in country shapes if measurable
  - Mark task complete when test is written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Multi-Continent and Interactive Features
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - Multi-continent selections (2-5 continents) produce viewBox (0, 0, 1000, 500)
    - Desktop layout maintains grid with 25% side panel and 75% map area
    - Country click interactions work: highlighting, answer emission after 1500ms
    - Pan and zoom functionality works within scale limits (0.5-5)
    - Hint button reveals continent name without affecting map
    - Countries in Americas and Africa display with correct shapes
    - Blitz mode timer displays with alert animation when time < 3 seconds
    - Wrong answer feedback shows correct country name
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 3. Fix for find-on-map visual and UX issues

  - [x] 3.1 Fix single continent centering in InteractiveMap.vue
    - Review and correct continentBounds values for each continent
    - Verify bounds using actual SVG path data from mapPaths.ts
    - Add appropriate padding to prevent continents from touching viewport edges
    - Enhance baseViewBox computation to properly center single continents
    - Consider aspect ratio when calculating viewBox
    - Ensure centroid of continent aligns with viewport center
    - _Bug_Condition: isBugCondition(input) where input.selectedContinents.length == 1 AND NOT mapCenteredOnContinent(input.selectedContinents[0])_
    - _Expected_Behavior: Single continent viewBox centers the continent within visible map area from design_
    - _Preservation: Multi-continent selections must continue to produce viewBox (0, 0, 1000, 500)_
    - _Requirements: 1.1, 2.1, 3.1_

  - [x] 3.2 Fix desktop gap color inconsistency in FindOnMapQuestion.vue
    - Change background color of `.find-on-map` container from #ffffff to #f0f2f8
    - Ensure `.left-panel` maintains its white background
    - Test visual consistency in desktop view (viewport >= 1024px)
    - _Bug_Condition: isBugCondition(input) where input.viewportWidth >= 1024 AND gapBackgroundColor != '#f0f2f8'_
    - _Expected_Behavior: Desktop gap background color is #f0f2f8 from design_
    - _Preservation: Desktop grid layout structure (25% / 75%) must remain unchanged_
    - _Requirements: 1.2, 2.2, 3.2_

  - [x] 3.3 Optimize mobile layout for map visibility in FindOnMapQuestion.vue
    - Redesign mobile layout to prioritize map visibility
    - Position header at top, maximize map area below
    - Reposition side panel content to not compete for vertical space
    - Consider options: floating bottom control panel or overlay with toggle
    - Ensure map occupies minimum 60% of viewport height on mobile
    - Add appropriate media queries for tablet (768px-1023px) and mobile (<768px)
    - Set explicit height constraints using viewport-based units (e.g., height: 60vh)
    - Maintain aspect ratio while maximizing map space
    - _Bug_Condition: isBugCondition(input) where input.viewportWidth < 1024 AND sidePanelCompetesWithMapForVerticalSpace_
    - _Expected_Behavior: Mobile map occupies >= 60% viewport height from design_
    - _Preservation: Desktop layout and all interactive features must remain unchanged_
    - _Requirements: 1.3, 2.3, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.4 Investigate and fix map distortions in Asia/Oceania/Europe
    - Investigate root cause of shape distortions in mapPaths.ts data
    - Compare current SVG paths with reference data from Natural Earth or other authoritative sources
    - If data source is fundamentally flawed, consider migrating to different map library
    - Evaluate options: D3-geo, TopoJSON, react-simple-maps data, Leaflet with GeoJSON
    - Update SVG path data for affected continents/countries
    - May require updating script in scripts/generateMapPaths.ts
    - Add validation script to detect distortions (geometric similarity metrics)
    - Document any known limitations of chosen map projection
    - _Bug_Condition: isBugCondition(input) where input.visibleCountries CONTAINS ANY_OF asia/oceania/europe countries AND countryShapeIsDistorted_
    - _Expected_Behavior: Asia/Oceania/Europe countries display with geographically correct shapes from design_
    - _Preservation: Americas and Africa country shapes must remain unchanged_
    - _Requirements: 1.4, 2.4, 3.6_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Fixed Visual and UX Issues
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - Verify all four bug scenarios now produce correct behavior:
      - Single continent centering works correctly
      - Desktop gap color is #f0f2f8
      - Mobile map occupies >= 60% viewport height
      - Asia/Oceania/Europe countries have correct shapes
    - **EXPECTED OUTCOME**: Test PASSES (confirms bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Multi-Continent and Interactive Features
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all preservation behaviors still work:
      - Multi-continent view produces viewBox (0, 0, 1000, 500)
      - Desktop layout maintains 25% / 75% grid
      - All interactive features work unchanged
      - Americas/Africa country shapes unchanged
      - Blitz timer and feedback displays work correctly

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise
  - Verify visual appearance in browser at different viewport sizes
  - Test single continent selection for each continent
  - Test multi-continent selections
  - Test mobile responsive behavior
  - Test all interactive features (click, pan, zoom, hint)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2"] },
    { "id": 1, "tasks": ["3.1", "3.2", "3.3", "3.4"] },
    { "id": 2, "tasks": ["3.5"] },
    { "id": 3, "tasks": ["3.6"] },
    { "id": 4, "tasks": ["4"] }
  ]
}
```

**Critical Path**: Tasks 1 and 2 (wave 0) must complete before any implementation work. All implementation sub-tasks (wave 1) must complete before verification of bug fixes (wave 2). Bug fix verification must complete before preservation verification (wave 3).

**Parallel Opportunities**: Tasks 1 and 2 can execute in parallel (wave 0). Sub-tasks 3.1, 3.2, 3.3, and 3.4 can be implemented in parallel (wave 1) after wave 0 completes.

## Notes

- **Testing Strategy**: The bug condition exploration test (task 1) is expected to FAIL on unfixed code - this is the correct outcome that proves the bugs exist. Do not attempt to fix the test when it fails.
- **Observation-First**: Preservation tests (task 2) must observe and record actual behavior on unfixed code before writing assertions. This ensures we preserve real behavior, not assumed behavior.
- **Property-Based Testing**: Both exploration and preservation tests should use property-based testing for stronger guarantees and better coverage across the input domain.
- **Visual Validation**: In addition to automated tests, manual visual inspection is required for task 4 checkpoint to verify the fixes look correct across different viewport sizes.
- **Mobile-First Consideration**: Task 3.3 (mobile layout optimization) may require significant UI restructuring. Consider design tradeoffs between overlay approach vs bottom sheet approach.
- **Data Source Investigation**: Task 3.4 (map distortions) may reveal fundamental data quality issues requiring migration to a different map library. Be prepared for this possibility and evaluate alternatives (D3-geo, TopoJSON, Natural Earth data).
- **File Locations**: 
  - InteractiveMap.vue: `/Users/mattiagiacchini/repos/flagIQ/src/components/game/InteractiveMap.vue`
  - FindOnMapQuestion.vue: `/Users/mattiagiacchini/repos/flagIQ/src/components/game/FindOnMapQuestion.vue`
  - mapPaths.ts: `/Users/mattiagiacchini/repos/flagIQ/src/data/mapPaths.ts`
