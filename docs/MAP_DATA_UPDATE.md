# Map Data Update Workflow

This document describes the complete workflow for updating the world map geographic data in FlagIQ. Follow these procedures when Natural Earth releases new data versions or when you need to regenerate the map for any reason.

## Table of Contents

1. [Overview](#overview)
2. [When to Update Map Data](#when-to-update-map-data)
3. [Updating world-atlas Package](#updating-world-atlas-package)
4. [Regenerating Map Data](#regenerating-map-data)
5. [Validation Steps](#validation-steps)
6. [Common Issues and Solutions](#common-issues-and-solutions)
7. [Rollback Procedure](#rollback-procedure)

## Overview

FlagIQ's map data comes from Natural Earth, a public domain geographic dataset. The data flows through this pipeline:

```
Natural Earth TopoJSON → world-atlas npm package → generateMapPaths.ts script → mapPaths.ts
```

The `world-atlas` package provides pre-processed TopoJSON data, and our generation script converts it to SVG paths compatible with the interactive map component.

## When to Update Map Data

Update the map data in these situations:

### Required Updates

- **Natural Earth releases major version** with boundary changes or corrections
- **Critical geographic errors** are discovered in the current data
- **New countries are added** to the FLAGS dataset and need map representation

### Optional Updates

- Minor Natural Earth updates with improved precision
- Performance optimizations (changing resolution or precision)
- Projection parameter adjustments for better visual balance

### Update Frequency

- **Recommended:** Review Natural Earth updates quarterly
- **Typical:** Update annually or when significant boundary changes occur
- **As-needed:** Update immediately for critical corrections

## Updating world-atlas Package

### Step 1: Check Current Version

```sh
npm list world-atlas
```

Output example:
```
flagiq@0.0.0 /path/to/flagIQ
└── world-atlas@2.0.2
```

### Step 2: Check for Available Updates

```sh
npm outdated world-atlas
```

Output example:
```
Package       Current  Wanted  Latest  Location
world-atlas   2.0.2    2.0.2   2.1.0   flagIQ
```

### Step 3: Review Changelog

Before updating, review the world-atlas changelog:

```sh
npm view world-atlas versions
npm view world-atlas@<latest-version>
```

Visit the [world-atlas GitHub repository](https://github.com/topojson/world-atlas) to review changes and assess impact.

### Step 4: Update the Package

For patch or minor updates:
```sh
npm update world-atlas
```

For major version updates:
```sh
npm install --save-dev world-atlas@latest
```

### Step 5: Verify Installation

```sh
npm list world-atlas
ls -lh node_modules/world-atlas/countries-50m.json
```

Ensure the TopoJSON file exists and has a reasonable size (~700-900 KB).

## Regenerating Map Data

After updating the `world-atlas` package (or when modifying the generation script), regenerate the map data:

### Step 1: Run the Generation Script

```sh
npm run generate:map
```

**Expected duration:** 5-10 seconds

### Step 2: Review the Generation Output

The script will display detailed progress and statistics. Look for:

#### ✅ Success Indicators

```
✅ PATH GENERATION COMPLETED SUCCESSFULLY
============================================================
📊 Summary Statistics:
  - Total countries processed: 245
  - Generated file: .../src/data/mapPaths.ts
  - File size: 248.5 KB
  - Execution time: 6.3 seconds

📍 Countries by continent:
  - Europe: 50
  - Asia: 50
  - Americas: 35
  - Africa: 54
  - Oceania: 14
  - Total: 245
============================================================
```

#### ⚠️ Warning Signs

```
⚠️  Countries in FLAGS but MISSING from MAP_COUNTRIES:
   Count: 3
   ISO Codes: XK, TW, PS
   → These countries exist in flags.ts but have no map geometry
```

**Action:** Review these discrepancies. Some territories (like Kosovo, Taiwan) may have complex geopolitical status in Natural Earth data.

#### ❌ Error Indicators

```
❌ Invalid ISO code format for Country: -99
❌ Empty path generated for: XX (Country Name)
```

**Action:** Investigate these errors. Empty paths or invalid ISO codes prevent countries from appearing on the map.

### Step 3: Inspect the Generated File

```sh
# Check file size
ls -lh src/data/mapPaths.ts

# View first 50 lines to verify structure
head -n 50 src/data/mapPaths.ts

# Count total countries
grep -c "id: '" src/data/mapPaths.ts
```

**Expected results:**
- File size: 240-260 KB (acceptable range: < 300 KB)
- Proper TypeScript structure with `MAP_COUNTRIES` export
- All entries have `id`, `pathData`, and `continent` properties

### Step 4: Check Git Diff

Review what changed in the generated file:

```sh
git diff src/data/mapPaths.ts
```

**What to look for:**
- Are changes limited to path data and centroids? (Normal)
- Did country IDs change? (Unexpected - investigate)
- Did continents change? (Unexpected - investigate)
- Is the diff size reasonable for the type of update?

## Validation Steps

After regeneration, validate the data quality and application functionality.

### 1. Run Unit Tests

```sh
npm run test:unit -- scripts/generateMapPaths.test.ts
```

This validates:
- ✅ ISO code format for all countries
- ✅ Continent values are valid
- ✅ All country IDs are unique
- ✅ Path data is non-empty
- ✅ Centroid coordinates are valid when present

**Expected output:**
```
✓ scripts/generateMapPaths.test.ts (25 tests) [pass]
  ✓ mapContinentCode function
    ✓ maps Europe correctly
    ✓ maps Asia correctly
    ✓ maps North America to americas
    ...
```

### 2. Run Integration Tests

```sh
npm run test:unit -- src/components/game/InteractiveMap.spec.ts
```

This validates:
- ✅ Map component renders with new data
- ✅ Continent filtering works correctly
- ✅ Country highlighting functions properly
- ✅ Click events work for all countries

### 3. Visual Validation (Manual)

Start the development server:

```sh
npm run dev
```

Navigate to the Find on Map game mode and verify:

#### Geographic Accuracy
- [ ] Major countries (US, Russia, China, Brazil, India) are recognizable
- [ ] Country shapes match expected geography
- [ ] No obvious distortions or artifacts
- [ ] Island nations (Japan, Indonesia, Philippines) show all major islands

#### Interactivity
- [ ] All countries are clickable
- [ ] Small countries (Vatican, Monaco, Singapore) can be clicked
- [ ] Hover effects work smoothly
- [ ] Correct/incorrect highlighting displays properly

#### Continent Filtering
- [ ] Europe filter shows only European countries
- [ ] Asia filter shows only Asian countries
- [ ] Americas filter shows North and South America
- [ ] Africa filter shows only African countries
- [ ] Oceania filter shows Australia, New Zealand, Pacific islands
- [ ] Multiple continent selection works correctly

#### Performance
- [ ] Map loads quickly (< 1 second)
- [ ] No lag when hovering over countries
- [ ] Smooth transitions between questions
- [ ] No console errors or warnings

### 4. Cross-Reference Validation

The generation script automatically validates against `flags.ts`. Review the output:

```
🔍 Cross-Reference Validation: MAP_COUNTRIES ↔ FLAGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Perfect match! All countries are synchronized.
   - FLAGS contains: 245 countries
   - MAP_COUNTRIES contains: 245 countries
   - All ISO codes match
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If there are discrepancies, decide whether to:
- Update `flags.ts` to add missing countries
- Modify the generation script to include missing territories
- Document known exclusions (e.g., Antarctica, disputed territories)

### 5. Run Full Test Suite

```sh
npm run test:unit
npm run test:e2e
```

Ensure all tests pass, including unrelated components, to confirm no regressions.

### 6. Performance Benchmarking

Optional but recommended for major updates:

```sh
# Build production bundle
npm run build

# Check bundle size
ls -lh dist/assets/*.js

# Verify map data isn't duplicated in bundle
grep -c "pathData" dist/assets/*.js
```

**Expected:** Map data should appear only once in the bundle.

## Common Issues and Solutions

### Issue 1: Missing Countries After Update

**Symptoms:**
- Countries from `flags.ts` not appearing in generated `mapPaths.ts`
- Cross-reference validation shows discrepancies

**Root causes:**
- Natural Earth changed ISO codes
- Countries removed from Natural Earth data
- Territories reclassified or merged

**Solution:**
1. Check Natural Earth changelog for country changes
2. Update the `buildCountryNameToISOMapping()` function in `generateMapPaths.ts` to add name variations
3. For disputed territories, decide on inclusion/exclusion policy
4. Document any permanent exclusions in code comments

### Issue 2: Distorted Country Shapes

**Symptoms:**
- Countries appear stretched or compressed
- Shapes don't match expected geography

**Root causes:**
- Projection parameters changed
- Incorrect scale or translation
- ViewBox mismatch

**Solution:**
1. Verify projection parameters in `generateMapPaths.ts`:
   ```typescript
   const projection = geoEquirectangular()
     .scale(160)           // Should be 160
     .translate([500, 250]) // Should be [500, 250]
   ```
2. Ensure SVG viewBox is `0 0 1000 500` in `InteractiveMap.vue`
3. Regenerate after fixing parameters

### Issue 3: File Size Too Large

**Symptoms:**
- Generated `mapPaths.ts` exceeds 300 KB
- Slower page load times

**Root causes:**
- Using 10m resolution instead of 50m
- Precision set too low (too much detail)
- Too many countries included

**Solution:**
1. Verify using 50m resolution:
   ```typescript
   const TOPOJSON_PATH = 'node_modules/world-atlas/countries-50m.json'
   ```
2. Adjust precision for more simplification:
   ```typescript
   .precision(0.2)  // Increase from 0.1 to 0.2
   ```
3. Regenerate and test visual quality vs. file size

### Issue 4: Small Countries Not Clickable

**Symptoms:**
- Vatican, Monaco, Singapore, or other small countries can't be clicked
- No centroid overlay circles visible

**Root causes:**
- Centroid calculation failed
- Threshold too high
- Centroid coordinates outside viewBox

**Solution:**
1. Check generation output for centroid warnings
2. Adjust `SMALL_COUNTRY_THRESHOLD` if needed:
   ```typescript
   const SMALL_COUNTRY_THRESHOLD = 150  // Increase from 100
   ```
3. Verify centroids are within viewBox bounds [0-1000, 0-500]
4. Regenerate and test clicking small countries

### Issue 5: Script Fails to Execute

**Symptoms:**
- Script crashes with error
- No output generated

**Common errors and solutions:**

#### "Cannot find module 'world-atlas'"
```sh
npm install --save-dev world-atlas
```

#### "ENOENT: no such file or directory"
```sh
# Ensure you're in the project root
cd /path/to/flagIQ
npm run generate:map
```

#### "Invalid TopoJSON structure"
```sh
# Re-install world-atlas
npm uninstall world-atlas
npm install --save-dev world-atlas@2.0.2
```

#### TypeScript execution error
```sh
# Ensure jiti is installed (for TS execution)
npm install --save-dev jiti
```

## Rollback Procedure

If the updated map data causes issues, you can rollback to the previous version:

### Option 1: Git Revert (Recommended)

If you committed the changes:

```sh
# Find the commit hash
git log --oneline src/data/mapPaths.ts

# Revert to previous version
git checkout <previous-commit-hash> -- src/data/mapPaths.ts

# Verify the file was restored
git diff src/data/mapPaths.ts

# Commit the rollback
git commit -m "Revert map data to previous version"
```

### Option 2: Stash Changes

If you haven't committed:

```sh
# Stash the new version
git stash

# Verify original version is restored
head -n 20 src/data/mapPaths.ts

# If needed, retrieve stashed changes later
git stash pop
```

### Option 3: Regenerate from Previous Package Version

If the issue is with the `world-atlas` package:

```sh
# Downgrade to previous version
npm install --save-dev world-atlas@2.0.2

# Regenerate map data
npm run generate:map

# Verify and test
npm run test:unit
```

### After Rollback

1. Document the issue that caused the rollback
2. Investigate root cause before attempting update again
3. Consider adding regression tests for the specific issue
4. Update this document with lessons learned

## Best Practices

### Before Updating

- [ ] Review Natural Earth and world-atlas changelogs
- [ ] Create a git branch for the update
- [ ] Document the current version numbers
- [ ] Run all tests to establish baseline
- [ ] Backup current `mapPaths.ts` (git handles this, but document commit hash)

### During Update

- [ ] Update one component at a time (package, then regenerate)
- [ ] Review generation script output carefully
- [ ] Inspect git diff before committing
- [ ] Take screenshots of map before/after for comparison
- [ ] Test on multiple browsers if visual changes are significant

### After Update

- [ ] Run complete test suite
- [ ] Perform manual visual validation
- [ ] Check bundle size hasn't increased significantly
- [ ] Update documentation if procedures changed
- [ ] Tag the release in git with version info
- [ ] Monitor for user reports of geographic issues

## Maintenance Schedule

### Monthly
- Check for world-atlas package updates

### Quarterly
- Review Natural Earth changelog for significant updates
- Run generation script to verify it still works
- Run validation tests

### Annually
- Perform full map data update cycle
- Review and update this documentation
- Evaluate if projection or resolution should be adjusted
- Consider geographic accuracy improvements

## Additional Resources

- [Natural Earth Data](https://www.naturalearthdata.com/) - Official data source
- [world-atlas GitHub](https://github.com/topojson/world-atlas) - NPM package repository
- [d3-geo Documentation](https://github.com/d3/d3-geo) - Projection and path generation
- [TopoJSON Specification](https://github.com/topojson/topojson-specification) - Data format reference
- [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) - Country code standard

## Contact and Support

For issues with map data generation:

1. Check this document's troubleshooting section
2. Review the generation script comments in `scripts/generateMapPaths.ts`
3. Check project issues for similar problems
4. Review test output for specific error details

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintained by:** FlagIQ Development Team
