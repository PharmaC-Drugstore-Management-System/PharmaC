import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

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
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'pharmaC-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => {
      const stored = localStorage.getItem(storageKey) as Theme;
      console.log('ThemeProvider init - storageKey:', storageKey, 'stored:', stored, 'defaultTheme:', defaultTheme);
      return stored || defaultTheme;
    }
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    console.log('ThemeProvider - Current theme:', theme);
    console.log('HTML element classes before:', root.className);

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      console.log('System theme detected:', systemTheme);
      if (systemTheme === 'dark') {
        root.classList.add('dark');
      }
      return;
    }

    if (theme === 'dark') {
      root.classList.add('dark');
      console.log('Dark mode applied, HTML classes after:', root.className);
    } else {
      console.log('Light mode applied, HTML classes after:', root.className);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
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
