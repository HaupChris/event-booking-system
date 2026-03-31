export type BrandingThemeMode = 'dark' | 'light' | 'circus';

export interface BrandingTypographyTokens {
  display: string;
  heading: string;
  body: string;
  accent: string;
}

export interface BrandingColorTokens {
  heroText: string;
  mutedText: string;
  panelBorder: string;
  panelBackground: string;
  ribbonBackground: string;
  ribbonText: string;
  sectionIcon: string;
}

export interface BrandingDecorationTokens {
  cornerGlyph: string;
  cardRadius: string;
  panelRadius: string;
}

export interface BrandingPack {
  id: string;
  label: string;
  year: number;
  motto: string;
  defaultThemeMode: BrandingThemeMode;
  typography: BrandingTypographyTokens;
  colors: BrandingColorTokens;
  decoration: BrandingDecorationTokens;
}
