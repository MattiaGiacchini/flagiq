# flagIQ

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Map Data Generation

FlagIQ uses real-world geographic data from Natural Earth for the "Find on Map" game mode. The map data is pre-generated and stored in `src/data/mapPaths.ts`.

### Prerequisites

The following development dependencies are required for map generation:

```sh
npm install --save-dev world-atlas d3-geo topojson-client
```

These dependencies are already included in `package.json` and will be installed with `npm install`.

### Generating Map Data

To regenerate the map data from Natural Earth TopoJSON:

```sh
npm run generate:map
```

This command executes the `scripts/generateMapPaths.ts` script, which:

1. Loads Natural Earth 50m resolution TopoJSON data from the `world-atlas` package
2. Converts TopoJSON geometries to GeoJSON features
3. Projects geographic coordinates to SVG paths using d3-geo Equirectangular projection
4. Calculates centroids for small countries (< 100px² area) to ensure clickability
5. Writes the generated data to `src/data/mapPaths.ts`

### Expected Output

When the generation completes successfully, you should see:

```
✅ PATH GENERATION COMPLETED SUCCESSFULLY
============================================================
📊 Summary Statistics:
  - Total countries processed: 245
  - Generated file: /path/to/src/data/mapPaths.ts
  - File size: ~250 KB
  - Execution time: < 10 seconds

📍 Countries by continent:
  - Europe: 50
  - Asia: 50
  - Americas: 35
  - Africa: 54
  - Oceania: 14
============================================================
```

### Success Indicators

- ✅ Script exits with code 0
- ✅ File `src/data/mapPaths.ts` is created/updated
- ✅ File size is approximately 250 KB (< 300 KB)
- ✅ Console shows "PATH GENERATION COMPLETED SUCCESSFULLY"
- ✅ No errors about missing ISO codes or empty paths
- ✅ Cross-reference validation shows all countries synchronized with `flags.ts`

### Troubleshooting

#### Error: "world-atlas package not found"

**Problem:** The `world-atlas` npm package is not installed.

**Solution:**
```sh
npm install --save-dev world-atlas
```

#### Error: "Cannot find module 'd3-geo'"

**Problem:** Missing d3-geo or topojson-client dependencies.

**Solution:**
```sh
npm install --save-dev d3-geo topojson-client
```

#### Warning: "Countries in FLAGS but MISSING from MAP_COUNTRIES"

**Problem:** Some countries in `flags.ts` don't have corresponding geographic data in Natural Earth.

**Impact:** These countries won't be clickable on the map.

**Solution:** This is expected for certain territories. Review the list and update `flags.ts` if needed, or add custom mapping in the generation script.

#### Warning: "Centroid out of viewBox bounds"

**Problem:** A calculated centroid falls outside the SVG viewBox (0-1000, 0-500).

**Impact:** Small country overlay circle won't be visible.

**Solution:** This is usually harmless. If it affects a critical country, adjust the projection parameters in the script.

#### Error: "Empty path generated for country"

**Problem:** d3-geo generated an empty SVG path for a country.

**Impact:** The country will be skipped and won't appear on the map.

**Solution:** Check the TopoJSON source data for that country. This may indicate invalid geometry in the source data.

### Validation

After generation, run the test suite to validate the data:

```sh
npm run test:unit -- scripts/generateMapPaths.test.ts
```

This validates:
- ISO code format (must match `/^[A-Z]{2}$/`)
- Continent values are valid
- All country IDs are unique
- Path data is non-empty
- Centroid format is correct when present

### Advanced: Customizing the Generation

The generation script is located at `scripts/generateMapPaths.ts`. You can modify:

- **Projection parameters:** Change scale or translation in the `geoEquirectangular()` configuration
- **Resolution:** Switch between 110m (low), 50m (medium), or 10m (high) Natural Earth data
- **Small country threshold:** Adjust `SMALL_COUNTRY_THRESHOLD` constant (default: 100px²)
- **Precision:** Modify `.precision()` value for balance between file size and detail (default: 0.1)

After modifications, regenerate the data and run tests to ensure validity.

### Updating Map Data

For detailed information about updating the world-atlas package and regenerating map data after Natural Earth updates, see the comprehensive guide:

**[Map Data Update Workflow](./docs/MAP_DATA_UPDATE.md)**

This guide covers:
- When to update map data
- Step-by-step update procedures
- Validation and testing steps
- Common issues and solutions
- Rollback procedures
