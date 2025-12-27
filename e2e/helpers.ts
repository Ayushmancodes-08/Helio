import { Page, expect } from '@playwright/test';

/**
 * Helper functions for E2E tests
 */

/**
 * Wait for language to change in the DOM
 */
export async function waitForLanguageChange(page: Page, expectedLocale: string) {
  await page.waitForFunction(
    (locale) => {
      const html = document.documentElement;
      return html.lang === locale;
    },
    expectedLocale,
    { timeout: 5000 }
  );
}

/**
 * Get current language from localStorage
 */
export async function getCurrentLanguageFromStorage(page: Page): Promise<string> {
  return await page.evaluate(() => {
    return localStorage.getItem('language_preference') || 'en-IN';
  });
}

/**
 * Clear language preference from localStorage
 */
export async function clearLanguageStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('language_preference');
  });
}

/**
 * Set language preference in localStorage
 */
export async function setLanguageInStorage(page: Page, locale: string) {
  await page.evaluate((lang) => {
    localStorage.setItem('language_preference', lang);
  }, locale);
}

/**
 * Verify language switcher is visible
 */
export async function verifyLanguageSwitcherVisible(page: Page) {
  const languageSwitcher = page.locator('[data-testid="language-switcher"]').first();
  await expect(languageSwitcher).toBeVisible();
  return languageSwitcher;
}

/**
 * Open language switcher dropdown
 */
export async function openLanguageSwitcher(page: Page) {
  const languageSwitcher = await verifyLanguageSwitcherVisible(page);
  await languageSwitcher.click();
  
  // Wait for dropdown to be visible
  const firstOption = page.locator('[data-testid="language-option-hi-IN"]');
  await expect(firstOption).toBeVisible();
}

/**
 * Select language from switcher
 */
export async function selectLanguage(page: Page, locale: string) {
  const option = page.locator(`[data-testid="language-option-${locale}"]`);
  await expect(option).toBeVisible();
  await option.click();
  
  // Wait for language to change
  await page.waitForTimeout(500);
}

/**
 * Verify language changed in UI
 */
export async function verifyLanguageChanged(page: Page, locale: string, expectedText: string) {
  const appName = page.locator('[data-testid="app-name"]');
  const appNameText = await appName.textContent();
  expect(appNameText).toContain(expectedText);
  
  // Verify localStorage
  const savedLanguage = await getCurrentLanguageFromStorage(page);
  expect(savedLanguage).toBe(locale);
}

/**
 * Navigate and verify language persists
 */
export async function navigateAndVerifyLanguagePersists(
  page: Page,
  url: string,
  expectedLocale: string
) {
  await page.goto(url);
  const savedLanguage = await getCurrentLanguageFromStorage(page);
  expect(savedLanguage).toBe(expectedLocale);
}

/**
 * Get all language options
 */
export async function getAllLanguageOptions(page: Page) {
  return {
    hindi: page.locator('[data-testid="language-option-hi-IN"]'),
    english: page.locator('[data-testid="language-option-en-IN"]'),
    bengali: page.locator('[data-testid="language-option-bn-IN"]'),
    telugu: page.locator('[data-testid="language-option-te-IN"]'),
  };
}

/**
 * Verify all language options are available
 */
export async function verifyAllLanguagesAvailable(page: Page) {
  const options = await getAllLanguageOptions(page);
  
  await expect(options.hindi).toBeVisible();
  await expect(options.english).toBeVisible();
  await expect(options.bengali).toBeVisible();
  await expect(options.telugu).toBeVisible();
}

/**
 * Test keyboard navigation
 */
export async function testKeyboardNavigation(page: Page) {
  const languageSwitcher = await verifyLanguageSwitcherVisible(page);
  
  // Focus on language switcher
  await languageSwitcher.focus();
  await expect(languageSwitcher).toBeFocused();
  
  // Open dropdown with Enter
  await page.keyboard.press('Enter');
  
  // Verify dropdown is open
  const firstOption = page.locator('[data-testid="language-option-hi-IN"]');
  await expect(firstOption).toBeVisible();
  
  return true;
}

/**
 * Verify native script names
 */
export async function verifyNativeScriptNames(page: Page) {
  const hindiOption = page.locator('[data-testid="language-option-hi-IN"]');
  const bengaliOption = page.locator('[data-testid="language-option-bn-IN"]');
  const teluguOption = page.locator('[data-testid="language-option-te-IN"]');
  
  const hindiText = await hindiOption.textContent();
  const bengaliText = await bengaliOption.textContent();
  const teluguText = await teluguOption.textContent();
  
  expect(hindiText).toContain('हिंदी');
  expect(bengaliText).toContain('বাংলা');
  expect(teluguText).toContain('తెలుగు');
}

/**
 * Set mobile viewport
 */
export async function setMobileViewport(page: Page) {
  await page.setViewportSize({ width: 375, height: 667 });
}

/**
 * Set desktop viewport
 */
export async function setDesktopViewport(page: Page) {
  await page.setViewportSize({ width: 1280, height: 720 });
}
