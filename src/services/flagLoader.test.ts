/**
 * Unit tests for FlagLoader service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { FlagLoader } from './flagLoader'

describe('FlagLoader', () => {
  let loader: FlagLoader
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    loader = new FlagLoader()
    
    // Mock global fetch
    mockFetch = vi.fn()
    globalThis.fetch = mockFetch as any
    
    // Mock URL.createObjectURL and revokeObjectURL
    globalThis.URL.createObjectURL = vi.fn((blob: Blob) => `blob:mock-${blob.size}`) as any
    globalThis.URL.revokeObjectURL = vi.fn() as any
  })

  afterEach(() => {
    loader.dispose()
    vi.restoreAllMocks()
  })

  describe('load', () => {
    it('should load a flag and return blob URL', async () => {
      const mockBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      })

      const blobUrl = await loader.load('US')

      expect(mockFetch).toHaveBeenCalledWith('/flags/us.svg')
      expect(blobUrl).toBe('blob:mock-11')
      expect(loader.isCached('US')).toBe(true)
    })

    it('should return cached blob URL on subsequent calls', async () => {
      const mockBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      })

      const url1 = await loader.load('DE')
      const url2 = await loader.load('DE')
      const url3 = await loader.load('DE')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(url1).toBe(url2)
      expect(url2).toBe(url3)
    })

    it('should handle HTTP errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      const blobUrl = await loader.load('XX')

      expect(blobUrl).toBe('')
      expect(loader.isCached('XX')).toBe(true) // Cache empty result to avoid retries
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const blobUrl = await loader.load('FR')

      expect(blobUrl).toBe('')
      expect(loader.isCached('FR')).toBe(true)
    })

    it('should timeout after 3 seconds', async () => {
      // Create a promise that never resolves
      mockFetch.mockImplementationOnce(() => new Promise(() => {}))

      const startTime = Date.now()
      const blobUrl = await loader.load('IT')
      const elapsed = Date.now() - startTime

      expect(blobUrl).toBe('')
      expect(elapsed).toBeGreaterThanOrEqual(3000)
      expect(elapsed).toBeLessThan(3500) // Allow some margin
    })

    it('should not make duplicate requests for concurrent loads', async () => {
      const mockBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
      
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            blob: async () => mockBlob,
          }), 100)
        )
      )

      // Start three concurrent loads for the same flag
      const promise1 = loader.load('ES')
      const promise2 = loader.load('ES')
      const promise3 = loader.load('ES')

      const [url1, url2, url3] = await Promise.all([promise1, promise2, promise3])

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(url1).toBe(url2)
      expect(url2).toBe(url3)
    })

    it('should use lowercase country codes in the path', async () => {
      const mockBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      })

      await loader.load('GB')

      expect(mockFetch).toHaveBeenCalledWith('/flags/gb.svg')
    })
  })

  describe('preload', () => {
    it('should preload multiple flags', async () => {
      const mockBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
      mockFetch.mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      })

      await loader.preload(['US', 'DE', 'FR'])

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(mockFetch).toHaveBeenCalledWith('/flags/us.svg')
      expect(mockFetch).toHaveBeenCalledWith('/flags/de.svg')
      expect(mockFetch).toHaveBeenCalledWith('/flags/fr.svg')
      
      expect(loader.isCached('US')).toBe(true)
      expect(loader.isCached('DE')).toBe(true)
      expect(loader.isCached('FR')).toBe(true)
    })

    it('should not fail if one flag fails to load', async () => {
      const mockBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('xx')) {
          return Promise.resolve({ ok: false, status: 404 })
        }
        return Promise.resolve({
          ok: true,
          blob: async () => mockBlob,
        })
      })

      await loader.preload(['US', 'XX', 'FR'])

      expect(loader.isCached('US')).toBe(true)
      expect(loader.isCached('XX')).toBe(true) // Cached as empty
      expect(loader.isCached('FR')).toBe(true)
    })

    it('should handle empty array', async () => {
      await loader.preload([])

      expect(mockFetch).not.toHaveBeenCalled()
      expect(loader.getCacheSize()).toBe(0)
    })

    it('should skip already cached flags', async () => {
      const mockBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
      mockFetch.mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      })

      // Load one flag first
      await loader.load('US')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Preload including the already loaded flag
      await loader.preload(['US', 'DE', 'FR'])

      // Should only fetch the two new flags
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })
  })

  describe('dispose', () => {
    it('should revoke all blob URLs and clear cache', async () => {
      const mockBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
      mockFetch.mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      })

      await loader.preload(['US', 'DE', 'FR'])

      expect(loader.getCacheSize()).toBe(3)

      loader.dispose()

      expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledTimes(3)
      expect(loader.getCacheSize()).toBe(0)
      expect(loader.isCached('US')).toBe(false)
    })

    it('should handle empty cache', () => {
      loader.dispose()

      expect(globalThis.URL.revokeObjectURL).not.toHaveBeenCalled()
      expect(loader.getCacheSize()).toBe(0)
    })
  })

  describe('cache management', () => {
    it('should track cache size correctly', async () => {
      const mockBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
      mockFetch.mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      })

      expect(loader.getCacheSize()).toBe(0)

      await loader.load('US')
      expect(loader.getCacheSize()).toBe(1)

      await loader.load('DE')
      expect(loader.getCacheSize()).toBe(2)

      await loader.load('US') // Already cached
      expect(loader.getCacheSize()).toBe(2)
    })

    it('should report isCached correctly', async () => {
      expect(loader.isCached('US')).toBe(false)

      const mockBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
      mockFetch.mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      })

      await loader.load('US')

      expect(loader.isCached('US')).toBe(true)
      expect(loader.isCached('DE')).toBe(false)
    })

    it('should cache failed loads to prevent repeated attempts', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      })

      await loader.load('XX')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(loader.isCached('XX')).toBe(true)

      // Try to load again
      const result = await loader.load('XX')

      // Should return cached empty result without fetching again
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(result).toBe('')
    })
  })

  describe('concurrent loading behavior', () => {
    it('should handle multiple different flags loading concurrently', async () => {
      const mockBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
      
      mockFetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            blob: async () => mockBlob,
          }), 50)
        )
      )

      const promises = [
        loader.load('US'),
        loader.load('DE'),
        loader.load('FR'),
        loader.load('IT'),
        loader.load('ES'),
      ]

      await Promise.all(promises)

      expect(mockFetch).toHaveBeenCalledTimes(5)
      expect(loader.getCacheSize()).toBe(5)
    })

    it('should deduplicate concurrent requests for the same flag', async () => {
      const mockBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
      
      let resolveFunc: (value: any) => void
      const controlledPromise = new Promise(resolve => {
        resolveFunc = resolve
      })

      mockFetch.mockImplementationOnce(() => controlledPromise)

      // Start multiple concurrent loads
      const promise1 = loader.load('US')
      const promise2 = loader.load('US')
      const promise3 = loader.load('US')

      // Wait a bit to ensure all are in flight
      await new Promise(resolve => setTimeout(resolve, 10))

      // Now resolve the fetch
      resolveFunc!({
        ok: true,
        blob: async () => mockBlob,
      })

      const [url1, url2, url3] = await Promise.all([promise1, promise2, promise3])

      // Should only make one fetch call
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(url1).toBe(url2)
      expect(url2).toBe(url3)
    })
  })

  describe('error logging', () => {
    it('should log errors to console', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockFetch.mockRejectedValueOnce(new Error('Network failure'))

      await loader.load('US')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[FlagLoader] Error loading flag US:'),
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('question queue preload strategy', () => {
    const mockFlag = (id: string) => ({
      id,
      name: `Country ${id}`,
      nameEs: `País ${id}`,
      continent: 'europe' as const,
      emoji: '🏳️'
    })

    const mockQuestion = (correctId: string, distractorIds: string[]) => ({
      correct: mockFlag(correctId),
      options: [mockFlag(correctId), ...distractorIds.map(id => mockFlag(id))]
    })

    beforeEach(() => {
      const mockBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' })
      mockFetch.mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      })
    })

    describe('initializeSession', () => {
      it('should preload first 3 questions by default', async () => {
        const questions = [
          mockQuestion('US', ['CA', 'MX', 'BR']),
          mockQuestion('DE', ['FR', 'IT', 'ES']),
          mockQuestion('JP', ['CN', 'KR', 'TH']),
          mockQuestion('AU', ['NZ', 'FJ', 'PG']),
          mockQuestion('EG', ['SA', 'AE', 'IQ']),
        ]

        await loader.initializeSession(questions, 3)

        expect(loader.getCurrentQuestionIndex()).toBe(0)
        
        // Should have loaded all unique flags from first 3 questions
        // Question 0: US, CA, MX, BR = 4 flags
        // Question 1: DE, FR, IT, ES = 4 flags
        // Question 2: JP, CN, KR, TH = 4 flags
        // Total: 12 unique flags
        expect(loader.getCacheSize()).toBe(12)
        
        // Verify specific flags are cached
        expect(loader.isCached('US')).toBe(true)
        expect(loader.isCached('DE')).toBe(true)
        expect(loader.isCached('JP')).toBe(true)
        
        // Fourth question flags should not be cached yet
        expect(loader.isCached('AU')).toBe(false)
      })

      it('should preload custom number of questions', async () => {
        const questions = [
          mockQuestion('US', ['CA', 'MX', 'BR']),
          mockQuestion('DE', ['FR', 'IT', 'ES']),
          mockQuestion('JP', ['CN', 'KR', 'TH']),
        ]

        await loader.initializeSession(questions, 2)

        // Should preload only first 2 questions (8 unique flags)
        expect(loader.getCacheSize()).toBe(8)
        expect(loader.isCached('US')).toBe(true)
        expect(loader.isCached('DE')).toBe(true)
        expect(loader.isCached('JP')).toBe(false)
      })

      it('should handle session with fewer questions than preload count', async () => {
        const questions = [
          mockQuestion('US', ['CA', 'MX', 'BR']),
          mockQuestion('DE', ['FR', 'IT', 'ES']),
        ]

        await loader.initializeSession(questions, 5)

        // Should preload all available questions (8 flags)
        expect(loader.getCacheSize()).toBe(8)
        expect(loader.isCached('US')).toBe(true)
        expect(loader.isCached('DE')).toBe(true)
      })

      it('should reset current question index', async () => {
        const questions = [mockQuestion('US', ['CA', 'MX', 'BR'])]
        
        await loader.initializeSession(questions, 1)
        await loader.onQuestionAnswered()
        
        expect(loader.getCurrentQuestionIndex()).toBe(1)
        
        // Initialize a new session
        await loader.initializeSession(questions, 1)
        
        expect(loader.getCurrentQuestionIndex()).toBe(0)
      })

      it('should handle empty question array', async () => {
        await loader.initializeSession([], 3)

        expect(loader.getCurrentQuestionIndex()).toBe(0)
        expect(loader.getCacheSize()).toBe(0)
      })

      it('should deduplicate flag IDs across questions', async () => {
        // Questions with overlapping flags
        const questions = [
          mockQuestion('US', ['CA', 'MX', 'BR']),
          mockQuestion('CA', ['US', 'MX', 'BR']), // Same flags, different correct answer
        ]

        await loader.initializeSession(questions, 2)

        // Should only load unique flags: US, CA, MX, BR = 4 flags
        expect(loader.getCacheSize()).toBe(4)
      })
    })

    describe('onQuestionAnswered', () => {
      it('should advance index and preload next 2 questions by default', async () => {
        const questions = [
          mockQuestion('Q1', ['A1', 'B1', 'C1']),
          mockQuestion('Q2', ['A2', 'B2', 'C2']),
          mockQuestion('Q3', ['A3', 'B3', 'C3']),
          mockQuestion('Q4', ['A4', 'B4', 'C4']),
          mockQuestion('Q5', ['A5', 'B5', 'C5']),
        ]

        await loader.initializeSession(questions, 3)
        mockFetch.mockClear() // Clear the initial preload calls

        expect(loader.getCurrentQuestionIndex()).toBe(0)

        // Answer first question
        await loader.onQuestionAnswered(2)

        expect(loader.getCurrentQuestionIndex()).toBe(1)
        
        // Should preload Q2 (current), Q3, Q4 - but Q2 and Q3 were already loaded
        // So only Q4 flags should be new
        expect(loader.isCached('Q4')).toBe(true)
        expect(loader.isCached('Q5')).toBe(false)
      })

      it('should preload custom number of upcoming questions', async () => {
        const questions = [
          mockQuestion('Q1', ['A1', 'B1', 'C1']),
          mockQuestion('Q2', ['A2', 'B2', 'C2']),
          mockQuestion('Q3', ['A3', 'B3', 'C3']),
          mockQuestion('Q4', ['A4', 'B4', 'C4']),
          mockQuestion('Q5', ['A5', 'B5', 'C5']),
        ]

        await loader.initializeSession(questions, 2)
        
        // Answer first question and preload 3 more
        await loader.onQuestionAnswered(3)

        expect(loader.getCurrentQuestionIndex()).toBe(1)
        expect(loader.isCached('Q4')).toBe(true)
        expect(loader.isCached('Q5')).toBe(true)
      })

      it('should handle end of questions gracefully', async () => {
        const questions = [
          mockQuestion('Q1', ['A1', 'B1', 'C1']),
          mockQuestion('Q2', ['A2', 'B2', 'C2']),
        ]

        await loader.initializeSession(questions, 1)

        // Answer first question
        await loader.onQuestionAnswered(2)
        expect(loader.getCurrentQuestionIndex()).toBe(1)

        // Answer last question (goes beyond array)
        await loader.onQuestionAnswered(2)
        expect(loader.getCurrentQuestionIndex()).toBe(2)

        // Should not throw error
        expect(loader.getCacheSize()).toBeGreaterThan(0)
      })

      it('should preload current question when at boundary', async () => {
        const questions = [
          mockQuestion('Q1', ['A1', 'B1', 'C1']),
          mockQuestion('Q2', ['A2', 'B2', 'C2']),
          mockQuestion('Q3', ['A3', 'B3', 'C3']),
        ]

        await loader.initializeSession(questions, 1)

        // Answer first two questions
        await loader.onQuestionAnswered(1)
        await loader.onQuestionAnswered(1)

        // Now at Q3 (index 2), which is the last question
        expect(loader.getCurrentQuestionIndex()).toBe(2)
        expect(loader.isCached('Q3')).toBe(true)
      })

      it('should sequence correctly through multiple answers', async () => {
        const questions = [
          mockQuestion('Q1', ['A1', 'B1', 'C1']),
          mockQuestion('Q2', ['A2', 'B2', 'C2']),
          mockQuestion('Q3', ['A3', 'B3', 'C3']),
          mockQuestion('Q4', ['A4', 'B4', 'C4']),
        ]

        await loader.initializeSession(questions, 2)

        expect(loader.getCurrentQuestionIndex()).toBe(0)

        await loader.onQuestionAnswered(1)
        expect(loader.getCurrentQuestionIndex()).toBe(1)

        await loader.onQuestionAnswered(1)
        expect(loader.getCurrentQuestionIndex()).toBe(2)

        await loader.onQuestionAnswered(1)
        expect(loader.getCurrentQuestionIndex()).toBe(3)

        // All flags should be cached by now
        expect(loader.getCacheSize()).toBe(16) // 4 questions × 4 flags each
      })
    })

    describe('preloadNextQuestions', () => {
      it('should preload current and next N questions', async () => {
        const questions = [
          mockQuestion('Q1', ['A1', 'B1', 'C1']),
          mockQuestion('Q2', ['A2', 'B2', 'C2']),
          mockQuestion('Q3', ['A3', 'B3', 'C3']),
        ]

        await loader.initializeSession(questions, 0) // Initialize but don't preload

        expect(loader.getCacheSize()).toBe(0)

        // Manually trigger preload for current + 2 next
        await loader.preloadNextQuestions(2)

        // Should load all 3 questions (12 flags)
        expect(loader.getCacheSize()).toBe(12)
      })

      it('should handle nextCount = 0 (only current question)', async () => {
        const questions = [
          mockQuestion('Q1', ['A1', 'B1', 'C1']),
          mockQuestion('Q2', ['A2', 'B2', 'C2']),
        ]

        await loader.initializeSession(questions, 0)

        await loader.preloadNextQuestions(0)

        // Should only load current question (4 flags)
        expect(loader.getCacheSize()).toBe(4)
        expect(loader.isCached('Q1')).toBe(true)
        expect(loader.isCached('Q2')).toBe(false)
      })

      it('should not exceed question array bounds', async () => {
        const questions = [
          mockQuestion('Q1', ['A1', 'B1', 'C1']),
          mockQuestion('Q2', ['A2', 'B2', 'C2']),
        ]

        await loader.initializeSession(questions, 0)

        // Try to preload way more than available
        await loader.preloadNextQuestions(10)

        // Should only load the 2 available questions (8 flags)
        expect(loader.getCacheSize()).toBe(8)
      })
    })

    describe('resetSession', () => {
      it('should clear question queue and reset index', async () => {
        const questions = [
          mockQuestion('Q1', ['A1', 'B1', 'C1']),
          mockQuestion('Q2', ['A2', 'B2', 'C2']),
        ]

        await loader.initializeSession(questions, 2)
        await loader.onQuestionAnswered()

        expect(loader.getCurrentQuestionIndex()).toBe(1)

        loader.resetSession()

        expect(loader.getCurrentQuestionIndex()).toBe(0)
      })

      it('should not clear cache', async () => {
        const questions = [mockQuestion('Q1', ['A1', 'B1', 'C1'])]

        await loader.initializeSession(questions, 1)
        const cacheSize = loader.getCacheSize()

        loader.resetSession()

        // Cache should remain intact
        expect(loader.getCacheSize()).toBe(cacheSize)
        expect(loader.isCached('Q1')).toBe(true)
      })
    })

    describe('dispose with session state', () => {
      it('should reset session state when disposing', async () => {
        const questions = [mockQuestion('Q1', ['A1', 'B1', 'C1'])]

        await loader.initializeSession(questions, 1)
        await loader.onQuestionAnswered()

        expect(loader.getCurrentQuestionIndex()).toBe(1)

        loader.dispose()

        expect(loader.getCurrentQuestionIndex()).toBe(0)
        expect(loader.getCacheSize()).toBe(0)
      })
    })

    describe('integration - realistic game flow', () => {
      it('should handle a typical game session flow', async () => {
        // Simulate a 5-question game
        const questions = [
          mockQuestion('Q1', ['A1', 'B1', 'C1']),
          mockQuestion('Q2', ['A2', 'B2', 'C2']),
          mockQuestion('Q3', ['A3', 'B3', 'C3']),
          mockQuestion('Q4', ['A4', 'B4', 'C4']),
          mockQuestion('Q5', ['A5', 'B5', 'C5']),
        ]

        // Session start: preload first 3 questions
        await loader.initializeSession(questions, 3)
        
        expect(loader.getCurrentQuestionIndex()).toBe(0)
        expect(loader.isCached('Q1')).toBe(true)
        expect(loader.isCached('Q2')).toBe(true)
        expect(loader.isCached('Q3')).toBe(true)
        expect(loader.isCached('Q4')).toBe(false)

        // Player answers Q1, preload next 2
        await loader.onQuestionAnswered(2)
        
        expect(loader.getCurrentQuestionIndex()).toBe(1)
        expect(loader.isCached('Q4')).toBe(true)
        expect(loader.isCached('Q5')).toBe(false)

        // Player answers Q2
        await loader.onQuestionAnswered(2)
        
        expect(loader.getCurrentQuestionIndex()).toBe(2)
        expect(loader.isCached('Q5')).toBe(true)

        // Player answers remaining questions
        await loader.onQuestionAnswered(2)
        await loader.onQuestionAnswered(2)
        await loader.onQuestionAnswered(2)

        expect(loader.getCurrentQuestionIndex()).toBe(5)
        
        // All flags should be cached
        expect(loader.getCacheSize()).toBe(20) // 5 questions × 4 flags each
      })

      it('should handle rapid consecutive answers', async () => {
        const questions = [
          mockQuestion('Q1', ['A1', 'B1', 'C1']),
          mockQuestion('Q2', ['A2', 'B2', 'C2']),
          mockQuestion('Q3', ['A3', 'B3', 'C3']),
        ]

        await loader.initializeSession(questions, 2)

        // Rapid answers without waiting
        const answer1 = loader.onQuestionAnswered(1)
        const answer2 = loader.onQuestionAnswered(1)
        const answer3 = loader.onQuestionAnswered(1)

        await Promise.all([answer1, answer2, answer3])

        // Should not crash and should reach the end
        expect(loader.getCurrentQuestionIndex()).toBe(3)
      })
    })
  })
})
