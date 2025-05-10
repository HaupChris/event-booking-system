// src/utils/responsive.ts
import { useTheme, useMediaQuery } from '@mui/material';
import { breakpoints } from '../styles/theme';

// Hook for responsive design
export const useResponsive = () => {
  const theme = useTheme();

  return {
    isMobile: useMediaQuery(theme.breakpoints.down('sm')),
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')),
    isDesktop: useMediaQuery(theme.breakpoints.up('md')),
    breakpoints: {
      up: (key: keyof typeof breakpoints) => useMediaQuery(theme.breakpoints.up(key)),
      down: (key: keyof typeof breakpoints) => useMediaQuery(theme.breakpoints.down(key)),
      between: (start: keyof typeof breakpoints, end: keyof typeof breakpoints) =>
        useMediaQuery(theme.breakpoints.between(start, end)),
    }
  };
};

// Simplified response helper functions
export const getResponsiveValue = <T>(options: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default: T;
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile && options.xs !== undefined) return options.xs;
  if (isTablet && options.sm !== undefined) return options.sm;
  if (isDesktop && options.md !== undefined) return options.md;

  return options.default;
};