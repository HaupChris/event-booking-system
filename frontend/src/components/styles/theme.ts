import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';
import { createContext, useContext } from 'react';
import { circusTheme as importedCircusTheme, circusPalette } from './circusTheme';
import { getComponentOverrides } from './spaceThemeOverrides';

// Re-export circusTheme
export const circusTheme = importedCircusTheme;

// Theme context
export type ThemeMode = 'dark' | 'light' | 'circus';

export interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleTheme: () => {},
});

// Hook to get current theme
export const useThemeMode = () => useContext(ThemeContext);

// Dark theme palette
const darkPalette = {
  primary: {
    main: '#64b5f6',
    light: '#bbdefb',
    dark: '#1e88e5',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ffffff',
    dark: '#e0e0e0',
  },
  background: {
    default: '#0d0d0d',
    paper: '#1a1a1a',
    card: 'radial-gradient(circle at bottom left, #061429 0%, #071f3b 100%)',
  },
  text: {
    primary: '#ffffff',
    secondary: alpha('#ffffff', 0.8),
    muted: alpha('#ffffff', 0.6),
  },
  status: {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
  },
};

// Light theme palette
const lightPalette = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#0d47a1',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#212121',
    dark: '#424242',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
    card: 'radial-gradient(circle at bottom left, #e3f2fd 0%, #bbdefb 100%)',
  },
  text: {
    primary: '#212121',
    secondary: alpha('#212121', 0.8),
    muted: alpha('#212121', 0.6),
  },
  status: {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
  },
};

// Shared typography configuration
const sharedTypography = {
  fontFamily: 'DSEG7Classic, monospace',
  h4: {
    fontWeight: 500,
    letterSpacing: '0.03em',
  },
  h5: {
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  h6: {
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  body1: {
    letterSpacing: '0.03em',
  },
  body2: {
    letterSpacing: '0.02em',
  },
};

// Create dark theme
export const darkTheme = createTheme({
  spacing: 8,
  palette: {
    mode: 'dark',
    primary: darkPalette.primary,
    secondary: {
      main: darkPalette.secondary.main,
    },
    background: {
      default: darkPalette.background.default,
      paper: darkPalette.background.paper,
    },
    text: {
      primary: darkPalette.text.primary,
      secondary: darkPalette.text.secondary,
    },
  },
  typography: sharedTypography,
  components: getComponentOverrides(darkPalette, 'dark'),
});

// Create light theme
export const lightTheme = createTheme({
  spacing: 8,
  palette: {
    mode: 'light',
    primary: lightPalette.primary,
    secondary: {
      main: lightPalette.secondary.main,
    },
    background: {
      default: lightPalette.background.default,
      paper: lightPalette.background.paper,
    },
    text: {
      primary: lightPalette.text.primary,
      secondary: lightPalette.text.secondary,
    },
  },
  typography: sharedTypography,
  components: getComponentOverrides(lightPalette, 'light'),
});

// Export spacePalette for direct use (defaults to dark, can be space or circus)
export let spacePalette = darkPalette;

// Export mixins with accessor function to ensure they use current palette
export const getMixins = (mode: ThemeMode) => {
  const palette = mode === 'circus' ? circusPalette : mode === 'dark' ? darkPalette : lightPalette;

  return {
    spacePanel: {
      background: palette.background.card,
      boxShadow: mode === 'dark' ? '0 5px 20px rgba(0,0,0,0.5)' : '0 5px 20px rgba(0,0,0,0.1)',
      border: `1px solid ${alpha(palette.primary.main, 0.2)}`,
      borderRadius: '14px',
      overflow: 'hidden',
      position: 'relative',
    },
    headerGradient: {
      width: '100%',
      height: '6px',
      background: `linear-gradient(90deg, ${palette.primary.dark}, ${palette.primary.main}, ${palette.primary.light}, ${palette.primary.dark})`,
      backgroundSize: '300% 100%',
      animation: 'gradientMove 12s linear infinite',
    },
    missionBriefing: {
      py: 1.5,
      px: 2,
      backgroundColor: mode === 'dark' ? alpha('#000', 0.3) : alpha('#f5f5f5', 0.8),
      borderLeft: '4px solid',
      borderColor: palette.primary.dark,
      mx: { xs: 1, sm: 2 },
      my: 2,
      borderRadius: '0 8px 8px 0',
    },
    footerBar: {
      p: 1.5,
      backgroundColor: mode === 'dark' ? '#041327' : '#e3f2fd',
      borderTop: '1px solid',
      borderColor: alpha(palette.primary.main, 0.2),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  };
};

// Adjust spacePalette globally based on mode
export const updateThemeMode = (mode: ThemeMode) => {
  spacePalette = mode === 'circus' ? circusPalette : mode === 'dark' ? darkPalette : lightPalette;
  return { spacePalette };
};
