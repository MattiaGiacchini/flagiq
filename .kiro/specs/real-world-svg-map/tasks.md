# Implementation Plan: Real-World SVG Map

## Overview

This implementation replaces placeholder SVG paths in the FlagIQ map with accurate real-world geography from Natural Earth. The approach uses a TypeScript script to convert Natural Earth TopoJSON data (50m resolution) to SVG paths via d3-geo, generating an updated `mapPaths.ts` file. No changes are needed to Vue components—the existing `InteractiveMap.vue` and `FindOnMapQuestion.vue` will work with the new data automatically.

**Key deliverables:**
- TypeScript script to generate SVG paths from Natural Earth TopoJSON
- Updated `mapPaths.ts` with 245 countries using real-world geometries
- Unit tests validating data integrity (ISO codes, continents, path validity)
- Integration tests verifying component compatibility
- Documentation for running the script and updating data

## Tasks

- [x] 1. Set up project dependencies and script structure
  - Install required dev dependencies: `world-atlas@^2.0.2`, `d3-geo@^3.1.0`, `topojson-client@^3.1.0`
  - Create `scripts/` directory if it doesn't exist
  - Create `scripts/generateMapPaths.ts` as the main generation script
  - Configure TypeScript for Node.js execution in scripts directory
  - _Requirements: 2.1, 2.2, 13.1, 13.2, 13.3, 16.1_

- [x] 2. Implement TopoJSON loading and conversion
  - [x] 2.1 Implement TopoJSON file loading from world-atlas package
    - Import and read `countries-50m.json` from world-atlas package
    - Validate TopoJSON structure (type === 'Topology', has objects.countries)
    - Convert TopoJSON to GeoJSON features using topojson-client
    - Handle file not found error with descriptive message
    - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 12.1, 12.2, 18.1_
  
  - [ ]* 2.2 Write unit tests for TopoJSON loading
    - Test successful loading of valid TopoJSON file
    - Test error handling for missing file
    - Test error handling for invalid TopoJSON structure
    - _Requirements: 12.1, 12.2_

- [x] 3. Implement SVG path generation with d3-geo
  - [x] 3.1 Configure d3-geo projection and path generator
    - Create d3.geoEquirectangular projection with scale 160, translate [500, 250]
    - Set precision to 0.1 for optimal file size vs detail balance
    - Create path generator using the projection
    - _Requirements: 2.5, 2.6, 5.3, 5.4, 8.1_
  
  - [x] 3.2 Implement SVG path generation for each country
    - Iterate through GeoJSON features
    - Generate SVG path string using d3-geo path generator
    - Handle MultiPolygon geometries (countries with multiple islands)
    - Skip countries with empty paths and log errors
    - _Requirements: 2.3, 2.8, 5.1, 5.2, 5.5, 12.3_

- [x] 4. Implement ISO code extraction and validation
  - [x] 4.1 Extract and validate ISO codes from Natural Earth data
    - Extract iso_a2 property from each country feature
    - Skip territories with iso_a2 === "-99" or null (log warning)
    - Validate ISO code format matches /^[A-Z]{2}$/
    - _Requirements: 2.7, 3.1, 3.3, 12.3_
  
  - [ ]* 4.2 Write property test for ISO code uniqueness and format
    - **Property 5: Unicidad de IDs**
    - **Validates: Requirements 3.3, 7.7**
    - Generate test data and verify all ISO codes are unique and match format
    - _Requirements: 3.3, 7.7, 10.1, 10.5_

- [x] 5. Implement continent mapping
  - [x] 5.1 Create continent mapping function
    - Map Natural Earth continent names to application continent codes
    - "Europe" → "europe", "Asia" → "asia"
    - "North America" | "South America" → "americas"
    - "Africa" → "africa", "Oceania" → "oceania"
    - Skip "Antarctica" countries
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [ ]* 5.2 Write unit tests for continent mapping
    - Test each continent mapping case
    - Test Antarctica exclusion
    - Test invalid continent handling
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 10.2_

- [x] 6. Implement small country centroid calculation
  - [x] 6.1 Calculate centroids for small countries
    - Calculate bounding box for each country using path generator
    - Compute area from bounding box dimensions
    - If area < 100 square pixels, calculate centroid using d3-geo
    - Store centroid as [x, y] array or undefined for large countries
    - Validate centroid coordinates are within viewBox [0-1000, 0-500]
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 6.2 Write unit tests for centroid calculation
    - Test centroid calculation for small countries
    - Test undefined centroid for large countries
    - Test centroid coordinates within valid range
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 10.4_

- [x] 7. Checkpoint - Ensure core conversion logic is working
  - Run the script manually to verify it processes Natural Earth data
  - Check console output for any errors or warnings
  - Verify intermediate data structures look correct
  - Ensure all tests pass, ask the user if questions arise

- [x] 8. Implement TypeScript file generation
  - [x] 8.1 Generate mapPaths.ts file with proper TypeScript structure
    - Create TypeScript output with MapCountry interface import
    - Generate MAP_COUNTRIES array with all processed countries
    - Format output with proper indentation and TypeScript syntax
    - Write output to `src/data/mapPaths.ts`
    - _Requirements: 2.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [x] 8.2 Implement cross-reference validation with FLAGS
    - Load FLAGS array from flags.ts
    - Report countries in FLAGS but missing from MAP_COUNTRIES
    - Report countries in MAP_COUNTRIES but missing from FLAGS
    - Display warnings for any mismatches
    - _Requirements: 3.4, 3.5, 3.6, 12.5_
  
  - [x] 8.3 Implement generation summary and reporting
    - Count countries by continent
    - Calculate generated file size
    - Display success message with statistics
    - Report total countries processed (should be 245)
    - Report execution time
    - _Requirements: 2.9, 5.6, 12.4, 16.2, 16.4, 16.5_

- [x] 9. Run generation script and update mapPaths.ts
  - [x] 9.1 Execute the generation script
    - Run `node --loader ts-node/esm scripts/generateMapPaths.ts` or equivalent
    - Verify script completes successfully with exit code 0
    - Review console output for any warnings or errors
    - _Requirements: 16.1, 16.2, 16.3_
  
  - [x] 9.2 Validate generated mapPaths.ts file
    - Check file size is under 300KB
    - Verify file contains 245 country entries
    - Verify TypeScript syntax is valid
    - Ensure imports and exports are correct
    - _Requirements: 5.6, 9.1, 11.1_

- [ ] 10. Implement data validation unit tests
  - [ ]* 10.1 Write unit tests for ISO code validation
    - Test all countries have valid ISO 3166-1 alpha-2 format
    - Test all ISO codes exist in FLAGS array
    - Test all ISO codes are unique
    - _Requirements: 3.3, 3.4, 10.1, 10.5_
  
  - [ ]* 10.2 Write unit tests for continent validation
    - Test all countries have valid continent values
    - Test continent values are in allowed set
    - _Requirements: 4.7, 10.2_
  
  - [ ]* 10.3 Write unit tests for path data validation
    - Test all countries have non-empty pathData
    - Test pathData contains valid SVG commands
    - Test pathData matches security pattern /^[MLCZmlcz0-9.,\s-]+$/
    - _Requirements: 5.1, 5.2, 10.3, 18.2, 18.5_
  
  - [ ]* 10.4 Write property test for viewBox coordinate constraints
    - **Property 2: Completitud de ViewBox**
    - **Validates: Requirements 5.3, 5.4**
    - Parse all path coordinates and verify they're within viewBox bounds
    - _Requirements: 5.3, 5.4_

- [ ] 11. Implement integration tests for component compatibility
  - [ ]* 11.1 Write integration test for InteractiveMap rendering
    - Test InteractiveMap renders all countries for selected continents
    - Test continent filtering works correctly
    - Test countries are rendered as path elements with correct IDs
    - _Requirements: 8.1, 8.2, 14.1, 14.2_
  
  - [ ]* 11.2 Write integration test for country interaction
    - Test click events emit correct ISO codes
    - Test hover states work on country paths
    - Test small countries with centroids have clickable circle overlays
    - _Requirements: 8.3, 8.6, 8.7_
  
  - [ ]* 11.3 Write integration test for country highlighting
    - Test correct answer highlighting (green) works
    - Test incorrect answer highlighting (red) works
    - Test highlighted countries are visually distinguishable
    - _Requirements: 8.4, 8.5, 14.3, 14.4_
  
  - [ ]* 11.4 Write integration test for internationalization
    - Test country names display correctly in English locale
    - Test country names display correctly in Spanish locale
    - Test locale switching updates country labels
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [x] 12. Checkpoint - Verify all tests pass
  - Run all unit tests with `npm run test:unit`
  - Run all integration tests
  - Fix any failing tests
  - Ensure all tests pass, ask the user if questions arise

- [x] 13. Perform visual verification and manual testing
  - [x] 13.1 Visual verification of major countries
    - Start development server
    - Navigate to Find on Map mode
    - Verify major countries (US, Russia, Brazil, China, Australia, India) are visually recognizable
    - Verify continent filtering shows/hides correct countries
    - _Requirements: 11.3, 14.1, 14.2_
  
  - [x] 13.2 Test small country clickability
    - Test clicking on small countries (Monaco, Vatican, San Marino, Liechtenstein)
    - Verify centroid overlays render as clickable circles
    - Verify clicks on small countries register correctly
    - _Requirements: 8.7, 6.2, 6.3_
  
  - [x] 13.3 Test interactive features
    - Verify hover effects work on all visible countries
    - Verify correct/incorrect highlighting appears on answer feedback
    - Test game flow in Find on Map mode with new geography
    - Verify performance feels smooth (no lag on hover/click)
    - _Requirements: 8.6, 8.4, 8.5, 9.2, 9.3, 9.4_

- [ ] 14. Create documentation for script usage
  - [-] 14.1 Document generation script in README or separate doc
    - Document how to install dependencies
    - Document how to run the generation script
    - Document expected output and success indicators
    - Document troubleshooting common errors
    - _Requirements: 17.2, 17.3_
  
  - [-] 14.2 Document data update workflow
    - Document how to update world-atlas package
    - Document how to regenerate map data after updates
    - Document validation steps after regeneration
    - _Requirements: 17.1, 17.4_

- [x] 15. Final checkpoint - Complete validation
  - Run full test suite (unit + integration)
  - Verify file size is under 300KB
  - Verify all 245 countries are present
  - Verify no console errors in development mode
  - Verify game works end-to-end in both English and Spanish
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for faster MVP
- The existing Vue components (`InteractiveMap.vue`, `FindOnMapQuestion.vue`) require NO modifications
- The MapCountry interface remains unchanged, ensuring complete backward compatibility
- Natural Earth data is public domain, requiring no licensing fees
- The script is run once during development; the generated `mapPaths.ts` is committed to source control
- Use TypeScript for the generation script to match the project's existing tooling
- d3-geo and topojson-client are dev dependencies only—they don't increase production bundle size
- The 50m resolution provides optimal balance: detailed enough for recognition, small enough for performance
- All 245 countries must have valid ISO codes matching the existing FLAGS array
- Small countries (area < 100px²) automatically get centroid overlays for clickability
- Equirectangular projection is used for simplicity and geographic neutrality
- Each property test validates universal correctness properties from the design document
- Unit tests validate specific data integrity requirements

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "5.1", "6.1"] },
    { "id": 2, "tasks": ["2.2", "4.2", "5.2", "6.2", "3.2"] },
    { "id": 3, "tasks": ["8.1", "8.2"] },
    { "id": 4, "tasks": ["8.3", "9.1"] },
    { "id": 5, "tasks": ["9.2", "10.1", "10.2", "10.3"] },
    { "id": 6, "tasks": ["10.4", "11.1", "11.2"] },
    { "id": 7, "tasks": ["11.3", "11.4", "13.1"] },
    { "id": 8, "tasks": ["13.2", "13.3", "14.1"] },
    { "id": 9, "tasks": ["14.2"] }
  ]
}
```
