import { describe, it, expect } from 'vitest';
import {
  normalizeSearchQuery,
  matchesSearchQuery,
  filterBySearchQuery,
  searchAcrossLanguageVariants,
  sortByRelevance,
  getSearchSuggestions,
} from '../search-utils';

describe('Search Utilities', () => {
  describe('normalizeSearchQuery', () => {
    it('should convert to lowercase', () => {
      expect(normalizeSearchQuery('HELLO')).toBe('hello');
    });

    it('should trim whitespace', () => {
      expect(normalizeSearchQuery('  hello  ')).toBe('hello');
    });

    it('should remove diacritics', () => {
      expect(normalizeSearchQuery('café')).toBe('cafe');
    });

    it('should handle Hindi text', () => {
      const hindi = 'नमस्ते';
      const normalized = normalizeSearchQuery(hindi);
      expect(normalized).toBeTruthy();
    });

    it('should handle Bengali text', () => {
      const bengali = 'নমস্কার';
      const normalized = normalizeSearchQuery(bengali);
      expect(normalized).toBeTruthy();
    });

    it('should handle Telugu text', () => {
      const telugu = 'నమస్కారం';
      const normalized = normalizeSearchQuery(telugu);
      expect(normalized).toBeTruthy();
    });
  });

  describe('matchesSearchQuery', () => {
    it('should match exact text', () => {
      expect(matchesSearchQuery('hello world', 'hello')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(matchesSearchQuery('Hello World', 'hello')).toBe(true);
    });

    it('should match partial text', () => {
      expect(matchesSearchQuery('paracetamol', 'para')).toBe(true);
    });

    it('should return false for non-matching text', () => {
      expect(matchesSearchQuery('hello', 'world')).toBe(false);
    });

    it('should handle empty query', () => {
      expect(matchesSearchQuery('hello', '')).toBe(false);
    });

    it('should handle empty text', () => {
      expect(matchesSearchQuery('', 'hello')).toBe(false);
    });

    it('should match Hindi text', () => {
      expect(matchesSearchQuery('पैरासिटामोल', 'पैरा')).toBe(true);
    });

    it('should match Bengali text', () => {
      expect(matchesSearchQuery('প্যারাসিটামল', 'প্যারা')).toBe(true);
    });

    it('should match Telugu text', () => {
      expect(matchesSearchQuery('పారాసిటామోల్', 'పారా')).toBe(true);
    });
  });

  describe('filterBySearchQuery', () => {
    const medicines = [
      { id: '1', name: 'Paracetamol', category: 'Pain Relief' },
      { id: '2', name: 'Aspirin', category: 'Pain Relief' },
      { id: '3', name: 'Ibuprofen', category: 'Anti-inflammatory' },
    ];

    it('should filter by single field', () => {
      const results = filterBySearchQuery(medicines, 'para', ['name']);
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Paracetamol');
    });

    it('should filter by multiple fields', () => {
      const results = filterBySearchQuery(medicines, 'pain', ['name', 'category']);
      expect(results).toHaveLength(2);
    });

    it('should return all items for empty query', () => {
      const results = filterBySearchQuery(medicines, '', ['name']);
      expect(results).toHaveLength(3);
    });

    it('should return empty array for no matches', () => {
      const results = filterBySearchQuery(medicines, 'xyz', ['name']);
      expect(results).toHaveLength(0);
    });

    it('should be case-insensitive', () => {
      const results = filterBySearchQuery(medicines, 'PARA', ['name']);
      expect(results).toHaveLength(1);
    });
  });

  describe('searchAcrossLanguageVariants', () => {
    it('should find match in English variant', () => {
      const variants = {
        en: 'Paracetamol',
        hi: 'पैरासिटामोल',
        bn: 'প্যারাসিটামল',
      };
      expect(searchAcrossLanguageVariants('para', variants)).toBe(true);
    });

    it('should find match in Hindi variant', () => {
      const variants = {
        en: 'Paracetamol',
        hi: 'पैरासिटामोल',
        bn: 'প্যারাসিটামল',
      };
      expect(searchAcrossLanguageVariants('पैरा', variants)).toBe(true);
    });

    it('should find match in Bengali variant', () => {
      const variants = {
        en: 'Paracetamol',
        hi: 'पैरासिटामोल',
        bn: 'প্যারাসিটামল',
      };
      expect(searchAcrossLanguageVariants('প্যারা', variants)).toBe(true);
    });

    it('should return false for no match', () => {
      const variants = {
        en: 'Paracetamol',
        hi: 'पैरासिटामोल',
      };
      expect(searchAcrossLanguageVariants('xyz', variants)).toBe(false);
    });

    it('should handle empty query', () => {
      const variants = { en: 'Paracetamol' };
      expect(searchAcrossLanguageVariants('', variants)).toBe(false);
    });
  });

  describe('sortByRelevance', () => {
    const items = [
      { id: '1', name: 'Paracetamol' },
      { id: '2', name: 'Para-Aminophenol' },
      { id: '3', name: 'Aspirin' },
    ];

    it('should prioritize exact matches', () => {
      const results = sortByRelevance(items, 'Paracetamol', 'name');
      expect(results[0].name).toBe('Paracetamol');
    });

    it('should prioritize starts-with matches', () => {
      const results = sortByRelevance(items, 'Para', 'name');
      expect(results[0].name).toBe('Paracetamol');
      expect(results[1].name).toBe('Para-Aminophenol');
    });

    it('should handle empty query', () => {
      const results = sortByRelevance(items, '', 'name');
      expect(results).toHaveLength(3);
    });
  });

  describe('getSearchSuggestions', () => {
    const items = [
      { id: '1', name: 'Paracetamol' },
      { id: '2', name: 'Aspirin' },
      { id: '3', name: 'Ibuprofen' },
      { id: '4', name: 'Naproxen' },
      { id: '5', name: 'Diclofenac' },
    ];

    it('should return limited suggestions', () => {
      const results = getSearchSuggestions(items, 'para', ['name'], 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should return all items for empty query', () => {
      const results = getSearchSuggestions(items, '', ['name'], 3);
      expect(results).toHaveLength(3);
    });

    it('should filter by query', () => {
      const results = getSearchSuggestions(items, 'para', ['name'], 10);
      expect(results.every(item => item.name.toLowerCase().includes('para'))).toBe(true);
    });
  });

  describe('Language-specific search', () => {
    it('should search Hindi medicine names', () => {
      const medicines = [
        { id: '1', name: 'पैरासिटामोल' },
        { id: '2', name: 'एस्पिरिन' },
      ];
      const results = filterBySearchQuery(medicines, 'पैरा', ['name']);
      expect(results).toHaveLength(1);
    });

    it('should search Bengali medicine names', () => {
      const medicines = [
        { id: '1', name: 'প্যারাসিটামল' },
        { id: '2', name: 'অ্যাসপিরিন' },
      ];
      const results = filterBySearchQuery(medicines, 'প্যারা', ['name']);
      expect(results).toHaveLength(1);
    });

    it('should search Telugu medicine names', () => {
      const medicines = [
        { id: '1', name: 'పారాసిటామోల్' },
        { id: '2', name: 'ఆస్పిరిన్' },
      ];
      const results = filterBySearchQuery(medicines, 'పారా', ['name']);
      expect(results).toHaveLength(1);
    });

    it('should search across mixed language names', () => {
      const patients = [
        { id: '1', name: 'राज कुमार' },
        { id: '2', name: 'রাজ কুমার' },
        { id: '3', name: 'రాజ కుమార్' },
      ];
      const results = filterBySearchQuery(patients, 'राज', ['name']);
      expect(results).toHaveLength(1);
    });
  });
});
