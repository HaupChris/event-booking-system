import React from 'react';
import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import FormCard from '../../../components/core/display/FormCard';
import { userAreaTexts } from '../../constants/texts';
import type { Profession } from '../interface';

interface SummaryProfessionsCardProps {
  professionIds: number[];
  professions: Profession[] | undefined;
}

function SummaryProfessionsCard({ professionIds, professions }: SummaryProfessionsCardProps) {
  const theme = useTheme();

  return (
    <FormCard title={userAreaTexts.summaryForm.professionsTitle} icon={<WorkIcon />}>
      {professionIds.length > 0 ? (
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
          {professionIds.map((id) => {
            const profession = professions?.find((p) => p.id === id);
            return profession ? (
              <Chip
                key={id}
                label={profession.title}
                variant="outlined"
                sx={{
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  color: theme.palette.text.primary,
                }}
              />
            ) : null;
          })}
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
          {userAreaTexts.summaryForm.noProfessionsSelected}
        </Typography>
      )}
    </FormCard>
  );
}

export default SummaryProfessionsCard;
