// hooks/useTheme.js
import { useState, useEffect, createContext, useContext } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  DEFAULT: 'default',    // Il tema colorato originale
  LIGHT: 'light',       // Tema bianco
  DARK: 'dark'          // Tema nero
};

const THEME_ORDER = [THEMES.DEFAULT, THEMES.LIGHT, THEMES.DARK];

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Carica il tema salvato o usa quello di default
    return localStorage.getItem('app-theme') || THEMES.DEFAULT;
  });

  // Salva il tema nel localStorage quando cambia
  useEffect(() => {
    localStorage.setItem('app-theme', currentTheme);
    // Applica la classe del tema al documento
    document.documentElement.className = `theme-${currentTheme}`;
  }, [currentTheme]);

  // Funzione per ciclare tra i temi
  const toggleTheme = () => {
    const currentIndex = THEME_ORDER.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % THEME_ORDER.length;
    setCurrentTheme(THEME_ORDER[nextIndex]);
  };

  // Funzione per impostare un tema specifico
  const setTheme = (theme) => {
    if (THEME_ORDER.includes(theme)) {
      setCurrentTheme(theme);
    }
  };

  const value = {
    currentTheme,
    toggleTheme,
    setTheme,
    isDefault: currentTheme === THEMES.DEFAULT,
    isLight: currentTheme === THEMES.LIGHT,
    isDark: currentTheme === THEMES.DARK
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};