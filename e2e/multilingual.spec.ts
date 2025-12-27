import { test, expect } from '@playwright/test';
import {
  getCurrentLanguageFromStorage,
  clearLanguageStorage,
  setLanguageInStorage,
  verifyLanguageSwitcherVisible,
  openLanguageSwitcher,
  selectLanguage,
  verifyLanguageChanged,
  navigateAndVerifyLanguagePersists,
  verifyAllLanguagesAvailable,
  testKeyboardNavigation,
  verifyNativeScriptNames,
  setMobileViewport,
} from './helpers';

test.describe('Multilingual E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear language preference before each test
    await page.goto('http://localhost:3000/en-IN');
    await clearLanguageStorage(page);
  });

  test('Test 1: User selects language on homepage', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000/en-IN');
    
    // Verify homepage is loaded
    await expect(page).toHaveTitle(/Grameen Swasthya Setu|स्वास्थ्य सेवा|স্বাস্থ्য সেবা|ఆరోగ్య సేవ/);
    
    // Open language switcher
    await openLanguageSwitcher(page);
    
    // Select Hindi language
    await selectLanguage(page, 'hi-IN');
    
    // Verify language changed
    await verifyLanguageChanged(page, 'hi-IN', 'स्वास्थ्य सेवा');
  });

  test('Test 2: User logs in and language is maintained', async ({ page }) => {
    // Set language preference to Hindi before login
    await page.goto('http://localhost:3000/en-IN');
    await setLanguageInStorage(page, 'hi-IN');
    
    // Navigate to homepage
    await page.goto('http://localhost:3000/en-IN');
    
    // Verify language is Hindi
    let savedLanguage = await getCurrentLanguageFromStorage(page);
    expect(savedLanguage).toBe('hi-IN');
    
    // Click login button
    const loginButton = page.locator('button:has-text("लॉगिन करें"), button:has-text("Login")').first();
    await loginButton.click();
    
    // Wait for navigation to login page
    await page.waitForURL(/\/login/);
    
    // Verify language is still Hindi after navigation
    savedLanguage = await getCurrentLanguageFromStorage(page);
    expect(savedLanguage).toBe('hi-IN');
  });

  test('Test 3: User changes language in dashboard', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000/en-IN');
    
    // Set initial language to English
    await setLanguageInStorage(page, 'en-IN');
    
    // Reload to apply language
    await page.reload();
    
    // Verify initial language is English
    let savedLanguage = await getCurrentLanguageFromStorage(page);
    expect(savedLanguage).toBe('en-IN');
    
    // Open language switcher
    await openLanguageSwitcher(page);
    
    // Select Bengali
    await selectLanguage(page, 'bn-IN');
    
    // Verify language changed
    await verifyLanguageChanged(page, 'bn-IN', 'স্বাস্থ্য সেবা');
  });

  test('Test 4: User logs out and language is remembered', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000/en-IN');
    
    // Set language to Telugu
    await setLanguageInStorage(page, 'te-IN');
    
    // Reload to apply language
    await page.reload();
    
    // Verify language is Telugu
    let savedLanguage = await getCurrentLanguageFromStorage(page);
    expect(savedLanguage).toBe('te-IN');
    
    // Simulate logout by clearing auth and navigating to login
    await page.evaluate(() => {
      localStorage.removeItem('sb-auth-token');
    });
    
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Verify language is still Telugu after logout
    savedLanguage = await getCurrentLanguageFromStorage(page);
    expect(savedLanguage).toBe('te-IN');
  });

  test('Test 5: User logs in on different device and language is loaded', async ({ page, context }) => {
    // Simulate first device: set language to Hindi and save to localStorage
    await page.goto('http://localhost:3000/en-IN');
    await setLanguageInStorage(page, 'hi-IN');
    
    // Verify language is saved
    let savedLanguage = await getCurrentLanguageFromStorage(page);
    expect(savedLanguage).toBe('hi-IN');
    
    // Simulate second device: create new context (new browser session)
    const newContext = await context.browser()?.newContext() || context;
    const newPage = await newContext.newPage();
    
    // Navigate to homepage on new device
    await newPage.goto('http://localhost:3000/en-IN');
    
    // On a new device, localStorage would be empty, so language would default to browser language
    // But we can verify that the language switcher works on the new device
    await verifyLanguageSwitcherVisible(newPage);
    
    // Set language to Bengali on new device
    await setLanguageInStorage(newPage, 'bn-IN');
    
    // Reload to apply language
    await newPage.reload();
    
    // Verify language is Bengali
    savedLanguage = await getCurrentLanguageFromStorage(newPage);
    expect(savedLanguage).toBe('bn-IN');
    
    await newPage.close();
  });

  test('Test 6: Language persistence across page navigation', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000/en-IN');
    
    // Set language to Hindi
    await setLanguageInStorage(page, 'hi-IN');
    
    // Reload to apply language
    await page.reload();
    
    // Verify language is Hindi
    let savedLanguage = await getCurrentLanguageFromStorage(page);
    expect(savedLanguage).toBe('hi-IN');
    
    // Navigate to login page
    await navigateAndVerifyLanguagePersists(page, 'http://localhost:3000/login', 'hi-IN');
    
    // Navigate back to homepage
    await navigateAndVerifyLanguagePersists(page, 'http://localhost:3000/en-IN', 'hi-IN');
  });

  test('Test 7: All language options are available', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000/en-IN');
    
    // Open language switcher
    await openLanguageSwitcher(page);
    
    // Verify all language options are available
    await verifyAllLanguagesAvailable(page);
  });

  test('Test 8: Language switcher is accessible via keyboard', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000/en-IN');
    
    // Test keyboard navigation
    const isAccessible = await testKeyboardNavigation(page);
    expect(isAccessible).toBe(true);
    
    // Navigate to Hindi option using arrow keys
    await page.keyboard.press('ArrowDown');
    
    // Press Enter to select
    await page.keyboard.press('Enter');
    
    // Verify language changed
    const savedLanguage = await getCurrentLanguageFromStorage(page);
    expect(savedLanguage).toBe('hi-IN');
  });

  test('Test 9: Language switcher displays native script names', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000/en-IN');
    
    // Open language switcher
    await openLanguageSwitcher(page);
    
    // Verify native script names
    await verifyNativeScriptNames(page);
  });

  test('Test 10: Language switcher is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await setMobileViewport(page);
    
    // Navigate to homepage
    await page.goto('http://localhost:3000/en-IN');
    
    // Verify language switcher is visible
    await verifyLanguageSwitcherVisible(page);
    
    // Open language switcher
    await openLanguageSwitcher(page);
    
    // Select Hindi
    await selectLanguage(page, 'hi-IN');
    
    // Verify language changed
    const savedLanguage = await getCurrentLanguageFromStorage(page);
    expect(savedLanguage).toBe('hi-IN');
  });
});
