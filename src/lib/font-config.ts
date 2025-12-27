/**
 * Font configuration for language-specific text rendering
 * Provides font families and loading strategies for each supported language
 */

import { Locale } from '@/config/i18n';

export interface FontConfig {
  locale: Locale;
  fontFamily: string;
  fallbackFonts: string[];
  scriptName: string;
  description: string;
}

/**
 * Font configurations for each supported language
 * Uses Google Fonts Noto Sans variants for proper script rendering
 */
export const fontConfigs: Record<Locale, FontConfig> = {
  'hi-IN': {
    locale: 'hi-IN',
    fontFamily: 'Noto Sans Devanagari',
    fallbackFonts: ['PT Sans', 'sans-serif'],
    scriptName: 'Devanagari',
    description: 'Hindi - Devanagari script',
  },
  'en-IN': {
    locale: 'en-IN',
    fontFamily: 'PT Sans',
    fallbackFonts: ['sans-serif'],
    scriptName: 'Latin',
    description: 'English - Latin script',
  },
  'bn-IN': {
    locale: 'bn-IN',
    fontFamily: 'Noto Sans Bengali',
    fallbackFonts: ['PT Sans', 'sans-serif'],
    scriptName: 'Bengali',
    description: 'Bengali - Bengali script',
  },
  'te-IN': {
    locale: 'te-IN',
    fontFamily: 'Noto Sans Telugu',
    fallbackFonts: ['PT Sans', 'sans-serif'],
    scriptName: 'Telugu',
    description: 'Telugu - Telugu script',
  },
};

/**
 * Get the font family string for a given locale
 * Includes fallback fonts for graceful degradation
 */
export function getFontFamily(locale: Locale): string {
  const config = fontConfigs[locale];
  const fonts = [config.fontFamily, ...config.fallbackFonts];
  return fonts.map((font) => `'${font}'`).join(', ');
}

/**
 * Get the font configuration for a given locale
 */
export function getFontConfig(locale: Locale): FontConfig {
  return fontConfigs[locale];
}

/**
 * Get all font configurations
 */
export function getAllFontConfigs(): FontConfig[] {
  return Object.values(fontConfigs);
}

/**
 * Verify that a locale has proper font support
 */
export function isFontSupported(locale: Locale): boolean {
  return locale in fontConfigs;
}

/**
 * Get CSS font-family declaration for a locale
 */
export function getCSSFontFamily(locale: Locale): string {
  return `font-family: ${getFontFamily(locale)};`;
}
