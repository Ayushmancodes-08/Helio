# E2E Tests Quick Start Guide

## Installation

```bash
cd GSS
npm install
```

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run with interactive UI
```bash
npm run test:e2e:ui
```

### Run in debug mode (step through tests)
```bash
npm run test:e2e:debug
```

### Run specific test
```bash
npx playwright test e2e/multilingual.spec.ts -g "Test 1"
```

### Run specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run on mobile only
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## Viewing Results

### View HTML report
```bash
npx playwright show-report
```

### View trace (for debugging)
```bash
npx playwright show-trace trace.zip
```

## Test Files

- **Tests**: `GSS/e2e/multilingual.spec.ts`
- **Helpers**: `GSS/e2e/helpers.ts`
- **Config**: `GSS/playwright.config.ts`
- **Docs**: `GSS/e2e/README.md`

## What's Tested

✅ User selects language on homepage
✅ User logs in and language is maintained
✅ User changes language in dashboard
✅ User logs out and language is remembered
✅ User logs in on different device and language is loaded
✅ Language persistence across page navigation
✅ All language options are available
✅ Language switcher is accessible via keyboard
✅ Language switcher displays native script names
✅ Language switcher is responsive on mobile

## Supported Languages

- Hindi (हिंदी) - hi-IN
- English - en-IN
- Bengali (বাংলা) - bn-IN
- Telugu (తెలుగు) - te-IN

## Browsers Tested

- Chromium
- Firefox
- WebKit
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## Troubleshooting

### Port 3000 already in use
The tests will automatically start the dev server. If port 3000 is in use:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Tests timeout
Increase timeout in `playwright.config.ts`:
```typescript
use: {
  timeout: 60000, // 60 seconds
}
```

### Debug specific test
```bash
npx playwright test e2e/multilingual.spec.ts -g "Test 1" --debug
```

## CI/CD Integration

Tests are ready for CI/CD:
- Automatic retries on CI (2 retries)
- Single worker for stability
- HTML reports generated
- Traces collected on failure

## Performance

- Each test: ~5-10 seconds
- Full suite: ~60-90 seconds
- Mobile tests: ~90-120 seconds

## Next Steps

1. Run tests: `npm run test:e2e`
2. Check results: `npx playwright show-report`
3. Debug failures: `npm run test:e2e:debug`
4. Integrate into CI/CD pipeline

## Documentation

- Full docs: `GSS/e2e/README.md`
- Implementation details: `GSS/E2E_TESTS_IMPLEMENTATION.md`
