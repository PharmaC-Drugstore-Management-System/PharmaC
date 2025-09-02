import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export const useLanguage = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'th' : 'en';
    changeLanguage(newLang);
  };

  const isThaiLanguage = () => currentLanguage === 'th';
  const isEnglishLanguage = () => currentLanguage === 'en';

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return {
    t,
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    isThaiLanguage,
    isEnglishLanguage,
    availableLanguages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'th', name: 'ไทย', flag: '🇹🇭' }
    ]
  };
};
