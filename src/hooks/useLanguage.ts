'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Locale, locales } from '@/config/i18n'
import { useCallback } from 'react'

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

export function useLanguage(): LanguageContextType {
  const locale = useLocale() as Locale
  const router = useRouter()
  const t = useTranslations() as any

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
  const formatRelativeTime = useCallback((date: Date): string => {
    try {
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffSecs = Math.floor(diffMs / 1000)
      const diffMins = Math.floor(diffSecs / 60)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffSecs < 60) {
        return t('common.timeAgo.justNow')
      } else if (diffMins < 60) {
        return t('common.timeAgo.minutesAgo', { count: diffMins })
      } else if (diffHours < 24) {
        return t('common.timeAgo.hoursAgo', { count: diffHours })
      } else if (diffDays < 7) {
        return t('common.timeAgo.daysAgo', { count: diffDays })
      } else {
        return formatDate(date, 'short')
      }
    } catch (error) {
      console.error('Error formatting relative time:', error)
      return date.toLocaleDateString()
    }
  }, [locale, t, formatDate])

  // Set locale and navigate to new locale route
  const setLocale = useCallback(async (newLocale: Locale) => {
    if (!locales.includes(newLocale)) {
      console.warn(`Invalid locale: ${newLocale}`)
      return
    }

    // Get current pathname without locale
    const pathname = window.location.pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    
    // Navigate to new locale route
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }, [locale, router])

  return {
    locale,
    setLocale,
    t: (key: string, params?: Record<string, any>) => {
      try {
        return t(key, params)
      } catch (error) {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    },
    formatDate,
    formatRelativeTime,
    formatNumber,
    formatCurrency,
    translations: {}, // Not used with next-intl
  }
}
