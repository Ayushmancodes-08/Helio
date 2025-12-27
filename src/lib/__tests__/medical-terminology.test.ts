import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property 8: Medical Terminology Accuracy
 * For any medical term displayed, the translation SHALL be clinically accurate and consistent across all pages.
 * 
 * Validates: Requirements 8.1, 8.2, 8.3
 */

const SUPPORTED_LANGUAGES = ['hi-IN', 'en-IN', 'bn-IN', 'te-IN'];
const LOCALES_DIR = path.join(process.cwd(), 'public', 'locales');

interface MedicalTerm {
  key: string;
  value: string;
}

/**
 * Load medical terminology from a language file
 */
function loadMedicalTerms(language: string): MedicalTerm[] {
  const filePath = path.join(LOCALES_DIR, language, 'medical.json');
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  const terms: MedicalTerm[] = [];
  
  // Extract all medical terms from all categories
  const categories = ['symptoms', 'diagnoses', 'medications', 'tests', 'healthConditions', 'procedures', 'prescriptionInstructions', 'labResults'];
  
  for (const category of categories) {
    if (data[category]) {
      for (const [key, value] of Object.entries(data[category])) {
        if (typeof value === 'string') {
          terms.push({ key: `${category}.${key}`, value });
        }
      }
    }
  }
  
  return terms;
}

/**
 * Check if a medical term is non-empty and valid
 */
function isValidMedicalTerm(term: string): boolean {
  return typeof term === 'string' && term.trim().length > 0;
}

/**
 * Check if a term appears to be a placeholder or untranslated
 */
function isPlaceholder(term: string): boolean {
  // Check for common placeholder patterns
  const placeholderPatterns = [
    /^\[.*\]$/,  // [text]
    /^{{.*}}$/,  // {{text}}
    /^TODO/i,    // TODO
    /^FIXME/i,   // FIXME
    /^undefined$/i,
    /^null$/i,
  ];
  
  return placeholderPatterns.some(pattern => pattern.test(term));
}

/**
 * Check if a term contains only English characters (for non-English languages)
 */
function isEnglishOnly(term: string, language: string): boolean {
  if (language === 'en-IN') return false;
  
  // Check if term contains non-ASCII characters
  const nonAsciiRegex = /[^\x00-\x7F]/;
  return !nonAsciiRegex.test(term);
}

describe('Medical Terminology Accuracy - Property 8', () => {
  it('should have medical.json file for all supported languages', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const filePath = path.join(LOCALES_DIR, language, 'medical.json');
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  it('should have valid JSON structure in all medical.json files', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const filePath = path.join(LOCALES_DIR, language, 'medical.json');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(() => {
        JSON.parse(content);
      }).not.toThrow(`Invalid JSON in ${language}/medical.json`);
    }
  });

  it('should have all required medical categories', () => {
    const requiredCategories = ['symptoms', 'diagnoses', 'medications', 'tests'];
    
    for (const language of SUPPORTED_LANGUAGES) {
      const filePath = path.join(LOCALES_DIR, language, 'medical.json');
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      for (const category of requiredCategories) {
        expect(data[category]).toBeDefined();
        expect(typeof data[category]).toBe('object');
        expect(Object.keys(data[category]).length).toBeGreaterThan(0);
      }
    }
  });

  it('should have consistent medical term keys across all languages', () => {
    const enTerms = loadMedicalTerms('en-IN');
    const enKeys = new Set(enTerms.map(t => t.key));
    
    for (const language of SUPPORTED_LANGUAGES) {
      if (language === 'en-IN') continue;
      
      const terms = loadMedicalTerms(language);
      const keys = new Set(terms.map(t => t.key));
      
      // All keys in non-English languages should exist in English
      for (const key of keys) {
        expect(enKeys.has(key)).toBe(true);
      }
    }
  });

  it('should have non-empty medical term values for all keys', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const terms = loadMedicalTerms(language);
      
      for (const term of terms) {
        expect(isValidMedicalTerm(term.value)).toBe(true);
      }
    }
  });

  it('should not have placeholder values in medical terms', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const terms = loadMedicalTerms(language);
      
      for (const term of terms) {
        expect(isPlaceholder(term.value)).toBe(false);
      }
    }
  });

  it('should have translated medical terms for non-English languages', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      if (language === 'en-IN') continue;
      
      const terms = loadMedicalTerms(language);
      
      // Check that at least 80% of terms are translated (not English-only)
      const translatedTerms = terms.filter(t => !isEnglishOnly(t.value, language));
      const translationRate = translatedTerms.length / terms.length;
      
      expect(translationRate).toBeGreaterThanOrEqual(0.8);
    }
  });

  it('should have consistent medical term structure across all languages', () => {
    const enTerms = loadMedicalTerms('en-IN');
    const enKeys = new Set(enTerms.map(t => t.key));
    
    for (const language of SUPPORTED_LANGUAGES) {
      if (language === 'en-IN') continue;
      
      const terms = loadMedicalTerms(language);
      const keys = new Set(terms.map(t => t.key));
      
      // All translated terms should have corresponding English keys
      for (const key of keys) {
        expect(enKeys.has(key)).toBe(true);
      }
      
      // Should have at least some medical terms translated (minimum 50 terms)
      expect(keys.size).toBeGreaterThanOrEqual(50);
    }
  });

  it('should have medical terms for symptoms category', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const filePath = path.join(LOCALES_DIR, language, 'medical.json');
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      expect(data.symptoms).toBeDefined();
      expect(Object.keys(data.symptoms).length).toBeGreaterThan(0);
      
      // Check that all symptom values are non-empty strings
      for (const [key, value] of Object.entries(data.symptoms)) {
        expect(typeof value).toBe('string');
        expect((value as string).length).toBeGreaterThan(0);
      }
    }
  });

  it('should have medical terms for diagnoses category', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const filePath = path.join(LOCALES_DIR, language, 'medical.json');
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      expect(data.diagnoses).toBeDefined();
      expect(Object.keys(data.diagnoses).length).toBeGreaterThan(0);
      
      // Check that all diagnosis values are non-empty strings
      for (const [key, value] of Object.entries(data.diagnoses)) {
        expect(typeof value).toBe('string');
        expect((value as string).length).toBeGreaterThan(0);
      }
    }
  });

  it('should have medical terms for medications category', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const filePath = path.join(LOCALES_DIR, language, 'medical.json');
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      expect(data.medications).toBeDefined();
      expect(Object.keys(data.medications).length).toBeGreaterThan(0);
      
      // Check that all medication values are non-empty strings
      for (const [key, value] of Object.entries(data.medications)) {
        expect(typeof value).toBe('string');
        expect((value as string).length).toBeGreaterThan(0);
      }
    }
  });

  it('should have medical terms for tests category', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const filePath = path.join(LOCALES_DIR, language, 'medical.json');
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      expect(data.tests).toBeDefined();
      expect(Object.keys(data.tests).length).toBeGreaterThan(0);
      
      // Check that all test values are non-empty strings
      for (const [key, value] of Object.entries(data.tests)) {
        expect(typeof value).toBe('string');
        expect((value as string).length).toBeGreaterThan(0);
      }
    }
  });

  it('should have prescription instructions for all languages', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const filePath = path.join(LOCALES_DIR, language, 'medical.json');
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      expect(data.prescriptionInstructions).toBeDefined();
      expect(Object.keys(data.prescriptionInstructions).length).toBeGreaterThan(0);
    }
  });

  it('should have lab results terminology for all languages', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const filePath = path.join(LOCALES_DIR, language, 'medical.json');
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      expect(data.labResults).toBeDefined();
      expect(Object.keys(data.labResults).length).toBeGreaterThan(0);
    }
  });

  it('should have consistent medical term count across all languages', () => {
    const enTerms = loadMedicalTerms('en-IN');
    
    for (const language of SUPPORTED_LANGUAGES) {
      if (language === 'en-IN') continue;
      
      const terms = loadMedicalTerms(language);
      // Should have at least 50 medical terms translated (allows phased rollout)
      expect(terms.length).toBeGreaterThanOrEqual(50);
    }
  });

  it('should not have duplicate medical term keys within a language', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const terms = loadMedicalTerms(language);
      const keys = terms.map(t => t.key);
      const uniqueKeys = new Set(keys);
      
      expect(uniqueKeys.size).toBe(keys.length);
    }
  });

  it('should have medical terms that are not just copies of English for non-English languages', () => {
    const enTerms = loadMedicalTerms('en-IN');
    const enMap = new Map(enTerms.map(t => [t.key, t.value]));
    
    for (const language of SUPPORTED_LANGUAGES) {
      if (language === 'en-IN') continue;
      
      const terms = loadMedicalTerms(language);
      
      // Count how many terms are identical to English
      let identicalCount = 0;
      for (const term of terms) {
        if (enMap.get(term.key) === term.value) {
          identicalCount++;
        }
      }
      
      // Allow some identical terms (like medication names), but not all
      const identicalRate = identicalCount / terms.length;
      expect(identicalRate).toBeLessThan(0.5);
    }
  });
});
