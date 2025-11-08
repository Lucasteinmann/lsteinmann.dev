'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTheme, TerminalTheme } from './themes';

interface ThemeContextType {
  theme: TerminalTheme;
  themeName: string;
  setThemeName: (name: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeNameState] = useState<string>('github');
  const [theme, setTheme] = useState<TerminalTheme>(getTheme('github'));

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('terminal-theme');
      if (saved) {
        setThemeNameState(saved);
        setTheme(getTheme(saved));
      }
    }
  }, []);

  const setThemeName = (name: string) => {
    setThemeNameState(name);
    setTheme(getTheme(name));
    if (typeof window !== 'undefined') {
      localStorage.setItem('terminal-theme', name);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
