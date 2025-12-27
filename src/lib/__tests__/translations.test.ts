import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property 2: Translation Completeness
 * For any page in the application and any supported language, all visible text elements 
 * SHALL be translated to that language (no English text should appear when another language is selected).
 * 
 * Validates: Requirements 4.1, 4.2, 4.3
 */

const SUPPORTED_LANGUAGES = ['hi-IN', 'en-IN', 'bn-IN', 'te-IN'];
const NAMESPACES = ['common', 'auth', 'dashboard', 'appointments', 'medical', 'errors', 'homepage'];
const LOCALES_DIR = path.join(process.cwd(), 'public', 'locales');

interface TranslationKey {
  key: string;
  value: any;
}

/**
 * Recursively extract all translation keys from a translation object
 */
function extractKeys(obj: any, prefix = ''): TranslationKey[] {
  const keys: TranslationKey[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push({ key: fullKey, value });
    }
  }

  return keys;
}

/**
 * Load a translation file
 */
function loadTranslation(language: string, namespace: string): any {
  const filePath = path.join(LOCALES_DIR, language, `${namespace}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

describe('Translation Completeness - Property 2', () => {
  it('should have all translation files for all supported languages', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const languageDir = path.join(LOCALES_DIR, language);
      expect(fs.existsSync(languageDir)).toBe(true);
    }
  });

  it('should have all namespaces for all supported languages', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      for (const namespace of NAMESPACES) {
        const filePath = path.join(LOCALES_DIR, language, `${namespace}.json`);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    }
  });

  it('should have consistent translation keys across all languages for each namespace', () => {
    for (const namespace of NAMESPACES) {
      // Get keys from English (reference language)
      const enTranslation = loadTranslation('en-IN', namespace);
      expect(enTranslation).not.toBeNull();

      const enKeys = new Set(extractKeys(enTranslation).map((k) => k.key));

      // Check all other languages have the same keys
      for (const language of SUPPORTED_LANGUAGES) {
        if (language === 'en-IN') continue;

        const translation = loadTranslation(language, namespace);
        expect(translation).not.toBeNull();

        const keys = new Set(extractKeys(translation).map((k) => k.key));

        // Check for missing keys
        const missingKeys = Array.from(enKeys).filter((key) => !keys.has(key));
        expect(missingKeys).toEqual([]);

        // Check for extra keys
        const extraKeys = Array.from(keys).filter((key) => !enKeys.has(key));
        expect(extraKeys).toEqual([]);
      }
    }
  });

  it('should have non-empty translation values for all keys', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      for (const namespace of NAMESPACES) {
        const translation = loadTranslation(language, namespace);
        expect(translation).not.toBeNull();

        const keys = extractKeys(translation);
        for (const { key, value } of keys) {
          expect(typeof value).toBe('string');
          expect(value.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('should have valid JSON structure for all translation files', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      for (const namespace of NAMESPACES) {
        const filePath = path.join(LOCALES_DIR, language, `${namespace}.json`);
        const content = fs.readFileSync(filePath, 'utf-8');

        expect(() => {
          JSON.parse(content);
        }).not.toThrow(
          `Invalid JSON in ${language}/${namespace}.json`
        );
      }
    }
  });

  it('should have translations for all required namespaces', () => {
    const requiredNamespaces = ['common', 'auth', 'dashboard', 'appointments', 'medical', 'errors', 'homepage'];

    for (const language of SUPPORTED_LANGUAGES) {
      for (const namespace of requiredNamespaces) {
        const translation = loadTranslation(language, namespace);
        expect(translation).not.toBeNull();
        expect(Object.keys(translation).length).toBeGreaterThan(0);
      }
    }
  });

  it('should have consistent structure across all language variants of the same namespace', () => {
    for (const namespace of NAMESPACES) {
      const translations = new Map<string, any>();

      for (const language of SUPPORTED_LANGUAGES) {
        const translation = loadTranslation(language, namespace);
        translations.set(language, translation);
      }

      // Get the structure from English
      const enTranslation = translations.get('en-IN');
      const enStructure = JSON.stringify(Object.keys(enTranslation).sort());

      // Compare with other languages
      for (const language of SUPPORTED_LANGUAGES) {
        if (language === 'en-IN') continue;

        const translation = translations.get(language);
        const structure = JSON.stringify(Object.keys(translation).sort());

        expect(structure).toBe(enStructure);
      }
    }
  });
});
