/**
 * useErrorTranslation Hook
 * Provides error translation utilities for components
 */

import { useLanguage } from './useLanguage'
import {
  getErrorMessage,
  getHttpErrorMessage,
  getAuthErrorMessage,
  getAppointmentErrorMessage,
  getMedicalErrorMessage,
  getValidationErrorMessage,
  handleApiError,
  translateApiError,
} from '@/lib/error-handler'

export function useErrorTranslation() {
  const { t } = useLanguage()

  return {
    /**
     * Get translated error message
     */
    getErrorMessage: (errorKey: string, params?: Record<string, any>) =>
      getErrorMessage(t, errorKey, params),

    /**
     * Get translated HTTP error message
     */
    getHttpErrorMessage: (statusCode: number) =>
      getHttpErrorMessage(t, statusCode),

    /**
     * Get translated authentication error message
     */
    getAuthErrorMessage: (errorCode: string) =>
      getAuthErrorMessage(t, errorCode),

    /**
     * Get translated appointment error message
     */
    getAppointmentErrorMessage: (errorCode: string) =>
      getAppointmentErrorMessage(t, errorCode),

    /**
     * Get translated medical error message
     */
    getMedicalErrorMessage: (errorCode: string) =>
      getMedicalErrorMessage(t, errorCode),

    /**
     * Get translated validation error message
     */
    getValidationErrorMessage: (errorCode: string, params?: Record<string, any>) =>
      getValidationErrorMessage(t, errorCode, params),

    /**
     * Handle API error response
     */
    handleApiError: (response: Response) =>
      handleApiError(t, response),

    /**
     * Translate API error object
     */
    translateApiError: (error: any) =>
      translateApiError(t, error),
  }
}
