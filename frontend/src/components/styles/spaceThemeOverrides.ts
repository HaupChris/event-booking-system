import type { Components, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material';

interface SpacePalette {
  primary: {
    main: string;
    dark: string;
    light: string;
  };
  text: {
    primary: string;
  };
  background: {
    card: string;
    paper: string;
  };
}

// Component overrides factory function for space themes (dark/light)
export const getComponentOverrides = (
  palette: SpacePalette,
  mode: 'dark' | 'light'
): Components<Omit<Theme, 'components'>> => {
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
          },
        },
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
          paddingBottom: 16,
        },
      },
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
        },
      },
    },
  };
};
