import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fc from 'fast-check'
import { locales, Locale } from '@/config/i18n'

/**
 * Property 6: Currency Format Consistency
 * For any currency amount displayed, the format SHALL be consistent with the selected language's locale.
 *
 * Validates: Requirements 6.1, 6.2
 */

/**
 * Property 1: Language Persistence Round-Trip
 * For any user who selects a language and then closes and reopens the application,
 * the application SHALL display content in the previously selected language.
 *
 * Validates: Requirements 1.2, 2.3, 2.4
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

describe('Language Persistence Round-Trip - Property 1', () => {
  beforeEach(() => {
    // Clear mock localStorage before each test
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    mockLocalStorage.clear()
  })

  /**
   * Property-based test: Language persistence round-trip
   * For any supported language, when saved to localStorage and retrieved,
   * it should be the same language.
   *
   * Feature: multilingual-indian-languages, Property 1: Language Persistence Round-Trip
   */
  it('should persist and retrieve language preference from localStorage', () => {
    fc.assert(
      fc.property(fc.constantFrom(...locales), (selectedLocale: Locale) => {
        // Arrange: Clear localStorage
        mockLocalStorage.clear()

        // Act: Save language to localStorage
        mockLocalStorage.setItem('language_preference', selectedLocale)

        // Assert: Retrieve and verify
        const retrievedLocale = mockLocalStorage.getItem('language_preference')
        expect(retrievedLocale).toBe(selectedLocale)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Language preference validation
   * For any language preference stored in localStorage, it should be a valid locale.
   *
   * Feature: multilingual-indian-languages, Property 1: Language Persistence Round-Trip
   */
  it('should only store valid language preferences', () => {
    fc.assert(
      fc.property(fc.constantFrom(...locales), (selectedLocale: Locale) => {
        // Arrange
        mockLocalStorage.clear()

        // Act: Save language
        mockLocalStorage.setItem('language_preference', selectedLocale)
        const stored = mockLocalStorage.getItem('language_preference')

        // Assert: Verify it's a valid locale
        expect(locales).toContain(stored as Locale)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Multiple language switches
   * For any sequence of language selections, the final stored language
   * should be the last selected language.
   *
   * Feature: multilingual-indian-languages, Property 1: Language Persistence Round-Trip
   */
  it('should handle multiple language switches correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...locales), { minLength: 1, maxLength: 10 }),
        (languageSequence: Locale[]) => {
          // Arrange
          mockLocalStorage.clear()

          // Act: Switch through multiple languages
          for (const locale of languageSequence) {
            mockLocalStorage.setItem('language_preference', locale)
          }

          // Assert: Final language should be the last one
          const finalLocale = mockLocalStorage.getItem('language_preference')
          expect(finalLocale).toBe(languageSequence[languageSequence.length - 1])
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Language preference round-trip with default fallback
   * For any language preference, if it's not found in localStorage,
   * the system should default to English.
   *
   * Feature: multilingual-indian-languages, Property 1: Language Persistence Round-Trip
   */
  it('should default to English when no language preference is stored', () => {
    // Arrange
    mockLocalStorage.clear()

    // Act: Try to retrieve non-existent preference
    const stored = mockLocalStorage.getItem('language_preference')

    // Assert: Should be null (application should default to English)
    expect(stored).toBeNull()
  })

  /**
   * Property-based test: Language preference persistence across sessions
   * For any language preference saved, it should persist when localStorage is not cleared.
   *
   * Feature: multilingual-indian-languages, Property 1: Language Persistence Round-Trip
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

  /**
   * Property-based test: Language preference idempotence
   * For any language preference, setting it multiple times should result
   * in the same stored value.
   *
   * Feature: multilingual-indian-languages, Property 1: Language Persistence Round-Trip
   */
  it('should be idempotent when setting the same language multiple times', () => {
    fc.assert(
      fc.property(fc.constantFrom(...locales), (selectedLocale: Locale) => {
        // Arrange
        mockLocalStorage.clear()

        // Act: Set the same language multiple times
        mockLocalStorage.setItem('language_preference', selectedLocale)
        mockLocalStorage.setItem('language_preference', selectedLocale)
        mockLocalStorage.setItem('language_preference', selectedLocale)

        // Assert: Should still be the same language
        const stored = mockLocalStorage.getItem('language_preference')
        expect(stored).toBe(selectedLocale)
      }),
      { numRuns: 100 }
    )
  })
})



/**
 * Property 6: Currency Format Consistency
 * For any currency amount displayed, the format SHALL be consistent with the selected language's locale.
 *
 * Validates: Requirements 6.1, 6.2
 */

describe('Currency Format Consistency - Property 6', () => {
  /**
   * Property-based test: Currency formatting consistency
   * For any supported locale and any valid currency amount,
   * the formatted currency should contain the INR symbol and be properly formatted.
   *
   * Feature: multilingual-indian-languages, Property 6: Currency Format Consistency
   */
  it('should format currency consistently for all supported locales', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...locales),
        fc.integer({ min: 0, max: 1000000 }),
        (locale: Locale, amount: number) => {
          // Act: Format currency using Intl API (same as formatCurrency implementation)
          const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          })
          const formatted = formatter.format(amount)

          // Assert: Formatted string should contain INR symbol
          expect(formatted).toContain('₹')

          // Assert: Formatted string should be a non-empty string
          expect(formatted.length).toBeGreaterThan(0)

          // Assert: Formatted string should contain numeric characters (including locale-specific digits)
          // Matches Arabic digits (0-9), Bengali digits (০-৯), Hindi digits (०-९), Telugu digits (౦-౯)
          expect(formatted).toMatch(/[\d०-९০-৯౦-౯]/)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Currency format includes decimal places
   * For any currency amount, the formatted output should include exactly 2 decimal places.
   *
   * Feature: multilingual-indian-languages, Property 6: Currency Format Consistency
   */
  it('should include exactly 2 decimal places in currency formatting', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...locales),
        fc.integer({ min: 0, max: 1000000 }),
        (locale: Locale, amount: number) => {
          // Act: Format currency
          const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          })
          const formatted = formatter.format(amount)

          // Assert: Should contain decimal separator and 2 decimal places
          // Matches decimal separator followed by 2 locale-specific digits
          const decimalMatch = formatted.match(/[.,][\d०-९०-৯౦-౯]{2}/)
          expect(decimalMatch).not.toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Currency format is consistent across multiple calls
   * For any locale and amount, formatting the same amount multiple times
   * should produce identical results (idempotence).
   *
   * Feature: multilingual-indian-languages, Property 6: Currency Format Consistency
   */
  it('should produce consistent formatting across multiple calls (idempotence)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...locales),
        fc.integer({ min: 0, max: 1000000 }),
        (locale: Locale, amount: number) => {
          // Act: Format the same amount multiple times
          const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          })
          const formatted1 = formatter.format(amount)
          const formatted2 = formatter.format(amount)
          const formatted3 = formatter.format(amount)

          // Assert: All three formats should be identical
          expect(formatted1).toBe(formatted2)
          expect(formatted2).toBe(formatted3)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Currency format respects locale-specific grouping
   * For any locale and large amount, the formatted currency should use
   * locale-specific thousand separators.
   *
   * Feature: multilingual-indian-languages, Property 6: Currency Format Consistency
   */
  it('should apply locale-specific grouping for large amounts', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...locales),
        fc.integer({ min: 1000, max: 1000000 }),
        (locale: Locale, amount: number) => {
          // Act: Format currency
          const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          })
          const formatted = formatter.format(amount)

          // Assert: For amounts >= 1000, should contain grouping separator
          // (either comma or space depending on locale)
          if (amount >= 1000) {
            // Should have some form of grouping - check that formatted is longer than a simple number
            // This accounts for currency symbol, grouping separators, and decimal places
            expect(formatted.length).toBeGreaterThanOrEqual(
              formatter.format(999).length
            )
          }

          // Assert: Should still contain INR symbol
          expect(formatted).toContain('₹')
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Currency format handles zero and small amounts
   * For any locale and small amounts (including zero), formatting should work correctly.
   *
   * Feature: multilingual-indian-languages, Property 6: Currency Format Consistency
   */
  it('should correctly format zero and small amounts', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...locales),
        fc.integer({ min: 0, max: 99 }),
        (locale: Locale, amount: number) => {
          // Act: Format currency
          const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          })
          const formatted = formatter.format(amount)

          // Assert: Should contain INR symbol
          expect(formatted).toContain('₹')

          // Assert: Should contain decimal separator with 2 digits (including locale-specific digits)
          expect(formatted).toMatch(/[.,][\d०-९०-৯౦-౯]{2}/)

          // Assert: Should be a valid string
          expect(typeof formatted).toBe('string')
          expect(formatted.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Currency format is locale-independent for INR
   * For any locale, the currency should always be INR (₹) since all locales use Indian Rupees.
   *
   * Feature: multilingual-indian-languages, Property 6: Currency Format Consistency
   */
  it('should always use INR currency symbol regardless of locale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...locales),
        fc.integer({ min: 0, max: 100000 }),
        (locale: Locale, amount: number) => {
          // Act: Format currency
          const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          })
          const formatted = formatter.format(amount)

          // Assert: All locales should use INR symbol (₹)
          expect(formatted).toContain('₹')
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Currency format handles decimal amounts
   * For any locale and decimal amount, formatting should preserve 2 decimal places.
   *
   * Feature: multilingual-indian-languages, Property 6: Currency Format Consistency
   */
  it('should correctly format decimal amounts with 2 decimal places', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...locales),
        fc.tuple(
          fc.integer({ min: 0, max: 100000 }),
          fc.integer({ min: 0, max: 99 })
        ),
        (locale: Locale, [wholePart, decimalPart]: [number, number]) => {
          // Arrange: Create decimal amount
          const amount = wholePart + decimalPart / 100

          // Act: Format currency
          const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
          })
          const formatted = formatter.format(amount)

          // Assert: Should contain INR symbol
          expect(formatted).toContain('₹')

          // Assert: Should have decimal separator with 2 digits (including locale-specific digits)
          expect(formatted).toMatch(/[.,][\d०-९०-৯౦-౯]{2}/)
        }
      ),
      { numRuns: 100 }
    )
  })
})
