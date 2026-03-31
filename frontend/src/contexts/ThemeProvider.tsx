import React, { useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import type { ThemeMode } from '../components/styles/theme';
import { DEFAULT_BRANDING_PACK_ID, resolveBrandingPack } from '../branding/packs';
import { getFrontendSettings } from '../services/frontendSettingsService';
import {
  ThemeContext,
  updateThemeMode,
  darkTheme,
  lightTheme,
  circusTheme,
} from '../components/styles/theme';

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('circus');
  const [theme, setTheme] = useState(circusTheme);
  const [brandingPackId, setBrandingPackId] = useState(DEFAULT_BRANDING_PACK_ID);

  useEffect(() => {
    let isMounted = true;

    const initializeTheme = async () => {
      let resolvedPackId = DEFAULT_BRANDING_PACK_ID;

      try {
        const frontendSettings = await getFrontendSettings();
        if (frontendSettings.branding_pack) {
          resolvedPackId = frontendSettings.branding_pack;
        }
      } catch {
        // Keep defaults when backend settings are not available
      }

      if (!isMounted) {
        return;
      }

      setBrandingPackId(resolvedPackId);

      const brandingPack = resolveBrandingPack(resolvedPackId);
      const savedMode = localStorage.getItem('themeMode') as ThemeMode | null;
      const selectedMode: ThemeMode =
        savedMode && (savedMode === 'dark' || savedMode === 'light' || savedMode === 'circus')
          ? savedMode
          : brandingPack.defaultThemeMode;

      setMode(selectedMode);
      const selectedTheme =
        selectedMode === 'circus' ? circusTheme : selectedMode === 'dark' ? darkTheme : lightTheme;
      setTheme(selectedTheme);
      updateThemeMode(selectedMode);
    };

    void initializeTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = () => {
    // Cycle through: circus -> dark -> light -> circus
    const newMode: ThemeMode = mode === 'circus' ? 'dark' : mode === 'dark' ? 'light' : 'circus';
    setMode(newMode);

    // Update theme
    const selectedTheme =
      newMode === 'circus' ? circusTheme : newMode === 'dark' ? darkTheme : lightTheme;
    setTheme(selectedTheme);
    updateThemeMode(newMode);

    localStorage.setItem('themeMode', newMode);
  };

  useEffect(() => {
    const rootStyle = document.documentElement.style;
    const brandingPack = resolveBrandingPack(brandingPackId);

    rootStyle.setProperty('--ww-font-display', brandingPack.typography.display);
    rootStyle.setProperty('--ww-font-heading', brandingPack.typography.heading);
    rootStyle.setProperty('--ww-font-body', brandingPack.typography.body);
    rootStyle.setProperty('--ww-color-panel-border', brandingPack.colors.panelBorder);
    rootStyle.setProperty('--ww-color-ribbon-text', brandingPack.colors.ribbonText);
    rootStyle.setProperty('--ww-color-ribbon-bg', brandingPack.colors.ribbonBackground);
    rootStyle.setProperty('--ww-color-hero-text', brandingPack.colors.heroText);
  }, [brandingPackId]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, brandingPackId, setBrandingPackId }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
