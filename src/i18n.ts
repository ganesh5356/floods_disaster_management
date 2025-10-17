import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';
import translationTA from './locales/ta/translation.json';
import translationTE from './locales/te/translation.json';
import translationKN from './locales/kn/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  hi: {
    translation: translationHI,
  },
  ta: {
    translation: translationTA,
  },
  te: {
    translation: translationTE,
  },
  kn: {
    translation: translationKN,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
