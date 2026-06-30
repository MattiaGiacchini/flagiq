# Requirements Document

## Introduction

This document specifies the requirements for replacing placeholder SVG map paths with accurate real-world geography in the FlagIQ Find on Map game mode. The system shall use Natural Earth TopoJSON data converted to SVG paths via d3-geo, maintaining existing architecture, visual design, and all interactive functionality while providing geographically accurate representations of all 245 countries.

## Glossary

- **Map_System**: The complete map rendering subsystem including data generation, storage, and interactive display
- **Generation_Script**: The Node.js script (generateMapPaths.js) that converts Natural Earth TopoJSON to SVG paths
- **Map_Data_File**: The TypeScript file (mapPaths.ts) containing SVG path definitions for all countries
- **Interactive_Map**: The Vue component (InteractiveMap.vue) that renders the SVG map and handles user interaction
- **Natural_Earth**: Public domain geographic dataset providing country boundaries in TopoJSON format
- **SVG_Path**: Scalable Vector Graphics path definition using commands (M, L, C, Z) and coordinates
- **ISO_Code**: ISO 3166-1 alpha-2 two-letter country code (e.g., 'US', 'FR', 'JP')
- **Centroid**: Center point [x, y] coordinate for small countries to ensure clickability
- **ViewBox**: SVG coordinate system defining the visible area (0 0 1000 500)
- **TopoJSON**: Topology-preserving GeoJSON format that is ~80% smaller than GeoJSON
- **Projection**: Mathematical transformation mapping geographic coordinates to screen coordinates
- **Small_Country**: A country whose rendered area is less than 100 square pixels
- **Continent_Filter**: User-selected continents determining which countries are visible
- **Country_Highlighting**: Visual feedback showing correct (green) or incorrect (red) answers

## Requirements

### Requirement 1: Geographic Data Source

**User Story:** As a user, I want to see accurate real-world country shapes, so that I can learn geography correctly and recognize countries by their actual boundaries.

#### Acceptance Criteria

1. THE Map_System SHALL use Natural Earth TopoJSON data at 50m resolution as the geographic data source
2. THE Map_System SHALL use data from the world-atlas NPM package version 2.0.2 or compatible
3. THE Natural_Earth data SHALL be in the public domain requiring no licensing fees
4. THE Map_System SHALL process countries-50m.json file from world-atlas package

### Requirement 2: Data Conversion Script

**User Story:** As a developer, I want an automated script to generate map data, so that I can update geographic data without manual path creation.

#### Acceptance Criteria

1. THE Generation_Script SHALL load TopoJSON data from world-atlas package
2. WHEN the Generation_Script executes, THE Generation_Script SHALL convert TopoJSON geometries to GeoJSON features using topojson-client
3. WHEN the Generation_Script processes a country, THE Generation_Script SHALL generate SVG path strings using d3-geo library
4. WHEN the Generation_Script completes, THE Generation_Script SHALL write a valid TypeScript file to src/data/mapPaths.ts
5. THE Generation_Script SHALL use d3.geoEquirectangular projection with scale 160 and translation [500, 250]
6. THE Generation_Script SHALL set path precision to 0.1 for optimal balance between detail and file size
7. WHEN a country has iso_a2 property equal to "-99" or null, THE Generation_Script SHALL skip that territory and log a warning
8. WHEN the Generation_Script generates an empty SVG path for a country, THE Generation_Script SHALL log an error and skip that country
9. THE Generation_Script SHALL report the total number of countries processed by continent

### Requirement 3: ISO Code Mapping

**User Story:** As a developer, I want all countries to use standard ISO codes, so that the map data integrates with the existing flag data system.

#### Acceptance Criteria

1. WHEN the Generation_Script processes a country, THE Generation_Script SHALL extract the iso_a2 property as the country ID
2. THE Map_Data_File SHALL contain only countries with valid ISO 3166-1 alpha-2 codes
3. FOR ALL countries in Map_Data_File, the ISO_Code SHALL match the format /^[A-Z]{2}$/
4. FOR ALL countries in Map_Data_File, the ISO_Code SHALL exist in the FLAGS array from flags.ts
5. WHEN the Generation_Script completes, THE Generation_Script SHALL report any countries in FLAGS that are missing from Map_Data_File
6. WHEN the Generation_Script completes, THE Generation_Script SHALL report any countries in Map_Data_File that are missing from FLAGS

### Requirement 4: Continent Classification

**User Story:** As a user, I want to filter countries by continent, so that I can practice geography for specific regions.

#### Acceptance Criteria

1. WHEN the Generation_Script processes a country with continent "Europe", THE Generation_Script SHALL assign continent value "europe"
2. WHEN the Generation_Script processes a country with continent "Asia", THE Generation_Script SHALL assign continent value "asia"
3. WHEN the Generation_Script processes a country with continent "North America" or "South America", THE Generation_Script SHALL assign continent value "americas"
4. WHEN the Generation_Script processes a country with continent "Africa", THE Generation_Script SHALL assign continent value "africa"
5. WHEN the Generation_Script processes a country with continent "Oceania", THE Generation_Script SHALL assign continent value "oceania"
6. WHEN the Generation_Script processes a country with continent "Antarctica", THE Generation_Script SHALL skip that country
7. FOR ALL countries in Map_Data_File, the continent value SHALL be one of: "europe", "asia", "americas", "africa", "oceania"

### Requirement 5: SVG Path Generation

**User Story:** As a user, I want all countries to be visible on the map, so that I can identify and select any country in the game.

#### Acceptance Criteria

1. FOR ALL countries in Map_Data_File, the pathData property SHALL contain a non-empty string
2. FOR ALL countries in Map_Data_File, the pathData SHALL contain at least one valid SVG path command (M, L, C, or Z)
3. FOR ALL coordinates in any pathData, the x coordinate SHALL be within the range [0, 1000]
4. FOR ALL coordinates in any pathData, the y coordinate SHALL be within the range [0, 500]
5. WHEN a country has MultiPolygon geometry (multiple islands), THE Generation_Script SHALL combine all polygons into a single SVG path with multiple M commands
6. THE Map_Data_File SHALL contain exactly 245 country entries

### Requirement 6: Small Country Handling

**User Story:** As a user, I want to be able to click on small countries like Vatican or Monaco, so that I can answer questions about all countries regardless of their size.

#### Acceptance Criteria

1. WHEN the Generation_Script processes a country, THE Generation_Script SHALL calculate the bounding box area in pixels
2. WHEN a country has bounding box area less than 100 square pixels, THE Generation_Script SHALL calculate the centroid coordinates using d3-geo
3. WHEN a country has bounding box area less than 100 square pixels, THE Generation_Script SHALL store the centroid as [x, y] array
4. WHEN a country has bounding box area greater than or equal to 100 square pixels, THE Generation_Script SHALL set centroid to undefined
5. FOR ALL countries with defined centroid, the centroid[0] value SHALL be within range [0, 1000]
6. FOR ALL countries with defined centroid, the centroid[1] value SHALL be within range [0, 500]

### Requirement 7: Map Data File Structure

**User Story:** As a developer, I want the map data file to maintain the existing TypeScript interface, so that no changes are required to Vue components.

#### Acceptance Criteria

1. THE Map_Data_File SHALL export a constant named MAP_COUNTRIES
2. THE MAP_COUNTRIES constant SHALL be an array of objects conforming to the MapCountry interface
3. FOR ALL entries in MAP_COUNTRIES, the object SHALL have an id property of type string
4. FOR ALL entries in MAP_COUNTRIES, the object SHALL have a pathData property of type string
5. FOR ALL entries in MAP_COUNTRIES, the object SHALL have a continent property of type Continent
6. FOR ALL entries in MAP_COUNTRIES, the object MAY have a centroid property of type [number, number] or undefined
7. FOR ALL id values in MAP_COUNTRIES, the id SHALL be unique within the array

### Requirement 8: Component Compatibility

**User Story:** As a user, I want all existing map interactions to work identically, so that the game experience remains consistent.

#### Acceptance Criteria

1. THE Interactive_Map component SHALL render all countries without code modifications
2. WHEN a Continent_Filter is applied, THE Interactive_Map SHALL display only countries matching the selected continents
3. WHEN a country is clicked, THE Interactive_Map SHALL emit the country's ISO_Code
4. WHEN a correct answer is given, THE Interactive_Map SHALL apply green highlighting to the country path
5. WHEN an incorrect answer is given, THE Interactive_Map SHALL apply red highlighting to the country path
6. WHEN a user hovers over a country, THE Interactive_Map SHALL change the country's visual appearance
7. FOR ALL countries with defined centroid, THE Interactive_Map SHALL render a clickable circle overlay at the centroid coordinates

### Requirement 9: Performance Requirements

**User Story:** As a user, I want the map to load and respond quickly, so that the game feels smooth and responsive.

#### Acceptance Criteria

1. THE Map_Data_File size SHALL be less than 300 kilobytes
2. WHEN the map renders for the first time, THE rendering time SHALL be less than 16 milliseconds
3. WHEN a user hovers over a country, THE visual response SHALL occur within 50 milliseconds
4. WHEN a user clicks a country, THE event handling SHALL complete within 50 milliseconds
5. THE Map_Data_File SHALL load in less than 100 milliseconds on a 3G network connection

### Requirement 10: Data Validation

**User Story:** As a developer, I want automated validation of map data, so that I can detect data quality issues before deployment.

#### Acceptance Criteria

1. THE Map_System SHALL provide unit tests that validate ISO_Code format for all countries
2. THE Map_System SHALL provide unit tests that validate continent values for all countries
3. THE Map_System SHALL provide unit tests that validate pathData is non-empty for all countries
4. THE Map_System SHALL provide unit tests that validate centroid format when present
5. THE Map_System SHALL provide unit tests that validate uniqueness of all ISO_Codes
6. THE Map_System SHALL provide unit tests that validate all ISO_Codes exist in FLAGS array

### Requirement 11: Round-Trip Path Preservation

**User Story:** As a developer, I want to ensure that the SVG paths accurately represent the geographic data, so that the visual representation matches the source data.

#### Acceptance Criteria

1. WHEN the Generation_Script converts TopoJSON to SVG paths, THE resulting paths SHALL represent the same geographic boundaries as the input data
2. FOR ALL countries in Map_Data_File, parsing and rendering the pathData SHALL produce a recognizable country shape
3. THE Map_System SHALL provide integration tests that verify visually that major countries (US, Russia, Brazil, China, Australia) are recognizable

### Requirement 12: Error Handling and Reporting

**User Story:** As a developer, I want clear error messages when data generation fails, so that I can quickly diagnose and fix issues.

#### Acceptance Criteria

1. IF the world-atlas package is not installed, THEN THE Generation_Script SHALL display an error message indicating the missing package and exit with code 1
2. IF the TopoJSON file structure is invalid, THEN THE Generation_Script SHALL display an error message describing the structural issue and exit with code 1
3. WHEN the Generation_Script skips a territory due to invalid ISO code, THE Generation_Script SHALL log a warning message including the territory name
4. WHEN the Generation_Script completes successfully, THE Generation_Script SHALL display a summary including country counts by continent and total file size
5. IF any country in FLAGS is missing from Map_Data_File after generation, THEN THE Generation_Script SHALL display a warning listing the missing countries

### Requirement 13: Development Dependencies

**User Story:** As a developer, I want all required libraries installed as dev dependencies, so that the production bundle remains lightweight.

#### Acceptance Criteria

1. THE Map_System SHALL require topojson-client version 3.1.0 or compatible as a dev dependency
2. THE Map_System SHALL require d3-geo version 3.1.0 or compatible as a dev dependency
3. THE Map_System SHALL require world-atlas version 2.0.2 or compatible as a dev dependency
4. THE Map_System SHALL NOT include topojson-client, d3-geo, or world-atlas in production dependencies
5. THE production bundle SHALL NOT include any of the data generation libraries

### Requirement 14: Visual Design Preservation

**User Story:** As a user, I want the map to look the same as before, so that the visual experience remains familiar.

#### Acceptance Criteria

1. THE Interactive_Map SHALL maintain the existing SVG viewBox dimensions of 1000x500
2. THE Interactive_Map SHALL maintain the existing panel layout with controls on the left and map on the right
3. THE Interactive_Map SHALL maintain the existing color scheme for country highlighting
4. THE Interactive_Map SHALL maintain the existing hover effects and transitions
5. THE Interactive_Map SHALL maintain the existing ARIA labels and accessibility features

### Requirement 15: Internationalization Support

**User Story:** As a multilingual user, I want country names to display in my selected language, so that I can play in my preferred language.

#### Acceptance Criteria

1. THE Interactive_Map SHALL continue to support English and Spanish locales
2. WHEN the locale is set to English, THE country names SHALL display in English
3. WHEN the locale is set to Spanish, THE country names SHALL display in Spanish
4. THE ISO_Code-based country naming SHALL remain functional after map data update

### Requirement 16: Script Execution and Output

**User Story:** As a developer, I want to run the generation script easily, so that I can update map data when needed.

#### Acceptance Criteria

1. THE Generation_Script SHALL be executable via "node scripts/generateMapPaths.js"
2. WHEN the Generation_Script executes successfully, THE script SHALL exit with code 0
3. WHEN the Generation_Script encounters a fatal error, THE script SHALL exit with a non-zero code
4. THE Generation_Script SHALL output progress information to console during execution
5. THE Generation_Script SHALL complete execution in less than 10 seconds on standard hardware

### Requirement 17: Data Update Workflow

**User Story:** As a developer, I want to update map data when Natural Earth releases new versions, so that the geographic data remains current.

#### Acceptance Criteria

1. WHEN the world-atlas package is updated, THE Generation_Script SHALL process the new data without code modifications
2. THE Map_System SHALL provide documentation describing the data update process
3. THE Map_System SHALL provide documentation listing the commands needed to regenerate map data
4. WHEN map data is regenerated, THE existing unit tests SHALL validate the new data

### Requirement 18: Security and Data Safety

**User Story:** As a developer, I want to ensure that map data generation is safe, so that no malicious code can be injected.

#### Acceptance Criteria

1. THE Generation_Script SHALL validate TopoJSON structure before processing
2. THE Generation_Script SHALL generate SVG paths containing only valid SVG path commands and numeric coordinates
3. THE Generation_Script SHALL NOT use eval() or similar dynamic code execution
4. THE Generation_Script SHALL NOT execute shell commands with user-provided input
5. FOR ALL generated pathData strings, the content SHALL match the pattern /^[MLCZmlcz0-9.,\s-]+$/
