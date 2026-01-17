import React, { useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import type {
  ThemeMode} from '../components/styles/theme';
import {
  ThemeContext,
  updateThemeMode,
  darkTheme,
  lightTheme,
  circusTheme
} from '../components/styles/theme';

const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('circus');  // Default to circus theme
  const [theme, setTheme] = useState(circusTheme);

  useEffect(() => {
    // Load saved preference
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    if (savedMode && (savedMode === 'dark' || savedMode === 'light' || savedMode === 'circus')) {
      setMode(savedMode);
      const selectedTheme = savedMode === 'circus' ? circusTheme : (savedMode === 'dark' ? darkTheme : lightTheme);
      setTheme(selectedTheme);
      updateThemeMode(savedMode);
    }
  }, []);

  const toggleTheme = () => {
    // Cycle through: circus -> dark -> light -> circus
    const newMode: ThemeMode = mode === 'circus' ? 'dark' : (mode === 'dark' ? 'light' : 'circus');
    setMode(newMode);

    // Update theme
    const selectedTheme = newMode === 'circus' ? circusTheme : (newMode === 'dark' ? darkTheme : lightTheme);
    setTheme(selectedTheme);
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