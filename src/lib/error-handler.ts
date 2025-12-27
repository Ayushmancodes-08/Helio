/**
 * Error Handler Utility
 * Provides functions to translate error messages based on the current language
 */

import { LanguageContextType } from '@/context/language-context'

export interface ErrorTranslationParams {
  key: string
  params?: Record<string, any>
}

/**
 * Get translated error message
 * @param t - Translation function from language context
 * @param errorKey - Error key (e.g., 'validation.required', 'authentication.invalidCredentials')
 * @param params - Optional parameters for interpolation
 * @returns Translated error message
 */
export function getErrorMessage(
  t: LanguageContextType['t'],
  errorKey: string,
  params?: Record<string, any>
): string {
  return t(`errors.${errorKey}`, params)
}

/**
 * Map validation error codes to translation keys
 */
export const validationErrorMap: Record<string, string> = {
  required: 'validation.required',
  email: 'validation.invalidEmail',
  phone: 'validation.invalidPhone',
  minLength: 'validation.minLength',
  maxLength: 'validation.maxLength',
  pattern: 'validation.pattern',
  passwordTooShort: 'validation.passwordTooShort',
  passwordMismatch: 'validation.passwordMismatch',
  invalidDate: 'validation.invalidDate',
  invalidNumber: 'validation.invalidNumber',
}

/**
 * Map HTTP status codes to translation keys
 */
export const httpErrorMap: Record<number, string> = {
  400: 'general.badRequest',
  401: 'general.unauthorized',
  403: 'general.forbidden',
  404: 'general.notFound',
  409: 'general.conflict',
  429: 'general.tooManyRequests',
  500: 'general.serverError',
  503: 'general.serviceUnavailable',
}

/**
 * Map authentication error codes to translation keys
 */
export const authErrorMap: Record<string, string> = {
  invalid_credentials: 'authentication.invalidCredentials',
  account_locked: 'authentication.accountLocked',
  account_not_found: 'authentication.accountNotFound',
  email_already_exists: 'authentication.emailAlreadyExists',
  phone_already_exists: 'authentication.phoneAlreadyExists',
  session_expired: 'authentication.sessionExpired',
  token_invalid: 'authentication.tokenInvalid',
  token_expired: 'authentication.tokenExpired',
}

/**
 * Map appointment error codes to translation keys
 */
export const appointmentErrorMap: Record<string, string> = {
  appointment_not_found: 'appointment.appointmentNotFound',
  appointment_cancelled: 'appointment.appointmentCancelled',
  appointment_passed: 'appointment.appointmentPassed',
  doctor_not_available: 'appointment.doctorNotAvailable',
  slot_not_available: 'appointment.slotNotAvailable',
  cannot_cancel: 'appointment.cannotCancelAppointment',
  cannot_reschedule: 'appointment.cannotRescheduleAppointment',
}

/**
 * Map medical error codes to translation keys
 */
export const medicalErrorMap: Record<string, string> = {
  record_not_found: 'medical.recordNotFound',
  prescription_not_found: 'medical.prescriptionNotFound',
  lab_report_not_found: 'medical.labReportNotFound',
  invalid_medication: 'medical.invalidMedication',
  invalid_dosage: 'medical.invalidDosage',
}

/**
 * Get translated error message from HTTP status code
 * @param t - Translation function from language context
 * @param statusCode - HTTP status code
 * @returns Translated error message
 */
export function getHttpErrorMessage(
  t: LanguageContextType['t'],
  statusCode: number
): string {
  const errorKey = httpErrorMap[statusCode] || 'general.serverError'
  return getErrorMessage(t, errorKey)
}

/**
 * Get translated error message from authentication error code
 * @param t - Translation function from language context
 * @param errorCode - Authentication error code
 * @returns Translated error message
 */
export function getAuthErrorMessage(
  t: LanguageContextType['t'],
  errorCode: string
): string {
  const errorKey = authErrorMap[errorCode] || 'authentication.invalidCredentials'
  return getErrorMessage(t, errorKey)
}

/**
 * Get translated error message from appointment error code
 * @param t - Translation function from language context
 * @param errorCode - Appointment error code
 * @returns Translated error message
 */
export function getAppointmentErrorMessage(
  t: LanguageContextType['t'],
  errorCode: string
): string {
  const errorKey = appointmentErrorMap[errorCode] || 'general.serverError'
  return getErrorMessage(t, errorKey)
}

/**
 * Get translated error message from medical error code
 * @param t - Translation function from language context
 * @param errorCode - Medical error code
 * @returns Translated error message
 */
export function getMedicalErrorMessage(
  t: LanguageContextType['t'],
  errorCode: string
): string {
  const errorKey = medicalErrorMap[errorCode] || 'medical.recordNotFound'
  return getErrorMessage(t, errorKey)
}

/**
 * Get translated validation error message
 * @param t - Translation function from language context
 * @param errorCode - Validation error code
 * @param params - Optional parameters for interpolation
 * @returns Translated error message
 */
export function getValidationErrorMessage(
  t: LanguageContextType['t'],
  errorCode: string,
  params?: Record<string, any>
): string {
  const errorKey = validationErrorMap[errorCode] || 'validation.pattern'
  return getErrorMessage(t, errorKey, params)
}

/**
 * Parse Zod validation error and return translated message
 * @param t - Translation function from language context
 * @param fieldName - Name of the field with error
 * @param errorCode - Zod error code
 * @param params - Optional parameters for interpolation
 * @returns Translated error message
 */
export function parseZodError(
  t: LanguageContextType['t'],
  fieldName: string,
  errorCode: string,
  params?: Record<string, any>
): string {
  return getValidationErrorMessage(t, errorCode, params)
}

/**
 * Handle API error response and return translated message
 * @param t - Translation function from language context
 * @param response - Fetch response object
 * @returns Translated error message
 */
export async function handleApiError(
  t: LanguageContextType['t'],
  response: Response
): Promise<string> {
  try {
    const data = await response.json()
    
    // If API returns a specific error code, try to translate it
    if (data.errorCode) {
      return getErrorMessage(t, data.errorCode, data.params)
    }
    
    // Otherwise, use HTTP status code
    return getHttpErrorMessage(t, response.status)
  } catch (error) {
    // If response parsing fails, use HTTP status code
    return getHttpErrorMessage(t, response.status)
  }
}

/**
 * Translate error object from API response
 * @param t - Translation function from language context
 * @param error - Error object from API
 * @returns Translated error message
 */
export function translateApiError(
  t: LanguageContextType['t'],
  error: any
): string {
  if (typeof error === 'string') {
    return error
  }

  if (error?.message) {
    return error.message
  }

  if (error?.errorCode) {
    return getErrorMessage(t, error.errorCode, error?.params)
  }

  return getErrorMessage(t, 'general.serverError')
}
