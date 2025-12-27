/**
 * Notification Translation Utilities
 * 
 * This module provides helper functions to get translated notification messages
 * for appointment reminders, system notifications, success messages, and warnings.
 */

export type NotificationType = 'appointmentReminders' | 'systemNotifications' | 'successMessages' | 'warningMessages' | 'errorMessages' | 'infoMessages'

export interface NotificationTranslationParams {
  doctorName?: string
  date?: string
  time?: string
  language?: string
  medicineName?: string
  type?: string
  doctor?: string
  count?: number
  [key: string]: any
}

/**
 * Get appointment reminder translation
 * @param key - The translation key (e.g., 'upcoming', 'upcomingIn24Hours')
 * @param t - The translation function from useLanguage hook
 * @param params - Parameters for interpolation
 */
export function getAppointmentReminderTranslation(
  key: string,
  t: (key: string, params?: Record<string, any>) => string,
  params?: NotificationTranslationParams
): string {
  return t(`notifications.appointmentReminders.${key}`, params)
}

/**
 * Get system notification translation
 * @param key - The translation key (e.g., 'profileUpdated', 'passwordChanged')
 * @param t - The translation function from useLanguage hook
 * @param params - Parameters for interpolation
 */
export function getSystemNotificationTranslation(
  key: string,
  t: (key: string, params?: Record<string, any>) => string,
  params?: NotificationTranslationParams
): string {
  return t(`notifications.systemNotifications.${key}`, params)
}

/**
 * Get success message translation
 * @param key - The translation key (e.g., 'appointmentBooked', 'profileUpdated')
 * @param t - The translation function from useLanguage hook
 * @param params - Parameters for interpolation
 */
export function getSuccessMessageTranslation(
  key: string,
  t: (key: string, params?: Record<string, any>) => string,
  params?: NotificationTranslationParams
): string {
  return t(`notifications.successMessages.${key}`, params)
}

/**
 * Get warning message translation
 * @param key - The translation key (e.g., 'appointmentSoon', 'lowStock')
 * @param t - The translation function from useLanguage hook
 * @param params - Parameters for interpolation
 */
export function getWarningMessageTranslation(
  key: string,
  t: (key: string, params?: Record<string, any>) => string,
  params?: NotificationTranslationParams
): string {
  return t(`notifications.warningMessages.${key}`, params)
}

/**
 * Get error message translation
 * @param key - The translation key (e.g., 'appointmentBookingFailed', 'networkError')
 * @param t - The translation function from useLanguage hook
 * @param params - Parameters for interpolation
 */
export function getErrorMessageTranslation(
  key: string,
  t: (key: string, params?: Record<string, any>) => string,
  params?: NotificationTranslationParams
): string {
  return t(`notifications.errorMessages.${key}`, params)
}

/**
 * Get info message translation
 * @param key - The translation key (e.g., 'noAppointments', 'loadingData')
 * @param t - The translation function from useLanguage hook
 * @param params - Parameters for interpolation
 */
export function getInfoMessageTranslation(
  key: string,
  t: (key: string, params?: Record<string, any>) => string,
  params?: NotificationTranslationParams
): string {
  return t(`notifications.infoMessages.${key}`, params)
}

/**
 * Get notification title translation
 * @param type - The notification type
 * @param t - The translation function from useLanguage hook
 */
export function getNotificationTitle(
  type: NotificationType,
  t: (key: string, params?: Record<string, any>) => string
): string {
  return t(`notifications.${type}.title`)
}
