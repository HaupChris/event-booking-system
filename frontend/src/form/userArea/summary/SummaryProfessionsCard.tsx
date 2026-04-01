import React from 'react';
import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import FormCard from '../../../components/core/display/FormCard';
import { userAreaTexts } from '../../constants/texts';
import type { Profession } from '../interface';
import { useThemeMode } from '../../../components/styles/theme';

interface SummaryProfessionsCardProps {
  professionIds: number[];
  professions: Profession[] | undefined;
}

function SummaryProfessionsCard({ professionIds, professions }: SummaryProfessionsCardProps) {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';

  return (
    <FormCard
      title={userAreaTexts.summaryForm.professionsTitle}
      icon={<WorkIcon />}
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
      {professionIds.length > 0 ? (
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
          {professionIds.map((id) => {
            const profession = professions?.find((p) => p.id === id);
            return profession ? (
              <Chip
                key={id}
                label={profession.title}
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
            ) : null;
          })}
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
          {userAreaTexts.summaryForm.noProfessionsSelected}
        </Typography>
      )}
    </FormCard>
  );
}

export default SummaryProfessionsCard;
