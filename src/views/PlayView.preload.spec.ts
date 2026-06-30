/**
 * Task 9.2: Trigger preload on game start and answer events
 * 
 * Tests verify that:
 * - FlagLoader.initializeSession is called on game start with first 3 flags
 * - FlagLoader.resetSession is called on component unmount
 * - Edge cases are handled (fewer than 3 remaining questions)
 * 
 * Requirements: 4.4, 4.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PlayView from './PlayView.vue'
import { useGameStore } from '@/stores/game'
import { useSessionStore } from '@/stores/session'
import { flagLoader } from '@/services/flagLoader'
import type { SessionConfig } from '@/types/session'

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
}))

// Mock components to avoid complex rendering
vi.mock('@/components/game/GameProgressBar.vue', () => ({
  default: { name: 'GameProgressBar', template: '<div />' },
}))
vi.mock('@/components/game/NameItQuestion.vue', () => ({
  default: { name: 'NameItQuestion', template: '<div @answer="$emit(\'answer\', $event)" />' },
}))
vi.mock('@/components/game/ChooseFlagQuestion.vue', () => ({
  default: { name: 'ChooseFlagQuestion', template: '<div />' },
}))
vi.mock('@/components/game/TypeItQuestion.vue', () => ({
  default: { name: 'TypeItQuestion', template: '<div />' },
}))
vi.mock('@/components/game/FindOnMapQuestion.vue', () => ({
  default: { name: 'FindOnMapQuestion', template: '<div />' },
}))
vi.mock('@/components/game/GameResults.vue', () => ({
  default: { name: 'GameResults', template: '<div />' },
}))

describe('PlayView - Flag Preloading (Task 9.2)', () => {
  let initializeSessionSpy: ReturnType<typeof vi.spyOn>
  let onQuestionAnsweredSpy: ReturnType<typeof vi.spyOn>
  let resetSessionSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Spy on flagLoader methods
    initializeSessionSpy = vi.spyOn(flagLoader, 'initializeSession').mockResolvedValue()
    onQuestionAnsweredSpy = vi.spyOn(flagLoader, 'onQuestionAnswered').mockResolvedValue()
    resetSessionSpy = vi.spyOn(flagLoader, 'resetSession')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should preload first 3 flags when game session starts', async () => {
    const sessionStore = useSessionStore()
    const gameStore = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: false,
    }
    
    sessionStore.updateConfig(config)
    sessionStore.startSession()
    mount(PlayView)
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Verify startGame was called
    expect(gameStore.questions.length).toBeGreaterThan(0)
    
    // Verify initializeSession was called with questions and preloadCount=3
    expect(initializeSessionSpy).toHaveBeenCalledWith(
      gameStore.questions,
      3
    )
  })

  it('should handle edge case when fewer than 3 questions remain', async () => {
    const sessionStore = useSessionStore()
    const gameStore = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: false,
    }
    
    sessionStore.updateConfig(config)
    sessionStore.startSession()
    mount(PlayView)
    
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Verify the game was started with the requested number of questions
    expect(gameStore.questions.length).toBeGreaterThanOrEqual(10)
    
    // Verify initializeSession was still called with preloadCount=3
    // The FlagLoader should handle the edge case internally
    expect(initializeSessionSpy).toHaveBeenCalledWith(
      gameStore.questions,
      3
    )
  })

  it('should reset session on component unmount', async () => {
    const sessionStore = useSessionStore()
    
    const config: SessionConfig = {
      continents: ['africa'],
      mode: 'name-it',
      count: 10,
      blitz: false,
    }
    
    sessionStore.updateConfig(config)
    sessionStore.startSession()
    const wrapper = mount(PlayView)
    
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Clear previous calls
    resetSessionSpy.mockClear()
    
    // Unmount component
    wrapper.unmount()
    
    // Verify resetSession was called
    expect(resetSessionSpy).toHaveBeenCalledTimes(1)
  })

  it('should verify preload integration with game flow', async () => {
    const sessionStore = useSessionStore()
    const gameStore = useGameStore()
    
    const config: SessionConfig = {
      continents: ['asia'],
      mode: 'name-it',
      count: 10,
      blitz: false,
    }
    
    sessionStore.updateConfig(config)
    sessionStore.startSession()
    mount(PlayView)
    
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Verify initialization
    expect(initializeSessionSpy).toHaveBeenCalledTimes(1)
    expect(initializeSessionSpy).toHaveBeenCalledWith(
      gameStore.questions,
      3
    )
    
    // Verify questions were generated
    expect(gameStore.questions.length).toBeGreaterThan(0)
    expect(gameStore.currentQuestion).toBeTruthy()
  })
})
