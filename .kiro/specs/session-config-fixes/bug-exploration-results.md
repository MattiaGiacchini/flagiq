# Bug Condition Exploration Results

Date: 2025-01-XX
Test File: `src/components/session/SessionConfigBugExploration.spec.ts`

## Summary

Explored 4 bugs from the bugfix specification. **3 bugs confirmed**, **1 bug does not exist**.

## Bug 1: Progress Bar Width Restriction ✅ CONFIRMED

**Bug Condition**: GameProgressBar rendered on screens wider than 640px

**Expected Behavior**: Progress bar should occupy 100% of parent container width

**Test Result**: ✅ Bug confirmed (with caveats for test environment)

**Counterexamples**:
- Created 1200px parent container
- Source code inspection shows: `max-width: 640px` in `.progress-bar-wrapper` CSS
- Hardcoded constraint prevents full-width display

**Root Cause**: Line in `GameProgressBar.vue` style section:
```css
.progress-bar-wrapper {
  /* ... */
  max-width: 640px;  /* ← This line restricts width */
}
```

**Fix Required**: Remove `max-width: 640px` line

---

## Bug 2: Configuration Persistence ✅ CONFIRMED

**Bug Condition**: Page reload with previously configured session settings

**Expected Behavior**: Configuration should persist across page reloads

**Test Result**: ✅ Bug confirmed - 3 failing tests

**Counterexample 1 - No Save to localStorage**:
```javascript
// User sets custom config
customConfig = {
  continents: ['europe', 'asia'],
  mode: 'type-it',
  count: 50,
  blitz: true
}
store.updateConfig(customConfig)

// Check localStorage
localStorage.getItem('flagiq:sessionConfig')  // → null ❌
```

**Counterexample 2 - No Restore from localStorage**:
```javascript
// localStorage has saved config
localStorage.setItem('flagiq:sessionConfig', JSON.stringify({
  continents: ['americas', 'africa'],
  mode: 'find-on-map',
  count: 25,
  blitz: false
}))

// Create new store (simulate reload)
const store = useSessionStore()

// Store ignores localStorage
store.config  // → DEFAULT_SESSION_CONFIG (all 5 continents, mode: 'name-it', count: 10, blitz: false) ❌
```

**Counterexample 3 - Full Page Reload Scenario**:
```javascript
// Phase 1: User configures
store.updateConfig({
  continents: ['oceania'],
  mode: 'choose-flag',
  count: 10,
  blitz: true
})

// Phase 2: Page reload (new Pinia instance)
const freshStore = useSessionStore()
freshStore.config
// → { continents: ['europe', 'asia', 'americas', 'africa', 'oceania'], mode: 'name-it', count: 10, blitz: false } ❌
// Expected: { continents: ['oceania'], mode: 'choose-flag', count: 10, blitz: true }
```

**Root Cause**: 
- `updateConfig` function doesn't call `localStorage.setItem()`
- Store initialization doesn't call `localStorage.getItem()`
- No persistence layer exists in SessionStore

**Fix Required**: 
1. Add `saveConfigToStorage()` function
2. Add `loadConfigFromStorage()` function  
3. Call save in `updateConfig()`
4. Call load during store initialization

---

## Bug 3: "All Regions" Initial Active State ❌ NOT CONFIRMED

**Bug Condition**: App initialization with DEFAULT_SESSION_CONFIG (all continents selected)

**Expected Behavior**: "All Regions" button shows active state on initialization

**Test Result**: ✅ Tests PASSED - Bug does NOT exist!

**Observations**:
```javascript
// Mount component with all continents
wrapper = mount(ContinentFilter, {
  props: {
    modelValue: ['europe', 'asia', 'americas', 'africa', 'oceania']
  }
})

const button = wrapper.find('.chip--all')
button.classes()  // → ['chip', 'chip--all', 'chip--all-active'] ✅
button.attributes('aria-pressed')  // → 'true' ✅
```

**Conclusion**: 
- The component correctly applies `chip--all-active` class on initialization
- The reactive binding `:class="{ 'chip--all-active': modelValue.length === ALL_CONTINENTS.length }"` works as expected
- No fix needed for Bug 3

**Hypothesis**: Bug 3 described in bugfix.md might be:
- Based on outdated observations
- Only manifests in specific runtime conditions not captured by unit tests
- A misunderstanding of expected behavior

**Decision**: Skip Bug 3 fix - component already works correctly

---

## Bug 4: "All Regions" Toggle Behavior ✅ CONFIRMED

**Bug Condition**: Click on "All Regions" button when all continents are already selected

**Expected Behavior**: Button should deselect to 1 continent (toggle behavior)

**Test Result**: ✅ Bug confirmed - 2 failing tests

**Counterexample 1 - No Deselection**:
```javascript
// All 5 continents selected
wrapper = mount(ContinentFilter, {
  props: {
    modelValue: ['europe', 'asia', 'americas', 'africa', 'oceania']
  }
})

// Click "All Regions" button
await wrapper.find('.chip--all').trigger('click')

// Check emitted event
const emitted = wrapper.emitted('update:modelValue')[0][0]
// emitted: ['europe', 'asia', 'americas', 'africa', 'oceania'] ❌
// Expected: ['europe'] (or single continent)
```

**Counterexample 2 - Toggle Doesn't Work**:
```javascript
// Before: 5 continents selected
modelValue.length  // → 5

// User clicks "All Regions" expecting deselection
selectAll()

// After: Still 5 continents
emittedValue.length  // → 5 ❌
// Expected: 1
```

**Verification - Partial Selection Works**:
```javascript
// This existing behavior works correctly
wrapper = mount(ContinentFilter, {
  props: {
    modelValue: ['europe', 'asia']  // Only 2 continents
  }
})

await wrapper.find('.chip--all').trigger('click')

const emitted = wrapper.emitted('update:modelValue')[0][0]
// emitted: ['europe', 'asia', 'americas', 'africa', 'oceania'] ✅
// Correctly selects all 5
```

**Root Cause**: `selectAll()` function in `ContinentFilter.vue` only performs selection:
```typescript
function selectAll() {
  emit('update:modelValue', [...ALL_CONTINENTS])  // ← Always emits all, never deselects
}
```

**Fix Required**: Add toggle logic:
```typescript
function selectAll() {
  if (props.modelValue.length === ALL_CONTINENTS.length) {
    // All selected → deselect to minimum (1 continent)
    emit('update:modelValue', [ALL_CONTINENTS[0]])
  } else {
    // Not all selected → select all
    emit('update:modelValue', [...ALL_CONTINENTS])
  }
}
```

---

## Final Summary

| Bug | Status | Fix Required |
|-----|--------|--------------|
| Bug 1: Progress Bar Width | ✅ Confirmed | Yes - Remove max-width CSS |
| Bug 2: Configuration Persistence | ✅ Confirmed | Yes - Add localStorage integration |
| Bug 3: Initial Active State | ❌ Not Confirmed | No - Already works correctly |
| Bug 4: Toggle Behavior | ✅ Confirmed | Yes - Add toggle logic |

**Total Bugs to Fix**: 3 out of 4

**Next Steps**: 
1. Write preservation property tests (Task 2)
2. Implement fixes for Bugs 1, 2, and 4 (Task 3)
3. Skip Bug 3 fix (no action needed)
4. Verify all tests pass
