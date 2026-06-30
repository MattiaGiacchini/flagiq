import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import * as fc from 'fast-check'
import IncorrectAnswers from './IncorrectAnswers.vue'
import FlagImage from '@/components/common/FlagImage.vue'
import type { IncorrectAnswer } from '@/utils/incorrectAnswers'
import type { Continent } from '@/types/session'

/**
 * Property-based tests for IncorrectAnswers flag image fallback
 * 
 * **Validates: Requirements 4.1, 4.2, 4.5**
 */

describe('IncorrectAnswers - Property-Based Tests', () => {
  // Arbitrary generators
  const continentArb = fc.constantFrom<Continent>(
    'africa',
    'americas',
    'asia',
    'europe',
    'oceania'
  )

  const countryCodeArb = fc.stringMatching(/^[A-Z]{2}$/)
  
  const countryNameArb = fc.string({ minLength: 2, maxLength: 30 })
    .filter(s => s.trim().length > 0)
  
  const emojiArb = fc.constantFrom(
    '🇺🇸', '🇫🇷', '🇩🇪', '🇬🇧', '🇨🇦', 
    '🇯🇵', '🇨🇳', '🇧🇷', '🇦🇺', '🇮🇳'
  )

  const flagArb = fc.record({
    id: countryCodeArb,
    name: countryNameArb,
    nameEs: countryNameArb,
    continent: continentArb,
    emoji: emojiArb
  })

  const incorrectAnswerArb = fc.record({
    correctFlag: flagArb,
    chosenFlag: flagArb,
    continent: continentArb
  })

  describe('Flag Image Fallback Property', () => {
    it('should always render FlagImage component with correct props for any incorrect answer', () => {
      fc.assert(
        fc.property(
          fc.array(incorrectAnswerArb, { minLength: 1, maxLength: 10 }),
          fc.constantFrom<'en' | 'es'>('en', 'es'),
          (incorrectAnswers, locale) => {
            const wrapper = mount(IncorrectAnswers, {
              props: {
                incorrect: incorrectAnswers,
                locale
              }
            })

            const flagImages = wrapper.findAllComponents(FlagImage)
            
            // Property: number of FlagImage components equals number of incorrect answers
            expect(flagImages).toHaveLength(incorrectAnswers.length)
            
            // Property: each FlagImage receives correct props from corresponding incorrect answer
            flagImages.forEach((flagImage, index) => {
              const answer = incorrectAnswers[index]
              if (!answer) return
              
              // Property: countryCode is lowercase version of correct flag's id
              expect(flagImage.props('countryCode')).toBe(answer.correctFlag.id.toLowerCase())
              
              // Property: emoji matches correct flag's emoji
              expect(flagImage.props('emoji')).toBe(answer.correctFlag.emoji)
              
              // Property: alt text contains correct flag's name
              const expectedName = locale === 'es' 
                ? answer.correctFlag.nameEs 
                : answer.correctFlag.name
              expect(flagImage.props('alt')).toContain(expectedName)
              
              // Property: showSkeleton is always false
              expect(flagImage.props('showSkeleton')).toBe(false)
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should use eager loading for first 3 flags and lazy loading for rest', () => {
      fc.assert(
        fc.property(
          fc.array(incorrectAnswerArb, { minLength: 1, maxLength: 10 }),
          (incorrectAnswers) => {
            const wrapper = mount(IncorrectAnswers, {
              props: {
                incorrect: incorrectAnswers,
                locale: 'en'
              }
            })

            const flagImages = wrapper.findAllComponents(FlagImage)
            
            flagImages.forEach((flagImage, index) => {
              if (index < 3) {
                // Property: first 3 flags use eager loading
                expect(flagImage.props('eager')).toBe(true)
              } else {
                // Property: flags beyond first 3 use lazy loading
                expect(flagImage.props('eager')).toBe(false)
              }
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should hide flag images when showFlags is false for any incorrect answers', () => {
      fc.assert(
        fc.property(
          fc.array(incorrectAnswerArb, { minLength: 1, maxLength: 10 }),
          (incorrectAnswers) => {
            const wrapper = mount(IncorrectAnswers, {
              props: {
                incorrect: incorrectAnswers,
                locale: 'en',
                showFlags: false
              }
            })

            // Property: no FlagImage components rendered when showFlags is false
            const flagImages = wrapper.findAllComponents(FlagImage)
            expect(flagImages).toHaveLength(0)
            
            // Property: no flag containers rendered
            const flagContainers = wrapper.findAll('.incorrect-answers__flag-container')
            expect(flagContainers).toHaveLength(0)
            
            // Property: content still renders
            const cards = wrapper.findAll('.incorrect-answers__card')
            expect(cards).toHaveLength(incorrectAnswers.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should display correct flag emoji in chosen answer text for any incorrect answer', () => {
      fc.assert(
        fc.property(
          incorrectAnswerArb,
          fc.constantFrom<'en' | 'es'>('en', 'es'),
          (incorrectAnswer, locale) => {
            const wrapper = mount(IncorrectAnswers, {
              props: {
                incorrect: [incorrectAnswer],
                locale
              }
            })

            const chosenText = wrapper.find('.incorrect-answers__chosen').text()
            
            // Property: chosen text contains the chosen flag's emoji
            expect(chosenText).toContain(incorrectAnswer.chosenFlag.emoji)
            
            // Property: chosen text contains the chosen flag's name
            const chosenName = locale === 'es' 
              ? incorrectAnswer.chosenFlag.nameEs 
              : incorrectAnswer.chosenFlag.name
            expect(chosenText).toContain(chosenName)
            
            // Property: chosen text contains appropriate label for locale
            const expectedLabel = locale === 'es' ? 'Respondiste:' : 'You answered:'
            expect(chosenText).toContain(expectedLabel)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should maintain visual consistency for any number of incorrect answers', () => {
      fc.assert(
        fc.property(
          fc.array(incorrectAnswerArb, { minLength: 1, maxLength: 20 }),
          (incorrectAnswers) => {
            const wrapper = mount(IncorrectAnswers, {
              props: {
                incorrect: incorrectAnswers,
                locale: 'en'
              }
            })

            const cards = wrapper.findAll('.incorrect-answers__card')
            
            // Property: each card has required structure
            cards.forEach((card) => {
              expect(card.find('.incorrect-answers__flag-container').exists()).toBe(true)
              expect(card.find('.incorrect-answers__content').exists()).toBe(true)
              expect(card.find('.incorrect-answers__correct').exists()).toBe(true)
              expect(card.find('.incorrect-answers__chosen').exists()).toBe(true)
              expect(card.find('.incorrect-answers__continent').exists()).toBe(true)
            })
            
            // Property: number of cards equals number of incorrect answers
            expect(cards).toHaveLength(incorrectAnswers.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should correctly format continent names for all locales and continents', () => {
      fc.assert(
        fc.property(
          continentArb,
          fc.constantFrom<'en' | 'es'>('en', 'es'),
          flagArb,
          flagArb,
          (continent, locale, correctFlag, chosenFlag) => {
            const incorrectAnswer: IncorrectAnswer = {
              correctFlag: { ...correctFlag, continent },
              chosenFlag,
              continent
            }

            const wrapper = mount(IncorrectAnswers, {
              props: {
                incorrect: [incorrectAnswer],
                locale
              }
            })

            const continentText = wrapper.find('.incorrect-answers__continent').text()
            
            // Property: continent text is never empty
            expect(continentText.trim()).not.toBe('')
            
            // Property: continent text matches expected translation
            const continentTranslations: Record<Continent, { en: string; es: string }> = {
              africa: { en: 'Africa', es: 'África' },
              americas: { en: 'Americas', es: 'Américas' },
              asia: { en: 'Asia', es: 'Asia' },
              europe: { en: 'Europe', es: 'Europa' },
              oceania: { en: 'Oceania', es: 'Oceanía' }
            }
            
            const expectedText = continentTranslations[continent][locale]
            expect(continentText).toBe(expectedText)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not render when incorrect array is empty regardless of other props', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<'en' | 'es'>('en', 'es'),
          fc.boolean(),
          (locale, showFlags) => {
            const wrapper = mount(IncorrectAnswers, {
              props: {
                incorrect: [],
                locale,
                showFlags
              }
            })

            // Property: component does not render when no incorrect answers
            expect(wrapper.find('.incorrect-answers').exists()).toBe(false)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should display correct flag prominently for any incorrect answer', () => {
      fc.assert(
        fc.property(
          incorrectAnswerArb,
          fc.constantFrom<'en' | 'es'>('en', 'es'),
          (incorrectAnswer, locale) => {
            const wrapper = mount(IncorrectAnswers, {
              props: {
                incorrect: [incorrectAnswer],
                locale
              }
            })

            // Property: correct flag name is displayed in the correct element
            const correctName = locale === 'es' 
              ? incorrectAnswer.correctFlag.nameEs 
              : incorrectAnswer.correctFlag.name
            
            const correctElement = wrapper.find('.incorrect-answers__correct')
            // Vue templates naturally trim whitespace, so we compare trimmed values
            expect(correctElement.text().trim()).toBe(correctName.trim())
            
            // Property: FlagImage uses correct flag's data, not chosen flag's
            const flagImage = wrapper.findComponent(FlagImage)
            expect(flagImage.props('countryCode')).toBe(
              incorrectAnswer.correctFlag.id.toLowerCase()
            )
            expect(flagImage.props('emoji')).toBe(incorrectAnswer.correctFlag.emoji)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
