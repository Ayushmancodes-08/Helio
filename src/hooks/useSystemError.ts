/**
 * useSystemError Hook
 * Provides system error handling utilities with translations
 */

import { useLanguage } from './useLanguage'
import {
  createSystemError,
  createHttpError,
  logSystemError,
  handleNetworkError,
  handleDatabaseError,
  handleFileError,
  handlePaymentError,
  handleError,
  ErrorSeverity,
  SystemError,
} from '@/lib/system-error-handler'

export function useSystemError() {
  const { t } = useLanguage()

  return {
    /**
     * Create a system error with translated message
     */
    createSystemError: (
      code: string,
      severity?: ErrorSeverity,
      context?: Record<string, any>
    ) => createSystemError(t, code, severity, context),

    /**
     * Create a system error from HTTP status code
     */
    createHttpError: (
      statusCode: number,
      severity?: ErrorSeverity,
      context?: Record<string, any>
    ) => createHttpError(t, statusCode, severity, context),

    /**
     * Log system error
     */
    logSystemError: (error: SystemError) =>
      logSystemError(error),

    /**
     * Handle network error
     */
    handleNetworkError: (error: any) =>
      handleNetworkError(t, error),

    /**
     * Handle database error
     */
    handleDatabaseError: (error: any) =>
      handleDatabaseError(t, error),

    /**
     * Handle file error
     */
    handleFileError: (error: any) =>
      handleFileError(t, error),

    /**
     * Handle payment error
     */
    handlePaymentError: (error: any) =>
      handlePaymentError(t, error),

    /**
     * Generic error handler
     */
    handleError: (error: any, errorType?: 'network' | 'database' | 'file' | 'payment' | 'generic') =>
      handleError(t, error, errorType),
  }
}
