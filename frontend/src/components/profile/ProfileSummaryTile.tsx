import React from 'react';
import { alpha, Box, Typography } from '@mui/material';
import { useThemeMode } from '../styles/theme';
import { useBrandingPack } from '../../branding/useBrandingPack';

interface ProfileSummaryTileProps {
  label: string;
  title: string;
  price?: number;
  extra?: string;
}

const ProfileSummaryTile: React.FC<ProfileSummaryTileProps> = ({ label, title, price, extra }) => {
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';

  return (
    <Box
      sx={{
        px: 1,
        py: 1.5,
        bgcolor: 'action.hover',
        borderRadius: 1.5,
        border: isCircusMode ? '1px solid' : 'none',
        borderColor: isCircusMode ? alpha('#d8b87a', 0.35) : 'transparent',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body1"
        fontWeight="bold"
        sx={{ fontFamily: isCircusMode ? brandingPack.typography.body : undefined }}
      >
        {title}
      </Typography>
      {typeof price === 'number' && (
        <Typography variant="body2" color="text.secondary">
          {price.toFixed(2)} €
        </Typography>
      )}
      {extra && (
        <Typography variant="body2" color="text.secondary">
          {extra}
        </Typography>
      )}
    </Box>
  );
};

export default ProfileSummaryTile;
