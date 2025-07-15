import React, { useState } from 'react';
import { Sun, Moon, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsToggles() {
  const [language, setLanguage] = useState('EN');
  const [darkMode, setDarkMode] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'TH' : 'EN');
  };
 const navigate = useNavigate();
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
 <div className="min-h-screen bg-white p-4">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center p-6 ">
          <button className="flex items-center justify-center w-12 h-12 bg-teal-600 rounded-full mr-4"   onClick={() => navigate('/settings')}>
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h2 className="text-lg font-medium text-gray-900">PhamarC</h2>
            <h1 className="text-2xl font-semibold text-gray-900">Page Settings</h1>
          </div>
        </div>
      <div className="bg-white rounded-2xl p-6 max-w-sm mx-auto shadow-sm">
        
        {/* Language Setting */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-gray-900 text-base text-xl ">Language</span>
          <div className="flex bg-gray-200 rounded-full p-0.5">
            <button
              onClick={toggleLanguage}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                language === 'TH' 
                  ? 'bg-teal-400 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              TH
            </button>
            <button
              onClick={toggleLanguage}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                language === 'EN' 
                  ? 'bg-teal-400 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Dark Mode Setting */}
        <div className="flex items-center justify-between">
          <span className="text-gray-900 text-base text-xl ">Dark mode</span>
          <div className="flex bg-gray-200 rounded-full p-0.5">
            <button
              onClick={toggleDarkMode}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                !darkMode 
                  ? 'bg-teal-400 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Sun size={16} />
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                darkMode 
                  ? 'bg-teal-400 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Moon size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
  );
}