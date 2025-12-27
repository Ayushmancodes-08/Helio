import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './i18n';
import fs from 'fs';
import path from 'path';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Validate that the incoming locale is valid
  // If locale is undefined or not in our list, fallback to default
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  // Now we have a valid locale string
  const validLocale = locale as Locale;

  try {
    // Load all translation namespaces for this locale
    const namespaces = ['common', 'auth', 'dashboard', 'appointments', 'medical', 'errors', 'homepage', 'notifications', 'patient', 'doctor', 'pharmacist', 'healthOfficial', 'dataEntryOperator', 'profile'];
    const messages: Record<string, any> = {};

    for (const namespace of namespaces) {
      try {
        // Use fs to read the file directly

        const filePath = path.join(process.cwd(), 'public', 'locales', validLocale, `${namespace}.json`);

        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(fileContent);
          messages[namespace] = data;
        } else {
          console.warn(`Translation file not found: ${filePath}`);
          messages[namespace] = {};
        }

      } catch (error) {
        console.warn(`Failed to load ${namespace} for ${validLocale}:`, error);
        messages[namespace] = {};
      }
    }

    return { messages, locale: validLocale };
  } catch (error) {
    console.error(`Failed to load messages for locale ${validLocale}:`, error);
    return {
      messages: {},
      locale: validLocale,
    };
  }
});
