'use client';

import { getAllFontConfigs } from '@/lib/font-config';
import { languageMetadata } from '@/config/i18n';

/**
 * FontShowcase Component
 * Displays text samples in each language to verify proper font rendering
 * Used for testing and verification of language-specific fonts
 */
export function FontShowcase() {
  const fontConfigs = getAllFontConfigs();

  const sampleTexts: Record<string, string> = {
    'hi-IN': 'नमस्ते! यह हिंदी पाठ है। Noto Sans Devanagari फ़ॉन्ट का उपयोग किया जा रहा है।',
    'en-IN': 'Hello! This is English text. PT Sans font is being used.',
    'bn-IN': 'নমস্কার! এটি বাংলা পাঠ। Noto Sans Bengali ফন্ট ব্যবহার করা হচ্ছে।',
    'te-IN': 'హలో! ఇది తెలుగు పాఠం. Noto Sans Telugu ఫాంట్ ఉపయోగించబడుతోంది.',
  };

  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Font Rendering Showcase</h2>
        <p className="text-gray-600">
          Verify that each language is rendered with its appropriate font
        </p>
      </div>

      <div className="grid gap-6">
        {fontConfigs.map((config) => {
          const metadata = languageMetadata[config.locale];
          const sampleText = sampleTexts[config.locale];

          return (
            <div
              key={config.locale}
              className="border rounded-lg p-6 bg-white shadow-sm"
            >
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{metadata.flag}</span>
                  <div>
                    <h3 className="font-bold text-lg">{metadata.name}</h3>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    <strong>Font Family:</strong> {config.fontFamily}
                  </p>
                  <p>
                    <strong>Script:</strong> {config.scriptName}
                  </p>
                  <p>
                    <strong>Locale:</strong> {config.locale}
                  </p>
                </div>
              </div>

              <div
                className="p-4 bg-gray-50 rounded border border-gray-200"
                style={{
                  fontFamily: `'${config.fontFamily}', 'PT Sans', sans-serif`,
                  fontSize: '16px',
                  lineHeight: '1.6',
                }}
              >
                {sampleText}
              </div>

              <div className="mt-3 text-xs text-gray-500">
                <p>
                  <strong>CSS:</strong> font-family: '{config.fontFamily}',
                  'PT Sans', sans-serif;
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold mb-2">Font Loading Information</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>
            • <strong>Hindi (हिंदी):</strong> Uses Noto Sans Devanagari for
            proper Devanagari script rendering
          </li>
          <li>
            • <strong>English:</strong> Uses PT Sans as the primary font
          </li>
          <li>
            • <strong>Bengali (বাংলা):</strong> Uses Noto Sans Bengali for
            proper Bengali script rendering
          </li>
          <li>
            • <strong>Telugu (తెలుగు):</strong> Uses Noto Sans Telugu for
            proper Telugu script rendering
          </li>
          <li>
            • All fonts are loaded from Google Fonts with proper fallbacks
          </li>
          <li>
            • Font selection is automatic based on the current language
            (html[lang] attribute)
          </li>
        </ul>
      </div>
    </div>
  );
}
