# Technical Design Document

## Overview

This design document details the technical implementation for replacing emoji flags with real flag images throughout the FlagIQ application. The solution downloads all 197 flag images locally to `public/flags/`, implements a reusable FlagImage.vue component with robust fallback handling, updates the data model, and ensures no white borders or vertical scrolling during gameplay.

**Key Decisions**:
- Store all flag images locally in `public/flags/` directory for instant loading and offline availability
- Create one-time download script (scripts/downloadFlags.ts) that fetches flags from flagcdn.com
- Prefer SVG format for scalability, fallback to PNG high-resolution when SVG unavailable
- Build reusable FlagImage component with automatic SVG→PNG→emoji fallback chain

## Glossary

- **FlagImage Component**: Reusable Vue component that handles flag image loading, error states, and fallback to emoji
- **flagcdn.com**: Free CDN service providing flag images in multiple formats and sizes
- **object-fit: cover**: CSS property that scales image to fill container while maintaining aspect ratio, cropping excess
- **Lazy Loading**: Browser-native image loading strategy that defers loading of off-screen images
- **Intersection Observer**: Browser API for detecting when elements enter the viewport
- **vh (Viewport Height)**: CSS unit representing 1% of viewport height
- **overflow: hidden**: CSS property that prevents scrolling by clipping overflow content

## Architecture

### Component Hierarchy

```
App.vue
└── PlayView.vue
    ├── FindOnMapQuestion.vue
    │   └── FlagImage.vue (new)
    ├── ChooseFlagQuestion.vue
    │   └── FlagImage.vue (new, multiple instances)
    ├── NameItQuestion.vue
    │   └── FlagImage.vue (new)
    └── TypeItQuestion.vue
        └── FlagImage.vue (new)
```

### Data Flow

```
flags.ts (data source)
    ↓
getLocalFlagPath() helper function
    ↓
FlagImage.vue component
    ↓ (tries SVG first)
/flags/{code}.svg
    ↓ (on error)
/flags/{code}.png
    ↓ (on error)
Fallback to emoji
```

### High-Level Design

#### Local Flag Images with Download Script

**Decision**: Download all flag images locally to `public/flags/` directory and serve them from the application bundle.

**Rationale**:
- ✅ Instant loading (~10-50ms vs 200-2000ms CDN)
- ✅ Offline availability (no network dependency)
- ✅ No external CDN dependency or potential downtime
- ✅ Predictable performance across all environments
- ✅ SVG format for scalability without quality loss
- ✅ One-time download script setup

**File Structure**:
```
public/flags/
├── us.svg
├── fr.svg
├── jp.svg
├── ch.svg (fallback to .png if SVG unavailable)
└── ... (197 total countries)
```

**Download Source**:
- Use flagcdn.com as the source for the initial download script
- Download format priority: SVG first (preferred), PNG high-resolution (fallback)
- SVG URL pattern: `https://flagcdn.com/{code}.svg`
- PNG fallback pattern: `https://flagcdn.com/w640/{code}.png`

Where `{code}` is the ISO 3166-1 alpha-2 country code in lowercase (e.g., 'us', 'fr', 'jp').

#### Download Script Design: scripts/downloadFlags.ts (NEW FILE)

**Purpose**: One-time script to download all 197 flag images from flagcdn.com to `public/flags/` directory.

**Implementation**:

```typescript
import fs from 'node:fs'
import path from 'node:path'
import { flags } from '../src/data/flags'

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'flags')
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // ms

interface DownloadResult {
  code: string
  success: boolean
  format: 'svg' | 'png' | 'failed'
  error?: string
}

/**
 * Download a single flag with retry logic
 */
async function downloadFlag(countryCode: string): Promise<DownloadResult> {
  const code = countryCode.toLowerCase()
  
  // Try SVG first
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const svgUrl = `https://flagcdn.com/${code}.svg`
      const response = await fetch(svgUrl)
      
      if (response.ok) {
        const buffer = await response.arrayBuffer()
        const filePath = path.join(OUTPUT_DIR, `${code}.svg`)
        fs.writeFileSync(filePath, Buffer.from(buffer))
        return { code, success: true, format: 'svg' }
      }
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.warn(`SVG failed for ${code}, trying PNG...`)
      } else {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      }
    }
  }
  
  // Fallback to PNG high-resolution
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const pngUrl = `https://flagcdn.com/w640/${code}.png`
      const response = await fetch(pngUrl)
      
      if (response.ok) {
        const buffer = await response.arrayBuffer()
        const filePath = path.join(OUTPUT_DIR, `${code}.png`)
        fs.writeFileSync(filePath, Buffer.from(buffer))
        return { code, success: true, format: 'png' }
      }
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      }
    }
  }
  
  return { 
    code, 
    success: false, 
    format: 'failed',
    error: 'All download attempts failed'
  }
}

/**
 * Main download function
 */
async function downloadAllFlags() {
  console.log('🏁 Starting flag download...')
  console.log(`📦 Total flags to download: ${flags.length}`)
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    console.log(`✅ Created directory: ${OUTPUT_DIR}`)
  }
  
  const results: DownloadResult[] = []
  let completed = 0
  
  // Download all flags
  for (const flag of flags) {
    const result = await downloadFlag(flag.id)
    results.push(result)
    completed++
    
    if (result.success) {
      console.log(`✅ [${completed}/${flags.length}] ${result.code}.${result.format}`)
    } else {
      console.error(`❌ [${completed}/${flags.length}] ${result.code} - ${result.error}`)
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success).length
  const svgCount = results.filter(r => r.format === 'svg').length
  const pngCount = results.filter(r => r.format === 'png').length
  const failed = results.filter(r => !r.success).length
  
  console.log('\n📊 Download Summary:')
  console.log(`✅ Successful: ${successful}/${flags.length}`)
  console.log(`   - SVG: ${svgCount}`)
  console.log(`   - PNG: ${pngCount}`)
  console.log(`❌ Failed: ${failed}`)
  
  if (failed > 0) {
    console.log('\n⚠️  Failed downloads:')
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.code}`)
    })
  }
}

// Run script
downloadAllFlags().catch(error => {
  console.error('💥 Script failed:', error)
  process.exit(1)
})
```

**Features**:
- Downloads all 197 flags from flags.ts
- Tries SVG first, falls back to PNG if SVG fails
- 3 retry attempts per flag with 1s delay
- Progress logging: "Downloaded 150/197 flags..."
- Creates `public/flags/` directory if it doesn't exist
- Final summary with success/failure counts
- Error handling for network issues

**Usage**:
```bash
npm run download-flags
# or
npx tsx scripts/downloadFlags.ts
```

## Components and Interfaces

### FlagImage Component: src/components/common/FlagImage.vue (NEW FILE)

**Purpose**: Reusable component that handles flag image loading, error states, and fallback to emoji.

**Props**:
```typescript
interface Props {
  countryCode: string              // ISO 3166-1 alpha-2 (e.g., 'US')
  emoji: string                    // Fallback emoji
  alt: string                      // Accessibility text
  eager?: boolean                  // Skip lazy loading (default: false)
}
```

**Note**: Removed `size` prop since we now use scalable SVG files that adapt to container size.

**State**:
```typescript
const imageLoaded = ref(false)
const imageError = ref(false)
const showFallback = ref(false)
```

**Behavior**:
1. Initially show emoji while image loads (flicker prevention)
2. Try loading SVG first from local path
3. On SVG load error: try PNG fallback
4. On all errors: stay on emoji fallback, log error
5. Use native lazy loading unless `eager` prop is true

**Template**:
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { getLocalFlagPath, getFallbackFlagPath } from '@/utils/flagImages'

const props = defineProps<{
  countryCode: string
  emoji: string
  alt: string
  eager?: boolean
}>()

const imageLoaded = ref(false)
const showFallback = ref(true) // Start with emoji
const currentSrc = ref(getLocalFlagPath(props.countryCode))

function handleLoad() {
  imageLoaded.value = true
  showFallback.value = false
}

function handleError() {
  // Try PNG fallback if SVG failed
  if (currentSrc.value.endsWith('.svg')) {
    currentSrc.value = getFallbackFlagPath(props.countryCode)
  } else {
    // Both SVG and PNG failed, stay on emoji
    console.warn(`Failed to load flag image for ${props.countryCode}`)
    showFallback.value = true
    imageLoaded.value = false
  }
}
</script>

<template>
  <div class="flag-image">
    <!-- Fallback emoji -->
    <span 
      v-if="showFallback" 
      class="flag-emoji"
      role="img"
      :aria-label="alt"
    >
      {{ emoji }}
    </span>
    
    <!-- Local flag image -->
    <img
      v-show="imageLoaded"
      :src="currentSrc"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      class="flag-img"
      @load="handleLoad"
      @error="handleError"
    />
  </div>
</template>
```

**Styles** (Critical for no white borders):
```vue
<style scoped>
.flag-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit; /* Inherit from parent */
}

.flag-emoji {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: inherit;
  line-height: 1;
}

.flag-img {
  width: 100%;
  height: 100%;
  object-fit: cover;  /* KEY: fills container without white borders */
  display: block;
  border-radius: inherit;
}
</style>
```

**Key CSS Properties**:
- `object-fit: cover` — Scales image to fill container, crops excess (no white borders)
- `width: 100%; height: 100%` — Image fills parent container
- `overflow: hidden` — Clips any overflow
- `display: block` — Removes inline spacing issues

### Component Updates

#### FindOnMapQuestion.vue

**Changes**:
- Replace `.flag-emoji` span with `<FlagImage>` component
- Pass `countryCode`, `emoji`, `alt` props (removed `size`)
- Remove font-size styling from `.flag-emoji` (now handled by FlagImage)

**Before**:
```vue
<div class="flag-display">
  <span class="flag-emoji" role="img" :aria-label="flagName(question.correct, locale)">
    {{ question.correct.emoji }}
  </span>
</div>

<style>
.flag-emoji {
  font-size: 4rem; /* Desktop */
}
</style>
```

**After**:
```vue
<div class="flag-display">
  <FlagImage
    :country-code="question.correct.id"
    :emoji="question.correct.emoji"
    :alt="`Flag of ${flagName(question.correct, locale)}`"
    eager
  />
</div>

<style>
.flag-display {
  /* Aspect ratio maintained, FlagImage fills */
  width: 100%;
  aspect-ratio: 3/2;
}
</style>
```

#### ChooseFlagQuestion.vue

**Changes**:
- Replace emoji spans in `.option-btn` with `<FlagImage>`
- Each option button shows a different flag
- Removed `size` prop (SVG scales to container)

**Before**:
```vue
<button class="option-btn" @click="pick(opt.id)">
  <span class="flag-emoji">{{ opt.emoji }}</span>
</button>

<style>
.flag-emoji {
  font-size: 4.5rem;
}
</style>
```

**After**:
```vue
<button class="option-btn" @click="pick(opt.id)">
  <FlagImage
    :country-code="opt.id"
    :emoji="opt.emoji"
    :alt="`Flag option`"
  />
</button>

<style>
.option-btn {
  aspect-ratio: 4/3;
  padding: 0.5rem; /* Space around flag */
}
</style>
```

#### NameItQuestion.vue

**Changes**:
- Replace `.flag-emoji` with `<FlagImage>` in `.flag-display`
- Removed `size` prop

**Before**:
```vue
<div class="flag-display">
  <span class="flag-emoji">{{ question.correct.emoji }}</span>
</div>

<style>
.flag-emoji {
  font-size: 5rem;
}
</style>
```

**After**:
```vue
<div class="flag-display">
  <FlagImage
    :country-code="question.correct.id"
    :emoji="question.correct.emoji"
    :alt="`Flag of ${flagName(question.correct, locale)}`"
    eager
  />
</div>

<style>
.flag-display {
  width: 200px;
  height: 140px; /* Maintains aspect ratio */
}
</style>
```

#### TypeItQuestion.vue

**Changes**:
- Replace `.flag-emoji` with `<FlagImage>` in large `.flag-display`
- Removed `size` prop

**Before**:
```vue
<div class="flag-display">
  <span class="flag-emoji">{{ question.correct.emoji }}</span>
</div>

<style>
.flag-display {
  width: 340px;
  height: 240px;
}
.flag-emoji {
  font-size: 9rem;
}
</style>
```

**After**:
```vue
<div class="flag-display">
  <FlagImage
    :country-code="question.correct.id"
    :emoji="question.correct.emoji"
    :alt="`Flag of ${flagName(question.correct, locale)}`"
    eager
  />
</div>

<style>
.flag-display {
  width: 340px;
  height: 240px;
  overflow: hidden; /* Ensure no overflow */
}
</style>
```

### Eliminating Vertical Scroll

**Problem**: Some game screens have vertical scrollbars during gameplay.

**Root Causes**:
1. Content height exceeds viewport height
2. Missing `overflow: hidden` on game containers
3. No explicit height constraints

**Solution Strategy**:

#### PlayView.vue Container

**Add**:
```vue
<template>
  <div class="play-view">
    <!-- Game question components -->
  </div>
</template>

<style scoped>
.play-view {
  height: calc(100vh - 80px); /* Subtract header height */
  overflow: hidden; /* Prevent scroll */
  display: flex;
  flex-direction: column;
}
</style>
```

#### Question Component Containers

**Each question component should**:
```css
.choose-flag,
.name-it,
.type-it,
.find-on-map {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center content vertically */
}
```

#### Scroll Reset on Question Change

**In PlayView.vue**:
```typescript
watch(() => currentQuestion.value, () => {
  window.scrollTo(0, 0) // Reset scroll position
})
```

#### Mobile Keyboard Handling

**Challenge**: Virtual keyboard on mobile reduces available viewport height.

**Solution**:
```css
@media (max-width: 767px) {
  .play-view {
    /* Use viewport height units that account for keyboard */
    height: 100dvh; /* Dynamic viewport height (newer browsers) */
    min-height: -webkit-fill-available; /* iOS Safari fallback */
  }
}
```

## Data Models

### flags.ts Data Model Update

**Current Structure**:
```typescript
export interface Flag {
  id: string           // ISO 3166-1 alpha-2
  emoji: string        // Unicode emoji
  name: string         // English name
  nameEs: string       // Spanish name
  continent: Continent
}
```

**New Structure**:
```typescript
export interface Flag {
  id: string           // ISO 3166-1 alpha-2
  emoji: string        // Unicode emoji (KEEP for fallback)
  name: string         // English name
  nameEs: string       // Spanish name
  continent: Continent
  imageUrl?: string    // NEW: Optional base image URL
}
```

**Implementation Strategy**:
- Do NOT add `imageUrl` property to each flag object manually
- Instead, use a helper function that constructs URLs dynamically from the `id` property
- This keeps data lean and avoids duplicating the URL pattern 197 times

### Helper Functions: src/utils/flagImages.ts (NEW FILE)

```typescript
import fs from 'node:fs' // Only for build-time checks, not runtime

/**
 * Get local flag image path
 * @param countryCode - ISO 3166-1 alpha-2 code (e.g., 'US', 'FR')
 * @returns Local path to flag image: /flags/{code}.svg or /flags/{code}.png
 */
export function getLocalFlagPath(countryCode: string): string {
  const code = countryCode.toLowerCase()
  
  // Prefer SVG, fallback to PNG
  // Note: In production, both formats may exist. Check at build time or
  // use a manifest file to determine which format is available per flag.
  
  // For now, assume SVG exists. The <img> tag will handle fallback via onerror.
  return `/flags/${code}.svg`
}

/**
 * Get fallback PNG path if SVG fails
 * @param countryCode - ISO 3166-1 alpha-2 code
 * @returns Fallback PNG path
 */
export function getFallbackFlagPath(countryCode: string): string {
  const code = countryCode.toLowerCase()
  return `/flags/${code}.png`
}
```

**Simplified Design**:
- Removed `getFlagImageUrl()` (no more dynamic CDN URLs)
- Removed `getResponsiveFlagUrl()` (SVG scales automatically)
- Removed `preloadFlagImage()` (local files load instantly)
- Added `getLocalFlagPath()` to return local file path
- Added `getFallbackFlagPath()` for PNG fallback if SVG fails

**Path Format**:
- Primary: `/flags/{code}.svg`
- Fallback: `/flags/{code}.png`

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Image Load Success Rate

_For any_ flag rendering attempt where the local file exists in `public/flags/`, the system SHALL successfully load and display the flag image in >99% of cases within 500ms.

**Validates: Requirements 2.1, 2.2**

### Property 2: Fallback Reliability

_For any_ flag rendering attempt where the local image file fails to load or does not exist, the system SHALL display the emoji fallback within 500ms without UI freeze or error message to the user.

**Validates: Requirements 4.1, 4.3, 4.4**

### Property 3: Accessibility Compliance

_For any_ flag image rendered in the application, the system SHALL include proper alt text in the current locale language that accurately identifies the country represented.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 4: Visual Consistency

_For any_ two devices viewing the same flag, the system SHALL display visually identical flag representations (same colors, proportions, symbols) regardless of device OS or browser.

**Validates: Requirements 1.3**

### Property 5: Performance Budget

_For any_ page load containing up to 4 flags (typical question with choices), the total image payload SHALL NOT exceed 200KB and SHALL load within 500ms from local storage.

**Validates: Requirements 3.1, 3.2**

### Property 6: No White Borders

_For any_ flag image rendered in the application, the system SHALL display the flag edge-to-edge within its container with zero visible white space or borders around the flag content.

**Validates: Requirements 8.2, 8.3, 8.7**

### Property 7: No Vertical Scroll During Gameplay

_For any_ game question screen (Find on Map, Choose Flag, Name It, Type It), the system SHALL NOT display vertical scrollbar and SHALL fit all content within the available viewport height without requiring user scrolling.

**Validates: Requirements 9.1, 9.2, 9.4, 9.5**

## Error Handling

### Fallback Strategy

1. Try SVG from local path → If fails, try PNG from local path → If fails, show emoji
2. All transitions happen silently without user-facing errors
3. Emoji provides instant fallback without blocking UI

### Error Logging

```typescript
function handleError() {
  if (currentSrc.value.endsWith('.svg')) {
    // Try PNG fallback
    currentSrc.value = getFallbackFlagPath(props.countryCode)
  } else {
    console.warn(`Failed to load flag image for ${props.countryCode}`)
    showFallback.value = true
  }
}
```

**No Error UI**: Do NOT show "broken image" icon or error message to user. Silent fallback to emoji provides seamless UX.

### Performance Optimizations

**Local Loading Benefits**:
- Local SVG/PNG files load in ~10-50ms (vs 200-2000ms from CDN)
- No network latency or CDN downtime
- Instant availability after initial page load
- Browser cache handles repeated views

**Lazy Loading**:
- Use native browser lazy loading for flags outside viewport
- First visible flag uses `loading="eager"` for instant display
- Implementation: `<img loading="lazy" ... />` (default in FlagImage component)

**Note**: Previous design included CDN image caching, responsive image selection, and preloading strategies. These are no longer needed with local files:
- ❌ Removed: CDN cache management
- ❌ Removed: Responsive image size selection (SVG scales automatically)
- ❌ Removed: Preloading next question flags (local files load instantly)

### Accessibility

**Alt Text Format**:
- English: `"Flag of France"`
- Spanish: `"Bandera de Francia"`

**Implementation**:
```vue
<FlagImage
  :alt="locale === 'es' 
    ? `Bandera de ${flagName(flag, 'es')}` 
    : `Flag of ${flagName(flag, 'en')}`"
/>
```

**ARIA Considerations**:
- Flag images are NOT decorative (they convey meaning)
- Always include descriptive alt text
- Do NOT use `aria-hidden="true"`

## Testing Strategy

### Unit Tests

**FlagImage.vue**:
- Test SVG load success → shows image
- Test SVG load error → tries PNG fallback
- Test PNG fallback error → shows emoji fallback
- Test lazy loading attribute application
- Test accessibility attributes

**Helper Functions**:
- Test `getLocalFlagPath()` returns correct SVG path
- Test `getFallbackFlagPath()` returns correct PNG path

**Download Script**:
- Test script creates `public/flags/` directory
- Test script downloads all 197 flags
- Test retry logic on network failure
- Test progress logging

### Integration Tests

**Question Components**:
- Test flag displays in each game mode
- Test fallback works when files missing
- Test no white borders visible
- Test no vertical scroll appears

**File Existence Test**:
- Test all 197 flag files exist in `public/flags/`
- Test files are valid SVG or PNG format
- Test file sizes are reasonable (<100KB each)

### Visual Regression Tests

- Capture screenshots of each game mode
- Compare before/after for visual consistency
- Verify flags fill containers edge-to-edge
- Verify no scrollbars appear

### Performance Tests

- Measure local image load times (~10-50ms expected)
- Verify lazy loading works
- Check total payload size (target: <200KB for 4 flags)
- Test offline functionality (all flags available locally)

### Testing Approach

**Dual Testing Strategy**:
- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Integration tests**: Verify component interactions and end-to-end flows
- **Visual regression tests**: Verify consistent visual appearance across updates
- **Performance tests**: Verify load times and payload sizes meet targets

Property-based testing is NOT applicable for this feature because:
- The feature primarily involves UI rendering and layout (not suitable for PBT)
- Infrastructure/configuration (download script, file system operations)
- Side effects (image loading, DOM manipulation)
- Visual appearance verification (requires visual testing, not property assertions)

Instead, we rely on:
- **Example-based unit tests** for component behavior
- **Visual regression tests** for UI consistency
- **Integration tests** for file existence and component interaction

## Implementation Sequence

0. ✅ **Create and run download script** (scripts/downloadFlags.ts)
   - Download all 197 flags to public/flags/
   - Verify all files downloaded successfully
1. ✅ Create `src/utils/flagImages.ts` with helper functions
2. ✅ Create `src/components/common/FlagImage.vue` component
3. ✅ Update FindOnMapQuestion.vue (simplest case)
4. ✅ Update NameItQuestion.vue
5. ✅ Update TypeItQuestion.vue  
6. ✅ Update ChooseFlagQuestion.vue (multiple flags)
7. ✅ Add overflow hidden and height constraints to PlayView.vue
8. ✅ Add scroll reset logic on question change
9. ✅ Write unit tests for FlagImage and helpers
10. ✅ Write test to verify all 197 flag files exist
11. ✅ Write integration tests for updated components
12. ✅ Run visual regression tests
13. ✅ Performance testing and verification

## Rollback Plan

If issues arise:
1. **Easy rollback**: FlagImage component has emoji fallback built-in
2. **Emergency**: Revert to emoji-only by setting `showFallback = true` in FlagImage
3. **Gradual rollout**: Enable feature flag to test with subset of users first

## Success Metrics

- ✅ No white borders visible around any flag
- ✅ No vertical scrollbars during gameplay
- ✅ All 197 flag files downloaded and available locally
- ✅ Local image load time < 50ms
- ✅ Fallback to emoji < 100ms on error
- ✅ Total payload < 200KB for 4 flags (with SVG compression)
- ✅ Offline functionality works (all flags available)
- ✅ All accessibility tests pass
- ✅ No visual regressions reported
