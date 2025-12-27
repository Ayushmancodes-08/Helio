/**
 * Date Formatting Utilities
 * Handles relative time formatting and date localization
 */

import { Locale } from '@/config/i18n'

/**
 * Calculate the difference between two dates in various units
 */
interface DateDifference {
  minutes: number
  hours: number
  days: number
  weeks: number
  months: number
  years: number
}

/**
 * Calculate the difference between a date and now
 * @param date - The date to compare
 * @returns Object with differences in various units
 */
export function calculateDateDifference(date: Date): DateDifference {
  const now = new Date()
  const diffMs = Math.abs(date.getTime() - now.getTime())

  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  return { minutes, hours, days, weeks, months, years }
}

/**
 * Determine if a date is in the past or future
 * @param date - The date to check
 * @returns 'past' if date is before now, 'future' if after now, 'now' if within 1 minute
 */
export function getDateDirection(date: Date): 'past' | 'future' | 'now' {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()

  // If within 1 minute, consider it "now"
  if (Math.abs(diffMs) < 60000) {
    return 'now'
  }

  return diffMs < 0 ? 'past' : 'future'
}

/**
 * Get the appropriate translation key for relative time
 * @param unit - The time unit (minutes, hours, days, etc.)
 * @param count - The count of units
 * @param direction - Whether the time is in the past or future
 * @returns The translation key to use
 */
export function getRelativeTimeKey(
  unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years',
  count: number,
  direction: 'past' | 'future'
): string {
  if (direction === 'past') {
    return count === 1 ? `common.time.${unit}Ago` : `common.time.${unit}Ago_plural`
  } else {
    return count === 1 ? `common.time.in${unit.charAt(0).toUpperCase()}${unit.slice(1)}` : `common.time.in${unit.charAt(0).toUpperCase()}${unit.slice(1)}_plural`
  }
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "in 3 days")
 * This function returns the key and count needed for translation
 * @param date - The date to format
 * @returns Object with translationKey and count for use with translation function
 */
export function formatRelativeTime(date: Date): { key: string; count: number } {
  const direction = getDateDirection(date)

  if (direction === 'now') {
    return { key: 'common.time.now', count: 0 }
  }

  const diff = calculateDateDifference(date)

  // Determine the most appropriate unit
  if (diff.years > 0) {
    return {
      key: getRelativeTimeKey('years', diff.years, direction),
      count: diff.years,
    }
  } else if (diff.months > 0) {
    return {
      key: getRelativeTimeKey('months', diff.months, direction),
      count: diff.months,
    }
  } else if (diff.weeks > 0) {
    return {
      key: getRelativeTimeKey('weeks', diff.weeks, direction),
      count: diff.weeks,
    }
  } else if (diff.days > 0) {
    return {
      key: getRelativeTimeKey('days', diff.days, direction),
      count: diff.days,
    }
  } else if (diff.hours > 0) {
    return {
      key: getRelativeTimeKey('hours', diff.hours, direction),
      count: diff.hours,
    }
  } else {
    return {
      key: getRelativeTimeKey('minutes', Math.max(1, diff.minutes), direction),
      count: Math.max(1, diff.minutes),
    }
  }
}
