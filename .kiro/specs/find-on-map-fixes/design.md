# Find-on-Map Fixes Bugfix Design

## Overview

This bugfix addresses multiple visual and UX issues in the "Find on Map" game mode that degrade the user experience, particularly on mobile devices. The issues include incorrect map centering when a single continent is selected, visual inconsistency in the desktop gap color, poor mobile layout that compresses the map, and map distortion in certain regions (Asia, Australia, Europe). The fix approach involves: (1) correcting the viewBox calculation logic in InteractiveMap.vue to properly center single-continent selections, (2) applying the application background color (#f0f2f8) to the gap between containers, (3) implementing a mobile-responsive layout that prioritizes map visibility, and (4) investigating and addressing SVG path data issues causing geographical distortions.

## Glossary

- **Bug_Condition (C)**: The set of conditions that trigger any of the four identified visual/UX defects
- **Property (P)**: The desired correct visual and interaction behavior for affected scenarios
- **Preservation**: Existing multi-continent views, desktop layout, interactive features, and correctly-rendered continents that must remain unchanged
- **InteractiveMap.vue**: The component in `src/components/game/InteractiveMap.vue` that renders the SVG world map with pan/zoom capabilities
- **FindOnMapQuestion.vue**: The parent component in `src/components/game/FindOnMapQuestion.vue` that orchestrates the question UI with map and side panel
- **baseViewBox**: The computed property that determines the initial viewBox based on selected continents
- **continentBounds**: The record mapping each continent to its bounding box coordinates (x, y, width, height)
- **visibleContinents**: The array of continent IDs currently selected in session configuration

## Bug Details

### Bug Condition

The bugs manifest in four distinct scenarios within the "Find on Map" game mode. The InteractiveMap.vue component incorrectly calculates the map centering, the FindOnMapQuestion.vue component has styling issues affecting visual consistency and mobile usability, and the underlying SVG data contains geographical distortions.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type GameState
  OUTPUT: boolean
  
  RETURN (
    // Bug 1: Single continent not centered
    (input.selectedContinents.length == 1 
     AND NOT mapCenteredOnContinent(input.selectedContinents[0]))
    
    OR
    
    // Bug 2: Gap color inconsistency on desktop
    (input.viewportWidth >= 1024 
     AND gapBackgroundColor != '#f0f2f8')
    
    OR
    
    // Bug 3: Poor mobile layout
    (input.viewportWidth < 1024 
     AND sidePanelCompetesWithMapForVerticalSpace)
    
    OR
    
    // Bug 4: Map distortion in specific continents
    (input.visibleCountries CONTAINS ANY_OF ['asia', 'oceania', 'europe'] countries
     AND countryShapeIsDistorted(input.visibleCountries))
  )
END FUNCTION
```

### Examples

**Bug 1 - Single Continent Centering:**
- User selects only "Europe" → Map shows Europe offset to the left/right instead of centered
- User selects only "Oceania" → Map displays Australia but not properly centered in viewport
- User selects only "Africa" → Continent is partially visible or poorly framed

**Bug 2 - Gap Color Inconsistency:**
- Desktop view at 1920x1080 → White gap appears between map container and side panel instead of #f0f2f8
- The gap stands out visually against the application's consistent #f0f2f8 background

**Bug 3 - Mobile Layout Issues:**
- Mobile device (375x667) → Side panel takes valuable vertical space, compressing map to unusable size
- Tablet landscape mode → Layout doesn't adapt optimally for map visibility

**Bug 4 - Map Distortion:**
- Viewing Japan → Shape appears stretched or compressed
- Viewing Australia → Proportions don't match real geography
- Viewing European countries → Shapes appear deformed

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When multiple continents or all continents are selected, the map must continue to display the full world view with viewBox (0, 0, 1000, 500)
- Desktop layout (viewport ≥ 1024px) must maintain the grid layout with 25% side panel and 75% map area
- Country click interactions must continue to work: register answer, apply correct highlighting (green for correct, red for incorrect), emit answer event after 1500ms delay
- Pan and zoom functionality must continue to work: mouse drag for panning, scroll wheel for zooming, scale limits between 0.5 and 5
- Hint button functionality must continue to reveal the continent name without affecting map centering or visualization
- Countries in Americas and Africa must continue to display with correct geographical shapes
- Blitz mode timer must continue to display in side panel with alert animation when time < 3 seconds
- Incorrect answer feedback must continue to show the correct country name in the side panel

**Scope:**
All inputs that do NOT involve single-continent selection, desktop gap rendering, mobile viewport sizing, or Asia/Oceania/Europe country rendering should be completely unaffected by this fix. This includes:
- Multi-continent game sessions
- Mouse click and keyboard interactions on map countries
- Pan and zoom gesture handling
- Hint revelation mechanics
- Timer and feedback displays

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Incorrect ViewBox Centering Logic**: The `baseViewBox` computed property in InteractiveMap.vue may be using continent bounding boxes that don't account for proper centering
   - The continentBounds values may be incorrect or outdated
   - The viewBox calculation doesn't properly center single continents within the available viewport
   - The aspect ratio preservation (`preserveAspectRatio="xMidYMid meet"`) may not be working as expected with current viewBox values

2. **Missing Background Color Style**: The FindOnMapQuestion.vue component doesn't apply the application background color to the container
   - The white background (#ffffff) is hardcoded in `.find-on-map` style
   - No consideration for the gap between grid items showing through

3. **Inflexible Desktop-First Layout**: The mobile media query (max-width: 1024px) changes grid to vertical stack but doesn't optimize for map visibility
   - The side panel in mobile still takes significant height
   - No consideration for repositioning controls as overlay or bottom sheet
   - Map container height is not maximized for available viewport

4. **SVG Path Data Issues**: The mapPaths.ts data contains distorted or incorrect SVG path definitions for specific continents
   - Possible data source quality issues from original map generation
   - May require investigation of alternative map libraries or data sources (e.g., TopoJSON, Natural Earth)

## Correctness Properties

Property 1: Bug Condition - Single Continent Proper Centering

_For any_ game session where exactly one continent is selected in the configuration, the fixed InteractiveMap component SHALL calculate a viewBox that centers the selected continent within the visible map area, ensuring the entire continent is visible and properly framed without excessive whitespace.

**Validates: Requirements 2.1**

Property 2: Bug Condition - Desktop Gap Color Consistency

_For any_ desktop viewport (width ≥ 1024px) rendering the FindOnMapQuestion component, the fixed component SHALL apply background color #f0f2f8 to the parent container, ensuring visual consistency with the application's color scheme and eliminating white gaps.

**Validates: Requirements 2.2**

Property 3: Bug Condition - Mobile Layout Optimization

_For any_ mobile viewport (width < 1024px) rendering the FindOnMapQuestion component, the fixed layout SHALL position the header at the top and maximize the map area by repositioning the side panel content to not compete for vertical space, ensuring the map occupies at least 60% of the viewport height.

**Validates: Requirements 2.3**

Property 4: Bug Condition - Geographical Accuracy for All Continents

_For any_ country in Asia, Australia, or Europe rendered in the InteractiveMap component, the fixed map data SHALL display the country with geographically correct and proportional shapes, either through corrected SVG path data or integration of an accurate map data source.

**Validates: Requirements 2.4**

Property 5: Preservation - Multi-Continent View Unchanged

_For any_ game session where multiple continents (2-5) are selected, the fixed InteractiveMap component SHALL produce exactly the same viewBox (0, 0, 1000, 500) and display behavior as the original component, preserving the full world view.

**Validates: Requirements 3.1**

Property 6: Preservation - Desktop Layout Structure

_For any_ desktop viewport rendering the FindOnMapQuestion component where the fixes are applied, the grid layout structure with 25% side panel and 75% map area SHALL remain unchanged from the original component.

**Validates: Requirements 3.2**

Property 7: Preservation - Interactive Features Unchanged

_For any_ user interaction (click, pan, zoom, keyboard) with the InteractiveMap component, the fixed component SHALL produce exactly the same behavior, events, and visual feedback as the original component, preserving all interactive functionality.

**Validates: Requirements 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/components/game/InteractiveMap.vue`

**Function/Section**: `continentBounds` constant and `baseViewBox` computed property

**Specific Changes**:
1. **Update Continent Bounding Boxes**: Review and correct the continentBounds values for each continent to ensure proper framing
   - Verify bounds using actual SVG path data from mapPaths.ts
   - Ensure bounds include appropriate padding for visual balance
   - Test each continent individually to validate centering

2. **Improve ViewBox Calculation**: Enhance the baseViewBox logic to better center single continents
   - Consider aspect ratio of the SVG container when calculating viewBox
   - Add padding/margin to prevent continents from touching viewport edges
   - Ensure the centroid of the continent aligns with the viewport center

**File**: `src/components/game/FindOnMapQuestion.vue`

**Section**: `.find-on-map` and `.map-container` style blocks

**Specific Changes**:
3. **Apply Background Color to Container**: Change the background color of `.find-on-map` from `#ffffff` to `#f0f2f8`
   - This will make the gap between grid items match the application background
   - The side panel `.left-panel` should keep its white background

4. **Optimize Mobile Layout**: Redesign the mobile responsive layout to prioritize map visibility
   - Consider changing mobile layout to: fixed header at top, map in center, floating bottom control panel
   - Alternatively: overlay side panel on map with toggle button
   - Ensure map gets minimum 60% viewport height on mobile
   - Add appropriate media queries for tablet (768px-1023px) vs mobile (<768px)

5. **Add Mobile-Specific Map Container Sizing**: Set explicit height constraints for map container on mobile
   - Use `height: 60vh` or similar viewport-based units
   - Ensure the aspect ratio is maintained while maximizing space

**File**: `src/data/mapPaths.ts` (Investigation Required)

**Specific Changes**:
6. **Investigate and Fix SVG Path Data**: Research the root cause of distortions in Asia, Oceania, and Europe
   - Compare current paths with reference data from Natural Earth or other authoritative sources
   - If data source is fundamentally flawed, consider migrating to a different map library
   - Options: D3-geo, TopoJSON, react-simple-maps data, Leaflet with GeoJSON
   - May require script update in `scripts/generateMapPaths.ts`

7. **Validation**: Add visual regression tests or validation script to detect distortions
   - Compare rendered country shapes against reference shapes
   - Calculate geometric similarity metrics
   - Document any known limitations of the chosen map projection

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate each bug on unfixed code, then verify the fix works correctly and preserves existing behavior. Given the visual nature of these bugs, testing will combine automated component tests with manual visual verification.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the four bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that render the components with specific configurations and viewport sizes. Capture snapshots or calculate geometric properties to detect issues. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Single Continent Europe Test**: Set `visibleContinents: ['europe']`, render InteractiveMap, verify viewBox centers Europe (will fail on unfixed code - expect off-center viewBox)
2. **Single Continent Oceania Test**: Set `visibleContinents: ['oceania']`, render InteractiveMap, verify viewBox centers Oceania (will fail on unfixed code - expect poor framing)
3. **Desktop Gap Color Test**: Render FindOnMapQuestion at 1920x1080, inspect computed styles of `.find-on-map` container (will fail on unfixed code - expect white background)
4. **Mobile Layout Test**: Render FindOnMapQuestion at 375x667, measure map container height as percentage of viewport (will fail on unfixed code - expect <50% height)
5. **Asia Country Shape Test**: Render Japan or China on map, compare rendered path area/centroid to reference values (may fail on unfixed code - expect geometric deviation)
6. **Australia Shape Test**: Render Australia, compare aspect ratio and shape metrics (may fail on unfixed code - expect distortion)

**Expected Counterexamples**:
- ViewBox calculation produces off-center coordinates for single continents
- Background color is #ffffff instead of #f0f2f8 in desktop view
- Mobile map container has insufficient height (<60vh)
- SVG path data produces distorted country shapes in specific continents
- Possible causes: incorrect continentBounds coordinates, missing CSS background color, inflexible grid layout, poor source data quality

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := renderMapComponent_fixed(input)
  ASSERT expectedBehavior(result)
END FOR

WHERE expectedBehavior checks:
  - Single continent: viewBox centers the continent properly
  - Desktop: background color is #f0f2f8
  - Mobile: map height >= 60% of viewport
  - Asia/Oceania/Europe countries: shapes match reference geometry
```

**Test Implementation**:
- Unit tests: Verify baseViewBox computation for each single continent
- Component tests: Render FindOnMapQuestion with viewport mocking, measure layout
- Visual regression tests: Capture screenshots of each continent view, compare with reference
- Geometric validation: Calculate centroids and bounds of rendered paths, compare with expected values

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT InteractiveMap_original(input) = InteractiveMap_fixed(input)
  ASSERT FindOnMapQuestion_original(input) = FindOnMapQuestion_fixed(input)
END FOR

WHERE input covers:
  - Multi-continent selections (2-5 continents)
  - Desktop viewport interactions
  - Americas and Africa country rendering
  - All interactive features (click, pan, zoom, hint)
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for multi-continent views, interactive features, and correctly-rendered continents, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Multi-Continent View Preservation**: Render with continents: ['europe', 'asia'] and verify viewBox is (0, 0, 1000, 500), matching unfixed behavior
2. **Desktop Layout Preservation**: Verify grid-template-columns: 25% 75% is unchanged at viewport ≥ 1024px
3. **Click Interaction Preservation**: Simulate country clicks, verify highlighting and answer emission timing (1500ms) unchanged
4. **Pan/Zoom Preservation**: Simulate mouse wheel and drag events, verify scale and translate values match unfixed behavior
5. **Hint Button Preservation**: Click hint button, verify continent name reveals without affecting viewBox
6. **Americas Countries Preservation**: Render USA, Brazil, Mexico - verify shapes unchanged from unfixed code
7. **Africa Countries Preservation**: Render Egypt, South Africa, Nigeria - verify shapes unchanged from unfixed code
8. **Blitz Timer Preservation**: Render in blitz mode, verify timer display and animation triggers unchanged

### Unit Tests

- Test baseViewBox computed property returns correct coordinates for each single continent
- Test baseViewBox returns (0, 0, 1000, 500) for multi-continent selections
- Test mobile media query applies correct grid-template-rows instead of grid-template-columns
- Test background color CSS variable or class application in desktop view
- Test map container height calculation in mobile view
- Test continentBounds accuracy against actual SVG path boundaries

### Property-Based Tests

- Generate random single-continent selections, verify all produce centered viewBoxes within valid coordinate ranges
- Generate random multi-continent combinations (2-5 continents), verify all produce default world viewBox
- Generate random viewport sizes (300-2000px width), verify layout switches correctly at 1024px breakpoint
- Generate random country selections across all continents, verify Americas/Africa preserve original shapes while Asia/Oceania/Europe improve
- Generate random pan/zoom interactions, verify scale and translate values stay within defined limits (scale: 0.5-5)

### Integration Tests

- Test full game flow: start session with single continent, verify map centers correctly, click country, verify answer registers
- Test continent switching: play question with all continents, then start new session with single continent, verify viewBox updates correctly
- Test mobile flow: resize viewport to mobile, verify layout adapts, interact with map, verify functionality preserved
- Test responsive breakpoint: resize from desktop to mobile and back, verify layout transitions smoothly without breaking state
- Test visual feedback loop: click wrong country, verify red highlighting, verify correct country shows in green, verify feedback message appears
- Test hint interaction on single continent: reveal hint, verify continent name appears, verify map centering unaffected
- Test blitz mode on mobile: verify timer displays correctly, verify map still usable with reduced space
