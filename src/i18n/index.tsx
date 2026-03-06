import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import { I18nManager } from 'react-native';

// Import translation files
import en from './locales/en.json';
import ar from './locales/ar.json';
import tr from './locales/tr.json';
import fr from './locales/fr.json';

// Dynamically determine available languages from imported locale files
const availableLocales: Record<string, any> = { en, ar, tr, fr };
const SUPPORTED_LANGUAGES = Object.keys(availableLocales);

// RTL languages configuration
const RTL_LANGUAGES = ['ar'];

// Export supported languages and RTL configuration for use in other parts of the app
export { SUPPORTED_LANGUAGES, availableLocales, RTL_LANGUAGES };

// Function to check if a language is RTL
export const isRTL = (language: string): boolean => {
  return RTL_LANGUAGES.includes(language);
};

// Function to get the appropriate initial language
const getInitialLanguage = (): string => {
  try {
    // Get device locales using react-native-localize
    const deviceLocales = getLocales();
    const deviceLanguage = deviceLocales[0]?.languageCode;

    // console.log('Device locales:', deviceLocales);
    // console.log('Device primary language:', deviceLanguage);
    // console.log('Supported app languages:', SUPPORTED_LANGUAGES);

    // Check if device language is supported
    if (deviceLanguage && SUPPORTED_LANGUAGES.includes(deviceLanguage)) {
      // console.log('Using device language (supported):', deviceLanguage);
      return deviceLanguage;
    } else {
      // console.log(
      //   'Device language not supported, using English fallback. Device language was:',
      //   deviceLanguage,
      // );
      return 'en'; // Fallback to English if device language is not supported
    }
  } catch (error) {
    console.error('Error detecting device language:', error);
    return 'en'; // Fallback to English on error
  }
};

// Function to update RTL layout
const updateRTLLayout = (language: string) => {
  const shouldBeRTL = isRTL(language);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    // console.log(`RTL layout updated: ${shouldBeRTL} for language: ${language}`);
  }
};

// Determine initial language based on system language
const initialLanguage = getInitialLanguage();

// Set up RTL for initial language
updateRTLLayout(initialLanguage);

// console.log('i18n initialized with language:', initialLanguage);
// console.log('Available languages:', SUPPORTED_LANGUAGES);
// console.log('RTL enabled:', I18nManager.isRTL);

// Build resources object dynamically from available locales
const resources = Object.keys(availableLocales).reduce((acc, lang) => {
  acc[lang] = { translation: availableLocales[lang] };
  return acc;
}, {} as Record<string, { translation: any }>);

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage, // Use supported device language or fallback to English
  fallbackLng: 'en', // Fallback to English if device language is not supported

  interpolation: {
    escapeValue: false, // React already does escaping
  },

  react: {
    useSuspense: false,
  },

  // Debug mode for development
  debug: __DEV__,
});

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
