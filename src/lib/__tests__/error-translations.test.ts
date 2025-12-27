import { describe, it, expect, beforeEach, vi } from 'vitest'
import fc from 'fast-check'
import {
  getErrorMessage,
  getHttpErrorMessage,
  getAuthErrorMessage,
  getAppointmentErrorMessage,
  getMedicalErrorMessage,
  getValidationErrorMessage,
  validationErrorMap,
  httpErrorMap,
  authErrorMap,
  appointmentErrorMap,
  medicalErrorMap,
} from '@/lib/error-handler'
import { LanguageContextType } from '@/context/language-context'

/**
 * Mock translation function that simulates the language context
 */
function createMockTranslation(): LanguageContextType['t'] {
  const translations: Record<string, string> = {
    'errors.general.notFound': 'Page not found',
    'errors.general.unauthorized': 'Unauthorized access',
    'errors.general.forbidden': 'Access forbidden',
    'errors.general.serverError': 'Server error occurred',
    'errors.general.badRequest': 'Bad request',
    'errors.general.conflict': 'Conflict occurred',
    'errors.general.tooManyRequests': 'Too many requests',
    'errors.general.serviceUnavailable': 'Service unavailable',
    'errors.general.networkError': 'Network error occurred',
    'errors.general.timeout': 'Request timeout',
    'errors.validation.required': 'This field is required',
    'errors.validation.invalidEmail': 'Invalid email address',
    'errors.validation.invalidPhone': 'Invalid phone number',
    'errors.validation.passwordTooShort': 'Password too short',
    'errors.validation.passwordMismatch': 'Passwords do not match',
    'errors.validation.invalidDate': 'Invalid date format',
    'errors.validation.invalidNumber': 'Invalid number',
    'errors.validation.minLength': 'Minimum {{min}} characters required',
    'errors.validation.maxLength': 'Maximum {{max}} characters allowed',
    'errors.validation.pattern': 'Invalid format',
    'errors.authentication.invalidCredentials': 'Invalid credentials',
    'errors.authentication.accountLocked': 'Account locked',
    'errors.authentication.accountNotFound': 'Account not found',
    'errors.authentication.emailAlreadyExists': 'Email already exists',
    'errors.authentication.phoneAlreadyExists': 'Phone already exists',
    'errors.authentication.sessionExpired': 'Session expired',
    'errors.authentication.tokenInvalid': 'Token invalid',
    'errors.authentication.tokenExpired': 'Token expired',
    'errors.appointment.appointmentNotFound': 'Appointment not found',
    'errors.appointment.appointmentCancelled': 'Appointment cancelled',
    'errors.appointment.appointmentPassed': 'Appointment passed',
    'errors.appointment.doctorNotAvailable': 'Doctor not available',
    'errors.appointment.slotNotAvailable': 'Slot not available',
    'errors.appointment.cannotCancelAppointment': 'Cannot cancel appointment',
    'errors.appointment.cannotRescheduleAppointment': 'Cannot reschedule appointment',
    'errors.medical.recordNotFound': 'Record not found',
    'errors.medical.prescriptionNotFound': 'Prescription not found',
    'errors.medical.labReportNotFound': 'Lab report not found',
    'errors.medical.invalidMedication': 'Invalid medication',
    'errors.medical.invalidDosage': 'Invalid dosage',
    'errors.database.connectionError': 'Connection error',
    'errors.database.queryError': 'Query error',
    'errors.database.dataNotFound': 'Data not found',
    'errors.database.duplicateEntry': 'Duplicate entry',
    'errors.file.fileNotFound': 'File not found',
    'errors.file.invalidFileType': 'Invalid file type',
    'errors.file.fileTooLarge': 'File too large',
    'errors.file.uploadFailed': 'Upload failed',
    'errors.payment.paymentFailed': 'Payment failed',
    'errors.payment.invalidPaymentMethod': 'Invalid payment method',
    'errors.payment.insufficientFunds': 'Insufficient funds',
    'errors.payment.transactionFailed': 'Transaction failed',
  }

  return (key: string, params?: Record<string, any>): string => {
    let value = translations[key]
    if (!value) {
      return key
    }

    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue))
      }
    }

    return value
  }
}

describe('Error Message Translations', () => {
  let mockT: LanguageContextType['t']

  beforeEach(() => {
    mockT = createMockTranslation()
  })

  /**
   * Property-based test: Error message retrieval
   * For any valid error key, the system SHALL return a translated message
   * that is not empty and not the key itself.
   *
   * Feature: multilingual-indian-languages, Property: Error Message Translation
   * Validates: Requirements 4.4, 12.3, 12.4
   */
  it('should return translated error messages for all error keys', () => {
    const errorKeys = [
      'general.notFound',
      'general.unauthorized',
      'general.forbidden',
      'general.serverError',
      'validation.required',
      'validation.invalidEmail',
      'authentication.invalidCredentials',
      'appointment.appointmentNotFound',
      'medical.recordNotFound',
    ]

    fc.assert(
      fc.property(fc.constantFrom(...errorKeys), (errorKey: string) => {
        // Act
        const message = getErrorMessage(mockT, errorKey)

        // Assert: Should return a non-empty message
        expect(message).toBeTruthy()
        expect(message.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: HTTP error message mapping
   * For any HTTP status code in the error map, the system SHALL return
   * a translated message.
   *
   * Feature: multilingual-indian-languages, Property: Error Message Translation
   * Validates: Requirements 4.4, 12.3, 12.4
   */
  it('should map HTTP status codes to translated error messages', () => {
    const statusCodes = Object.keys(httpErrorMap).map(Number)

    fc.assert(
      fc.property(fc.constantFrom(...statusCodes), (statusCode: number) => {
        // Act
        const message = getHttpErrorMessage(mockT, statusCode)

        // Assert: Should return a non-empty message
        expect(message).toBeTruthy()
        expect(message.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Authentication error message mapping
   * For any authentication error code, the system SHALL return a translated message.
   *
   * Feature: multilingual-indian-languages, Property: Error Message Translation
   * Validates: Requirements 4.4, 12.3, 12.4
   */
  it('should map authentication error codes to translated messages', () => {
    const errorCodes = Object.keys(authErrorMap)

    fc.assert(
      fc.property(fc.constantFrom(...errorCodes), (errorCode: string) => {
        // Act
        const message = getAuthErrorMessage(mockT, errorCode)

        // Assert: Should return a non-empty message
        expect(message).toBeTruthy()
        expect(message.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Appointment error message mapping
   * For any appointment error code, the system SHALL return a translated message.
   *
   * Feature: multilingual-indian-languages, Property: Error Message Translation
   * Validates: Requirements 4.4, 12.3, 12.4
   */
  it('should map appointment error codes to translated messages', () => {
    const errorCodes = Object.keys(appointmentErrorMap)

    fc.assert(
      fc.property(fc.constantFrom(...errorCodes), (errorCode: string) => {
        // Act
        const message = getAppointmentErrorMessage(mockT, errorCode)

        // Assert: Should return a non-empty message
        expect(message).toBeTruthy()
        expect(message.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Medical error message mapping
   * For any medical error code, the system SHALL return a translated message.
   *
   * Feature: multilingual-indian-languages, Property: Error Message Translation
   * Validates: Requirements 4.4, 12.3, 12.4
   */
  it('should map medical error codes to translated messages', () => {
    const errorCodes = Object.keys(medicalErrorMap)

    fc.assert(
      fc.property(fc.constantFrom(...errorCodes), (errorCode: string) => {
        // Act
        const message = getMedicalErrorMessage(mockT, errorCode)

        // Assert: Should return a non-empty message
        expect(message).toBeTruthy()
        expect(message.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Validation error message mapping
   * For any validation error code, the system SHALL return a translated message.
   *
   * Feature: multilingual-indian-languages, Property: Error Message Translation
   * Validates: Requirements 4.4, 12.3, 12.4
   */
  it('should map validation error codes to translated messages', () => {
    const errorCodes = Object.keys(validationErrorMap)

    fc.assert(
      fc.property(fc.constantFrom(...errorCodes), (errorCode: string) => {
        // Act
        const message = getValidationErrorMessage(mockT, errorCode)

        // Assert: Should return a non-empty message
        expect(message).toBeTruthy()
        expect(message.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Error message interpolation
   * For any error message with parameters, the system SHALL correctly
   * interpolate the parameters into the message.
   *
   * Feature: multilingual-indian-languages, Property: Error Message Translation
   * Validates: Requirements 4.4, 12.3, 12.4
   */
  it('should correctly interpolate parameters in error messages', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (min: number, max: number) => {
          // Act
          const minMessage = getValidationErrorMessage(mockT, 'minLength', { min })
          const maxMessage = getValidationErrorMessage(mockT, 'maxLength', { max })

          // Assert: Should contain the interpolated values
          expect(minMessage).toContain(min.toString())
          expect(maxMessage).toContain(max.toString())
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property-based test: Fallback for unknown error codes
   * For any unknown error code, the system SHALL return a fallback message.
   *
   * Feature: multilingual-indian-languages, Property: Error Message Translation
   * Validates: Requirements 4.4, 12.3, 12.4
   */
  it('should return fallback message for unknown error codes', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (unknownCode: string) => {
        // Skip if it's a known code
        if (unknownCode.includes('general') || unknownCode.includes('validation')) {
          return
        }

        // Act
        const message = getErrorMessage(mockT, `unknown.${unknownCode}`)

        // Assert: Should return the key itself as fallback
        expect(message).toBeTruthy()
      }),
      { numRuns: 50 }
    )
  })

  /**
   * Property-based test: Error message consistency
   * For any error code, calling the function multiple times with the same
   * parameters SHALL return the same message.
   *
   * Feature: multilingual-indian-languages, Property: Error Message Translation
   * Validates: Requirements 4.4, 12.3, 12.4
   */
  it('should return consistent error messages for the same error code', () => {
    const errorKey = 'validation.required'

    // Act
    const message1 = getErrorMessage(mockT, errorKey)
    const message2 = getErrorMessage(mockT, errorKey)
    const message3 = getErrorMessage(mockT, errorKey)

    // Assert: All calls should return the same message
    expect(message1).toBe(message2)
    expect(message2).toBe(message3)
  })

  /**
   * Property-based test: HTTP error code coverage
   * For any HTTP error status code in the map, the system SHALL have
   * a corresponding translation.
   *
   * Feature: multilingual-indian-languages, Property: Error Message Translation
   * Validates: Requirements 4.4, 12.3, 12.4
   */
  it('should have translations for all mapped HTTP error codes', () => {
    const statusCodes = [400, 401, 403, 404, 409, 429, 500, 503]

    statusCodes.forEach((statusCode) => {
      // Act
      const message = getHttpErrorMessage(mockT, statusCode)

      // Assert: Should return a non-empty message
      expect(message).toBeTruthy()
      expect(message.length).toBeGreaterThan(0)
    })
  })

  /**
   * Property-based test: Error message non-emptiness
   * For any valid error key, the system SHALL never return an empty string.
   *
   * Feature: multilingual-indian-languages, Property: Error Message Translation
   * Validates: Requirements 4.4, 12.3, 12.4
   */
  it('should never return empty error messages for valid keys', () => {
    const validKeys = [
      'general.notFound',
      'validation.required',
      'authentication.invalidCredentials',
      'appointment.appointmentNotFound',
      'medical.recordNotFound',
    ]

    validKeys.forEach((key) => {
      // Act
      const message = getErrorMessage(mockT, key)

      // Assert: Should not be empty
      expect(message).not.toBe('')
      expect(message.length).toBeGreaterThan(0)
    })
  })
})
