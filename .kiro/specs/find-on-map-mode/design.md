# Design Document: Find on Map Game Mode

## Overview

The "Find on Map" game mode introduces a geographic learning experience to FlagIQ where players identify country locations on an interactive world map by clicking on the correct region after seeing a flag. This mode integrates with the existing game architecture while introducing a new interaction paradigm: spatial selection on an SVG-based map instead of multiple-choice button selection.

**Core Design Principles:**
- **Consistency with existing modes**: Follow the established game flow pattern (show question → user answers → visual feedback → emit answer → next question)
- **Reuse existing stores**: Leverage the Game Store for question generation, scoring, and timing; Session Store for configuration
- **Accessibility-first**: Ensure keyboard navigation and screen reader support for the interactive map
- **Progressive enhancement**: Start with SVG-based clickable regions, with potential for future enhancements (zooming, panning)

**Key Technical Decisions:**
1. Use inline SVG with `<path>` elements for country boundaries (not canvas or external map library dependencies)
2. Map country `id` attributes to ISO 3166-1 alpha-2 codes (matching existing `Flag.id` structure)
3. Implement click detection using SVG event listeners on individual path elements
4. Support continent filtering by conditionally rendering only relevant `<path>` elements
5. Provide visual feedback using CSS classes and transitions (highlight correct/incorrect regions)

## Architecture

### Component Structure

```
PlayView.vue (existing orchestrator)
└── FindOnMapQuestion.vue (NEW)
    ├── InteractiveMap.vue (NEW)
    │   └── SVG with clickable path elements
    ├── FlagDisplay (inline)
    ├── HintButton (inline)
    └── FeedbackOverlay (inline)
```

**FindOnMapQuestion.vue** serves as the main question component, analogous to `NameItQuestion.vue`, `ChooseFlagQuestion.vue`, and `TypeItQuestion.vue`. It:
- Receives the current `Question` from PlayView
- Manages local UI state (hint visibility, feedback state, chosen region)
- Emits `answer` event with `chosenId` after visual feedback delay
- Displays the flag, hint button, and interactive map

**InteractiveMap.vue** is a reusable, presentation-focused component that:
- Renders SVG map with country boundaries as clickable `<path>` elements
- Accepts props: `visibleContinents` (filters displayed countries), `highlightedCountries` (for feedback), `disableInteraction` (during feedback)
- Emits `countryClicked` with country ID when a region is clicked
- Supports keyboard navigation (tab through countries, Enter/Space to select)
- Provides ARIA labels for accessibility

### Data Flow

```
Session Store → Game Store → PlayView → FindOnMapQuestion → InteractiveMap
     ↓              ↓            ↓              ↓                  ↓
continents → filter flags → Question → flag display → filter SVG paths
                                       ↓                           ↓
                                  chosenId ← ← ← ← ← click event
                                       ↓
                              visual feedback (800ms)
                                       ↓
                                emit answer event
                                       ↓
                              Game Store.answer()
```

### Store Integration

The design leverages the existing Game Store without modification:
- `Game Store.questions`: Already contains `Question[]` with correct flag and options
- `Game Store.answer(chosenId)`: Validates the chosen country ID against `question.correct.id`
- `Game Store.currentQuestion`: Provides reactive question for FindOnMapQuestion component

The Session Store already supports `'find-on-map'` mode via the `GameMode` type definition and stores continent filters.

## Components and Interfaces

### FindOnMapQuestion.vue

**Props:**
```typescript
interface Props {
  question: Question       // from Game Store
  locale: AppLocale        // from Locale Store
  blitzMode?: boolean      // from Session Store (optional, for timer display)
  timeRemaining?: number   // from Game Store (optional, for blitz countdown)
}
```

**Emits:**
```typescript
interface Emits {
  answer: [chosenId: string]  // emitted after 800ms feedback delay
}
```

**Local State:**
```typescript
const chosen = ref<string | null>(null)           // ID of clicked country
const hintRevealed = ref(false)                   // whether "Show Continent" was used
const feedbackState = ref<'idle' | 'correct' | 'wrong'>('idle')
```

**Behavior:**
1. Display the flag emoji/SVG from `question.correct`
2. Render `InteractiveMap` with `visibleContinents` from Session Store
3. When user clicks a country, set `chosen.value = countryId`
4. Determine if answer is correct: `countryId === question.correct.id`
5. Set `feedbackState` to `'correct'` or `'wrong'`
6. Pass `highlightedCountries` to InteractiveMap:
   - Correct: `[question.correct.id]` with green highlight
   - Wrong: `[chosenId, question.correct.id]` with red (wrong) and green (correct)
7. After 1500ms delay (per Requirement 6.3), emit `answer` event
8. Reset state on `question` prop change

**Hint System:**
- Display "Show Continent" button (enabled when `!hintRevealed && !chosen`)
- On click: `hintRevealed.value = true`, display continent name
- Continent name retrieved from `question.correct.continent` and localized

### InteractiveMap.vue

**Props:**
```typescript
interface Props {
  visibleContinents: Continent[]              // filter which countries to render
  highlightedCountries?: CountryHighlight[]   // for feedback visualization
  disableInteraction?: boolean                // true during feedback delay
  locale: AppLocale                           // for country name ARIA labels
}

interface CountryHighlight {
  id: string                // country ISO code
  color: 'correct' | 'wrong'  // visual state
}
```

**Emits:**
```typescript
interface Emits {
  countryClicked: [countryId: string]
}
```

**Template Structure:**
```vue
<svg
  viewBox="0 0 1000 500"
  class="interactive-map"
  role="application"
  aria-label="Interactive world map"
>
  <path
    v-for="country in visibleCountries"
    :key="country.id"
    :id="country.id"
    :d="country.pathData"
    :class="getCountryClass(country.id)"
    :aria-label="flagName(country, locale)"
    tabindex="0"
    role="button"
    @click="handleCountryClick(country.id)"
    @keydown.enter.space.prevent="handleCountryClick(country.id)"
  />
</svg>
```

**Country Path Data:**
- Store SVG path coordinates in a separate file: `src/data/mapPaths.ts`
- Structure: `{ id: string, pathData: string, continent: Continent }[]`
- Source: Simplified world map SVG with ISO 3166-1 alpha-2 IDs ([simplemaps.com](https://simplemaps.com/resources/svg-world) or [GitHub worldMapSvg](https://github.com/StephanWagner/worldMapSvg))
- Simplify path data to reduce file size (remove excessive precision)

**Keyboard Navigation:**
- Tab through countries in DOM order (alphabetical by ID or geographic proximity)
- Focus ring visible on `:focus-visible`
- Enter or Space key triggers selection (equivalent to click)
- Focus management: after selection, maintain focus on selected country for feedback visibility

**Visual Feedback:**
- Hover: subtle border color change and scale transform
- Highlighted (correct): green fill with increased opacity
- Highlighted (wrong): red fill with increased opacity
- Smooth CSS transitions for all state changes

**Small Country Handling (Requirement 2.6):**
- Countries with bounding box < 20x20px receive a circular clickable overlay
- Overlay positioned at country centroid with `r="10"` (diameter 20px)
- Overlay invisible but captures pointer events: `fill="transparent" pointer-events="all"`
- List of small countries requiring overlay: Monaco, Vatican City, San Marino, Liechtenstein, Singapore, Malta, Maldives (based on FLAGS data, may need adjustment)

### FlagDisplay (inline in FindOnMapQuestion)

Simple presentation of the flag:
```vue
<div class="flag-display">
  <span class="flag-emoji" role="img" :aria-label="flagName(question.correct, locale)">
    {{ question.correct.emoji }}
  </span>
</div>
```

### HintButton (inline in FindOnMapQuestion)

```vue
<button
  class="hint-btn"
  :disabled="hintRevealed || chosen !== null"
  @click="revealHint"
>
  {{ hintRevealed ? continentName : t.showContinent }}
</button>
```

Translation keys:
- `en`: "Show Continent" / "Continent: {name}"
- `es`: "Mostrar Continente" / "Continente: {name}"

## Data Models

### MapCountry (new interface)

```typescript
// src/data/mapPaths.ts
export interface MapCountry {
  id: string              // ISO 3166-1 alpha-2 (matches Flag.id)
  pathData: string        // SVG path "d" attribute
  continent: Continent    // for filtering
  centroid?: [number, number]  // [x, y] for small country overlays
}

export const MAP_COUNTRIES: MapCountry[] = [
  { id: 'US', pathData: 'M123 456 L...', continent: 'americas' },
  { id: 'FR', pathData: 'M789 234 L...', continent: 'europe', centroid: [450, 180] },
  // ... (56 countries from FLAGS data)
]
```

**Data Source:**
We'll use a simplified public domain world map SVG and extract path data for the 56 countries currently in `FLAGS`. The map projection should be equirectangular or Miller cylindrical for recognizable shapes.

### CountryHighlight (new interface)

```typescript
// src/components/game/InteractiveMap.vue
export interface CountryHighlight {
  id: string                      // country ISO code
  color: 'correct' | 'wrong'      // visual feedback state
}
```

### Continent Name Localization

```typescript
// src/utils/continentNames.ts
import type { Continent } from '@/types/session'
import type { AppLocale } from '@/stores/locale'

const CONTINENT_NAMES: Record<Continent, { en: string; es: string }> = {
  europe: { en: 'Europe', es: 'Europa' },
  asia: { en: 'Asia', es: 'Asia' },
  americas: { en: 'Americas', es: 'Américas' },
  africa: { en: 'Africa', es: 'África' },
  oceania: { en: 'Oceania', es: 'Oceanía' },
}

export function continentName(continent: Continent, locale: AppLocale): string {
  return CONTINENT_NAMES[continent][locale]
}
```

## Correctness Properties

**Property-based testing is NOT applicable to this feature.**

This feature is UI-focused with interactive rendering, event handling, and visual feedback. The acceptance criteria test:
- **UI rendering** (SVG maps, visual states, CSS transitions)
- **DOM event handling** (clicks, keyboard navigation, focus management)  
- **Component integration** (Store coordination, prop passing)
- **Accessibility** (ARIA attributes, screen reader support)

These behaviors cannot be meaningfully expressed as universal properties suitable for property-based testing because:

1. **Click detection is deterministic** — A click either hits a region or doesn't; no edge cases from input variation
2. **Visual feedback is not computable** — Green/red highlights and CSS transitions cannot be verified via properties
3. **Rendering is state-driven, not input-driven** — Flag data variation doesn't reveal rendering bugs
4. **External dependencies** — Map path data is static; we're testing DOM interaction, not pure logic

**Alternative Testing Approach:**

Instead of property-based tests, this feature uses:
- **Example-based unit tests** (Vitest + Vue Test Utils) for specific UI states
- **Integration tests** for Store coordination
- **End-to-end tests** (Playwright) for user workflows
- **Accessibility audits** (axe-core) for ARIA compliance

See the Testing Strategy section below for comprehensive test specifications.

## Error Handling

### Invalid Country Selection

**Scenario:** User clicks on a country that's not in the active continents filter (edge case: map rendering bug)

**Handling:**
- InteractiveMap should only render countries in `visibleContinents`
- If click event fires for a country not in visibleContinents, log warning and ignore
- No error shown to user (should be impossible in correct implementation)

### Missing Map Data

**Scenario:** A country in `FLAGS` doesn't have corresponding path data in `MAP_COUNTRIES`

**Handling:**
- At build time: validate that every `Flag.id` has a matching `MapCountry.id`
- At runtime: if missing, log error and exclude from map rendering
- Game still playable with reduced country pool
- Show warning in dev console: "Missing map data for country: {id}"

### SVG Rendering Failure

**Scenario:** Browser doesn't support inline SVG or path rendering fails

**Handling:**
- Provide fallback message: "This mode requires a modern browser with SVG support."
- Display a "Back" button to return to session setup
- No crash or blank screen

### Click Detection Accuracy

**Scenario:** User clicks near a small country border, hit detection ambiguous

**Handling:**
- SVG uses `pointer-events="visiblePainted"` on paths (default)
- For small countries with overlay circles, the circle captures events first
- No special handling needed; browser SVG hit testing is reliable
- If user reports issues: adjust path simplification level (more detail near borders)

### Timeout in Blitz Mode

**Scenario:** Timer expires before user clicks

**Handling:**
- Game Store automatically records `answer('') ` (empty chosenId) as 'wrong'
- FindOnMapQuestion receives new question prop, resets state
- No special error handling in component; existing Game Store logic sufficient

### Accessibility Errors

**Scenario:** Screen reader user cannot navigate map or announce country names

**Handling:**
- All `<path>` elements have `role="button"` and `aria-label` with country name
- Keyboard navigation works via `tabindex="0"` and keydown handlers
- If ARIA fails: user can fall back to other game modes (type-it, name-it)
- Log accessibility audit warnings in CI with `@axe-core/playwright`

## Testing Strategy

### Overview

This feature introduces UI-heavy, interaction-driven functionality that is **not suitable for property-based testing**. The acceptance criteria focus on visual rendering, click event handling, UI state transitions, and accessibility—all of which are best validated through:

1. **Component unit tests** (example-based) for specific UI states and interactions
2. **Integration tests** for Game Store / Session Store coordination
3. **End-to-end tests** (Playwright) for full user workflows
4. **Accessibility audits** (axe-core) for ARIA compliance

Property-based testing is inappropriate here because:
- We're testing UI rendering and event handling, not pure functions
- Input variation (random flags, continents) doesn't reveal meaningful edge cases beyond what example-based tests cover
- Visual feedback and DOM state cannot be meaningfully asserted via universal properties
- Click detection is deterministic: either a click hits a region or it doesn't

### Unit Test Suite (Vitest + Vue Test Utils)

**FindOnMapQuestion.vue:**
- ✓ Displays the correct flag emoji from `question.correct`
- ✓ Renders InteractiveMap with correct `visibleContinents` prop
- ✓ Shows "Show Continent" button when hint not revealed and no answer chosen
- ✓ Disables "Show Continent" button after hint is revealed
- ✓ Displays continent name after hint button is clicked
- ✓ Emits `answer` event with correct `chosenId` after user clicks country
- ✓ Shows correct visual feedback (green highlight) when answer is correct
- ✓ Shows wrong visual feedback (red + green) when answer is incorrect
- ✓ Displays country name during feedback when answer is incorrect
- ✓ Resets state (chosen, hintRevealed, feedbackState) when question prop changes
- ✓ Displays countdown timer when `blitzMode=true` prop is set

**InteractiveMap.vue:**
- ✓ Renders only countries from `visibleContinents` prop
- ✓ Applies correct CSS class when country is highlighted as 'correct'
- ✓ Applies correct CSS class when country is highlighted as 'wrong'
- ✓ Emits `countryClicked` event when a country path is clicked
- ✓ Emits `countryClicked` event when Enter key pressed on focused country
- ✓ Emits `countryClicked` event when Space key pressed on focused country
- ✓ Does not emit events when `disableInteraction=true`
- ✓ Renders small country overlay circles for configured tiny countries
- ✓ Applies correct ARIA labels using `flagName()` function
- ✓ Maintains focus on selected country after click for accessibility

**continentName utility:**
- ✓ Returns English continent name when locale is 'en'
- ✓ Returns Spanish continent name when locale is 'es'
- ✓ Returns correct name for all 5 continents

### Integration Tests (Vitest)

**Game Store + Session Store:**
- ✓ When Session Store has `mode='find-on-map'` and continents filter, Game Store generates questions with only those flags
- ✓ Game Store.answer() correctly marks answer as 'correct' when chosenId matches question.correct.id
- ✓ Game Store.answer() correctly marks answer as 'wrong' when chosenId does not match
- ✓ Game Store records hint usage in AnsweredQuestion (if we add `hintUsed?: boolean` field)

**PlayView + FindOnMapQuestion:**
- ✓ PlayView passes correct question, locale, and blitzMode props to FindOnMapQuestion
- ✓ PlayView calls Game Store.answer() when FindOnMapQuestion emits 'answer' event
- ✓ PlayView advances to next question after answer is recorded

### End-to-End Tests (Playwright)

**Happy Path:**
1. Configure session with 'find-on-map' mode, single continent (Europe), 10 questions
2. Start game
3. For each question:
   - Verify flag is displayed
   - Click correct country on map
   - Verify green highlight appears
   - Verify next question loads
4. Complete all 10 questions
5. Verify GameResults shows correct score

**Wrong Answer Path:**
1. Start game with 'find-on-map' mode
2. Click incorrect country
3. Verify red highlight on clicked country, green highlight on correct country
4. Verify correct country name is displayed
5. Verify next question loads after delay

**Hint Usage:**
1. Start game with 'find-on-map' mode
2. Click "Show Continent" button
3. Verify continent name is displayed
4. Verify button is disabled
5. Click correct country
6. Verify answer is recorded (no score penalty)

**Blitz Mode:**
1. Start game with 'find-on-map' mode and blitz enabled
2. Verify countdown timer is visible
3. Wait for timer to expire without clicking
4. Verify answer is recorded as wrong
5. Verify next question loads

**Keyboard Navigation:**
1. Start game with 'find-on-map' mode
2. Use Tab key to navigate between countries on map
3. Verify focus ring is visible
4. Press Enter on a country
5. Verify answer is recorded

**Continent Filtering:**
1. Configure session with only 'oceania' continent
2. Start game
3. Verify map displays only Oceania countries (Australia, New Zealand, Fiji, etc.)
4. Verify Europe/Asia/Americas/Africa countries are not visible

### Accessibility Audits (axe-core)

- ✓ No ARIA violations on FindOnMapQuestion component
- ✓ All interactive map regions have accessible names
- ✓ Keyboard focus order is logical
- ✓ Color contrast meets WCAG AA standards for feedback states
- ✓ Screen reader announces country name when focused

### Manual Testing Checklist

- [ ] Small countries (Monaco, Malta, etc.) are clickable with 20x20px minimum target
- [ ] Visual feedback timing feels smooth (1500ms not too fast/slow)
- [ ] Map renders correctly on mobile viewport (responsive scaling)
- [ ] Hover states work on desktop (pointer-based devices)
- [ ] Touch targets are ≥44x44px on mobile (iOS/Android)
- [ ] Map is recognizable and not overly simplified

### Test Coverage Goals

- **Unit tests:** 85%+ coverage for FindOnMapQuestion and InteractiveMap components
- **Integration tests:** Cover all Game Store / Session Store interactions
- **E2E tests:** Cover all primary user workflows (happy path, wrong answer, hint, blitz, keyboard)
- **Accessibility:** Zero critical violations in automated audit

### Test Data Strategy

**Example Flags for Testing:**
Use a subset of FLAGS for faster test execution:
```typescript
const TEST_FLAGS: Flag[] = [
  { id: 'US', name: 'United States', nameEs: 'Estados Unidos', continent: 'americas', emoji: '🇺🇸' },
  { id: 'FR', name: 'France', nameEs: 'Francia', continent: 'europe', emoji: '🇫🇷' },
  { id: 'JP', name: 'Japan', nameEs: 'Japón', continent: 'asia', emoji: '🇯🇵' },
  { id: 'AU', name: 'Australia', nameEs: 'Australia', continent: 'oceania', emoji: '🇦🇺' },
  { id: 'EG', name: 'Egypt', nameEs: 'Egipto', continent: 'africa', emoji: '🇪🇬' },
]
```

**Mock Map Path Data:**
For unit tests, use simplified rectangular paths:
```typescript
const MOCK_MAP_COUNTRIES: MapCountry[] = [
  { id: 'US', pathData: 'M0 0 L100 0 L100 100 L0 100 Z', continent: 'americas' },
  { id: 'FR', pathData: 'M200 0 L300 0 L300 100 L200 100 Z', continent: 'europe' },
  // ...
]
```

This avoids loading large SVG path data in test environment.
