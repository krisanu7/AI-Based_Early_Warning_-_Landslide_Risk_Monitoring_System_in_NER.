import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('swasthya_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // Default to clean Light mode
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('swasthya_theme', theme);
  }, [theme]);

  const setLight = () => {
    setTheme('light');
  };

  const setDark = () => {
    setTheme('dark');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', setLight, setDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: 'light',
      isDark: false,
      setLight: () => {},
      setDark: () => {},
      toggleTheme: () => {}
    };
  }
  return ctx;
};
