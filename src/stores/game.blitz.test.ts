import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGameStore } from './game'
import type { SessionConfig } from '@/types/session'
import { setActivePinia, createPinia } from 'pinia'

describe('game store - Blitz mode timer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should start Blitz timer when config.blitz is true', () => {
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: true,
    }
    
    store.startGame(config)
    
    expect(store.blitzMode).toBe(true)
    expect(store.blitzTimeLeft).toBe(60)
    expect(store.isBlitzActive).toBe(true)
  })

  it('should not start Blitz timer when config.blitz is false', () => {
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: false,
    }
    
    store.startGame(config)
    
    expect(store.blitzMode).toBe(false)
    expect(store.blitzTimeLeft).toBe(60)
    expect(store.isBlitzActive).toBe(false)
  })

  it('should decrement timer every second', () => {
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: true,
    }
    
    store.startGame(config)
    
    expect(store.blitzTimeLeft).toBe(60)
    
    // Advance time by 1 second
    vi.advanceTimersByTime(1000)
    expect(store.blitzTimeLeft).toBe(59)
    
    // Advance time by 5 more seconds
    vi.advanceTimersByTime(5000)
    expect(store.blitzTimeLeft).toBe(54)
  })

  it('should end game when timer reaches zero', () => {
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: true,
    }
    
    store.startGame(config)
    
    expect(store.isActive).toBe(true)
    expect(store.finishedAt).toBe(null)
    
    // Advance time to just before timer expires
    vi.advanceTimersByTime(59000)
    expect(store.blitzTimeLeft).toBe(1)
    expect(store.isActive).toBe(true)
    
    // Advance one more second - timer expires
    vi.advanceTimersByTime(1000)
    expect(store.blitzTimeLeft).toBe(0)
    expect(store.isActive).toBe(false)
    expect(store.finishedAt).not.toBe(null)
  })

  it('should cleanup timer on reset', () => {
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: true,
    }
    
    store.startGame(config)
    expect(store.blitzMode).toBe(true)
    
    // Advance timer a bit
    vi.advanceTimersByTime(5000)
    expect(store.blitzTimeLeft).toBe(55)
    
    // Reset the store
    store.reset()
    
    expect(store.blitzMode).toBe(false)
    expect(store.blitzTimeLeft).toBe(60)
    expect(store.isBlitzActive).toBe(false)
  })

  it('should stop existing timer before starting new one', () => {
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: true,
    }
    
    // Start first game
    store.startGame(config)
    vi.advanceTimersByTime(10000)
    expect(store.blitzTimeLeft).toBe(50)
    
    // Start second game without resetting
    store.startGame(config)
    expect(store.blitzTimeLeft).toBe(60) // Should reset to 60
    
    vi.advanceTimersByTime(5000)
    expect(store.blitzTimeLeft).toBe(55)
  })

  it('should compute isBlitzActive correctly', () => {
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: true,
    }
    
    // Before starting
    expect(store.isBlitzActive).toBe(false)
    
    // After starting
    store.startGame(config)
    expect(store.isBlitzActive).toBe(true)
    
    // After timer expires
    vi.advanceTimersByTime(60000)
    expect(store.isBlitzActive).toBe(false)
  })

  it('should allow manual stop of Blitz timer', () => {
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: true,
    }
    
    store.startGame(config)
    expect(store.blitzMode).toBe(true)
    
    vi.advanceTimersByTime(10000)
    expect(store.blitzTimeLeft).toBe(50)
    
    // Manually stop the timer
    store.stopBlitzTimer()
    
    // Timer should stop decrementing
    vi.advanceTimersByTime(5000)
    expect(store.blitzTimeLeft).toBe(50) // Should remain at 50
  })
})
