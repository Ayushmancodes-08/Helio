# Error Message Translation Guide

This guide explains how to use the error message translation system in the multilingual healthcare application.

## Overview

The error translation system provides a centralized way to translate error messages across the application. It supports:

- **Form validation errors** - Translate validation error messages
- **API response errors** - Translate errors from API responses
- **System errors** - Translate system-level errors
- **HTTP errors** - Translate HTTP status codes to user-friendly messages
- **Authentication errors** - Translate authentication-specific errors
- **Appointment errors** - Translate appointment-related errors
- **Medical errors** - Translate medical record errors
- **Database errors** - Translate database operation errors
- **File errors** - Translate file operation errors
- **Payment errors** - Translate payment-related errors

## Error Translation Files

Error translations are stored in JSON files organized by language:

```
public/locales/
├── hi-IN/errors.json
├── en-IN/errors.json
├── bn-IN/errors.json
└── te-IN/errors.json
```

Each file contains error messages organized by category:

```json
{
  "general": {
    "notFound": "Page not found",
    "unauthorized": "Unauthorized access",
    "forbidden": "Access forbidden",
    "serverError": "Server error occurred"
  },
  "validation": {
    "required": "This field is required",
    "invalidEmail": "Invalid email address",
    "invalidPhone": "Invalid phone number"
  },
  "authentication": {
    "invalidCredentials": "Invalid email or password",
    "accountLocked": "Account is locked"
  }
}
```

## Using Error Translations in Components

### 1. Using the `useErrorTranslation` Hook

The simplest way to use error translations in components:

```typescript
import { useErrorTranslation } from '@/hooks/useErrorTranslation'

export function MyComponent() {
  const { getErrorMessage, getHttpErrorMessage } = useErrorTranslation()

  // Get a translated error message
  const errorMsg = getErrorMessage('validation.required')

  // Get HTTP error message
  const httpError = getHttpErrorMessage(404)

  return <div>{errorMsg}</div>
}
```

### 2. Using the `useFormValidation` Hook

For form validation errors:

```typescript
import { useFormValidation } from '@/hooks/useFormValidation'
import { useForm } from 'react-hook-form'

export function LoginForm() {
  const { getFieldErrorMessage } = useFormValidation()
  const { control, formState: { errors } } = useForm()

  return (
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          {errors.email && (
            <FormMessage>
              {getFieldErrorMessage(errors.email)}
            </FormMessage>
          )}
        </FormItem>
      )}
    />
  )
}
```

### 3. Using the `useSystemError` Hook

For system-level errors:

```typescript
import { useSystemError, ErrorSeverity } from '@/hooks/useSystemError'

export function DataFetcher() {
  const { handleNetworkError, createSystemError, logSystemError } = useSystemError()

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data')
      if (!response.ok) {
        const error = createSystemError(
          'general.serverError',
          ErrorSeverity.ERROR,
          { statusCode: response.status }
        )
        logSystemError(error)
      }
    } catch (error) {
      const errorMsg = handleNetworkError(error)
      console.error(errorMsg)
    }
  }

  return <button onClick={fetchData}>Fetch Data</button>
}
```

## Error Translation Utilities

### Error Handler Functions

Located in `src/lib/error-handler.ts`:

```typescript
// Get translated error message
getErrorMessage(t, 'validation.required')

// Get HTTP error message
getHttpErrorMessage(t, 404)

// Get authentication error message
getAuthErrorMessage(t, 'invalid_credentials')

// Get appointment error message
getAppointmentErrorMessage(t, 'appointment_not_found')

// Get medical error message
getMedicalErrorMessage(t, 'record_not_found')

// Get validation error message with parameters
getValidationErrorMessage(t, 'minLength', { min: 8 })

// Handle API error response
handleApiError(t, response)

// Translate API error object
translateApiError(t, error)
```

### Form Validation Helpers

Located in `src/lib/form-validation-helper.ts`:

```typescript
// Get translated field error
getFieldErrorMessage(t, fieldError)

// Translate all form errors
translateFormErrors(t, formErrors)

// Validate email
validateEmail(t, email)

// Validate phone
validatePhone(t, phone)

// Validate password
validatePassword(t, password)

// Validate password match
validatePasswordMatch(t, password, confirmPassword)

// Validate min/max length
validateMinLength(t, value, min)
validateMaxLength(t, value, max)
```

### System Error Handlers

Located in `src/lib/system-error-handler.ts`:

```typescript
// Create system error
createSystemError(t, code, severity, context)

// Create HTTP error
createHttpError(t, statusCode, severity, context)

// Log system error
logSystemError(error)

// Handle specific error types
handleNetworkError(t, error)
handleDatabaseError(t, error)
handleFileError(t, error)
handlePaymentError(t, error)
handleError(t, error, errorType)
```

## Error Categories and Keys

### General Errors
- `general.notFound` - Page not found
- `general.unauthorized` - Unauthorized access
- `general.forbidden` - Access forbidden
- `general.serverError` - Server error occurred
- `general.badRequest` - Bad request
- `general.conflict` - Conflict occurred
- `general.tooManyRequests` - Too many requests
- `general.serviceUnavailable` - Service unavailable
- `general.networkError` - Network error occurred
- `general.timeout` - Request timeout

### Validation Errors
- `validation.required` - This field is required
- `validation.invalidEmail` - Invalid email address
- `validation.invalidPhone` - Invalid phone number
- `validation.passwordTooShort` - Password too short
- `validation.passwordMismatch` - Passwords do not match
- `validation.invalidDate` - Invalid date format
- `validation.invalidNumber` - Invalid number
- `validation.minLength` - Minimum {{min}} characters required
- `validation.maxLength` - Maximum {{max}} characters allowed
- `validation.pattern` - Invalid format

### Authentication Errors
- `authentication.invalidCredentials` - Invalid email or password
- `authentication.accountLocked` - Account is locked
- `authentication.accountNotFound` - Account not found
- `authentication.emailAlreadyExists` - Email already registered
- `authentication.phoneAlreadyExists` - Phone already registered
- `authentication.sessionExpired` - Session expired
- `authentication.tokenInvalid` - Token invalid
- `authentication.tokenExpired` - Token expired

### Appointment Errors
- `appointment.appointmentNotFound` - Appointment not found
- `appointment.appointmentCancelled` - Appointment cancelled
- `appointment.appointmentPassed` - Appointment date passed
- `appointment.doctorNotAvailable` - Doctor not available
- `appointment.slotNotAvailable` - Slot not available
- `appointment.cannotCancelAppointment` - Cannot cancel appointment
- `appointment.cannotRescheduleAppointment` - Cannot reschedule appointment

### Medical Errors
- `medical.recordNotFound` - Medical record not found
- `medical.prescriptionNotFound` - Prescription not found
- `medical.labReportNotFound` - Lab report not found
- `medical.invalidMedication` - Invalid medication
- `medical.invalidDosage` - Invalid dosage

### Database Errors
- `database.connectionError` - Database connection error
- `database.queryError` - Database query error
- `database.dataNotFound` - Data not found
- `database.duplicateEntry` - Duplicate entry

### File Errors
- `file.fileNotFound` - File not found
- `file.invalidFileType` - Invalid file type
- `file.fileTooLarge` - File size exceeds limit
- `file.uploadFailed` - File upload failed

### Payment Errors
- `payment.paymentFailed` - Payment failed
- `payment.invalidPaymentMethod` - Invalid payment method
- `payment.insufficientFunds` - Insufficient funds
- `payment.transactionFailed` - Transaction failed

## Examples

### Example 1: Form Validation with Error Translation

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useErrorTranslation } from '@/hooks/useErrorTranslation'
import { useToast } from '@/hooks/use-toast'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password too short'),
})

export function LoginForm() {
  const { toast } = useToast()
  const { getErrorMessage } = useErrorTranslation()
  const form = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      // Submit form
    } catch (error) {
      const errorMsg = getErrorMessage('general.serverError')
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMsg,
      })
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

### Example 2: API Error Handling

```typescript
import { useErrorTranslation } from '@/hooks/useErrorTranslation'
import { useToast } from '@/hooks/use-toast'

export function DataComponent() {
  const { toast } = useToast()
  const { getHttpErrorMessage, handleApiError } = useErrorTranslation()

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data')
      if (!response.ok) {
        const errorMsg = await handleApiError(response)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMsg,
        })
        return
      }
      const data = await response.json()
      // Process data
    } catch (error) {
      const errorMsg = getHttpErrorMessage(500)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMsg,
      })
    }
  }

  return <button onClick={fetchData}>Fetch Data</button>
}
```

### Example 3: System Error Handling

```typescript
import { useSystemError, ErrorSeverity } from '@/hooks/useSystemError'

export function FileUploader() {
  const { handleFileError, createSystemError, logSystemError } = useSystemError()

  const handleUpload = async (file: File) => {
    try {
      // Upload file
    } catch (error) {
      const errorMsg = handleFileError(error)
      const systemError = createSystemError(
        'file.uploadFailed',
        ErrorSeverity.ERROR,
        { fileName: file.name }
      )
      logSystemError(systemError)
      console.error(errorMsg)
    }
  }

  return <input type="file" onChange={(e) => handleUpload(e.target.files?.[0])} />
}
```

## Adding New Error Messages

To add new error messages:

1. Add the error key and message to all language files:
   - `public/locales/en-IN/errors.json`
   - `public/locales/hi-IN/errors.json`
   - `public/locales/bn-IN/errors.json`
   - `public/locales/te-IN/errors.json`

2. If it's a new error category, add it to the appropriate error map in `src/lib/error-handler.ts`

3. Use the error key in your components with the translation hooks

Example:

```json
{
  "custom": {
    "myError": "This is my custom error message"
  }
}
```

Then use it:

```typescript
const errorMsg = getErrorMessage(t, 'custom.myError')
```

## Testing Error Translations

Error translations are tested using property-based testing. See `src/lib/__tests__/error-translations.test.ts` for examples.

Run tests:

```bash
npm run test src/lib/__tests__/error-translations.test.ts
```

## Best Practices

1. **Always use error translation hooks** - Don't hardcode error messages
2. **Use appropriate error categories** - Choose the right category for your error
3. **Provide context** - Include relevant information in error messages
4. **Log errors** - Use system error logging for debugging
5. **Test error handling** - Write tests for error scenarios
6. **Keep messages concise** - Error messages should be clear and brief
7. **Use parameters for dynamic values** - Use `{{param}}` syntax for interpolation
8. **Translate all user-facing errors** - Don't show untranslated error messages to users

## Troubleshooting

### Error message shows the key instead of translation

This usually means:
1. The error key doesn't exist in the translation file
2. The language context is not properly initialized
3. The translation file wasn't loaded

Solution:
- Check that the error key exists in all language files
- Ensure the component is wrapped with LanguageProvider
- Verify the translation file is in the correct location

### Error messages not updating when language changes

This usually means:
- The component is not re-rendering when language changes
- The useErrorTranslation hook is not being called

Solution:
- Ensure the component uses the useErrorTranslation hook
- Check that the language context is properly updating
- Verify the component is re-rendering on language change

## Related Documentation

- [Language Context Documentation](./src/context/language-context.tsx)
- [Error Handler Utilities](./src/lib/error-handler.ts)
- [Form Validation Helpers](./src/lib/form-validation-helper.ts)
- [System Error Handler](./src/lib/system-error-handler.ts)
