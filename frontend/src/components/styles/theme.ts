import { createTheme, Theme, Components } from '@mui/material/styles';
import { alpha } from '@mui/material';
import { createContext, useContext } from 'react';

// Theme context
export type ThemeMode = 'dark' | 'light';

export interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleTheme: () => {}
});

// Hook to get current theme
export const useThemeMode = () => useContext(ThemeContext);

// Dark theme palette
const darkPalette = {
  primary: {
    main: '#64b5f6',
    light: '#bbdefb',
    dark: '#1e88e5',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#ffffff',
    dark: '#e0e0e0'
  },
  background: {
    default: '#0d0d0d',
    paper: '#1a1a1a',
    card: 'radial-gradient(circle at bottom left, #061429 0%, #071f3b 100%)'
  },
  text: {
    primary: '#ffffff',
    secondary: alpha('#ffffff', 0.8),
    muted: alpha('#ffffff', 0.6)
  },
  status: {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3'
  }
};

// Light theme palette
const lightPalette = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#0d47a1',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#212121',
    dark: '#424242'
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
    card: 'radial-gradient(circle at bottom left, #e3f2fd 0%, #bbdefb 100%)'
  },
  text: {
    primary: '#212121',
    secondary: alpha('#212121', 0.8),
    muted: alpha('#212121', 0.6)
  },
  status: {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3'
  }
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

// Component overrides factory function
const getComponentOverrides = (palette: typeof darkPalette, mode: 'dark' | 'light'): Components<Omit<Theme, 'components'>> => {
  const isDark = mode === 'dark';
  const boxShadowStrength = isDark ? '0.5' : '0.1';
  const buttonBg = isDark
    ? 'linear-gradient(145deg, #222222, #1a1a1a)'
    : 'linear-gradient(145deg, #f5f5f5, #e0e0e0)';
  const buttonHoverBg = isDark
    ? 'linear-gradient(145deg, #2a2a2a, #1f1f1f)'
    : 'linear-gradient(145deg, #ffffff, #f0f0f0)';
  const buttonBoxShadow = isDark
    ? 'inset 1px 1px 2px #111, inset -1px -1px 2px #333'
    : 'inset 1px 1px 2px #fff, inset -1px -1px 2px #ccc';
  const inputBg = isDark
    ? 'linear-gradient(145deg, #2a2a2a, #1f1f1f)'
    : 'linear-gradient(145deg, #ffffff, #f0f0f0)';

  return {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          textTransform: 'none',
          padding: '8px 16px',
          border: `1px solid ${palette.primary.main}`,
          background: buttonBg,
          boxShadow: buttonBoxShadow,
          color: palette.primary.main,
          '&:hover': {
            boxShadow: `0 0 6px ${palette.primary.main}`,
            background: buttonHoverBg,
          },
        },
        contained: {
          background: `linear-gradient(45deg, ${palette.primary.dark}, ${palette.primary.main})`,
          color: palette.text.primary,
          '&:hover': {
            background: `linear-gradient(45deg, ${palette.primary.main}, ${palette.primary.light})`,
          }
        }
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          background: inputBg,
          boxShadow: buttonBoxShadow,
          '& fieldset': {
            borderColor: alpha(palette.primary.main, 0.3),
          },
          '&:hover fieldset': {
            borderColor: alpha(palette.primary.main, 0.5),
          },
          '&.Mui-focused fieldset': {
            borderColor: palette.primary.main,
            boxShadow: `0 0 6px ${palette.primary.main}`,
          },
        },
        input: {
          color: palette.text.primary,
          caretColor: palette.primary.main,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: palette.background.card,
          boxShadow: `0 5px 20px rgba(0,0,0,${boxShadowStrength})`,
          border: `1px solid ${alpha(palette.primary.main, 0.2)}`,
          borderRadius: '14px',
          overflow: 'hidden',
          position: 'relative',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 16,
          paddingBottom: 16
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation2: {
          background: palette.background.card,
          boxShadow: `0 5px 20px rgba(0,0,0,${boxShadowStrength})`,
          border: `1px solid ${alpha(palette.primary.main, 0.2)}`,
          borderRadius: '14px',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: alpha(palette.background.paper, isDark ? 0.7 : 0.9),
        },
        elevation3: {
          background: palette.background.card,
          boxShadow: `0 5px 20px rgba(0,0,0,${boxShadowStrength})`,
          border: `1px solid ${alpha(palette.primary.main, 0.2)}`,
          borderRadius: '14px',
          overflow: 'hidden',
          position: 'relative',
        }
      },
    },
  };
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

// Export spacePalette for direct use
export let spacePalette = darkPalette;

// Export mixins with accessor function to ensure they use current palette
export const getMixins = (mode: ThemeMode) => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;

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
    }
  };
};

// Adjust spacePalette globally based on mode
export const updateThemeMode = (mode: ThemeMode) => {
  spacePalette = mode === 'dark' ? darkPalette : lightPalette;
  return { spacePalette };
};