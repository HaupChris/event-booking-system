import { createTheme } from '@mui/material/styles';
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

// Create dark theme
export const darkTheme = createTheme({
  spacing: 8, // Default MUI spacing unit (8px)
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
  typography: {
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
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          textTransform: 'none',
          padding: '8px 16px',
          border: `1px solid ${darkPalette.primary.main}`,
          background: 'linear-gradient(145deg, #222222, #1a1a1a)',
          boxShadow: 'inset 1px 1px 2px #111, inset -1px -1px 2px #333',
          color: darkPalette.primary.main,
          '&:hover': {
            boxShadow: `0 0 6px ${darkPalette.primary.main}`,
            background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
          },
        },
        contained: {
          background: `linear-gradient(45deg, ${darkPalette.primary.dark}, ${darkPalette.primary.main})`,
          color: darkPalette.text.primary,
          '&:hover': {
            background: `linear-gradient(45deg, ${darkPalette.primary.main}, ${darkPalette.primary.light})`,
          }
        }
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
          boxShadow: 'inset 1px 1px 2px #111, inset -1px -1px 2px #333',
          '& fieldset': {
            borderColor: alpha(darkPalette.primary.main, 0.3),
          },
          '&:hover fieldset': {
            borderColor: alpha(darkPalette.primary.main, 0.5),
          },
          '&.Mui-focused fieldset': {
            borderColor: darkPalette.primary.main,
            boxShadow: `0 0 6px ${darkPalette.primary.main}`,
          },
        },
        input: {
          color: darkPalette.text.primary,
          caretColor: darkPalette.primary.main,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: darkPalette.background.card,
          boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
          border: `1px solid ${alpha(darkPalette.primary.main, 0.2)}`,
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
          background: darkPalette.background.card,
          boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
          border: `1px solid ${alpha(darkPalette.primary.main, 0.2)}`,
          borderRadius: '14px',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: alpha(darkPalette.background.paper, 0.7),
        },
        elevation3: {
          background: darkPalette.background.card,
          boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
          border: `1px solid ${alpha(darkPalette.primary.main, 0.2)}`,
          borderRadius: '14px',
          overflow: 'hidden',
          position: 'relative',
        }
      },
    },
  },
});

// Create light theme
export const lightTheme = createTheme({
  spacing: 8, // Default MUI spacing unit (8px)
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
  typography: {
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
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          textTransform: 'none',
          padding: '8px 16px',
          border: `1px solid ${lightPalette.primary.main}`,
          background: 'linear-gradient(145deg, #f5f5f5, #e0e0e0)',
          boxShadow: 'inset 1px 1px 2px #fff, inset -1px -1px 2px #ccc',
          color: lightPalette.primary.main,
          '&:hover': {
            boxShadow: `0 0 6px ${lightPalette.primary.main}`,
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
          },
        },
        contained: {
          background: `linear-gradient(45deg, ${lightPalette.primary.dark}, ${lightPalette.primary.main})`,
          color: lightPalette.text.primary,
          '&:hover': {
            background: `linear-gradient(45deg, ${lightPalette.primary.main}, ${lightPalette.primary.light})`,
          }
        }
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
          boxShadow: 'inset 1px 1px 2px #fff, inset -1px -1px 2px #ccc',
          '& fieldset': {
            borderColor: alpha(lightPalette.primary.main, 0.3),
          },
          '&:hover fieldset': {
            borderColor: alpha(lightPalette.primary.main, 0.5),
          },
          '&.Mui-focused fieldset': {
            borderColor: lightPalette.primary.main,
            boxShadow: `0 0 6px ${lightPalette.primary.main}`,
          },
        },
        input: {
          color: lightPalette.text.primary,
          caretColor: lightPalette.primary.main,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: lightPalette.background.card,
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
          border: `1px solid ${alpha(lightPalette.primary.main, 0.2)}`,
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
          background: lightPalette.background.card,
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
          border: `1px solid ${alpha(lightPalette.primary.main, 0.2)}`,
          borderRadius: '14px',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: alpha(lightPalette.background.paper, 0.9),
        },
        elevation3: {
          background: lightPalette.background.card,
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
          border: `1px solid ${alpha(lightPalette.primary.main, 0.2)}`,
          borderRadius: '14px',
          overflow: 'hidden',
          position: 'relative',
        }
      },
    },
  },
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