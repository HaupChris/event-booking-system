// src/styles/theme.ts
import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';

// Define the space theme palette
export const spacePalette = {
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

// Spacing system (follows 8px grid)
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px'
};

// Breakpoints for responsive design
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536
};

// Common mixins for reuse
export const mixins = {
  spacePanel: {
    background: spacePalette.background.card,
    boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
    border: `1px solid ${alpha(spacePalette.primary.main, 0.2)}`,
    borderRadius: '14px',
    overflow: 'hidden',
    position: 'relative',
  },
  headerGradient: {
    width: '100%',
    height: '6px',
    background: `linear-gradient(90deg, ${spacePalette.primary.dark}, ${spacePalette.primary.main}, ${spacePalette.primary.light}, ${spacePalette.primary.dark})`,
    backgroundSize: '300% 100%',
    animation: 'gradientMove 12s linear infinite',
  },
  missionBriefing: {
    py: 1.5,
    px: 2,
    backgroundColor: alpha('#000', 0.3),
    borderLeft: '4px solid',
    borderColor: spacePalette.primary.dark,
    mx: { xs: 1, sm: 2 },
    my: 2,
    borderRadius: '0 8px 8px 0',
  },
  footerBar: {
    p: 1.5,
    backgroundColor: '#041327',
    borderTop: '1px solid',
    borderColor: alpha(spacePalette.primary.main, 0.2),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
};

// Create the theme object
export const spaceTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: spacePalette.primary,
    secondary: {
      main: spacePalette.secondary.main,
    },
    background: {
      default: spacePalette.background.default,
      paper: spacePalette.background.paper,
    },
    text: {
      primary: spacePalette.text.primary,
      secondary: spacePalette.text.secondary,
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
          border: `1px solid ${spacePalette.primary.main}`,
          background: 'linear-gradient(145deg, #222222, #1a1a1a)',
          boxShadow: 'inset 1px 1px 2px #111, inset -1px -1px 2px #333',
          color: spacePalette.primary.main,
          '&:hover': {
            boxShadow: `0 0 6px ${spacePalette.primary.main}`,
            background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
          },
        },
        contained: {
          background: `linear-gradient(45deg, ${spacePalette.primary.dark}, ${spacePalette.primary.main})`,
          color: spacePalette.text.primary,
          '&:hover': {
            background: `linear-gradient(45deg, ${spacePalette.primary.main}, ${spacePalette.primary.light})`,
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
            borderColor: alpha(spacePalette.primary.main, 0.3),
          },
          '&:hover fieldset': {
            borderColor: alpha(spacePalette.primary.main, 0.5),
          },
          '&.Mui-focused fieldset': {
            borderColor: spacePalette.primary.main,
            boxShadow: `0 0 6px ${spacePalette.primary.main}`,
          },
        },
        input: {
          color: spacePalette.text.primary,
          caretColor: spacePalette.primary.main,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: spacePalette.background.card,
          boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
          border: `1px solid ${alpha(spacePalette.primary.main, 0.2)}`,
          borderRadius: '14px',
          overflow: 'hidden',
          position: 'relative',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          paddingLeft:0,
          paddingRight:0,
          paddingTop:16,
          paddingBottom:16
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation2: {
          background: spacePalette.background.card,
          boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
          border: `1px solid ${alpha(spacePalette.primary.main, 0.2)}`,
          borderRadius: '14px',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: alpha(spacePalette.background.paper, 0.7),
        },
        elevation3: {
          background: spacePalette.background.card,
          boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
          border: `1px solid ${alpha(spacePalette.primary.main, 0.2)}`,
          borderRadius: '14px',
          overflow: 'hidden',
          position: 'relative',
        }
      },
    },
  },
});

export default spaceTheme;