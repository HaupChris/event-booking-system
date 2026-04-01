import React from 'react';
import { Box, Typography, Button, Alert, CircularProgress, alpha, useTheme } from '@mui/material';
import { Check, SignalCellularNodata, RocketLaunch } from '@mui/icons-material';
import ThemedFormLayout from '../../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../../components/core/display/FormCard';
import MissionHeading from '../../../components/core/display/MissionHeading';
import { useThemeMode } from '../../../components/styles/theme';
import { userAreaTexts } from '../../constants/texts';

interface InitialViewProps {
  totalPrice: number;
  isOnline: boolean;
  isSubmitting: boolean;
  submissionAttempted: boolean;
  onSubmit: () => void;
}

const CIRCUS_SECTION_CARD_SX = {
  border: '2px solid',
  borderColor: alpha('#d8b87a', 0.88),
  backgroundColor: alpha('#1a0b12', 0.58),
  backgroundImage: 'none !important',
  borderRadius: '14px',
  boxShadow: '0 10px 24px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(244,205,142,0.2)',
};

const InitialView: React.FC<InitialViewProps> = ({
  totalPrice,
  isOnline,
  isSubmitting,
  submissionAttempted,
  onSubmit,
}) => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';
  const warningColor = theme.palette.warning?.main || '#ff9800';
  const errorColor = theme.palette.error?.main || '#f44336';

  const sectionCardSx = isCircusMode ? CIRCUS_SECTION_CARD_SX : undefined;
  const subtitleSx = {
    mt: 1,
    mb: 1,
    px: { xs: 1, sm: 2 },
    fontSize: '1.03rem',
    color: alpha(theme.palette.text.primary, 0.8),
    lineHeight: 1.65,
  };
  const contributionLabelSx = {
    color: theme.palette.text.primary,
  };
  const contributionValueSx = {
    mt: 1,
    color: theme.palette.primary.main,
    fontWeight: 'bold',
  };
  const submitButtonSx = {
    py: 1.5,
    px: { xs: 3, sm: 5 },
    fontWeight: 'bold',
    fontSize: '1.06rem',
    boxShadow: 3,
    minWidth: { xs: '100%', sm: '60%' },
    textTransform: 'none',
    '&.Mui-disabled': {
      background: alpha(theme.palette.primary.light, 0.2),
      color: alpha(theme.palette.text.primary, 0.4),
    },
  };
  const warningAlertSx = {
    mt: 3,
    width: '100%',
    bgcolor: alpha(warningColor, 0.1),
    color: theme.palette.text.primary,
    border: '1px solid',
    borderColor: alpha(warningColor, 0.3),
    '& .MuiAlert-icon': {
      color: warningColor,
    },
  };
  const errorAlertSx = {
    mt: 3,
    width: '100%',
    bgcolor: alpha(errorColor, 0.1),
    color: theme.palette.text.primary,
    border: '1px solid',
    borderColor: alpha(errorColor, 0.3),
    '& .MuiAlert-icon': {
      color: errorColor,
    },
  };
  const paymentNoteSx = {
    mt: 2,
    color: alpha(theme.palette.text.primary, 0.6),
    textAlign: 'center',
  };

  if (isCircusMode) {
    Object.assign(subtitleSx, {
      color: alpha('#f4ead6', 0.9),
      fontFamily: '"Merriweather", serif',
    });
    Object.assign(contributionLabelSx, {
      color: '#f4ead6',
      fontFamily: '"Merriweather", serif',
    });
    Object.assign(contributionValueSx, {
      color: '#e8d2ab',
      fontFamily: '"Rye", serif',
    });
    Object.assign(submitButtonSx, {
      border: '1px solid',
      borderColor: alpha('#f3d79f', 0.75),
      background: 'linear-gradient(180deg, rgba(214,150,58,0.98) 0%, rgba(172,103,36,0.97) 100%)',
      color: '#2b140e',
      fontFamily: '"Rye", serif',
      letterSpacing: '0.02em',
      '&:hover': {
        background: 'linear-gradient(180deg, rgba(229,166,72,0.98) 0%, rgba(182,113,40,0.98) 100%)',
      },
    });
    Object.assign(warningAlertSx, {
      bgcolor: alpha('#4a2814', 0.82),
      borderColor: alpha('#e6c586', 0.6),
      '& .MuiAlert-icon': {
        color: '#e6c586',
      },
      '& .MuiAlert-message': {
        fontFamily: '"Merriweather", serif',
      },
    });
    Object.assign(errorAlertSx, {
      bgcolor: alpha('#3a1715', 0.85),
      borderColor: alpha('#e9a6a1', 0.58),
      '& .MuiAlert-icon': {
        color: '#e9a6a1',
      },
      '& .MuiAlert-message': {
        fontFamily: '"Merriweather", serif',
      },
    });
    Object.assign(paymentNoteSx, {
      color: alpha('#e8d2ab', 0.84),
      fontFamily: '"Merriweather", serif',
    });
  }

  return (
    <ThemedFormLayout
      missionBriefing={userAreaTexts.confirmationForm.initialView.missionBriefing}
      footerId={userAreaTexts.confirmationForm.initialView.footerId}
    >
      <FormCard selected={isCircusMode} sx={sectionCardSx}>
        <MissionHeading
          title={userAreaTexts.confirmationForm.initialView.title}
          icon={<RocketLaunch />}
          withDivider={false}
        />
        <Typography variant="body1" align="center" sx={subtitleSx}>
          {userAreaTexts.confirmationForm.initialView.subtitle}
        </Typography>
      </FormCard>

      <FormCard
        sx={{
          mt: 3,
          ...(sectionCardSx || {}),
        }}
      >
        <Typography variant="h6" align="center" sx={contributionLabelSx}>
          {userAreaTexts.confirmationForm.initialView.totalContribution}
        </Typography>
        <Typography variant="h4" align="center" fontWeight="bold" sx={contributionValueSx}>
          {totalPrice}€
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            disabled={!isOnline || isSubmitting}
            variant="contained"
            color="primary"
            onClick={onSubmit}
            size="large"
            sx={submitButtonSx}
            startIcon={isSubmitting ? null : <Check />}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              userAreaTexts.confirmationForm.initialView.submitButton
            )}
          </Button>
        </Box>
      </FormCard>

      {!isOnline && (
        <Alert severity="warning" icon={<SignalCellularNodata />} sx={warningAlertSx}>
          {userAreaTexts.confirmationForm.initialView.offlineWarning}
        </Alert>
      )}

      {submissionAttempted && !isSubmitting && (
        <Alert severity="error" sx={errorAlertSx}>
          {userAreaTexts.confirmationForm.initialView.errorMessage}
        </Alert>
      )}

      <Typography variant="body2" sx={paymentNoteSx}>
        {userAreaTexts.confirmationForm.initialView.paymentNote}
      </Typography>
    </ThemedFormLayout>
  );
};

export default InitialView;
