import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import { I18nManager } from 'react-native';

// Dynamically determine available languages from imported locale files
const SUPPORTED_LANGUAGES = ['en', 'ar', 'tr', 'fr'];

// RTL languages configuration
const RTL_LANGUAGES = ['ar'];

// Lazy-loaded locale data — only loaded when initI18n() is called
let availableLocales: Record<string, any> | null = null;

function loadLocales(): Record<string, any> {
  if (!availableLocales) {
    availableLocales = {
      en: require('./locales/en.json'),
      ar: require('./locales/ar.json'),
      tr: require('./locales/tr.json'),
      fr: require('./locales/fr.json'),
    };
  }
  return availableLocales;
}

// Export supported languages and RTL configuration for use in other parts of the app
export { SUPPORTED_LANGUAGES, RTL_LANGUAGES };
export { availableLocales };

// Function to check if a language is RTL
export const isRTL = (language: string): boolean => {
  return RTL_LANGUAGES.includes(language);
};

// Function to get the appropriate initial language
const getInitialLanguage = (): string => {
  try {
    const deviceLocales = getLocales();
    const deviceLanguage = deviceLocales[0]?.languageCode;

    if (deviceLanguage && SUPPORTED_LANGUAGES.includes(deviceLanguage)) {
      return deviceLanguage;
    } else {
      return 'en';
    }
  } catch (error) {
    console.error('Error detecting device language:', error);
    return 'en';
  }
};

// Function to update RTL layout
const updateRTLLayout = (language: string) => {
  const shouldBeRTL = isRTL(language);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }
};

/**
 * Lazy i18n initialization — call this once before rendering.
 * Avoids blocking bundle eval with getLocales(), RTL setup, and JSON parsing.
 */
let _i18nInitialized = false;

export function initI18n(): void {
  if (_i18nInitialized) return;
  _i18nInitialized = true;

  const initialLanguage = getInitialLanguage();
  updateRTLLayout(initialLanguage);

  const locales = loadLocales();
  const resources = Object.keys(locales).reduce((acc, lang) => {
    acc[lang] = { translation: locales[lang] };
    return acc;
  }, {} as Record<string, { translation: any }>);

  i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    debug: false, // i18next debug logging is extremely verbose — disable even in dev
  });
}

// Language change handler
export const changeLanguage = (language: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (SUPPORTED_LANGUAGES.includes(language)) {
      // Update RTL layout before changing language
      updateRTLLayout(language);
      
      i18n.changeLanguage(language).then((t) => {
        // console.log(`Language changed to: ${language}`);
        // console.log(`RTL is now: ${I18nManager.isRTL}`);
        resolve(t);
      }).catch((error) => {
        console.error('Error changing language:', error);
        reject(error);
      });
    } else {
      const error = new Error(`Unsupported language: ${language}`);
      console.error(error.message);
      reject(error);
    }
  });
};

// Function to handle language changes from system settings
export const handleSystemLanguageChange = () => {
  const newLanguage = getInitialLanguage();
  const currentLanguage = i18n.language;
  
  if (newLanguage !== currentLanguage) {
    // console.log(`System language changed from ${currentLanguage} to ${newLanguage}`);
    changeLanguage(newLanguage);
  }
};

export default i18n;
