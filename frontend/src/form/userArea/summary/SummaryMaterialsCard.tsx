import React from 'react';
import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import BackpackIcon from '@mui/icons-material/Backpack';
import FormCard from '../../../components/core/display/FormCard';
import { userAreaTexts } from '../../constants/texts';
import type { Material } from '../interface';

interface SummaryMaterialsCardProps {
  materials: (Material | undefined)[];
}

function SummaryMaterialsCard({ materials }: SummaryMaterialsCardProps) {
  const theme = useTheme();
  const validMaterials = materials.filter(Boolean) as Material[];

  return (
    <FormCard title={userAreaTexts.summaryForm.equipment} icon={<BackpackIcon />}>
      {validMaterials.length > 0 ? (
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'medium',
              mb: 1.5,
              color: alpha(theme.palette.text.primary, 0.8),
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
              bgcolor: alpha(theme.palette.background.default, 0.2),
              borderRadius: '8px',
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
            }}
          >
            {validMaterials.map((material, index) => (
              <Chip
                key={index}
                label={material.title}
                variant="outlined"
                sx={{
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  color: theme.palette.text.primary,
                }}
              />
            ))}
          </Box>
        </Box>
      ) : (
        <Typography
          variant="body1"
          sx={{
            color: alpha(theme.palette.text.primary, 0.7),
            fontStyle: 'italic',
            pl: 1,
          }}
        >
          {userAreaTexts.summaryForm.noMaterialsSelected}
        </Typography>
      )}
    </FormCard>
  );
}

export default SummaryMaterialsCard;
