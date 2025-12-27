/**
 * useFont Hook
 * Provides access to font configuration for the current locale
 */

import { useLocale } from 'next-intl';
import { Locale } from '@/config/i18n';
import { getFontConfig, getFontFamily, isFontSupported } from '@/lib/font-config';

/**
 * Hook to get font configuration for the current locale
 * Returns font family, script name, and other font-related information
 */
export function useFont() {
  const locale = useLocale() as Locale;

  if (!isFontSupported(locale)) {
    console.warn(`Font not supported for locale: ${locale}`);
  }

  const fontConfig = getFontConfig(locale);
  const fontFamily = getFontFamily(locale);

  return {
    locale,
    fontConfig,
    fontFamily,
    fontName: fontConfig.fontFamily,
    scriptName: fontConfig.scriptName,
    description: fontConfig.description,
  };
}
