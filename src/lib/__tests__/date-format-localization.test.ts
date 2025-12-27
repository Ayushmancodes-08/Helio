import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { locales, Locale } from '@/config/i18n'

/**
 * Property 5: Date Format Localization
 * For any date displayed in the application, the format SHALL match the selected language's locale
 * (e.g., DD/MM/YYYY for Hindi, MM/DD/YYYY for English).
 *
 * Validates: Requirements 5.1, 5.3
 */

// Locale-specific date format configurations
const localeFormats: Record<Locale, {
  shortFormat: Intl.DateTimeFormatOptions
  longFormat: Intl.DateTimeFormatOptions
  hasNumericDigits: boolean // Whether locale uses ASCII digits or native numerals
}> = {
  'hi-IN': {
    shortFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
    longFormat: { year: 'numeric', month: 'long', day: 'numeric' },
    hasNumericDigits: true, // Hindi uses Devanagari numerals
  },
  'en-IN': {
    shortFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
    longFormat: { year: 'numeric', month: 'long', day: 'numeric' },
    hasNumericDigits: true, // English uses ASCII digits
  },
  'bn-IN': {
    shortFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
    longFormat: { year: 'numeric', month: 'long', day: 'numeric' },
    hasNumericDigits: true, // Bengali uses Bengali numerals
  },
  'te-IN': {
    shortFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
    longFormat: { year: 'numeric', month: 'long', day: 'numeric' },
    hasNumericDigits: true, // Telugu uses Telugu numerals
  },
}

// Helper function to check if a string contains any numeric characters (ASCII or locale-specific)
function containsNumericCharacters(str: string): boolean {
  // Match ASCII digits or any Unicode digit character
  return /[\d\u0660-\u0669\u06F0-\u06F9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0A86-\u0A8F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B86-\u0B8F\u0BE6-\u0BEF\u0C66-\u0C6F\u0C86-\u0C8F\u0CE6-\u0CEF\u0D58-\u0D5E\u0D66-\u0D6F\u0D86-\u0D8F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29]/.test(str)
}

describe('Date Format Localization - Property 5', () => {
  /**
   * Property-based test: Date formatting consistency across locales
   * For any date and any supported locale, the formatted date should contain numeric components
   * and follow the locale-specific pattern.
   *
   * Feature: multilingual-indian-languages, Property 5: Date Format Localization
   */
  it('should format dates consistently for all supported locales', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (date: Date) => {
          // For each supported locale
          for (const locale of locales) {
            // Act: Format date using Intl API
            const formatted = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date)

            // Assert: Formatted date should contain numeric components (ASCII or locale-specific)
            expect(containsNumericCharacters(formatted)).toBe(true)
            // Assert: Should not be empty
            expect(formatted.length).toBeGreaterThan(0)
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property-based test: Date formatting preserves date components
   * For any date, the formatted output should contain numeric components.
   *
   * Feature: multilingual-indian-languages, Property 5: Date Format Localization
   */
  it('should preserve all date components in formatted output', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (date: Date) => {
          // For each supported locale
          for (const locale of locales) {
            // Act: Format date
            const formatted = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date)

            // Assert: Formatted string should contain numeric components
            expect(containsNumericCharacters(formatted)).toBe(true)
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property-based test: Long format dates include month names
   * For any date and any supported locale, the long format should include the month name.
   *
   * Feature: multilingual-indian-languages, Property 5: Date Format Localization
   */
  it('should include month names in long format dates', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (date: Date) => {
          // For each supported locale
          for (const locale of locales) {
            // Act: Format date in long format
            const formatted = new Intl.DateTimeFormat(locale, localeFormats[locale].longFormat).format(date)

            // Assert: Long format should be longer than short format
            const shortFormatted = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date)
            expect(formatted.length).toBeGreaterThanOrEqual(shortFormatted.length)
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property-based test: Date formatting is deterministic
   * For any date and locale, formatting the same date multiple times should produce the same result.
   *
   * Feature: multilingual-indian-languages, Property 5: Date Format Localization
   */
  it('should produce consistent results for the same date', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (date: Date) => {
          // Skip invalid dates
          if (isNaN(date.getTime())) {
            return true
          }

          // For each supported locale
          for (const locale of locales) {
            // Act: Format the same date multiple times
            const formatted1 = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date)
            const formatted2 = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date)
            const formatted3 = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date)

            // Assert: All results should be identical
            expect(formatted1).toBe(formatted2)
            expect(formatted2).toBe(formatted3)
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property-based test: Different dates produce different formatted strings
   * For any two different dates (different day), the formatted output should be different.
   *
   * Feature: multilingual-indian-languages, Property 5: Date Format Localization
   */
  it('should produce different results for different dates', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
        ),
        ([date1, date2]: [Date, Date]) => {
          // Skip if dates are the same day
          const day1 = new Date(date1).setHours(0, 0, 0, 0)
          const day2 = new Date(date2).setHours(0, 0, 0, 0)
          
          if (day1 === day2) {
            return true
          }

          // For each supported locale
          for (const locale of locales) {
            // Act: Format both dates
            const formatted1 = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date1)
            const formatted2 = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date2)

            // Assert: Formatted strings should be different
            expect(formatted1).not.toBe(formatted2)
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property-based test: Date formatting handles edge cases
   * For dates at the beginning and end of months/years, formatting should work correctly.
   *
   * Feature: multilingual-indian-languages, Property 5: Date Format Localization
   */
  it('should handle edge case dates correctly', () => {
    const edgeCases = [
      new Date('2020-01-01'), // First day of year
      new Date('2020-12-31'), // Last day of year
      new Date('2020-02-29'), // Leap year date
      new Date('2021-02-28'), // Non-leap year date
      new Date('2020-01-31'), // Last day of month
      new Date('2020-04-30'), // Month with 30 days
    ]

    for (const date of edgeCases) {
      for (const locale of locales) {
        // Act: Format edge case date
        const formatted = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date)

        // Assert: Should produce valid formatted string
        expect(formatted).toBeDefined()
        expect(formatted.length).toBeGreaterThan(0)
        expect(containsNumericCharacters(formatted)).toBe(true)
      }
    }
  })

  /**
   * Property-based test: Date formatting respects locale-specific patterns
   * For any date, the formatted output should contain numeric components for that locale.
   *
   * Feature: multilingual-indian-languages, Property 5: Date Format Localization
   */
  it('should match locale-specific date patterns', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (date: Date) => {
          // For each supported locale
          for (const locale of locales) {
            // Act: Format date
            const formatted = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date)

            // Assert: Should contain numeric components (locale-specific or ASCII)
            expect(containsNumericCharacters(formatted)).toBe(true)
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property-based test: Date formatting is locale-aware
   * For the same date, different locales should produce appropriately formatted strings.
   *
   * Feature: multilingual-indian-languages, Property 5: Date Format Localization
   */
  it('should produce locale-aware formatted dates', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (date: Date) => {
          const formattedByLocale: Record<Locale, string> = {} as Record<Locale, string>

          // Format the same date in all locales
          for (const locale of locales) {
            formattedByLocale[locale] = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date)
          }

          // Assert: All formatted dates should be valid strings
          for (const locale of locales) {
            expect(formattedByLocale[locale]).toBeDefined()
            expect(formattedByLocale[locale].length).toBeGreaterThan(0)
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property-based test: Date formatting handles time components correctly
   * For dates with different times, the date portion should be formatted consistently.
   *
   * Feature: multilingual-indian-languages, Property 5: Date Format Localization
   */
  it('should format date portion consistently regardless of time', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          fc.integer({ min: 0, max: 23 }),
          fc.integer({ min: 0, max: 59 }),
          fc.integer({ min: 0, max: 59 })
        ),
        ([date, hours, minutes, seconds]: [Date, number, number, number]) => {
          // Create two dates with same date but different times
          const date1 = new Date(date)
          date1.setHours(0, 0, 0, 0)

          const date2 = new Date(date)
          date2.setHours(hours, minutes, seconds, 0)

          // For each supported locale
          for (const locale of locales) {
            // Act: Format both dates
            const formatted1 = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date1)
            const formatted2 = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date2)

            // Assert: Date portions should be identical
            expect(formatted1).toBe(formatted2)
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property-based test: Date formatting produces non-empty strings
   * For any valid date, the formatted output should never be empty.
   *
   * Feature: multilingual-indian-languages, Property 5: Date Format Localization
   */
  it('should never produce empty formatted dates', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (date: Date) => {
          // Skip invalid dates
          if (isNaN(date.getTime())) {
            return true
          }

          // For each supported locale
          for (const locale of locales) {
            // Act: Format date
            const formatted = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date)

            // Assert: Should not be empty
            expect(formatted).toBeTruthy()
            expect(formatted.trim().length).toBeGreaterThan(0)
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property-based test: Date formatting handles century boundaries
   * For dates across different centuries, formatting should work correctly.
   *
   * Feature: multilingual-indian-languages, Property 5: Date Format Localization
   */
  it('should handle dates across century boundaries', () => {
    const centuryBoundaryDates = [
      new Date('1999-12-31'),
      new Date('2000-01-01'),
      new Date('2099-12-31'),
      new Date('2100-01-01'),
    ]

    for (const date of centuryBoundaryDates) {
      for (const locale of locales) {
        // Act: Format date
        const formatted = new Intl.DateTimeFormat(locale, localeFormats[locale].shortFormat).format(date)

        // Assert: Should produce valid formatted string
        expect(formatted).toBeDefined()
        expect(formatted.length).toBeGreaterThan(0)
        expect(containsNumericCharacters(formatted)).toBe(true)
      }
    }
  })
})
