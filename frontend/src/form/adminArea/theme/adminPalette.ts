import { alpha } from '@mui/material';

export const adminPalette = {
  primary: {
    main: '#3b82f6',
    light: '#93c5fd',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#64748b',
    dark: '#475569',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
    sidebar: '#1e293b',
    card: '#ffffff',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#64748b',
  },
  status: {
    success: '#2563eb',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0891b2',
  },
  divider: '#cbd5e1',
};

// Pre-computed alpha variants used frequently across admin components
export const adminAlpha = {
  primaryBg: alpha(adminPalette.primary.main, 0.05),
  primaryBorder: alpha(adminPalette.primary.main, 0.35),
  primaryHover: alpha(adminPalette.primary.main, 0.08),
  primarySubtle: alpha(adminPalette.primary.main, 0.12),
  textSecondary: alpha(adminPalette.text.primary, 0.7),
};
