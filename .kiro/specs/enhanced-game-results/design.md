# Design Document: Enhanced Game Results

## Overview

This design enhances the game results screen with comprehensive performance analytics, including incorrect answer review, continent-based performance breakdowns, and improved SVG loading experience. The enhancement maintains the existing clean UI aesthetic while adding valuable learning feedback for players.

The design introduces new data structures to track continent-specific performance, a similarity matrix system for smarter distractor selection, and an improved SVG preloading strategy. All components are designed to be responsive and work seamlessly across mobile and desktop layouts.

### Key Design Goals

1. **Learning-Focused Feedback**: Provide actionable insights through incorrect answer review and continent performance breakdown
2. **Performance Optimization**: Implement SVG preloading and caching to eliminate emoji fallback flicker
3. **Intelligent Exercise Generation**: Use flag similarity data to generate more challenging and educational multiple-choice options
4. **Responsive Design**: Ensure all new features work seamlessly across device sizes
5. **Maintainability**: Keep components modular and testable with clear separation of concerns

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                     GameView                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │           GameResults Component                   │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Summary Metrics (score, time, percentage) │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  ContinentPerformance Component             │  │  │
│  │  │  - Performance bars by continent            │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  IncorrectAnswers Component                 │  │  │
│  │  │  - List of mistakes with corrections        │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Action Buttons (play again, home)          │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Game Store (game.ts)                       │
│  - Questions and answers                                │
│  - Session state                                        │
│  - Enhanced buildQuestions with similarity-based        │
│    distractor selection                                 │
│  - Randomized question order                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│         SVG Preloader Service (flagLoader.ts)           │
│  - Preload next N questions                             │
│  - Cache loaded SVGs                                    │
│  - Loading state management                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│    Flag Similarity Module (flagSimilarity.ts)           │
│  - Similarity matrix data structure                     │
│  - Parser for similarity config files                   │
│  - Printer for similarity config files                  │
│  - Distractor selection algorithm                       │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Session Initialization**: 
   - GameView creates session with SessionConfig
   - Game store generates randomized question pool
   - SVG preloader begins loading first 3 flags

2. **Question Display**:
   - Display current question with preloaded SVG
   - Preload next 2 questions in background
   - Cache SVGs for session duration

3. **Answer Recording**:
   - Store answer with question, chosen option, result, and hint usage
   - Track continent of correct answer for performance breakdown

4. **Results Display**:
   - Calculate continent-specific performance metrics
   - Identify incorrect answers for review section
   - Display all sections responsively based on viewport

## Components and Interfaces

### Enhanced GameResults Component

**Location**: `src/components/game/GameResults.vue`

**Props**:
```typescript
interface GameResultsProps {
  score: number
  total: number
  elapsedMs: number
  answers: AnsweredQuestion[]  // NEW: full answer history
  locale?: 'en' | 'es'
}
```

**Computed Properties**:
```typescript
// Existing
percentage: number
message: string
formattedTime: string

// New
incorrectAnswers: Array<{
  correctFlag: Flag
  chosenFlag: Flag
  continent: Continent
}>

continentPerformance: Array<{
  continent: Continent
  correct: number
  total: number
  percentage: number
}>
```

**Layout Strategy**:
- Mobile (<768px): Single column stack (summary → continent → incorrect → actions)
- Desktop (≥768px): Grid layout with summary prominent, continent and incorrect side-by-side

### New ContinentPerformance Component

**Location**: `src/components/game/ContinentPerformance.vue`

**Props**:
```typescript
interface ContinentPerformanceProps {
  performance: Array<{
    continent: Continent
    correct: number
    total: number
    percentage: number
  }>
  locale?: 'en' | 'es'
}
```

**Features**:
- Visual progress bar for each continent
- Percentage display
- Color coding (success green for 100%, blue for ≥80%, neutral for <80%)
- Alphabetically sorted by continent name (localized)

### New IncorrectAnswers Component

**Location**: `src/components/game/IncorrectAnswers.vue`

**Props**:
```typescript
interface IncorrectAnswersProps {
  incorrect: Array<{
    correctFlag: Flag
    chosenFlag: Flag
    continent: Continent
  }>
  locale?: 'en' | 'es'
}
```

**Format**:
- English: `{Correct Name} - You answered: {Chosen Name}, {Continent}`
- Spanish: `{Correct Name} - Respondiste: {Chosen Name}, {Continente}`
- Only renders if array has items

### Enhanced FlagImage Component

**Location**: `src/components/common/FlagImage.vue`

**New Props**:
```typescript
interface FlagImageProps {
  countryCode: string
  emoji: string
  alt: string
  eager?: boolean
  showSkeleton?: boolean  // NEW: use skeleton instead of emoji during load
}
```

**Loading States**:
1. **Loading**: Display skeleton placeholder (gray rounded rectangle with pulse animation)
2. **Loaded**: Display SVG image
3. **Error (after 3s timeout)**: Display emoji fallback

**Implementation**:
- Use `loading="eager"` for current and next 2 questions
- Use `loading="lazy"` for remaining questions
- Cache loaded images in browser memory via Image() constructor

## Data Models

### Enhanced AnsweredQuestion Interface

**Location**: `src/stores/game.ts`

```typescript
export interface AnsweredQuestion {
  question: Question
  chosenId: string
  result: QuestionResult
  hintUsed?: boolean
  // No changes needed - question.correct.continent already available
}
```

### Continent Performance Aggregate

```typescript
interface ContinentStats {
  continent: Continent
  correct: number
  total: number
  percentage: number
}

function calculateContinentPerformance(answers: AnsweredQuestion[]): ContinentStats[] {
  const statsByContinent = new Map<Continent, { correct: number; total: number }>()
  
  for (const answer of answers) {
    const continent = answer.question.correct.continent
    const stats = statsByContinent.get(continent) ?? { correct: 0, total: 0 }
    
    stats.total++
    if (answer.result === 'correct') stats.correct++
    
    statsByContinent.set(continent, stats)
  }
  
  return Array.from(statsByContinent.entries())
    .map(([continent, stats]) => ({
      continent,
      correct: stats.correct,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100)
    }))
    .sort((a, b) => a.continent.localeCompare(b.continent))
}
```

### Flag Similarity Matrix

**Location**: `src/data/flagSimilarity.ts`

```typescript
export interface SimilarityScore {
  flagA: string  // ISO code
  flagB: string  // ISO code
  score: number  // 0.0 to 1.0 (higher = more similar)
  factors?: {
    colorSimilarity?: number
    geographicProximity?: number
    patternSimilarity?: number
  }
}

export interface SimilarityMatrix {
  version: string
  scores: SimilarityScore[]
  metadata?: {
    generatedAt?: string
    algorithm?: string
  }
}

export function getSimilarFlags(targetId: string, matrix: SimilarityMatrix, limit: number): string[] {
  return matrix.scores
    .filter(s => s.flagA === targetId || s.flagB === targetId)
    .map(s => ({
      id: s.flagA === targetId ? s.flagB : s.flagA,
      score: s.score
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.id)
}
```

### Similarity Parser and Printer

**Location**: `src/utils/similarityParser.ts`

```typescript
export function parseSimilarityConfig(json: string): Result<SimilarityMatrix, string> {
  try {
    const parsed = JSON.parse(json)
    
    // Validate structure
    if (!parsed.version || !Array.isArray(parsed.scores)) {
      return { ok: false, error: 'Invalid structure: missing version or scores' }
    }
    
    // Validate scores
    for (const score of parsed.scores) {
      if (!score.flagA || !score.flagB || typeof score.score !== 'number') {
        return { ok: false, error: `Invalid score entry: ${JSON.stringify(score)}` }
      }
      if (score.score < 0 || score.score > 1) {
        return { ok: false, error: `Score out of range [0,1]: ${score.score}` }
      }
      // Validate flag IDs exist
      if (!FLAGS.find(f => f.id === score.flagA)) {
        return { ok: false, error: `Unknown flag ID: ${score.flagA}` }
      }
      if (!FLAGS.find(f => f.id === score.flagB)) {
        return { ok: false, error: `Unknown flag ID: ${score.flagB}` }
      }
    }
    
    return { ok: true, value: parsed as SimilarityMatrix }
  } catch (e) {
    return { ok: false, error: `JSON parse error: ${e}` }
  }
}

export function printSimilarityConfig(matrix: SimilarityMatrix): string {
  return JSON.stringify(matrix, null, 2)
}

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Incorrect Answers Completeness and Content

*For any* game session, the incorrect answers list SHALL contain exactly those answers where `result === 'wrong'`, and each entry SHALL include the correct flag name (localized), chosen flag name (localized), and continent of the correct answer.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 2: Incorrect Answer Formatting

*For any* incorrect answer and any locale (en or es), the formatted text SHALL match the pattern "{CorrectName} - {LocalizedPrompt}: {ChosenName}, {ContinentName}" where LocalizedPrompt is "You answered" for English and "Respondiste" for Spanish.

**Validates: Requirements 1.5, 1.6**

### Property 3: Continent Performance Calculation Correctness

*For any* game session, each continent's performance stats SHALL have correct count equal to the number of correct answers for that continent, total count equal to all questions for that continent, and percentage equal to `round((correct / total) * 100)`.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 4: Continent Performance Completeness

*For any* game session, the continent performance list SHALL include exactly the set of unique continents present in the answered questions, with each continent appearing exactly once.

**Validates: Requirements 2.1**

### Property 5: Continent Performance Sum Invariant

*For any* game session, the sum of correct answers across all continent performance entries SHALL equal the total session score, and the sum of total questions across all continent entries SHALL equal the total number of questions in the session.

**Validates: Requirements 2.2, 2.3**

### Property 6: Performance Bar Display Completeness

*For any* continent performance entry, the performance bar SHALL display the localized continent name, the format "{correct}/{total} {percentage}%", and a visual indicator with width proportional to the percentage.

**Validates: Requirements 2.5, 2.6, 2.7**

### Property 7: Summary Metrics Display

*For any* game results, the summary SHALL display the score, total questions, accuracy percentage equal to `round((score/total)*100)`, and the progress circle visualization SHALL reflect the accuracy percentage.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 8: Time Formatting

*For any* elapsed time in milliseconds, the formatted time SHALL be "{m}m {ss}s" when time ≥ 60 seconds, and "{s}s" when time < 60 seconds, where m is minutes, ss is zero-padded seconds, and s is seconds.

**Validates: Requirements 3.5, 3.6**

### Property 9: Performance-Based Message Selection

*For any* accuracy percentage, the congratulatory message and emoji SHALL be selected according to the percentage range: 100% (Perfect/🏆), ≥80% (Great/🎉), ≥60% (Well done/👍), ≥40% (Keep practicing/💪), <40% (Keep studying/📚), with localized text for English and Spanish.

**Validates: Requirements 3.7, 3.8**

### Property 10: Question Pool Randomization

*For any* session configuration, when generating multiple question pools with identical config, the question orders SHALL differ with high probability (≥95% unique for pools >10 questions), and the shuffle algorithm SHALL distribute countries uniformly across all positions.

**Validates: Requirements 5.1, 5.4, 5.5, 5.6**

### Property 11: Question Pool Size Correctness

*For any* session configuration, the generated question pool SHALL have length equal to `min(count, availableFlags.length)` when count is a number, and SHALL include all available flags when count is "all".

**Validates: Requirements 5.2, 5.3**

### Property 12: Similarity Parser Round-Trip

*For any* valid SimilarityMatrix object, `parseSimilarityConfig(printSimilarityConfig(matrix))` SHALL produce an equivalent SimilarityMatrix object with identical version, scores, and metadata.

**Validates: Requirements 7.1, 7.3, 7.4**

### Property 13: Similarity Parser Validation

*For any* similarity configuration input, the parser SHALL reject invalid inputs with descriptive errors: malformed JSON, missing required fields, similarity scores outside [0, 1], and flag IDs not present in the FLAGS dataset SHALL all produce appropriate error messages.

**Validates: Requirements 7.2, 7.5, 7.6**

### Property 14: SVG Cache Consistency

*For any* sequence of flag IDs with repetitions, after loading all flags, each unique flag ID SHALL have been fetched from the network exactly once, with subsequent requests served from cache.

**Validates: Requirements 4.7**

### Property 15: SVG Loading State Progression

*For any* flag image component with `showSkeleton=true`, the component SHALL display skeleton during loading, then display the SVG image after successful load, or display emoji fallback after load failure or 3-second timeout.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 16: Similarity-Based Distractor Selection

*For any* question where similarity-based selection is enabled and at least 3 similar flags are available from the selected continents, the distractor selection SHALL include at least 2 out of 3 distractors from flags with highest similarity scores to the correct answer.

**Validates: Requirements 6.2, 6.7**

### Property 17: Minimum Touch Target Size on Mobile

*For any* results screen rendered with viewport width < 768px, all interactive buttons SHALL have both width and height ≥ 44 pixels.

**Validates: Requirements 8.7**

### Property 18: Minimum Font Size

*For any* results screen at any viewport width, all body text elements SHALL have font-size ≥ 14 pixels.

**Validates: Requirements 8.8**

## Error Handling

### SVG Loading Errors

**Scenario**: Flag SVG fails to load (network error, missing file, CORS)

**Handling**:
1. Set 3-second timeout for SVG load attempt
2. On timeout or error, display emoji fallback
3. Log warning to console for debugging
4. Do not block question display or session flow

**User Experience**: Graceful degradation to emoji without disrupting gameplay

### Similarity Matrix Parse Errors

**Scenario**: Invalid similarity configuration file

**Handling**:
1. Return descriptive error message identifying the issue
2. Invalid JSON → "JSON parse error: {details}"
3. Missing required fields → "Invalid structure: missing {field}"
4. Score out of range → "Score out of range [0,1]: {value}"
5. Unknown flag ID → "Unknown flag ID: {id}"

**User Experience**: Developer receives clear error for debugging; system falls back to random distractor selection

### Empty Continent Performance

**Scenario**: No questions answered (session abandoned immediately)

**Handling**:
1. Continent performance section renders empty array
2. Incorrect answers section does not render
3. Summary metrics show 0/0 with appropriate message

**User Experience**: Results screen still displays with zeroed metrics and encouragement message

### Missing Locale Translations

**Scenario**: Continent name not translated for user's locale

**Handling**:
1. Fall back to English continent name
2. Log warning for missing translation
3. Continue rendering without interruption

**User Experience**: English fallback for untranslated strings

## Testing Strategy

### Unit Tests

**Components**:
- **GameResults.vue**: Test computed properties for incorrect answers and continent performance calculation
- **ContinentPerformance.vue**: Test rendering logic, color coding, sorting
- **IncorrectAnswers.vue**: Test formatting for both locales
- **FlagImage.vue**: Test loading states, skeleton display, error handling

**Utilities**:
- **similarityParser.ts**: Test parsing valid/invalid JSON, validation logic
- **flagLoader.ts**: Test preload queue, cache management
- **game.ts**: Test shuffle algorithm, distractor selection with/without similarity

**Test Examples**:
```typescript
describe('calculateContinentPerformance', () => {
  it('aggregates stats correctly for mixed performance', () => {
    const answers: AnsweredQuestion[] = [
      { question: europeQuestion1, result: 'correct', chosenId: 'DE' },
      { question: europeQuestion2, result: 'wrong', chosenId: 'FR' },
      { question: asiaQuestion1, result: 'correct', chosenId: 'JP' },
    ]
    
    const stats = calculateContinentPerformance(answers)
    
    expect(stats).toContainEqual({
      continent: 'europe',
      correct: 1,
      total: 2,
      percentage: 50
    })
    expect(stats).toContainEqual({
      continent: 'asia',
      correct: 1,
      total: 1,
      percentage: 100
    })
  })
})
```

### Property-Based Tests

**Configuration**: Minimum 100 iterations per test using fast-check

**Property Test 1: Incorrect Answers Completeness**
```typescript
import fc from 'fast-check'

/**
 * Feature: enhanced-game-results, Property 1
 * For any game session with at least one incorrect answer, the incorrect answers 
 * list contains exactly those answers where result === 'wrong' and includes the 
 * correct flag, chosen flag, and continent for each.
 */
it('incorrect answers list includes all and only wrong answers', () => {
  fc.assert(
    fc.property(
      fc.array(arbitraryAnsweredQuestion(), { minLength: 1, maxLength: 50 }),
      (answers) => {
        const incorrect = getIncorrectAnswers(answers)
        const wrongAnswers = answers.filter(a => a.result === 'wrong')
        
        // Same count
        expect(incorrect).toHaveLength(wrongAnswers.length)
        
        // Each wrong answer appears exactly once
        for (const wrong of wrongAnswers) {
          const found = incorrect.find(
            i => i.correctFlag.id === wrong.question.correct.id &&
                 i.chosenFlag.id === wrong.chosenId
          )
          expect(found).toBeDefined()
          expect(found!.continent).toBe(wrong.question.correct.continent)
        }
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 2: Continent Performance Accuracy**
```typescript
/**
 * Feature: enhanced-game-results, Property 2
 * For any game session, the sum of correct answers across all continent 
 * performance entries equals the total score, and the sum of total questions 
 * across all continent performance entries equals the total number of questions.
 */
it('continent performance sums match session totals', () => {
  fc.assert(
    fc.property(
      fc.array(arbitraryAnsweredQuestion(), { minLength: 1, maxLength: 50 }),
      (answers) => {
        const stats = calculateContinentPerformance(answers)
        
        const sumCorrect = stats.reduce((sum, s) => sum + s.correct, 0)
        const sumTotal = stats.reduce((sum, s) => sum + s.total, 0)
        
        const sessionScore = answers.filter(a => a.result === 'correct').length
        const sessionTotal = answers.length
        
        expect(sumCorrect).toBe(sessionScore)
        expect(sumTotal).toBe(sessionTotal)
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 3: Question Pool Randomization**
```typescript
/**
 * Feature: enhanced-game-results, Property 4
 * For any two consecutive game sessions with identical SessionConfig, 
 * the question order differs with high probability.
 */
it('consecutive sessions produce different question orders', () => {
  const config: SessionConfig = {
    continents: ['europe', 'asia'],
    mode: 'name-it',
    count: 20,
    blitz: false
  }
  
  const orders: string[][] = []
  
  // Generate 20 sessions
  for (let i = 0; i < 20; i++) {
    const questions = buildQuestions(config)
    orders.push(questions.map(q => q.correct.id))
  }
  
  // Check that at least 95% are unique (19/20)
  const uniqueOrders = new Set(orders.map(o => o.join(',')))
  expect(uniqueOrders.size).toBeGreaterThanOrEqual(19)
})
```

**Property Test 4: Similarity Parser Round-Trip**
```typescript
/**
 * Feature: enhanced-game-results, Property 5
 * For any valid SimilarityMatrix object, parsing then printing then parsing 
 * produces an equivalent object.
 */
it('similarity matrix round-trip preserves data', () => {
  fc.assert(
    fc.property(
      arbitrarySimilarityMatrix(),
      (matrix) => {
        const printed = printSimilarityConfig(matrix)
        const result = parseSimilarityConfig(printed)
        
        expect(result.ok).toBe(true)
        if (result.ok) {
          expect(result.value).toEqual(matrix)
        }
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 5: SVG Cache Consistency**
```typescript
/**
 * Feature: enhanced-game-results, Property 7
 * For any flag that appears multiple times in a session, after the first 
 * load completes, all subsequent displays use the cached version.
 */
it('repeated flags use cached SVG', async () => {
  fc.assert(
    fc.asyncProperty(
      fc.array(fc.constantFrom('DE', 'FR', 'IT', 'ES'), { minLength: 5, maxLength: 20 }),
      async (flagIds) => {
        const loader = new FlagLoader()
        const loadCounts = new Map<string, number>()
        
        // Mock network fetch to count loads
        const originalFetch = global.fetch
        global.fetch = vi.fn((url: string) => {
          const id = url.match(/\/([A-Z]{2})\.svg$/)?.[1]
          if (id) loadCounts.set(id, (loadCounts.get(id) ?? 0) + 1)
          return originalFetch(url)
        })
        
        // Load each flag in sequence
        for (const id of flagIds) {
          await loader.load(id)
        }
        
        // Each unique flag should be loaded exactly once
        const uniqueFlags = new Set(flagIds)
        for (const id of uniqueFlags) {
          expect(loadCounts.get(id)).toBe(1)
        }
        
        global.fetch = originalFetch
      }
    ),
    { numRuns: 100 }
  )
})
```

### Integration Tests

**GameResults with Real Data**:
```typescript
it('displays complete results with all sections', async () => {
  const store = useGameStore()
  store.startGame({
    continents: ['europe', 'asia', 'africa'],
    mode: 'name-it',
    count: 10,
    blitz: false
  })
  
  // Answer questions with mixed results
  store.answer('DE', false)  // correct
  store.answer('XX', false)  // wrong
  // ... more answers
  
  const wrapper = mount(GameResults, {
    props: {
      score: store.score,
      total: store.totalQuestions,
      elapsedMs: store.elapsedMs,
      answers: store.answers,
      locale: 'en'
    }
  })
  
  // Verify all sections render
  expect(wrapper.find('.results__score').exists()).toBe(true)
  expect(wrapper.find('.continent-performance').exists()).toBe(true)
  expect(wrapper.find('.incorrect-answers').exists()).toBe(true)
  expect(wrapper.find('.results__actions').exists()).toBe(true)
})
```

### Responsive Layout Tests

```typescript
describe('GameResults responsive layout', () => {
  it('uses mobile layout on narrow viewports', () => {
    global.innerWidth = 375
    const wrapper = mount(GameResults, { props: mockProps })
    
    const container = wrapper.find('.results__container')
    expect(container.classes()).toContain('results__container--mobile')
  })
  
  it('uses desktop layout on wide viewports', () => {
    global.innerWidth = 1024
    const wrapper = mount(GameResults, { props: mockProps })
    
    const container = wrapper.find('.results__container')
    expect(container.classes()).toContain('results__container--desktop')
  })
})
```

### Manual Testing Checklist

- [ ] Load game on mobile device, verify skeleton appears instead of emoji during SVG load
- [ ] Complete game with errors, verify incorrect answers section displays with proper formatting
- [ ] Complete game with all correct, verify incorrect answers section does not render
- [ ] Complete game spanning multiple continents, verify continent performance bars display correctly
- [ ] Verify continent performance sorting is alphabetical in both English and Spanish
- [ ] Test responsive breakpoint at 768px in browser dev tools
- [ ] Verify touch targets on mobile are at least 44x44px
- [ ] Test with slow 3G network to observe SVG preloading behavior
- [ ] Complete multiple sessions with same config, verify question order changes
- [ ] Test with invalid similarity config file, verify descriptive error message

## Implementation Notes

### Phase 1: Core Results Enhancements
1. Add `answers` prop to GameResults component
2. Implement continent performance calculation
3. Create ContinentPerformance component
4. Create IncorrectAnswers component
5. Update GameResults layout for desktop/mobile

### Phase 2: SVG Loading Improvements
1. Create FlagLoader service with preload queue
2. Add skeleton loading state to FlagImage component
3. Implement SVG caching strategy
4. Update question display components to use eager loading

### Phase 3: Randomization
1. Update buildQuestions to shuffle flags before selecting
2. Add property tests for randomization uniformity

### Phase 4: Similarity Matrix (Optional Enhancement)
1. Define similarity data structure
2. Implement parser and printer with validation
3. Create similarity-based distractor selection algorithm
4. Add similarity toggle to session configuration
5. Populate initial similarity data (can be empty initially)

### Styling Guidelines

**Colors**:
- Success (100%): `#10b981` (green-500)
- High performance (≥80%): `#3b82f6` (blue-500)
- Medium performance (60-79%): `#f59e0b` (amber-500)
- Low performance (<60%): `#ef4444` (red-500)
- Neutral: `#6b7280` (gray-500)

**Spacing**:
- Mobile: 1rem between sections
- Desktop: 1.5rem between sections
- Internal padding: 1rem

**Typography**:
- Headings: 1.25rem, weight 700
- Body: 0.9375rem (15px), weight 400
- Minimum touch target: 44x44px on mobile

**Skeleton Loader**:
```css
.skeleton {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 0.375rem;
}

@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```
