import React from 'react';
import { Box, Typography, Grid, alpha, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FormCard from '../../../components/core/display/FormCard';
import InfoPair from '../../../components/core/display/InfoPair';
import { userAreaTexts } from '../../constants/texts';

interface SummaryPersonalCardProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

function SummaryPersonalCard({ firstName, lastName, email, phone }: SummaryPersonalCardProps) {
  const theme = useTheme();

  return (
    <FormCard title={userAreaTexts.summaryForm.personalData} icon={<PersonIcon />}>
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
                color: alpha(theme.palette.text.primary, 0.7),
                flexShrink: 0,
              }}
            >
              Vorname:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 'medium',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
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
                color: alpha(theme.palette.text.primary, 0.7),
                flexShrink: 0,
              }}
            >
              Nachname:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 'medium',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
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
