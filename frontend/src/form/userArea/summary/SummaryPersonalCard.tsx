import React from 'react';
import { Box, Typography, Grid, alpha, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FormCard from '../../../components/core/display/FormCard';
import InfoPair from '../../../components/core/display/InfoPair';
import { userAreaTexts } from '../../constants/texts';
import { useThemeMode } from '../../../components/styles/theme';

interface SummaryPersonalCardProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

function SummaryPersonalCard({ firstName, lastName, email, phone }: SummaryPersonalCardProps) {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';

  return (
    <FormCard
      title={userAreaTexts.summaryForm.personalData}
      icon={<PersonIcon />}
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
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <Box sx={{ display: 'flex', mb: 1.5 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'medium',
                mr: 1,
                color: isCircusMode
                  ? alpha('#e5cf9f', 0.9)
                  : alpha(theme.palette.text.primary, 0.7),
                flexShrink: 0,
                fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
              }}
            >
              Vorname:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: isCircusMode ? '#f4ead6' : theme.palette.text.primary,
                fontWeight: 'medium',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
              }}
            >
              {firstName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', mb: 1.5 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'medium',
                mr: 1,
                color: isCircusMode
                  ? alpha('#e5cf9f', 0.9)
                  : alpha(theme.palette.text.primary, 0.7),
                flexShrink: 0,
                fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
              }}
            >
              Nachname:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: isCircusMode ? '#f4ead6' : theme.palette.text.primary,
                fontWeight: 'medium',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
              }}
            >
              {lastName}
            </Typography>
          </Box>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <InfoPair label="Email" value={email} icon={<EmailIcon />} />
          <InfoPair label="Telefon" value={phone} icon={<PhoneIcon />} />
        </Grid>
      </Grid>
    </FormCard>
  );
}

export default SummaryPersonalCard;
