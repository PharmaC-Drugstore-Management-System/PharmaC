import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface LanguageSwitcherProps {
  showText?: boolean;
  className?: string;
}

export default function LanguageSwitcher({ showText = true, className = '' }: LanguageSwitcherProps) {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLangData = availableLanguages.find(lang => lang.code === currentLanguage);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 group"
        style={{
          backgroundColor: document.documentElement.classList.contains('dark') ? 'transparent' : 'transparent',
          color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
        }}
        title={`Current language: ${currentLangData?.name} - Click to change`}
      >
        <div className="relative">
          <div className='flex flex-row items-center justify-center w-16 h-6 space-x-2'>
          <Globe size={24} color="white" className="transition-transform group-hover:rotate-12 bg-black rounded-full" />
          {/* Language indicator badge */}
          <div className="text-md font-bold">
            {currentLanguage.toUpperCase()}
          </div>
          </div>
        </div>
        {showText && (
          <>
            <span className="text-sm font-medium transition-all duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {currentLangData?.flag} {currentLangData?.name}
            </span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} group-hover:text-blue-600 dark:group-hover:text-blue-400`} />
          </>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50"
            style={{
              backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
              borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
            }}
          >
            <div className="py-1">
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    changeLanguage(language.code);
                    setIsOpen(false);
                    
                    // Force reload page for immediate language update
                    setTimeout(() => {
                      window.location.reload();
                    }, 100);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-105 group ${
                    currentLanguage === language.code ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                  style={{
                    color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                  }}
                >
                  <span className="text-lg transition-transform group-hover:scale-110">{language.flag}</span>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{language.name}</span>
                    <span className="text-xs opacity-70 group-hover:opacity-100">{language.code.toUpperCase()}</span>
                  </div>
                  {currentLanguage === language.code && (
                    <span className="ml-auto">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
