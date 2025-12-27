/**
 * useFormValidation Hook
 * Provides form validation utilities with error translations
 */

import { useLanguage } from './useLanguage'
import {
  getFieldErrorMessage,
  translateFormErrors,
  createValidationError,
  validateEmail,
  validatePhone,
  validatePassword,
  validatePasswordMatch,
  validateMinLength,
  validateMaxLength,
} from '@/lib/form-validation-helper'
import { FieldError } from 'react-hook-form'

export function useFormValidation() {
  const { t } = useLanguage()

  return {
    /**
     * Get translated error message from react-hook-form FieldError
     */
    getFieldErrorMessage: (error?: FieldError) =>
      getFieldErrorMessage(t, error),

    /**
     * Translate all form errors
     */
    translateFormErrors: (errors: Record<string, FieldError | undefined>) =>
      translateFormErrors(t, errors),

    /**
     * Create a custom validation error message
     */
    createValidationError: (errorKey: string, params?: Record<string, any>) =>
      createValidationError(t, errorKey, params),

    /**
     * Validate email
     */
    validateEmail: (email: string) =>
      validateEmail(t, email),

    /**
     * Validate phone number
     */
    validatePhone: (phone: string) =>
      validatePhone(t, phone),

    /**
     * Validate password
     */
    validatePassword: (password: string) =>
      validatePassword(t, password),

    /**
     * Validate password match
     */
    validatePasswordMatch: (password: string, confirmPassword: string) =>
      validatePasswordMatch(t, password, confirmPassword),

    /**
     * Validate minimum length
     */
    validateMinLength: (value: string, min: number) =>
      validateMinLength(t, value, min),

    /**
     * Validate maximum length
     */
    validateMaxLength: (value: string, max: number) =>
      validateMaxLength(t, value, max),
  }
}
