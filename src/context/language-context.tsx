'use client'

import React, { createContext, useCallback, useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { Locale, defaultLocale, locales } from '@/config/i18n'
import { createClient } from '@/lib/supabase/client'
import {
  saveLanguageToLocalStorage,
  loadLanguageFromLocalStorage,
  detectBrowserLanguage,
  getLanguagePreference,
  loadLanguageFromDatabase,
} from '@/lib/i18n-storage'
import { formatRelativeTime } from '@/lib/date-formatting'
import { translationLoader } from '@/lib/translation-loader'
import { translationCache } from '@/lib/translation-cache'

export interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => Promise<void>
  t: (key: string, params?: Record<string, any>) => string
  formatDate: (date: Date, format?: 'short' | 'long' | 'full') => string
  formatRelativeTime: (date: Date) => string
  formatNumber: (num: number) => string
  formatCurrency: (amount: number) => string
  translations: Record<string, any>
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: React.ReactNode
  initialLocale?: Locale
}

// Locale-specific formatting configurations
const localeConfig: Record<Locale, {
  dateFormat: Intl.DateTimeFormatOptions
  numberFormat: Intl.NumberFormatOptions
  currencyFormat: Intl.NumberFormatOptions
}> = {
  'hi-IN': {
    dateFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
    numberFormat: { useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'INR', minimumFractionDigits: 2 },
  },
  'en-IN': {
    dateFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
    numberFormat: { useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'INR', minimumFractionDigits: 2 },
  },
  'bn-IN': {
    dateFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
    numberFormat: { useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'INR', minimumFractionDigits: 2 },
  },
  'te-IN': {
    dateFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
    numberFormat: { useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'INR', minimumFractionDigits: 2 },
  },
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const nextIntlLocale = useLocale() as Locale
  const [locale, setLocaleState] = useState<Locale>(initialLocale || nextIntlLocale || defaultLocale)
  const [translations, setTranslations] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Load translations for the current locale using lazy loading and caching
  const loadTranslations = useCallback(async (targetLocale: Locale) => {
    try {
      setIsLoading(true)
      // Load all translation namespaces for the locale using lazy loader
      const namespaces = ['common', 'auth', 'dashboard', 'appointments', 'medical', 'errors', 'homepage', 'notifications']
      
      // Use lazy loader with caching
      const allTranslations = await translationLoader.loadMultiple(targetLocale, namespaces)
      setTranslations(allTranslations)
    } catch (error) {
      console.error('Error loading translations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initialize translations on mount
  useEffect(() => {
    loadTranslations(locale)
  }, [locale, loadTranslations])

  // Translation function with interpolation support
  const t = useCallback((key: string, params?: Record<string, any>): string => {
    const keys = key.split('.')
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to key if translation not found
        return key
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // Handle interpolation
    if (params) {
      let result = value
      for (const [paramKey, paramValue] of Object.entries(params)) {
        result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue))
      }
      return result
    }

    return value
  }, [translations])

  // Date formatting function
  const formatDate = useCallback((date: Date, format: 'short' | 'long' | 'full' = 'short'): string => {
    const config = localeConfig[locale]
    
    try {
      if (format === 'short') {
        return new Intl.DateTimeFormat(locale, config.dateFormat).format(date)
      } else if (format === 'long') {
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(date)
      } else {
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        }).format(date)
      }
    } catch (error) {
      console.error('Error formatting date:', error)
      return date.toLocaleDateString()
    }
  }, [locale])

  // Number formatting function
  const formatNumber = useCallback((num: number): string => {
    const config = localeConfig[locale]
    
    try {
      return new Intl.NumberFormat(locale, config.numberFormat).format(num)
    } catch (error) {
      console.error('Error formatting number:', error)
      return num.toString()
    }
  }, [locale])

  // Currency formatting function
  const formatCurrency = useCallback((amount: number): string => {
    const config = localeConfig[locale]
    
    try {
      return new Intl.NumberFormat(locale, config.currencyFormat).format(amount)
    } catch (error) {
      console.error('Error formatting currency:', error)
      return `₹${amount.toFixed(2)}`
    }
  }, [locale])

  // Relative time formatting function
  const formatRelativeTimeFunc = useCallback((date: Date): string => {
    try {
      const { key, count } = formatRelativeTime(date)
      return t(key, { count })
    } catch (error) {
      console.error('Error formatting relative time:', error)
      return date.toLocaleDateString()
    }
  }, [t])

  // Set locale and persist to localStorage and database
  const setLocale = useCallback(async (newLocale: Locale) => {
    if (!locales.includes(newLocale)) {
      console.warn(`Invalid locale: ${newLocale}`)
      return
    }

    setLocaleState(newLocale)

    // Persist to localStorage using utility function
    saveLanguageToLocalStorage(newLocale)

    // Preload translations for the new locale to improve performance
    const namespaces = ['common', 'auth', 'dashboard', 'appointments', 'medical', 'errors', 'homepage', 'notifications']
    translationLoader.preload(newLocale, namespaces).catch((error) => {
      console.warn('Failed to preload translations:', error)
    })

    // Persist to database if user is authenticated
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Use API endpoint to save language preference
        const response = await fetch('/api/language/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ language_preference: newLocale }),
        })

        if (!response.ok) {
          console.warn('Failed to save language preference to database')
        }
      }
    } catch (error) {
      console.warn('Failed to save language preference to database:', error)
    }
  }, [supabase])

  // Load language preference from localStorage, database, and browser detection on mount
  useEffect(() => {
    const loadPreference = async () => {
      // First, try to get saved preference from localStorage
      const savedLocale = loadLanguageFromLocalStorage()
      if (savedLocale) {
        setLocaleState(savedLocale)
        return
      }

      // Then, try to load from database if user is authenticated
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const dbLocale = await loadLanguageFromDatabase()
          if (dbLocale) {
            setLocaleState(dbLocale)
            // Also save to localStorage for faster future loads
            saveLanguageToLocalStorage(dbLocale)
            return
          }
        }
      } catch (error) {
        console.warn('Failed to load language preference from database:', error)
      }

      // Finally, detect browser language
      const detectedLocale = detectBrowserLanguage()
      setLocaleState(detectedLocale)
    }

    loadPreference()
  }, [supabase])

  const value: LanguageContextType = {
    locale,
    setLocale,
    t,
    formatDate,
    formatRelativeTime: formatRelativeTimeFunc,
    formatNumber,
    formatCurrency,
    translations,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
