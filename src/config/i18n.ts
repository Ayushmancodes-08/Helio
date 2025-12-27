// Supported locales
export const locales = ['hi-IN', 'en-IN', 'bn-IN', 'te-IN'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'en-IN';

// Language metadata
export const languageMetadata: Record<Locale, {
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  fontFamily: string;
  scriptName: string;
}> = {
  'hi-IN': {
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
    direction: 'ltr',
    fontFamily: 'Noto Sans Devanagari',
    scriptName: 'Devanagari',
  },
  'en-IN': {
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    direction: 'ltr',
    fontFamily: 'PT Sans',
    scriptName: 'Latin',
  },
  'bn-IN': {
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    direction: 'ltr',
    fontFamily: 'Noto Sans Bengali',
    scriptName: 'Bengali',
  },
  'te-IN': {
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    direction: 'ltr',
    fontFamily: 'Noto Sans Telugu',
    scriptName: 'Telugu',
  },
};
