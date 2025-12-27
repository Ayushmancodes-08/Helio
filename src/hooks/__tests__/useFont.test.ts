import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFont } from '../useFont';

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: vi.fn(),
}));

import { useLocale } from 'next-intl';

describe('useFont Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return font config for Hindi locale', () => {
    (useLocale as any).mockReturnValue('hi-IN');

    const result = useFont();

    expect(result.locale).toBe('hi-IN');
    expect(result.fontName).toBe('Noto Sans Devanagari');
    expect(result.scriptName).toBe('Devanagari');
    expect(result.fontFamily).toContain('Noto Sans Devanagari');
  });

  it('should return font config for English locale', () => {
    (useLocale as any).mockReturnValue('en-IN');

    const result = useFont();

    expect(result.locale).toBe('en-IN');
    expect(result.fontName).toBe('PT Sans');
    expect(result.scriptName).toBe('Latin');
    expect(result.fontFamily).toContain('PT Sans');
  });

  it('should return font config for Bengali locale', () => {
    (useLocale as any).mockReturnValue('bn-IN');

    const result = useFont();

    expect(result.locale).toBe('bn-IN');
    expect(result.fontName).toBe('Noto Sans Bengali');
    expect(result.scriptName).toBe('Bengali');
    expect(result.fontFamily).toContain('Noto Sans Bengali');
  });

  it('should return font config for Telugu locale', () => {
    (useLocale as any).mockReturnValue('te-IN');

    const result = useFont();

    expect(result.locale).toBe('te-IN');
    expect(result.fontName).toBe('Noto Sans Telugu');
    expect(result.scriptName).toBe('Telugu');
    expect(result.fontFamily).toContain('Noto Sans Telugu');
  });

  it('should include font family with fallbacks', () => {
    (useLocale as any).mockReturnValue('hi-IN');

    const result = useFont();

    expect(result.fontFamily).toContain('Noto Sans Devanagari');
    expect(result.fontFamily).toContain('PT Sans');
    expect(result.fontFamily).toContain('sans-serif');
  });

  it('should have description property', () => {
    (useLocale as any).mockReturnValue('hi-IN');

    const result = useFont();

    expect(result.description).toBeDefined();
    expect(typeof result.description).toBe('string');
    expect(result.description.length).toBeGreaterThan(0);
  });

  it('should have fontConfig property with all required fields', () => {
    (useLocale as any).mockReturnValue('bn-IN');

    const result = useFont();

    expect(result.fontConfig).toHaveProperty('locale');
    expect(result.fontConfig).toHaveProperty('fontFamily');
    expect(result.fontConfig).toHaveProperty('fallbackFonts');
    expect(result.fontConfig).toHaveProperty('scriptName');
    expect(result.fontConfig).toHaveProperty('description');
  });

  it('should return consistent results for same locale', () => {
    (useLocale as any).mockReturnValue('te-IN');

    const result1 = useFont();
    const result2 = useFont();

    expect(result1.locale).toBe(result2.locale);
    expect(result1.fontName).toBe(result2.fontName);
    expect(result1.scriptName).toBe(result2.scriptName);
  });
});
