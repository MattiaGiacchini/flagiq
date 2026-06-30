# Task 9.2 Implementation Summary

## Task: Trigger preload on game start and answer events

### Requirements
- Call FlagLoader preload on game session start (first 3 flags)
- Call FlagLoader preload on each answer submission (next 2 flags)
- Handle edge cases: fewer than 3 remaining questions
- Requirements: 4.4, 4.5

### Implementation

#### Changes to PlayView.vue

**Added imports:**
```typescript
import { flagLoader } from '@/services/flagLoader'
import { onBeforeUnmount } from 'vue'
```

**Modified `onMounted` hook:**
- Added call to `flagLoader.initializeSession(gameStore.questions, 3)` after `gameStore.startGame()`
- This preloads the first 3 questions when the game session starts

**Added `onBeforeUnmount` hook:**
- Added call to `flagLoader.resetSession()` to clean up when leaving the play view

**Modified `handleAnswer` function:**
- Added call to `flagLoader.onQuestionAnswered(2)` after `gameStore.answer()`
- Only calls preload if the game is not finished (`!gameStore.isFinished`)
- This preloads the next 2 questions after each answer

**Modified `handleRestart` function:**
- Added call to `flagLoader.initializeSession(gameStore.questions, 3)` after restarting the game
- Re-initializes the preloader with the new question set

**Modified `handleHome` function:**
- Added call to `flagLoader.resetSession()` to clean up flag loader state

### Edge Cases Handled

1. **Fewer than 3 questions in session**: The FlagLoader service's `initializeSession` method handles this internally. It will only preload as many flags as are available.

2. **Game finished**: The `handleAnswer` function checks `!gameStore.isFinished` before calling `onQuestionAnswered`, preventing unnecessary preload attempts after the last question.

3. **Component unmount**: Added `onBeforeUnmount` hook to ensure flag loader state is reset when navigating away from the play view.

### Testing

Created `PlayView.preload.spec.ts` with 4 integration tests:

1. **should preload first 3 flags when game session starts**
   - Verifies `initializeSession` is called with correct parameters on mount

2. **should handle edge case when fewer than 3 questions remain**
   - Verifies that the system handles small question counts gracefully

3. **should reset session on component unmount**
   - Verifies `resetSession` is called when component unmounts

4. **should verify preload integration with game flow**
   - End-to-end verification of the complete preload flow

All tests pass successfully.

### Files Modified

1. `/Users/mattiagiacchini/repos/flagIQ/src/views/PlayView.vue`
   - Added flag loader integration to game lifecycle events

### Files Created

1. `/Users/mattiagiacchini/repos/flagIQ/src/views/PlayView.preload.spec.ts`
   - Integration tests for flag preloading functionality

### Verification

- ✅ All TypeScript compilation checks pass
- ✅ No diagnostic errors
- ✅ All unit tests pass (4/4)
- ✅ Preload triggers correctly on game start
- ✅ Preload triggers correctly on answer submission
- ✅ Edge cases handled correctly
- ✅ Cleanup on unmount works correctly

### Requirements Satisfied

- ✅ 4.4: Preload flag SVGs for current question and next 2 questions
- ✅ 4.5: Preload first 3 flags on session start, next 2 on each answer

### Integration Points

The implementation integrates cleanly with existing code:
- Uses the singleton `flagLoader` instance from the service
- Leverages existing game store lifecycle methods
- Works with all game modes (name-it, choose-flag, type-it, find-on-map)
- Handles both initial game start and restart scenarios

### Performance Considerations

- Preloading happens asynchronously and doesn't block the UI
- Failed loads are cached as empty strings to avoid repeated attempts
- FlagLoader handles deduplication internally (same flag not fetched twice)
- Memory is cleaned up properly via `resetSession` calls
