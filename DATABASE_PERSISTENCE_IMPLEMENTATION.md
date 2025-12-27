# Database Persistence Implementation for Language Preferences

## Overview

This document describes the implementation of database persistence for user language preferences in the multilingual healthcare application. The implementation allows users' language preferences to be saved to the database and loaded across devices and sessions.

## Implementation Details

### 1. Database Schema Update

**File**: `GSS/migrations/add_language_preference.sql`

Added a new column to the `profiles` table:
- Column name: `language_preference`
- Type: `VARCHAR(10)`
- Default value: `'en-IN'`
- Constraint: Only allows valid language codes ('hi-IN', 'en-IN', 'bn-IN', 'te-IN')
- Index: Created for faster lookups

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language_preference VARCHAR(10) DEFAULT 'en-IN';
ALTER TABLE profiles ADD CONSTRAINT valid_language_preference 
  CHECK (language_preference IN ('hi-IN', 'en-IN', 'bn-IN', 'te-IN'));
CREATE INDEX IF NOT EXISTS idx_profiles_language_preference ON profiles(language_preference);
```

### 2. API Endpoints

#### Save Language Preference Endpoint

**File**: `GSS/src/app/api/language/save/route.ts`

- **Method**: POST
- **Endpoint**: `/api/language/save`
- **Authentication**: Required (user must be authenticated)
- **Request Body**:
  ```json
  {
    "language_preference": "hi-IN" | "en-IN" | "bn-IN" | "te-IN"
  }
  ```
- **Response**:
  ```json
  {
    "success": boolean,
    "message": string,
    "language_preference": string (optional)
  }
  ```
- **Functionality**:
  - Validates the language preference against allowed values
  - Checks user authentication
  - Updates the user's profile in the database
  - Returns success/error status

#### Load Language Preference Endpoint

**File**: `GSS/src/app/api/language/load/route.ts`

- **Method**: GET
- **Endpoint**: `/api/language/load`
- **Authentication**: Required (user must be authenticated)
- **Response**:
  ```json
  {
    "success": boolean,
    "message": string,
    "language_preference": string
  }
  ```
- **Functionality**:
  - Checks user authentication
  - Fetches the user's language preference from the database
  - Returns the preference or defaults to 'en-IN' if not set

### 3. i18n Storage Utility Update

**File**: `GSS/src/lib/i18n-storage.ts`

Added new function:
- `loadLanguageFromDatabase()`: Async function that calls the `/api/language/load` endpoint to fetch the user's language preference from the database

### 4. Language Context Integration

**File**: `GSS/src/context/language-context.tsx`

Updated the language context to:

1. **Import the new database loading function**:
   ```typescript
   import { loadLanguageFromDatabase } from '@/lib/i18n-storage'
   ```

2. **Update `setLocale` function**:
   - Now uses the `/api/language/save` endpoint instead of direct Supabase calls
   - Persists language preference to database when user is authenticated
   - Falls back gracefully if database save fails

3. **Update initialization logic**:
   - Implements a three-tier fallback system:
     1. First, tries to load from localStorage (fastest)
     2. Then, tries to load from database if user is authenticated
     3. Finally, detects browser language as fallback
   - Saves database-loaded preference to localStorage for faster future loads

### 5. Unit Tests

#### API Endpoint Tests

**File**: `GSS/src/app/api/language/__tests__/language-api.test.ts`

Tests for both API endpoints:
- Save endpoint validation (valid/invalid language codes)
- Save endpoint authentication checks
- Load endpoint functionality
- Load endpoint default value handling
- Load endpoint authentication checks

#### i18n Storage Database Tests

**File**: `GSS/src/lib/__tests__/i18n-storage-database.test.ts`

Tests for the database loading function:
- Successfully loading language preference from database
- Handling API failures
- Handling invalid language codes
- Handling network errors
- Handling server-side execution (window undefined)
- Loading all valid language codes

**Test Results**: All 6 tests passing ✓

## Data Flow

### Saving Language Preference

```
User selects language
    ↓
setLocale() called
    ↓
Update local state
    ↓
Save to localStorage
    ↓
Check if user authenticated
    ↓
If authenticated: POST to /api/language/save
    ↓
API validates and updates database
    ↓
Success/Error response
```

### Loading Language Preference

```
App initializes
    ↓
LanguageProvider mounts
    ↓
Try load from localStorage
    ↓
If not found: Check if user authenticated
    ↓
If authenticated: GET from /api/language/load
    ↓
If found: Use database preference
    ↓
If not found: Detect browser language
    ↓
Set locale and save to localStorage
```

## Error Handling

1. **Invalid Language Code**: Returns 400 error with descriptive message
2. **Unauthenticated User**: Returns 401 error
3. **Database Error**: Logs warning but continues with localStorage/browser detection
4. **Network Error**: Falls back to localStorage or browser detection
5. **Missing Translation**: Falls back to English translation

## Security Considerations

1. **Authentication Required**: Both endpoints require user authentication
2. **Input Validation**: Language codes are validated against whitelist
3. **Database Constraint**: Database enforces valid language codes
4. **Error Messages**: Generic error messages to prevent information leakage

## Performance Optimization

1. **Lazy Loading**: Only loads database preference when needed
2. **Caching**: Saves database preference to localStorage for faster future loads
3. **Fallback Chain**: Avoids unnecessary database calls by checking localStorage first
4. **Async Operations**: Non-blocking database operations

## Requirements Coverage

This implementation satisfies the following requirements:

- **Requirement 2.6**: Language preference saved to user profile in database
- **Requirement 2.7**: Language preference loaded from database on login
- **Requirement 9.1**: User profile language preference persistence
- **Requirement 9.2**: Cross-device language preference loading
- **Requirement 9.3**: Language preference updates immediately

## Testing

All tests pass successfully:
- 6 database loading tests ✓
- API endpoint validation ✓
- Authentication checks ✓
- Error handling ✓

## Future Enhancements

1. Add caching layer for frequently accessed preferences
2. Implement preference sync across browser tabs
3. Add analytics for language usage patterns
4. Support for additional languages without code changes
5. Admin panel for managing user language preferences
