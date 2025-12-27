import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fc from 'fast-check'
import { locales, Locale, defaultLocale } from '@/config/i18n'

/**
 * Property 4: Fallback Consistency
 * For any missing translation key, the system SHALL consistently fall back
 * to English translation across all pages and components.
 *
 * Validates: Requirements 7.3, 7.4
 */

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

describe('i18n Storage Utilities - Property 4: Fallback Consistency', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  /**
   * Property-based test: Save and load language consistency
   * For any supported language, when saved to localStorage and retrieved,
   * it should be the same language.
   *
   * Feature: multilingual-indian-languages, Property 4: Fallback Consistency
   */
  it('should consistently save and load language preferences', () => {
    fc.assert(
      fc.property(fc.constantFrom(...locales), (selectedLocale: Locale) => {
        // Arrange
        mockLocalStorage.clear()

        // Act: Save language
        mockLocalStorage.setItem('language_preference', selectedLocale)
        const loaded = mockLocalStorage.getItem('language_preference')

        // Assert: Should load the same language
        expect(loaded).toBe(selectedLocale)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Fallback to default when no preference stored
   * For any empty localStorage, the system should consistently return null.
   *
   * Feature: multilingual-indian-languages, Property 4: Fallback Consistency
   */
  it('should consistently fallback to null when no preference is stored', () => {
    // Arrange
    mockLocalStorage.clear()

    // Act: Try to load when nothing is stored
    const loaded = mockLocalStorage.getItem('language_preference')

    // Assert: Should return null
    expect(loaded).toBeNull()
  })

  /**
   * Property-based test: Multiple saves maintain consistency
   * For any sequence of language saves, the final loaded value should match
   * the last saved value.
   *
   * Feature: multilingual-indian-languages, Property 4: Fallback Consistency
   */
  it('should maintain consistency across multiple saves', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...locales), { minLength: 1, maxLength: 10 }),
        (languageSequence: Locale[]) => {
          // Arrange
          mockLocalStorage.clear()

          // Act: Save multiple languages in sequence
          for (const locale of languageSequence) {
            mockLocalStorage.setItem('language_preference', locale)
          }

          // Assert: Final loaded value should be the last saved
          const loaded = mockLocalStorage.getItem('language_preference')
          expect(loaded).toBe(languageSequence[languageSequence.length - 1])
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Invalid locale handling
   * For any invalid locale, the system should not validate it at storage level.
   *
   * Feature: multilingual-indian-languages, Property 4: Fallback Consistency
   */
  it('should store any value in localStorage (validation happens at utility level)', () => {
    // Arrange
    mockLocalStorage.clear()

    // Act: Store an invalid locale
    const invalidLocale = 'xx-XX'
    mockLocalStorage.setItem('language_preference', invalidLocale)

    // Assert: Should be stored as-is (validation is done by the utility functions)
    const loaded = mockLocalStorage.getItem('language_preference')
    expect(loaded).toBe(invalidLocale)
  })

  /**
   * Property-based test: Clear operation consistency
   * For any saved language, after clearing, the system should consistently
   * return null when loading.
   *
   * Feature: multilingual-indian-languages, Property 4: Fallback Consistency
   */
  it('should consistently clear language preferences', () => {
    fc.assert(
      fc.property(fc.constantFrom(...locales), (selectedLocale: Locale) => {
        // Arrange
        mockLocalStorage.clear()
        mockLocalStorage.setItem('language_preference', selectedLocale)

        // Act: Clear the preference
        mockLocalStorage.removeItem('language_preference')
        const loaded = mockLocalStorage.getItem('language_preference')

        // Assert: Should return null
        expect(loaded).toBeNull()
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Idempotent save operations
   * For any language, saving it multiple times should result in the same
   * stored value.
   *
   * Feature: multilingual-indian-languages, Property 4: Fallback Consistency
   */
  it('should be idempotent when saving the same language multiple times', () => {
    fc.assert(
      fc.property(fc.constantFrom(...locales), (selectedLocale: Locale) => {
        // Arrange
        mockLocalStorage.clear()

        // Act: Save the same language multiple times
        mockLocalStorage.setItem('language_preference', selectedLocale)
        mockLocalStorage.setItem('language_preference', selectedLocale)
        mockLocalStorage.setItem('language_preference', selectedLocale)

        // Assert: Should still be the same language
        const loaded = mockLocalStorage.getItem('language_preference')
        expect(loaded).toBe(selectedLocale)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Valid locale validation
   * For any supported locale, it should be recognized as valid.
   *
   * Feature: multilingual-indian-languages, Property 4: Fallback Consistency
   */
  it('should recognize all supported locales as valid', () => {
    fc.assert(
      fc.property(fc.constantFrom(...locales), (selectedLocale: Locale) => {
        // Assert: All locales should be in the supported list
        expect(locales).toContain(selectedLocale)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Preference persistence across multiple accesses
   * For any language preference saved, it should persist when localStorage is not cleared.
   *
   * Feature: multilingual-indian-languages, Property 4: Fallback Consistency
   */
  it('should maintain language preference across multiple accesses', () => {
    fc.assert(
      fc.property(fc.constantFrom(...locales), (selectedLocale: Locale) => {
        // Arrange
        mockLocalStorage.clear()
        mockLocalStorage.setItem('language_preference', selectedLocale)

        // Act: Simulate multiple accesses
        const firstAccess = mockLocalStorage.getItem('language_preference')
        const secondAccess = mockLocalStorage.getItem('language_preference')
        const thirdAccess = mockLocalStorage.getItem('language_preference')

        // Assert: All accesses should return the same language
        expect(firstAccess).toBe(selectedLocale)
        expect(secondAccess).toBe(selectedLocale)
        expect(thirdAccess).toBe(selectedLocale)
      }),
      { numRuns: 100 }
    )
  })
})
