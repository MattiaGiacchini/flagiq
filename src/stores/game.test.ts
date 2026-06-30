import { describe, it, expect } from 'vitest'
import { useGameStore } from './game'
import type { SessionConfig } from '@/types/session'
import { setActivePinia, createPinia } from 'pinia'

describe('game store - buildQuestions randomization', () => {
  it('should shuffle questions when count is all', () => {
    setActivePinia(createPinia())
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 'all',
      blitz: false,
    }
    
    // Start multiple games and collect question orders
    const orders: string[][] = []
    for (let i = 0; i < 10; i++) {
      store.startGame(config)
      const order = store.questions.map(q => q.correct.id)
      orders.push(order)
      store.reset()
    }
    
    // Check that we have at least some different orders
    // (With 44+ flags in Europe, it's virtually impossible to get the same order twice)
    const uniqueOrders = new Set(orders.map(o => o.join(',')))
    expect(uniqueOrders.size).toBeGreaterThan(5) // At least 6 out of 10 should be unique
  })

  it('should shuffle questions when count is numeric', () => {
    setActivePinia(createPinia())
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: false,
    }
    
    // Start multiple games and collect question orders
    const orders: string[][] = []
    for (let i = 0; i < 10; i++) {
      store.startGame(config)
      const order = store.questions.map(q => q.correct.id)
      expect(order).toHaveLength(10) // Verify we get exactly 10 questions
      orders.push(order)
      store.reset()
    }
    
    // Check that we have different orders
    const uniqueOrders = new Set(orders.map(o => o.join(',')))
    expect(uniqueOrders.size).toBeGreaterThan(5) // At least 6 out of 10 should be unique
  })

  it('should respect count limit when count is less than available flags', () => {
    setActivePinia(createPinia())
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['oceania'], // Smaller pool
      mode: 'name-it',
      count: 10,
      blitz: false,
    }
    
    store.startGame(config)
    expect(store.questions.length).toBeLessThanOrEqual(10)
  })
})

describe('game store - similarity-based distractor selection', () => {
  it('should generate questions with useSimilarity enabled', () => {
    setActivePinia(createPinia())
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: false,
      useSimilarity: true,
    }
    
    store.startGame(config)
    
    // Verify questions are generated
    expect(store.questions.length).toBe(10)
    
    // Verify each question has 4 options (1 correct + 3 distractors)
    store.questions.forEach(q => {
      expect(q.options).toHaveLength(4)
      expect(q.options).toContain(q.correct)
    })
  })

  it('should fall back to random selection when similarity matrix is empty', () => {
    setActivePinia(createPinia())
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: false,
      useSimilarity: true, // Enabled, but matrix is empty
    }
    
    store.startGame(config)
    
    // Should still generate valid questions
    expect(store.questions.length).toBe(10)
    
    // Verify each question has valid structure
    store.questions.forEach(q => {
      expect(q.options).toHaveLength(4)
      expect(q.options).toContain(q.correct)
      
      // All options should be unique
      const uniqueIds = new Set(q.options.map(o => o.id))
      expect(uniqueIds.size).toBe(4)
    })
  })

  it('should work with useSimilarity disabled', () => {
    setActivePinia(createPinia())
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: false,
      useSimilarity: false,
    }
    
    store.startGame(config)
    
    // Verify questions are generated normally
    expect(store.questions.length).toBe(10)
    
    store.questions.forEach(q => {
      expect(q.options).toHaveLength(4)
      expect(q.options).toContain(q.correct)
    })
  })

  it('should work with useSimilarity undefined (default)', () => {
    setActivePinia(createPinia())
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['europe'],
      mode: 'name-it',
      count: 10,
      blitz: false,
      // useSimilarity not specified, should default to false
    }
    
    store.startGame(config)
    
    // Verify questions are generated normally
    expect(store.questions.length).toBe(10)
    
    store.questions.forEach(q => {
      expect(q.options).toHaveLength(4)
      expect(q.options).toContain(q.correct)
    })
  })

  it('should ensure distractors are from the same continent pool', () => {
    setActivePinia(createPinia())
    const store = useGameStore()
    
    const config: SessionConfig = {
      continents: ['oceania'], // Small, isolated continent
      mode: 'name-it',
      count: 10,
      blitz: false,
      useSimilarity: true,
    }
    
    store.startGame(config)
    
    // All questions should have distractors from Oceania
    store.questions.forEach(q => {
      q.options.forEach(option => {
        expect(option.continent).toBe('oceania')
      })
    })
  })
})
