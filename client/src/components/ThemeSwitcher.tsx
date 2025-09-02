import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeProvider';
import { useEffect, useState } from 'react';

interface ThemeSwitcherProps {
  showText?: boolean;
  className?: string;
}

export default function ThemeSwitcher({ showText = false, className = '' }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(theme === 'dark');

  // Real-time theme change detection
  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  // Real-time DOM class monitoring for immediate visual updates
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const htmlElement = document.documentElement;
      const hasDarkClass = htmlElement.classList.contains('dark');
      setIsDark(hasDarkClass);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Force reload page for immediate visual update
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const CurrentIcon = isDark ? Moon : Sun;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleThemeToggle}
        className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 group"
        title={`Current: ${isDark ? 'Dark' : 'Light'} mode - Click to switch`}
      >
        {/* Sliding Toggle Container - ใช้ Tailwind classes */}
        <div className={`relative w-10 h-6 rounded-full transition-all duration-300 ${
          isDark ? 'bg-gray-600' : 'bg-gray-300'
        }`}>
          {/* Sliding Button - ใช้ Tailwind classes */}
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 transform text-white ${
              isDark ? 'bg-teal-500 translate-x-4' : 'bg-blue-500 translate-x-0'
            }`}
          >
            <CurrentIcon size={12} />
          </div>
        </div>

        {showText && (
          <span className="text-sm font-medium transition-colors duration-300 text-gray-600 dark:text-gray-300">
            {isDark ? 'Dark' : 'Light'}
          </span>
        )}
      </button>

      {/* Theme Status Indicator - ใช้ Tailwind classes */}
      <div className="absolute -bottom-1 -right-1">
        <div 
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isDark ? 'bg-indigo-500' : 'bg-emerald-500'
          }`}
          title={isDark ? 'Dark mode' : 'Light mode'}
        />
      </div>
    </div>
  );
}
