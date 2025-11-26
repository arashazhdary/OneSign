import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import faTranslations from './locales/fa.json';

// Initialize i18n with error handling
try {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          translation: enTranslations,
        },
        fa: {
          translation: faTranslations,
        },
      },
      fallbackLng: 'en',
      debug: import.meta.env.DEV,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      react: {
        useSuspense: false, // Disable suspense to prevent white screen
      },
    })
    .catch((error) => {
      console.error('Failed to initialize i18n:', error);
    });
} catch (error) {
  console.error('Error setting up i18n:', error);
}

export default i18n;
