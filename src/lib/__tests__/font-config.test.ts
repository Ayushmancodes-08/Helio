import { describe, it, expect } from 'vitest';
import {
  fontConfigs,
  getFontFamily,
  getFontConfig,
  getAllFontConfigs,
  isFontSupported,
  getCSSFontFamily,
} from '../font-config';
import { locales, Locale } from '@/config/i18n';

describe('Font Configuration', () => {
  describe('fontConfigs object', () => {
    it('should have configurations for all supported locales', () => {
      for (const locale of locales) {
        expect(fontConfigs).toHaveProperty(locale);
      }
    });

    it('should have required properties for each locale', () => {
      for (const locale of locales) {
        const config = fontConfigs[locale as Locale];
        expect(config).toHaveProperty('locale');
        expect(config).toHaveProperty('fontFamily');
        expect(config).toHaveProperty('fallbackFonts');
        expect(config).toHaveProperty('scriptName');
        expect(config).toHaveProperty('description');
      }
    });

    it('should have correct font families for each language', () => {
      expect(fontConfigs['hi-IN'].fontFamily).toBe('Noto Sans Devanagari');
      expect(fontConfigs['en-IN'].fontFamily).toBe('PT Sans');
      expect(fontConfigs['bn-IN'].fontFamily).toBe('Noto Sans Bengali');
      expect(fontConfigs['te-IN'].fontFamily).toBe('Noto Sans Telugu');
    });

    it('should have correct script names for each language', () => {
      expect(fontConfigs['hi-IN'].scriptName).toBe('Devanagari');
      expect(fontConfigs['en-IN'].scriptName).toBe('Latin');
      expect(fontConfigs['bn-IN'].scriptName).toBe('Bengali');
      expect(fontConfigs['te-IN'].scriptName).toBe('Telugu');
    });
  });

  describe('getFontFamily', () => {
    it('should return font family string with fallbacks for Hindi', () => {
      const fontFamily = getFontFamily('hi-IN');
      expect(fontFamily).toContain('Noto Sans Devanagari');
      expect(fontFamily).toContain('PT Sans');
      expect(fontFamily).toContain('sans-serif');
    });

    it('should return font family string with fallbacks for English', () => {
      const fontFamily = getFontFamily('en-IN');
      expect(fontFamily).toContain('PT Sans');
      expect(fontFamily).toContain('sans-serif');
    });

    it('should return font family string with fallbacks for Bengali', () => {
      const fontFamily = getFontFamily('bn-IN');
      expect(fontFamily).toContain('Noto Sans Bengali');
      expect(fontFamily).toContain('PT Sans');
      expect(fontFamily).toContain('sans-serif');
    });

    it('should return font family string with fallbacks for Telugu', () => {
      const fontFamily = getFontFamily('te-IN');
      expect(fontFamily).toContain('Noto Sans Telugu');
      expect(fontFamily).toContain('PT Sans');
      expect(fontFamily).toContain('sans-serif');
    });

    it('should return properly quoted font names', () => {
      const fontFamily = getFontFamily('hi-IN');
      expect(fontFamily).toMatch(/'Noto Sans Devanagari'/);
      expect(fontFamily).toMatch(/'PT Sans'/);
    });
  });

  describe('getFontConfig', () => {
    it('should return correct config for each locale', () => {
      const hiConfig = getFontConfig('hi-IN');
      expect(hiConfig.locale).toBe('hi-IN');
      expect(hiConfig.fontFamily).toBe('Noto Sans Devanagari');

      const enConfig = getFontConfig('en-IN');
      expect(enConfig.locale).toBe('en-IN');
      expect(enConfig.fontFamily).toBe('PT Sans');
    });
  });

  describe('getAllFontConfigs', () => {
    it('should return array of all font configurations', () => {
      const configs = getAllFontConfigs();
      expect(configs).toHaveLength(4);
      expect(configs.map((c) => c.locale)).toEqual(['hi-IN', 'en-IN', 'bn-IN', 'te-IN']);
    });

    it('should return configurations in consistent order', () => {
      const configs1 = getAllFontConfigs();
      const configs2 = getAllFontConfigs();
      expect(configs1.map((c) => c.locale)).toEqual(configs2.map((c) => c.locale));
    });
  });

  describe('isFontSupported', () => {
    it('should return true for supported locales', () => {
      expect(isFontSupported('hi-IN')).toBe(true);
      expect(isFontSupported('en-IN')).toBe(true);
      expect(isFontSupported('bn-IN')).toBe(true);
      expect(isFontSupported('te-IN')).toBe(true);
    });

    it('should return false for unsupported locales', () => {
      expect(isFontSupported('fr-FR' as Locale)).toBe(false);
      expect(isFontSupported('de-DE' as Locale)).toBe(false);
    });
  });

  describe('getCSSFontFamily', () => {
    it('should return valid CSS font-family declaration', () => {
      const css = getCSSFontFamily('hi-IN');
      expect(css).toMatch(/^font-family:/);
      expect(css).toContain('Noto Sans Devanagari');
      expect(css).toContain(';');
    });

    it('should return different CSS for different locales', () => {
      const hiCSS = getCSSFontFamily('hi-IN');
      const enCSS = getCSSFontFamily('en-IN');
      expect(hiCSS).not.toBe(enCSS);
    });

    it('should include all fallback fonts in CSS', () => {
      const css = getCSSFontFamily('bn-IN');
      expect(css).toContain('Noto Sans Bengali');
      expect(css).toContain('PT Sans');
      expect(css).toContain('sans-serif');
    });
  });

  describe('Font fallback chain', () => {
    it('should have fallback fonts for all locales', () => {
      for (const locale of locales) {
        const config = fontConfigs[locale as Locale];
        expect(config.fallbackFonts.length).toBeGreaterThan(0);
      }
    });

    it('should always include sans-serif as final fallback', () => {
      for (const locale of locales) {
        const config = fontConfigs[locale as Locale];
        expect(config.fallbackFonts[config.fallbackFonts.length - 1]).toBe('sans-serif');
      }
    });
  });

  describe('Font consistency across locales', () => {
    it('should have unique font families for each locale', () => {
      const fontFamilies = new Set(
        Object.values(fontConfigs).map((config) => config.fontFamily)
      );
      // Hindi, Bengali, Telugu should have unique fonts; English can share
      expect(fontFamilies.size).toBeGreaterThanOrEqual(3);
    });

    it('should have consistent description format', () => {
      for (const locale of locales) {
        const config = fontConfigs[locale as Locale];
        expect(config.description).toMatch(/^[A-Z]/); // Starts with capital letter
        expect(config.description).toContain('-'); // Contains dash separator
      }
    });
  });
});
