import { createTheme, alpha } from '@mui/material/styles';
import type { Components, Theme } from '@mui/material/styles';

// Circus theme palette (Theatrical/Vintage)
export const circusPalette = {
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

// Circus typography configuration (Theatrical/Vintage)
export const circusTypography = {
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

// Circus component overrides (Vintage theatrical styling)
export const getCircusComponentOverrides = (): Components<Omit<Theme, 'components'>> => {
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
          background: alpha('#4a2410', 0.4),
          border: '2px solid #704214',
          borderRadius: '6px',
          fontFamily: '"Crimson Text", "Georgia", serif',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '8px',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 4px, currentColor 4px, currentColor 5px)',
            opacity: 0.15,
            pointerEvents: 'none',
          },
          '& fieldset': {
            borderColor: alpha(circusPalette.primary.main, 0.4),
          },
          '&:hover': {
            background: alpha('#4a2410', 0.5),
            borderColor: alpha(circusPalette.primary.main, 0.6),
            boxShadow: '0 0 12px rgba(212, 175, 55, 0.25)',
          },
          '&:hover fieldset': {
            borderColor: alpha(circusPalette.primary.main, 0.6),
          },
          '&.Mui-focused': {
            background: alpha('#4a2410', 0.6),
            borderColor: circusPalette.primary.main,
            boxShadow: '0 0 16px rgba(212, 175, 55, 0.4)',
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
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: alpha(circusPalette.text.primary, 0.7),
          fontFamily: '"Crimson Text", "Georgia", serif',
          '&.Mui-focused': {
            color: circusPalette.primary.main,
          },
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
