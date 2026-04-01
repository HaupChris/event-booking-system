import React from 'react';
import { Box, Typography, Button, alpha, useTheme } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';
import ThemedFormLayout from '../../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../../components/core/display/FormCard';
import MissionHeading from '../../../components/core/display/MissionHeading';
import { useThemeMode } from '../../../components/styles/theme';
import { userAreaTexts } from '../../constants/texts';

interface ErrorViewProps {
  onRetry: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ onRetry }) => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';

  const sectionCardSx = isCircusMode
    ? {
        border: '2px solid',
        borderColor: alpha('#d8b87a', 0.85),
        backgroundColor: alpha('#1a0b12', 0.58),
        backgroundImage: 'none !important',
        borderRadius: '14px',
      }
    : undefined;

  return (
    <ThemedFormLayout
      missionBriefing={userAreaTexts.confirmationForm.errorView.missionBriefing}
      footerId={userAreaTexts.confirmationForm.errorView.footerId}
    >
      <FormCard sx={{ mb: 3, ...(sectionCardSx || {}) }}>
        <MissionHeading
          title={userAreaTexts.confirmationForm.errorView.title}
          icon={<ErrorOutline />}
          withDivider={false}
        />
      </FormCard>

      <Typography
        variant="body1"
        paragraph
        align="center"
        sx={{
          color: isCircusMode ? alpha('#f4ead6', 0.9) : alpha(theme.palette.text.primary, 0.8),
          fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
        }}
      >
        {userAreaTexts.confirmationForm.errorView.subtitle}
      </Typography>

      <FormCard sx={{ mb: 3, ...(sectionCardSx || {}) }}>
        <Box
          component="ul"
          sx={{
            pl: 4,
            pr: 2,
            py: 2,
            mb: 0,
            '& > li': {
              color: isCircusMode ? alpha('#f4ead6', 0.9) : alpha(theme.palette.text.primary, 0.8),
              mb: 1,
              fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
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
          color: isCircusMode ? alpha('#e8d2ab', 0.88) : alpha(theme.palette.text.primary, 0.8),
          fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
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
          ...(isCircusMode && {
            border: '1px solid',
            borderColor: alpha('#f3d79f', 0.75),
            background:
              'linear-gradient(180deg, rgba(214,150,58,0.98) 0%, rgba(172,103,36,0.97) 100%)',
            color: '#2b140e',
            fontFamily: '"Rye", serif',
            '&:hover': {
              background:
                'linear-gradient(180deg, rgba(229,166,72,0.98) 0%, rgba(182,113,40,0.98) 100%)',
            },
          }),
        }}
      >
        {userAreaTexts.confirmationForm.errorView.retryButton}
      </Button>
    </ThemedFormLayout>
  );
};

export default ErrorView;
