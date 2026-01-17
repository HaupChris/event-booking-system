import type { Theme, Components } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';
import { createContext, useContext } from 'react';

// Theme context
export type ThemeMode = 'dark' | 'light' | 'circus';

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

// Circus theme palette (Theatrical/Vintage)
const circusPalette = {
  primary: {
    main: '#D4AF37',      // Antique gold
    light: '#F4D03F',     // Bright gold
    dark: '#B8860B',      // Deep golden bronze
    contrastText: '#1a0a0a'
  },
  secondary: {
    main: '#6B46C1',      // Deep royal purple
    light: '#9F7AEA',     // Light lavender purple
    dark: '#4C2A85',      // Dark plum purple
  },
  accent: {
    main: '#4A90E2',      // Vibrant circus blue
    light: '#7BB3FF',     // Sky blue
    dark: '#2E5C8A',      // Deep navy blue
  },
  background: {
    default: '#1a0a0a',   // Very dark brown (vintage paper aged)
    paper: '#2d1810',     // Warm dark brown
    card: 'radial-gradient(circle at top center, #4a2410 0%, #2d1810 50%, #1a0a0a 100%)'  // Tent interior gradient
  },
  text: {
    primary: '#F5E6D3',   // Vintage cream/parchment
    secondary: alpha('#F5E6D3', 0.85),
    muted: alpha('#F5E6D3', 0.65),
    gold: '#D4AF37',      // For special emphasis
  },
  decorative: {
    sepia: '#704214',     // Sepia brown for borders
    vintageRed: '#8B4513', // Safe brown-red (no pure red for colorblindness)
    stripeLight: '#D4AF37', // Gold stripes
    stripeDark: '#6B46C1',  // Purple stripes
  },
  status: {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#4A90E2'       // Use circus blue for info
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

// Circus typography configuration (Theatrical/Vintage)
const circusTypography = {
  fontFamily: '"Playfair Display", "Georgia", serif',
  h4: {
    fontFamily: '"Abril Fatface", "Playfair Display", serif',
    fontWeight: 700,
    letterSpacing: '0.02em',
    textTransform: 'uppercase' as const,
  },
  h5: {
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontWeight: 600,
    letterSpacing: '0.03em',
  },
  h6: {
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  body1: {
    fontFamily: '"Crimson Text", "Georgia", serif',
    letterSpacing: '0.015em',
    lineHeight: 1.7,
  },
  body2: {
    fontFamily: '"Crimson Text", "Georgia", serif',
    letterSpacing: '0.015em',
    lineHeight: 1.6,
  },
  button: {
    fontFamily: '"Cinzel", "Playfair Display", serif',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  }
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

// Circus component overrides (Vintage theatrical styling)
const getCircusComponentOverrides = (): Components<Omit<Theme, 'components'>> => {
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'uppercase',
          padding: '10px 24px',
          fontFamily: '"Cinzel", "Playfair Display", serif',
          fontWeight: 600,
          letterSpacing: '0.1em',
        },
        contained: {
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
          border: '3px solid #704214',
          color: '#1a0a0a',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
            pointerEvents: 'none',
          },
          '&:hover': {
            background: 'linear-gradient(135deg, #F4D03F 0%, #D4AF37 100%)',
            boxShadow: '0 6px 12px rgba(212, 175, 55, 0.4), 0 0 20px rgba(212, 175, 55, 0.3)',
            transform: 'translateY(-2px)',
          }
        }
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: circusPalette.background.paper,
          border: '2px solid #704214',
          borderRadius: '4px',
          fontFamily: '"Crimson Text", "Georgia", serif',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '10px',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 4px, currentColor 4px, currentColor 5px)',
            opacity: 0.2,
            pointerEvents: 'none',
          },
          '& fieldset': {
            borderColor: alpha(circusPalette.primary.main, 0.3),
          },
          '&:hover': {
            borderColor: circusPalette.primary.main,
            boxShadow: '0 0 12px rgba(212, 175, 55, 0.3)',
          },
          '&:hover fieldset': {
            borderColor: alpha(circusPalette.primary.main, 0.5),
          },
          '&.Mui-focused': {
            borderColor: circusPalette.primary.main,
            boxShadow: '0 0 16px rgba(212, 175, 55, 0.5)',
          },
          '&.Mui-focused fieldset': {
            borderColor: circusPalette.primary.main,
          },
        },
        input: {
          color: circusPalette.text.primary,
          caretColor: circusPalette.primary.main,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: circusPalette.background.card,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          border: `2px solid ${circusPalette.decorative.sepia}`,
          borderRadius: '12px',
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
          background: circusPalette.background.card,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          border: `2px solid ${circusPalette.decorative.sepia}`,
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: alpha(circusPalette.background.paper, 0.9),
        },
        elevation3: {
          background: circusPalette.background.card,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          border: `2px solid ${circusPalette.decorative.sepia}`,
          borderRadius: '12px',
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

// Create circus theme (Theatrical/Vintage)
export const circusTheme = createTheme({
  spacing: 8,
  palette: {
    mode: 'dark',  // Use dark mode as base for better contrast
    primary: circusPalette.primary,
    secondary: {
      main: circusPalette.secondary.main,
    },
    background: {
      default: circusPalette.background.default,
      paper: circusPalette.background.paper,
    },
    text: {
      primary: circusPalette.text.primary,
      secondary: circusPalette.text.secondary,
    },
  },
  typography: circusTypography,
  components: getCircusComponentOverrides(),
});

// Export spacePalette for direct use (defaults to dark, can be space or circus)
export let spacePalette = darkPalette;

// Export mixins with accessor function to ensure they use current palette
export const getMixins = (mode: ThemeMode) => {
  const palette = mode === 'circus' ? circusPalette : (mode === 'dark' ? darkPalette : lightPalette);

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
  spacePalette = mode === 'circus' ? circusPalette : (mode === 'dark' ? darkPalette : lightPalette);
  return { spacePalette };
};