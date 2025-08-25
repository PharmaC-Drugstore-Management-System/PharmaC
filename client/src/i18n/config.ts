import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Header
      "pharmaC": "PharmaC",
      "pageSettings": "Page Settings",
      
      // Settings
      "language": "Language",
      "darkMode": "Dark mode",
      "lightMode": "Light mode",
      "systemMode": "Auto",
      
      // Common
      "save": "Save",
      "cancel": "Cancel",
      "settings": "Settings",
    }
  },
  th: {
    translation: {
      // Header
      "pharmaC": "PharmaC",
      "pageSettings": "การตั้งค่าหน้าเว็บ",
      
      // Settings
      "language": "ภาษา",
      "darkMode": "โหมดมืด",
      "lightMode": "โหมดสว่าง",
      "systemMode": "อัตโนมัติ",
      
      // Common
      "save": "บันทึก",
      "cancel": "ยกเลิก",
      "settings": "การตั้งค่า",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
