import { resolveBrandingPack } from './packs';
import { useThemeMode } from '../components/styles/theme';

export const useBrandingPack = () => {
  const { brandingPackId } = useThemeMode();
  return resolveBrandingPack(brandingPackId);
};
