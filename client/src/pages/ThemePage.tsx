import { useEffect } from 'react';
import { Sun, Moon, ChevronLeft, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeProvider';

export default function SettingsToggles() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Helper function to determine if current theme is dark
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/me', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.status === 401 || response.status === 403) {
        navigate('/login');
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      navigate('/login');
    }
  };

  useEffect(() => {
    checkAuth();
    // Theme is managed by ThemeProvider
  }, [theme]);

  return (
    <div className="min-h-screen p-4 transition-colors duration-300"
         style={{backgroundColor: isDark ? '#111827' : '#f3f4f6'}}>
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center p-6">
          <button 
            className="flex items-center justify-center w-12 h-12 rounded-full mr-4 transition-colors duration-200"
            style={{
              backgroundColor: isDark ? '#0d9488' : '#0f766e',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = isDark ? '#0f766e' : '#134e4a';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = isDark ? '#0d9488' : '#0f766e';
            }}
            onClick={() => navigate('/settings')}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h2 className="text-lg font-medium"
                style={{color: isDark ? '#d1d5db' : '#4b5563'}}>
              PharmaC
            </h2>
            <h1 className="text-2xl font-semibold"
                style={{color: isDark ? 'white' : '#111827'}}>
              Page Settings
            </h1>
          </div>
        </div>
        
        <div className="rounded-2xl p-6 max-w-sm mx-auto shadow-lg border transition-colors duration-300"
             style={{
               backgroundColor: isDark ? '#374151' : 'white',
               borderColor: isDark ? '#4b5563' : '#e5e7eb'
             }}>
          
          {/* Language Setting */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-xl"
                  style={{color: isDark ? 'white' : '#111827'}}>
              Language
            </span>
            <div className="flex rounded-full p-0.5"
                 style={{backgroundColor: isDark ? '#4b5563' : '#e5e7eb'}}>
              <button
                onClick={() => changeLanguage('th')}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: i18n.language === 'th' 
                    ? (isDark ? '#14b8a6' : '#14b8a6')
                    : 'transparent',
                  color: i18n.language === 'th' 
                    ? 'white' 
                    : (isDark ? '#d1d5db' : '#4b5563'),
                  boxShadow: i18n.language === 'th' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (i18n.language !== 'th') {
                    const target = e.target as HTMLButtonElement;
                    target.style.color = isDark ? 'white' : '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (i18n.language !== 'th') {
                    const target = e.target as HTMLButtonElement;
                    target.style.color = isDark ? '#d1d5db' : '#4b5563';
                  }
                }}
              >
                TH
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: i18n.language === 'en' 
                    ? (isDark ? '#14b8a6' : '#14b8a6')
                    : 'transparent',
                  color: i18n.language === 'en' 
                    ? 'white' 
                    : (isDark ? '#d1d5db' : '#4b5563'),
                  boxShadow: i18n.language === 'en' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (i18n.language !== 'en') {
                    const target = e.target as HTMLButtonElement;
                    target.style.color = isDark ? 'white' : '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (i18n.language !== 'en') {
                    const target = e.target as HTMLButtonElement;
                    target.style.color = isDark ? '#d1d5db' : '#4b5563';
                  }
                }}
              >
                EN
              </button>
            </div>
          </div>

          {/* Dark Mode Setting */}
          <div className="flex items-center justify-between">
            <span className="text-xl"
                  style={{color: isDark ? 'white' : '#111827'}}>
              Theme
            </span>
            <div className="flex rounded-full p-0.5"
                 style={{backgroundColor: isDark ? '#4b5563' : '#e5e7eb'}}>
              <button
                onClick={() => setTheme('light')}
                className="p-1.5 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: theme === 'light' 
                    ? (isDark ? '#14b8a6' : '#14b8a6')
                    : 'transparent',
                  color: theme === 'light' 
                    ? 'white' 
                    : (isDark ? '#d1d5db' : '#4b5563'),
                  boxShadow: theme === 'light' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (theme !== 'light') {
                    const target = e.target as HTMLButtonElement;
                    target.style.color = isDark ? 'white' : '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (theme !== 'light') {
                    const target = e.target as HTMLButtonElement;
                    target.style.color = isDark ? '#d1d5db' : '#4b5563';
                  }
                }}
              >
                <Sun size={16} />
              </button>
              <button
                onClick={() => setTheme('system')}
                className="p-1.5 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: theme === 'system' 
                    ? (isDark ? '#14b8a6' : '#14b8a6')
                    : 'transparent',
                  color: theme === 'system' 
                    ? 'white' 
                    : (isDark ? '#d1d5db' : '#4b5563'),
                  boxShadow: theme === 'system' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (theme !== 'system') {
                    const target = e.target as HTMLButtonElement;
                    target.style.color = isDark ? 'white' : '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (theme !== 'system') {
                    const target = e.target as HTMLButtonElement;
                    target.style.color = isDark ? '#d1d5db' : '#4b5563';
                  }
                }}
              >
                <Monitor size={16} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className="p-1.5 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: theme === 'dark' 
                    ? (isDark ? '#14b8a6' : '#14b8a6')
                    : 'transparent',
                  color: theme === 'dark' 
                    ? 'white' 
                    : (isDark ? '#d1d5db' : '#4b5563'),
                  boxShadow: theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (theme !== 'dark') {
                    const target = e.target as HTMLButtonElement;
                    target.style.color = isDark ? 'white' : '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (theme !== 'dark') {
                    const target = e.target as HTMLButtonElement;
                    target.style.color = isDark ? '#d1d5db' : '#4b5563';
                  }
                }}
              >
                <Moon size={16} />
              </button>
            </div>
          </div>

          {/* Status Display */}
          <div className="mt-6 p-3 rounded-lg"
               style={{backgroundColor: isDark ? '#4b5563' : '#f9fafb'}}>
            <div className="text-sm text-center"
                 style={{color: isDark ? '#d1d5db' : '#4b5563'}}>
              <p>Language: {i18n.language.toUpperCase()} | Mode: {theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
