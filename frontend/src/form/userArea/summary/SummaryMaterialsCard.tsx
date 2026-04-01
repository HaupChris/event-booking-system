import React from 'react';
import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import BackpackIcon from '@mui/icons-material/Backpack';
import FormCard from '../../../components/core/display/FormCard';
import { userAreaTexts } from '../../constants/texts';
import type { Material } from '../interface';
import { useThemeMode } from '../../../components/styles/theme';

interface SummaryMaterialsCardProps {
  materials: (Material | undefined)[];
}

function SummaryMaterialsCard({ materials }: SummaryMaterialsCardProps) {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';
  const validMaterials = materials.filter(Boolean) as Material[];

  return (
    <FormCard
      title={userAreaTexts.summaryForm.equipment}
      icon={<BackpackIcon />}
      sx={
        isCircusMode
          ? {
              border: '2px solid',
              borderColor: alpha('#d8b87a', 0.85),
              backgroundColor: alpha('#1a0b12', 0.58),
              borderRadius: '14px',
            }
          : undefined
      }
    >
      {validMaterials.length > 0 ? (
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'medium',
              mb: 1.5,
              color: isCircusMode ? '#f4ead6' : alpha(theme.palette.text.primary, 0.8),
              fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
            }}
          >
            {userAreaTexts.summaryForm.bringingItems}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              p: 1.5,
              bgcolor: isCircusMode
                ? alpha('#2a120f', 0.62)
                : alpha(theme.palette.background.default, 0.2),
              borderRadius: isCircusMode ? '12px' : '8px',
              border: '1px solid',
              borderColor: isCircusMode
                ? alpha('#d8b87a', 0.5)
                : alpha(theme.palette.primary.main, 0.2),
            }}
          >
            {validMaterials.map((material) => (
              <Chip
                key={material.id}
                label={material.title}
                variant="outlined"
                sx={{
                  borderColor: isCircusMode
                    ? alpha('#d8b87a', 0.55)
                    : alpha(theme.palette.primary.main, 0.5),
                  color: isCircusMode ? '#f4ead6' : theme.palette.text.primary,
                  fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
                  backgroundColor: isCircusMode ? alpha('#d8b87a', 0.12) : undefined,
                }}
              />
            ))}
          </Box>
        </Box>
      ) : (
        <Typography
          variant="body1"
          sx={{
            color: isCircusMode ? alpha('#e5cf9f', 0.9) : alpha(theme.palette.text.primary, 0.7),
            fontStyle: 'italic',
            pl: 1,
            fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
          }}
        >
          {userAreaTexts.summaryForm.noMaterialsSelected}
        </Typography>
      )}
    </FormCard>
  );
}

export default SummaryMaterialsCard;
