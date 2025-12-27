/**
 * Form Validation Helper
 * Provides utilities for translating form validation errors
 */

import { FieldError } from 'react-hook-form'
import { LanguageContextType } from '@/context/language-context'
import { getValidationErrorMessage } from './error-handler'

/**
 * Get translated error message from react-hook-form FieldError
 * @param t - Translation function from language context
 * @param error - FieldError from react-hook-form
 * @returns Translated error message or empty string if no error
 */
export function getFieldErrorMessage(
  t: LanguageContextType['t'],
  error?: FieldError
): string {
  if (!error) {
    return ''
  }

  // Map react-hook-form error types to translation keys
  const errorTypeMap: Record<string, string> = {
    required: 'validation.required',
    minLength: 'validation.minLength',
    maxLength: 'validation.maxLength',
    pattern: 'validation.pattern',
    validate: 'validation.pattern',
    min: 'validation.invalidNumber',
    max: 'validation.invalidNumber',
  }

  const errorKey = errorTypeMap[error.type] || 'validation.pattern'
  const params = error.message ? {} : {
    min: (error.ref as any)?.min,
    max: (error.ref as any)?.max,
  }

  // If error has a custom message, use it directly
  if (error.message && typeof error.message === 'string') {
    return error.message
  }

  return getValidationErrorMessage(t, errorKey, params)
}

/**
 * Translate all form errors
 * @param t - Translation function from language context
 * @param errors - Form errors object from react-hook-form
 * @returns Object with translated error messages
 */
export function translateFormErrors(
  t: LanguageContextType['t'],
  errors: Record<string, FieldError | undefined>
): Record<string, string> {
  const translatedErrors: Record<string, string> = {}

  for (const [fieldName, error] of Object.entries(errors)) {
    if (error) {
      translatedErrors[fieldName] = getFieldErrorMessage(t, error)
    }
  }

  return translatedErrors
}

/**
 * Create a custom validation error message
 * @param t - Translation function from language context
 * @param errorKey - Error key (e.g., 'validation.required')
 * @param params - Optional parameters for interpolation
 * @returns Translated error message
 */
export function createValidationError(
  t: LanguageContextType['t'],
  errorKey: string,
  params?: Record<string, any>
): string {
  return getValidationErrorMessage(t, errorKey, params)
}

/**
 * Validate email with translated error message
 * @param t - Translation function from language context
 * @param email - Email to validate
 * @returns Error message or empty string if valid
 */
export function validateEmail(
  t: LanguageContextType['t'],
  email: string
): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return getValidationErrorMessage(t, 'validation.invalidEmail')
  }
  return ''
}

/**
 * Validate phone number with translated error message
 * @param t - Translation function from language context
 * @param phone - Phone number to validate
 * @returns Error message or empty string if valid
 */
export function validatePhone(
  t: LanguageContextType['t'],
  phone: string
): string {
  const phoneRegex = /^\d{10}$/
  if (!phoneRegex.test(phone)) {
    return getValidationErrorMessage(t, 'validation.invalidPhone')
  }
  return ''
}

/**
 * Validate password with translated error message
 * @param t - Translation function from language context
 * @param password - Password to validate
 * @returns Error message or empty string if valid
 */
export function validatePassword(
  t: LanguageContextType['t'],
  password: string
): string {
  if (password.length < 8) {
    return getValidationErrorMessage(t, 'validation.passwordTooShort')
  }
  return ''
}

/**
 * Validate password match with translated error message
 * @param t - Translation function from language context
 * @param password - Password
 * @param confirmPassword - Confirm password
 * @returns Error message or empty string if valid
 */
export function validatePasswordMatch(
  t: LanguageContextType['t'],
  password: string,
  confirmPassword: string
): string {
  if (password !== confirmPassword) {
    return getValidationErrorMessage(t, 'validation.passwordMismatch')
  }
  return ''
}

/**
 * Validate minimum length with translated error message
 * @param t - Translation function from language context
 * @param value - Value to validate
 * @param min - Minimum length
 * @returns Error message or empty string if valid
 */
export function validateMinLength(
  t: LanguageContextType['t'],
  value: string,
  min: number
): string {
  if (value.length < min) {
    return getValidationErrorMessage(t, 'validation.minLength', { min })
  }
  return ''
}

/**
 * Validate maximum length with translated error message
 * @param t - Translation function from language context
 * @param value - Value to validate
 * @param max - Maximum length
 * @returns Error message or empty string if valid
 */
export function validateMaxLength(
  t: LanguageContextType['t'],
  value: string,
  max: number
): string {
  if (value.length > max) {
    return getValidationErrorMessage(t, 'validation.maxLength', { max })
  }
  return ''
}
