/**
 * System Error Handler
 * Provides utilities for handling and translating system errors
 */

import { LanguageContextType } from '@/context/language-context'
import { getErrorMessage, getHttpErrorMessage } from './error-handler'

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * System error object
 */
export interface SystemError {
  code: string
  message: string
  severity: ErrorSeverity
  timestamp: Date
  context?: Record<string, any>
}

/**
 * Create a system error with translated message
 * @param t - Translation function from language context
 * @param code - Error code
 * @param severity - Error severity
 * @param context - Optional context information
 * @returns SystemError object
 */
export function createSystemError(
  t: LanguageContextType['t'],
  code: string,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  context?: Record<string, any>
): SystemError {
  return {
    code,
    message: getErrorMessage(t, code),
    severity,
    timestamp: new Date(),
    context,
  }
}

/**
 * Create a system error from HTTP status code
 * @param t - Translation function from language context
 * @param statusCode - HTTP status code
 * @param severity - Error severity
 * @param context - Optional context information
 * @returns SystemError object
 */
export function createHttpError(
  t: LanguageContextType['t'],
  statusCode: number,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  context?: Record<string, any>
): SystemError {
  return {
    code: `http_${statusCode}`,
    message: getHttpErrorMessage(t, statusCode),
    severity,
    timestamp: new Date(),
    context,
  }
}

/**
 * Log system error
 * @param error - SystemError object
 */
export function logSystemError(error: SystemError): void {
  const logLevel = {
    [ErrorSeverity.INFO]: 'info',
    [ErrorSeverity.WARNING]: 'warn',
    [ErrorSeverity.ERROR]: 'error',
    [ErrorSeverity.CRITICAL]: 'error',
  }[error.severity];

  (console as any)[logLevel](
    `[${error.code}] ${error.message}`,
    error.context
  )
}

/**
 * Handle network error with translated message
 * @param t - Translation function from language context
 * @param error - Network error
 * @returns Translated error message
 */
export function handleNetworkError(
  t: LanguageContextType['t'],
  error: any
): string {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return getErrorMessage(t, 'general.networkError')
  }

  if (error?.name === 'AbortError') {
    return getErrorMessage(t, 'general.timeout')
  }

  return getErrorMessage(t, 'general.serverError')
}

/**
 * Handle database error with translated message
 * @param t - Translation function from language context
 * @param error - Database error
 * @returns Translated error message
 */
export function handleDatabaseError(
  t: LanguageContextType['t'],
  error: any
): string {
  if (error?.code === 'PGERR_CONNECTION_FAILURE') {
    return getErrorMessage(t, 'database.connectionError')
  }

  if (error?.code === 'PGERR_QUERY_ERROR') {
    return getErrorMessage(t, 'database.queryError')
  }

  if (error?.code === 'PGERR_DUPLICATE_KEY') {
    return getErrorMessage(t, 'database.duplicateEntry')
  }

  return getErrorMessage(t, 'database.queryError')
}

/**
 * Handle file error with translated message
 * @param t - Translation function from language context
 * @param error - File error
 * @returns Translated error message
 */
export function handleFileError(
  t: LanguageContextType['t'],
  error: any
): string {
  if (error?.code === 'ENOENT') {
    return getErrorMessage(t, 'file.fileNotFound')
  }

  if (error?.code === 'EACCES') {
    return getErrorMessage(t, 'general.forbidden')
  }

  if (error?.code === 'EFBIG') {
    return getErrorMessage(t, 'file.fileTooLarge')
  }

  return getErrorMessage(t, 'file.uploadFailed')
}

/**
 * Handle payment error with translated message
 * @param t - Translation function from language context
 * @param error - Payment error
 * @returns Translated error message
 */
export function handlePaymentError(
  t: LanguageContextType['t'],
  error: any
): string {
  if (error?.code === 'PAYMENT_FAILED') {
    return getErrorMessage(t, 'payment.paymentFailed')
  }

  if (error?.code === 'INVALID_PAYMENT_METHOD') {
    return getErrorMessage(t, 'payment.invalidPaymentMethod')
  }

  if (error?.code === 'INSUFFICIENT_FUNDS') {
    return getErrorMessage(t, 'payment.insufficientFunds')
  }

  if (error?.code === 'TRANSACTION_FAILED') {
    return getErrorMessage(t, 'payment.transactionFailed')
  }

  return getErrorMessage(t, 'payment.paymentFailed')
}

/**
 * Generic error handler that routes to specific handlers
 * @param t - Translation function from language context
 * @param error - Error object
 * @param errorType - Type of error (network, database, file, payment, etc.)
 * @returns Translated error message
 */
export function handleError(
  t: LanguageContextType['t'],
  error: any,
  errorType: 'network' | 'database' | 'file' | 'payment' | 'generic' = 'generic'
): string {
  switch (errorType) {
    case 'network':
      return handleNetworkError(t, error)
    case 'database':
      return handleDatabaseError(t, error)
    case 'file':
      return handleFileError(t, error)
    case 'payment':
      return handlePaymentError(t, error)
    default:
      return getErrorMessage(t, 'general.serverError')
  }
}
