import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'pharmaC-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => {
      const stored = localStorage.getItem(storageKey) as Theme;
      return (stored === 'dark' || stored === 'light') ? stored : defaultTheme;
    }
  );

  // Apply theme immediately on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(newTheme);
    body.classList.add(newTheme);
    
    // Force immediate reflow
    root.offsetHeight;
    body.offsetHeight;
  };

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      // Apply theme immediately before state update
      applyTheme(newTheme);
      
      // Update localStorage
      localStorage.setItem(storageKey, newTheme);
      
      // Update state
      setTheme(newTheme);
      
      // Force another reflow to ensure update
      setTimeout(() => {
        applyTheme(newTheme);
      }, 0);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
