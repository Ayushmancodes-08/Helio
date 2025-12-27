/**
 * i18n Storage Utilities
 * Handles localStorage persistence and browser language detection for language preferences
 */

import { Locale, locales, defaultLocale } from '@/config/i18n'

const LANGUAGE_PREFERENCE_KEY = 'language_preference'

/**
 * Save language preference to localStorage
 * @param locale - The locale to save
 * @returns true if successful, false otherwise
 */
export function saveLanguageToLocalStorage(locale: Locale): boolean {
  try {
    if (typeof window === 'undefined') {
      return false
    }
    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, locale)
    return true
  } catch (error) {
    console.warn('Failed to save language preference to localStorage:', error)
    return false
  }
}

/**
 * Load language preference from localStorage
 * @returns The saved locale, or null if not found or invalid
 */
export function loadLanguageFromLocalStorage(): Locale | null {
  try {
    if (typeof window === 'undefined') {
      return null
    }
    const saved = localStorage.getItem(LANGUAGE_PREFERENCE_KEY)
    if (saved && locales.includes(saved as Locale)) {
      return saved as Locale
    }
    return null
  } catch (error) {
    console.warn('Failed to load language preference from localStorage:', error)
    return null
  }
}

/**
 * Detect browser language and return matching locale
 * Falls back to English if no match found
 * @returns The detected locale or default locale
 */
export function detectBrowserLanguage(): Locale {
  try {
    if (typeof window === 'undefined') {
      return defaultLocale
    }

    // Get browser language
    const browserLanguage = navigator.language || navigator.languages?.[0]
    if (!browserLanguage) {
      return defaultLocale
    }

    // Normalize browser language to lowercase
    const normalizedBrowserLang = browserLanguage.toLowerCase()

    // Try exact match first (e.g., 'hi-in' matches 'hi-IN')
    for (const locale of locales) {
      if (locale.toLowerCase() === normalizedBrowserLang) {
        return locale
      }
    }

    // Try language code match (e.g., 'hi' from 'hi-in' matches 'hi-IN')
    const browserLangCode = normalizedBrowserLang.split('-')[0]
    for (const locale of locales) {
      const localeCode = locale.split('-')[0].toLowerCase()
      if (localeCode === browserLangCode) {
        return locale
      }
    }

    // Default to English if no match
    return defaultLocale
  } catch (error) {
    console.warn('Failed to detect browser language:', error)
    return defaultLocale
  }
}

/**
 * Get the appropriate language preference with fallback chain:
 * 1. Saved localStorage preference
 * 2. Browser detected language
 * 3. Default language (English)
 * @returns The language preference to use
 */
export function getLanguagePreference(): Locale {
  // First, try to get saved preference
  const savedLocale = loadLanguageFromLocalStorage()
  if (savedLocale) {
    return savedLocale
  }

  // Then, try to detect browser language
  const detectedLocale = detectBrowserLanguage()
  if (detectedLocale !== defaultLocale) {
    return detectedLocale
  }

  // Finally, default to English
  return defaultLocale
}

/**
 * Clear language preference from localStorage
 * @returns true if successful, false otherwise
 */
export function clearLanguagePreference(): boolean {
  try {
    if (typeof window === 'undefined') {
      return false
    }
    localStorage.removeItem(LANGUAGE_PREFERENCE_KEY)
    return true
  } catch (error) {
    console.warn('Failed to clear language preference from localStorage:', error)
    return false
  }
}

/**
 * Load language preference from database for authenticated user
 * @returns The saved locale from database, or null if not found or user not authenticated
 */
export async function loadLanguageFromDatabase(): Promise<Locale | null> {
  try {
    if (typeof window === 'undefined') {
      return null
    }

    const response = await fetch('/api/language/load', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const locale = data.language_preference

    if (locale && locales.includes(locale as Locale)) {
      return locale as Locale
    }

    return null
  } catch (error) {
    console.warn('Failed to load language preference from database:', error)
    return null
  }
}
