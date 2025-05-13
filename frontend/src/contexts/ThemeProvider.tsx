import React, { useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import {
  ThemeContext,
  updateThemeMode,
  ThemeMode,
  darkTheme,
  lightTheme
} from '../components/styles/theme';

const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [theme, setTheme] = useState(darkTheme);

  useEffect(() => {
    // Load saved preference
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    if (savedMode && (savedMode === 'dark' || savedMode === 'light')) {
      setMode(savedMode);
      setTheme(savedMode === 'dark' ? darkTheme : lightTheme);
      updateThemeMode(savedMode);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);

    // Update global space theme
    setTheme(newMode === 'dark' ? darkTheme : lightTheme);
    updateThemeMode(newMode);

    localStorage.setItem('themeMode', newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;