import { createTheme, alpha } from '@mui/material/styles';
import { adminPalette } from './adminPalette';

const fontFamily = "'Inter', 'system-ui', -apple-system, 'Segoe UI', Roboto, sans-serif";

export const adminTheme = createTheme({
  spacing: 8,
  palette: {
    mode: 'light',
    primary: adminPalette.primary,
    secondary: { main: adminPalette.secondary.main },
    background: {
      default: adminPalette.background.default,
      paper: adminPalette.background.paper,
    },
    text: {
      primary: adminPalette.text.primary,
      secondary: adminPalette.text.secondary,
    },
    divider: adminPalette.divider,
    error: { main: adminPalette.status.error },
    warning: { main: adminPalette.status.warning },
    info: { main: adminPalette.status.info },
    success: { main: adminPalette.status.success },
  },
  typography: {
    fontFamily,
    h4: { fontWeight: 700, letterSpacing: '-0.01em', color: adminPalette.text.primary },
    h5: { fontWeight: 700, letterSpacing: '-0.01em', color: adminPalette.text.primary },
    h6: { fontWeight: 700, fontSize: '1.05rem', color: adminPalette.text.primary },
    subtitle1: { fontWeight: 600, color: adminPalette.text.primary },
    subtitle2: { fontWeight: 600, color: adminPalette.text.secondary },
    body1: { fontSize: '0.9375rem', fontWeight: 450, color: adminPalette.text.primary },
    body2: { fontSize: '0.8125rem', fontWeight: 450, color: adminPalette.text.secondary },
    caption: { fontWeight: 500, color: adminPalette.text.muted },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${adminPalette.divider}`,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: `1px solid ${adminPalette.divider}` },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: adminPalette.background.default,
            color: adminPalette.text.primary,
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: adminPalette.divider,
          padding: '12px 16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.75rem' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: adminPalette.background.sidebar,
          color: '#ffffff',
          borderRight: 'none',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: adminPalette.background.paper,
          color: adminPalette.text.primary,
          borderBottom: `1px solid ${adminPalette.divider}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: alpha(adminPalette.primary.main, 0.15),
            color: adminPalette.primary.light,
            '&:hover': {
              backgroundColor: alpha(adminPalette.primary.main, 0.2),
            },
          },
        },
      },
    },
  },
});
