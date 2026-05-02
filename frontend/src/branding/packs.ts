import type { BrandingPack } from './types';

export const DEFAULT_BRANDING_PACK_ID = 'ww-2025-circus';

const BRANDING_PACKS: Record<string, BrandingPack> = {
  'ww-2025-circus': {
    id: 'ww-2025-circus',
    label: 'Wiesenwahn 2025 - Circus',
    year: 2025,
    motto: 'Zirkus Wiesenwahn',
    defaultThemeMode: 'circus',
    typography: {
      display: '"Rye", "Abril Fatface", serif',
      heading: '"Rye", "Playfair Display", serif',
      body: '"Merriweather", "Crimson Text", serif',
      accent: '"Merriweather", "Playfair Display", serif',
    },
    colors: {
      heroText: '#b04a3d',
      mutedText: '#e5cf9f',
      panelBorder: '#9a6c36',
      panelBackground:
        'radial-gradient(circle at 50% -15%, #3e1925 0%, #231019 45%, #16090f 80%, #13070c 100%)',
      ribbonBackground: 'linear-gradient(180deg, #3c6fb1 0%, #2e5e98 100%)',
      ribbonText: '#f5efe3',
      sectionIcon: '#64b5f6',
    },
    decoration: {
      cornerGlyph: '❖',
      cardRadius: '12px',
      panelRadius: '12px',
    },
  },
  'ww-2026-space': {
    id: 'ww-2026-space',
    label: 'Wiesenwahn 2026 - Zirkus',
    year: 2026,
    motto: 'Zirkus Wiesenwahn',
    defaultThemeMode: 'dark',
    typography: {
      display: '"DSEG7Classic", monospace',
      heading: '"DSEG7Classic", monospace',
      body: '"Merriweather", serif',
      accent: '"DSEG7Classic", monospace',
    },
    colors: {
      heroText: '#bbdefb',
      mutedText: 'rgba(255, 255, 255, 0.8)',
      panelBorder: '#64b5f6',
      panelBackground: 'radial-gradient(circle at bottom left, #061429 0%, #071f3b 100%)',
      ribbonBackground: 'rgba(0, 0, 0, 0.3)',
      ribbonText: '#ffffff',
      sectionIcon: '#64b5f6',
    },
    decoration: {
      cornerGlyph: '✦',
      cardRadius: '14px',
      panelRadius: '14px',
    },
  },
};

export const resolveBrandingPack = (packId?: string | null): BrandingPack => {
  if (!packId) {
    return BRANDING_PACKS[DEFAULT_BRANDING_PACK_ID];
  }

  return BRANDING_PACKS[packId] ?? BRANDING_PACKS[DEFAULT_BRANDING_PACK_ID];
};

export const getBrandingPackOptions = (): Array<{ id: string; label: string }> => {
  return Object.values(BRANDING_PACKS).map((pack) => ({ id: pack.id, label: pack.label }));
};
