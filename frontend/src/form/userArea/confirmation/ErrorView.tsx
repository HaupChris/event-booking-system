import React from 'react';
import { Box, Typography, Button, alpha, useTheme } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';
import ThemedFormLayout from '../../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../../components/core/display/FormCard';
import { userAreaTexts } from '../../constants/texts';

interface ErrorViewProps {
  onRetry: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ onRetry }) => {
  const theme = useTheme();

  return (
    <ThemedFormLayout
      missionBriefing={userAreaTexts.confirmationForm.errorView.missionBriefing}
      footerId={userAreaTexts.confirmationForm.errorView.footerId}
    >
      <FormCard sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 2,
          }}
        >
          <ErrorOutline
            sx={{ color: theme.palette.error?.main || '#f44336', fontSize: 60, mb: 1 }}
          />
          <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
            {userAreaTexts.confirmationForm.errorView.title}
          </Typography>
        </Box>
      </FormCard>

      <Typography
        variant="body1"
        paragraph
        align="center"
        sx={{ color: alpha(theme.palette.text.primary, 0.8) }}
      >
        {userAreaTexts.confirmationForm.errorView.subtitle}
      </Typography>

      <FormCard sx={{ mb: 3 }}>
        <Box
          component="ul"
          sx={{
            pl: 4,
            pr: 2,
            py: 2,
            mb: 0,
            '& > li': {
              color: alpha(theme.palette.text.primary, 0.8),
              mb: 1,
            },
          }}
        >
          {userAreaTexts.confirmationForm.errorView.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </Box>
      </FormCard>

      <Typography
        variant="body1"
        paragraph
        fontWeight="medium"
        sx={{
          textAlign: 'center',
          mb: 3,
          color: alpha(theme.palette.text.primary, 0.8),
        }}
      >
        {userAreaTexts.confirmationForm.errorView.contactInfo}
      </Typography>

      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={onRetry}
        startIcon={<Refresh />}
        sx={{
          mt: 2,
          py: 1.5,
        }}
      >
        {userAreaTexts.confirmationForm.errorView.retryButton}
      </Button>
    </ThemedFormLayout>
  );
};

export default ErrorView;
