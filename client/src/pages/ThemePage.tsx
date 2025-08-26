import { useEffect, useState } from 'react';
import { Sun, Moon, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SettingsToggles() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    
    // Apply immediately to document
    if (newMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

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
    
    // Apply dark mode on load
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
  }, [darkMode]);

    const checkme = async () => {
      try {
        const authme = await fetch('http://localhost:5000/api/me', {
          method: 'GET',
          credentials: 'include'
        })
        const data = await authme.json();
        if (authme.status === 401 || authme.status === 403) {
          navigate('/login');
          return;
        }
  
        console.log('Authme data:', data);
      } catch (error) {
        console.log('Error', error)
  
      }
    }
  
  
    useEffect(() => {
      checkme()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center p-6">
          <button 
            className="flex items-center justify-center w-12 h-12 bg-teal-600 rounded-full mr-4 hover:bg-teal-700 transition-colors duration-200"   
            onClick={() => navigate('/settings')}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300">PharmaC</h2>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Page Settings</h1>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm mx-auto shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          
          {/* Language Setting */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-gray-900 dark:text-white text-xl">Language</span>
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-full p-0.5">
              <button
                onClick={() => changeLanguage('th')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  i18n.language === 'th' 
                    ? 'bg-teal-400 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                TH
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  i18n.language === 'en' 
                    ? 'bg-teal-400 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Dark Mode Setting */}
          <div className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white text-xl">Dark mode</span>
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-full p-0.5">
              <button
                onClick={toggleDarkMode}
                className={`p-1.5 rounded-full transition-all duration-200 ${
                  !darkMode 
                    ? 'bg-teal-400 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                <Sun size={16} />
              </button>
              <button
                onClick={toggleDarkMode}
                className={`p-1.5 rounded-full transition-all duration-200 ${
                  darkMode 
                    ? 'bg-teal-400 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                <Moon size={16} />
              </button>
            </div>
          </div>

          {/* Status Display */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
              <p>Language: {i18n.language.toUpperCase()} | Mode: {darkMode ? 'Dark' : 'Light'}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}