/**
 * FlagLoader Service
 * 
 * Manages SVG flag image loading with caching and preloading capabilities.
 * Implements requirements 4.3, 4.4, 4.5, 4.6, 4.7 from enhanced-game-results spec.
 */

import type { Question } from '@/stores/game'

export class FlagLoader {
  private cache: Map<string, string> = new Map()
  private loadingPromises: Map<string, Promise<string>> = new Map()
  private readonly LOAD_TIMEOUT_MS = 3000
  private questionQueue: Question[] = []
  private currentQuestionIndex = 0

  /**
   * Preload multiple flag SVGs by their country codes.
   * Downloads and caches the SVG files, but doesn't return blob URLs.
   * 
   * @param ids - Array of ISO 3166-1 alpha-2 country codes (e.g., ['US', 'DE', 'FR'])
   * @returns Promise that resolves when all flags have been attempted to load
   */
  async preload(ids: string[]): Promise<void> {
    const promises = ids.map(async id => {
      try {
        await this.load(id)
      } catch (err) {
        console.warn(`[FlagLoader] Failed to preload flag ${id}:`, err)
      }
    })
    
    await Promise.all(promises)
  }

  /**
   * Load a flag SVG and return its blob URL. Uses cache if available.
   * Implements 3-second timeout for load attempts.
   * 
   * @param id - ISO 3166-1 alpha-2 country code (e.g., 'US', 'DE')
   * @returns Promise<string> - Blob URL for the SVG, or empty string on error
   */
  async load(id: string): Promise<string> {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id)!
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(id)
    if (existingPromise) {
      return existingPromise
    }

    // Start new load with timeout
    const loadPromise = this.loadWithTimeout(id)
    this.loadingPromises.set(id, loadPromise)

    try {
      const blobUrl = await loadPromise
      return blobUrl
    } finally {
      this.loadingPromises.delete(id)
    }
  }

  /**
   * Internal method to load SVG with timeout.
   * Creates a blob URL from the fetched SVG data.
   * 
   * @param id - ISO 3166-1 alpha-2 country code
   * @returns Promise<string> - Blob URL or empty string on error
   */
  private async loadWithTimeout(id: string): Promise<string> {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Timeout loading flag ${id} after ${this.LOAD_TIMEOUT_MS}ms`))
        }, this.LOAD_TIMEOUT_MS)
      })

      // Create fetch promise
      const fetchPromise = this.fetchFlag(id)

      // Race between fetch and timeout
      const blobUrl = await Promise.race([fetchPromise, timeoutPromise])
      
      // Cache the successful result
      this.cache.set(id, blobUrl)
      
      return blobUrl
    } catch (error) {
      console.error(`[FlagLoader] Error loading flag ${id}:`, error)
      // Cache empty string to avoid repeated failed attempts
      this.cache.set(id, '')
      return ''
    }
  }

  /**
   * Fetch the SVG file and convert to blob URL.
   * 
   * @param id - ISO 3166-1 alpha-2 country code
   * @returns Promise<string> - Blob URL for the SVG
   */
  private async fetchFlag(id: string): Promise<string> {
    const path = `/flags/${id.toLowerCase()}.svg`
    const response = await fetch(path)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    
    return blobUrl
  }

  /**
   * Clear all cached blob URLs and revoke them to free memory.
   * Should be called when the loader is no longer needed.
   */
  dispose(): void {
    // Revoke all blob URLs to free memory
    for (const blobUrl of this.cache.values()) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
    
    this.cache.clear()
    this.loadingPromises.clear()
    this.resetSession()
  }

  /**
   * Get the number of cached flags.
   * Useful for testing and monitoring.
   */
  getCacheSize(): number {
    return this.cache.size
  }

  /**
   * Check if a flag is cached.
   * 
   * @param id - ISO 3166-1 alpha-2 country code
   * @returns boolean - True if the flag is in cache
   */
  isCached(id: string): boolean {
    return this.cache.has(id)
  }

  /**
   * Initialize the question queue for a game session and preload first N questions.
   * This should be called when a game session starts.
   * Requirement 4.5: Preload first 3 flag SVGs when session starts.
   * 
   * @param questions - Array of Question objects for the entire game session
   * @param preloadCount - Total number of questions to preload initially (default: 3)
   */
  async initializeSession(questions: Question[], preloadCount: number = 3): Promise<void> {
    this.questionQueue = questions
    this.currentQuestionIndex = 0
    
    await this.preloadQuestions(preloadCount)
  }

  /**
   * Advance to the next question and preload upcoming questions.
   * This should be called when the player answers a question.
   * Requirement 4.5: Preload next 2 questions on each answer.
   * 
   * @param preloadCount - Number of questions after current to preload (default: 2)
   */
  async onQuestionAnswered(preloadCount: number = 2): Promise<void> {
    this.currentQuestionIndex++
    // Preload current + preloadCount more questions
    await this.preloadQuestions(preloadCount + 1)
  }

  /**
   * Preload N questions starting from the current question index.
   * Requirement 4.4: Preload current + next N questions.
   * 
   * @param count - Total number of questions to preload starting from current
   */
  async preloadQuestions(count: number): Promise<void> {
    const flagIds = this.getQuestionFlagIds(this.currentQuestionIndex, count)
    await this.preload(flagIds)
  }

  /**
   * Preload the current question and next N upcoming questions.
   * @deprecated Use preloadQuestions instead for clarity
   * 
   * @param nextCount - Number of questions after current to preload
   */
  async preloadNextQuestions(nextCount: number): Promise<void> {
    // For backwards compatibility: nextCount means "N more after current"
    // So total questions = current + nextCount = nextCount + 1
    await this.preloadQuestions(nextCount + 1)
  }

  /**
   * Extract flag IDs from a range of questions.
   * Handles edge cases where fewer questions remain than requested.
   * 
   * @param startIndex - Starting question index
   * @param count - Number of questions to include
   * @returns Array of unique flag IDs to preload
   */
  private getQuestionFlagIds(startIndex: number, count: number): string[] {
    const flagIds: Set<string> = new Set()
    
    // Calculate the range: [startIndex, startIndex + count)
    const endIndex = Math.min(
      startIndex + count,
      this.questionQueue.length
    )
    
    // Extract all flag IDs from questions in range
    for (let i = startIndex; i < endIndex; i++) {
      const question = this.questionQueue[i]
      if (question) {
        // Add correct answer flag
        flagIds.add(question.correct.id)
        // Add all option flags (includes distractors)
        question.options.forEach(flag => flagIds.add(flag.id))
      }
    }
    
    return Array.from(flagIds)
  }

  /**
   * @deprecated Use getQuestionFlagIds instead
   */
  private getNextQuestionFlagIds(nextCount: number): string[] {
    // For backwards compatibility
    return this.getQuestionFlagIds(this.currentQuestionIndex, nextCount + 1)
  }

  /**
   * Reset the question queue state.
   * Should be called when leaving a game session.
   */
  resetSession(): void {
    this.questionQueue = []
    this.currentQuestionIndex = 0
  }

  /**
   * Get the current question index (useful for testing and debugging).
   */
  getCurrentQuestionIndex(): number {
    return this.currentQuestionIndex
  }
}

/**
 * Singleton instance for application-wide use.
 * Use this instead of creating new instances unless you need isolated caching.
 */
export const flagLoader = new FlagLoader()
