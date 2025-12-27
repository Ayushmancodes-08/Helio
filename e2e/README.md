# E2E Tests for Multilingual Support

This directory contains end-to-end tests for the multilingual Indian languages support feature using Playwright.

## Test Coverage

The E2E tests cover the following scenarios:

### Test 1: User selects language on homepage
- Verifies that users can select a language from the language switcher on the homepage
- Confirms that the language preference is saved to localStorage
- Validates that the UI text changes to the selected language

### Test 2: User logs in and language is maintained
- Ensures that language preference is maintained when navigating from homepage to login
- Verifies that the selected language persists across page navigation
- Confirms that the login page displays in the selected language

### Test 3: User changes language in dashboard
- Tests language switching functionality within the dashboard
- Verifies that language changes are immediately reflected in the UI
- Confirms that the new language preference is saved to localStorage

### Test 4: User logs out and language is remembered
- Ensures that language preference is retained after logout
- Verifies that the language is still available when the user returns to the login page
- Confirms that localStorage persists the language preference

### Test 5: User logs in on different device and language is loaded
- Simulates a user logging in on a different device
- Verifies that the language switcher works on new devices
- Confirms that language preferences can be set on new devices

### Test 6: Language persistence across page navigation
- Tests that language preference persists when navigating between different pages
- Verifies that the language remains consistent across the entire application
- Confirms that localStorage maintains the language preference

### Test 7: All language options are available
- Verifies that all 4 supported languages (Hindi, English, Bengali, Telugu) are available
- Confirms that the language switcher displays all options correctly
- Validates that each language option is selectable

### Test 8: Language switcher is accessible via keyboard
- Tests keyboard navigation for the language switcher
- Verifies that users can open the dropdown using Enter key
- Confirms that users can select languages using arrow keys and Enter
- Validates accessibility compliance

### Test 9: Language switcher displays native script names
- Verifies that language names are displayed in their native scripts
- Confirms that Hindi shows as "हिंदी", Bengali as "বাংলা", Telugu as "తెలుగు"
- Validates that the native script names are correctly rendered

### Test 10: Language switcher is responsive on mobile
- Tests the language switcher on mobile viewports (375x667)
- Verifies that the switcher is visible and functional on mobile devices
- Confirms that language selection works on mobile browsers

## Running the Tests

### Prerequisites
1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure the development server is running or let Playwright start it:
   ```bash
   npm run dev
   ```

### Run all E2E tests
```bash
npm run test:e2e
```

### Run E2E tests with UI
```bash
npm run test:e2e:ui
```

### Run E2E tests in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test
```bash
npx playwright test e2e/multilingual.spec.ts -g "Test 1"
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Configuration

The tests are configured in `playwright.config.ts` with the following settings:

- **Base URL**: http://localhost:3000
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Retries**: 2 on CI, 0 locally
- **Timeout**: 30 seconds per test
- **Reporter**: HTML report

## Test Data

The tests use the following test data:

- **Languages**: Hindi (hi-IN), English (en-IN), Bengali (bn-IN), Telugu (te-IN)
- **Storage Key**: `language_preference` in localStorage
- **Test IDs**: 
  - `language-switcher`: Main language switcher button
  - `language-option-{locale}`: Individual language options
  - `app-name`: Application name for verification

## Debugging

### View HTML Report
After running tests, view the HTML report:
```bash
npx playwright show-report
```

### Debug Mode
Run tests in debug mode to step through them:
```bash
npm run test:e2e:debug
```

### Trace Viewer
Traces are automatically collected on first retry. View them:
```bash
npx playwright show-trace trace.zip
```

## Accessibility Testing

The tests include accessibility checks:
- Keyboard navigation support
- Screen reader announcements
- ARIA labels and roles
- Focus management
- Semantic HTML

## Performance Considerations

- Tests use `waitForTimeout(500)` to allow for language switching animations
- Language switcher should respond within 500ms (as per requirements)
- Tests verify that language changes are atomic (no partial translations)

## Maintenance

When updating the multilingual feature:
1. Update test IDs if component structure changes
2. Add new tests for new languages or features
3. Update test data if language codes change
4. Verify accessibility compliance with each update

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:
- Retries are enabled on CI (2 retries)
- Single worker on CI for stability
- HTML reports are generated for review
- Tests fail the build if any test fails

## Known Limitations

1. Tests assume the development server is running on port 3000
2. Tests use localStorage for language persistence (not database)
3. Tests don't cover authenticated user flows (database persistence)
4. Mobile tests use emulated devices, not real devices

## Future Enhancements

1. Add tests for database persistence (authenticated users)
2. Add tests for language-specific date/time formatting
3. Add tests for currency formatting
4. Add tests for medical terminology accuracy
5. Add visual regression tests for language-specific rendering
6. Add performance tests for language switching
7. Add tests for offline language switching
