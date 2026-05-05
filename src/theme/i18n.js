import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './en';
import es from './es';

const languageTag = Localization.getLocales()[0]?.languageTag ?? 'es';
const languageCode = languageTag.startsWith('es') ? 'es' : 'en';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: languageCode,
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
  });

export default i18n;
