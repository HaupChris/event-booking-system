import React from 'react';
import { Box, Typography, Snackbar, Alert, alpha, useTheme, Button } from '@mui/material';
import { Celebration, CheckCircleOutline, OpenInNew } from '@mui/icons-material';
import ThemedFormLayout from '../../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../../components/core/display/FormCard';
import MissionHeading from '../../../components/core/display/MissionHeading';
import SuccessClownVideo from '../../../components/core/display/SuccessClownVideo';
import PaymentInfo from './PaymentInfo';
import RedirectModal from './RedirectModal';
import { useThemeMode } from '../../../components/styles/theme';
import { userAreaTexts } from '../../constants/texts';

interface SuccessViewProps {
  totalPrice: number;
  betreff: string;
  onCopy: () => void;
  onPaypalClick: () => void;
  redirecting: boolean;
  setRedirecting: (value: boolean) => void;
  countdown: number;
  paymentLink: string;
  profileUuid: string;
  copied: boolean;
  onCloseCopied: (event: React.SyntheticEvent | Event, reason?: string) => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({
  totalPrice,
  betreff,
  onCopy,
  onPaypalClick,
  redirecting,
  setRedirecting,
  countdown,
  paymentLink,
  profileUuid,
  copied,
  onCloseCopied,
}) => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';

  const sectionCardSx = isCircusMode
    ? {
        border: '2px solid',
        borderColor: alpha('#d8b87a', 0.88),
        backgroundColor: alpha('#1a0b12', 0.58),
        backgroundImage: 'none !important',
        borderRadius: '14px',
        boxShadow: '0 10px 24px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(244,205,142,0.2)',
      }
    : undefined;

  return (
    <ThemedFormLayout
      missionBriefing={userAreaTexts.confirmationForm.successView.subtitle}
      footerId={userAreaTexts.confirmationForm.successView.footerId}
    >
      <FormCard sx={{ mb: 3, ...(sectionCardSx || {}) }} selected={isCircusMode}>
        <MissionHeading
          title={userAreaTexts.confirmationForm.successView.title}
          icon={<CheckCircleOutline />}
          withDivider={false}
        />
      </FormCard>

      <SuccessClownVideo />

      <PaymentInfo
        totalPrice={totalPrice}
        betreff={betreff}
        onCopy={onCopy}
        onPaypalClick={onPaypalClick}
      />

      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: isCircusMode ? '12px' : 2,
          border: '1px solid',
          borderColor: isCircusMode
            ? alpha('#d8b87a', 0.62)
            : alpha(theme.palette.primary.main, 0.35),
          backgroundColor: isCircusMode
            ? alpha('#2a120f', 0.62)
            : alpha(theme.palette.primary.dark, 0.08),
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: isCircusMode ? alpha('#f4ead6', 0.9) : alpha(theme.palette.text.primary, 0.85),
            mb: 1,
            fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
          }}
        >
          Bitte schließe zuerst die Zahlung ab. Danach kannst du dein Profil fuer News und
          Schicht-Updates jederzeit direkt aufrufen.
        </Typography>
        {profileUuid ? (
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            href={`/profile/${profileUuid}`}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNew />}
            sx={{
              textTransform: 'none',
              ...(isCircusMode && {
                borderColor: alpha('#d8b87a', 0.8),
                color: '#e8d2ab',
                fontFamily: '"Merriweather", serif',
                '&:hover': {
                  borderColor: alpha('#f3d79f', 0.9),
                  backgroundColor: alpha('#3a1b12', 0.55),
                },
              }),
            }}
          >
            Profil in neuem Tab oeffnen
          </Button>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            disabled
            startIcon={<OpenInNew />}
            sx={{
              textTransform: 'none',
              ...(isCircusMode && {
                borderColor: alpha('#d8b87a', 0.45),
                color: alpha('#e8d2ab', 0.58),
                fontFamily: '"Merriweather", serif',
              }),
            }}
          >
            Profil-Link wird vorbereitet
          </Button>
        )}
      </Box>

      <Box
        sx={{
          mt: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Celebration sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography
          variant="subtitle1"
          fontWeight="medium"
          sx={{
            color: isCircusMode ? alpha('#e8d2ab', 0.9) : alpha(theme.palette.text.primary, 0.8),
            fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
          }}
        >
          {userAreaTexts.confirmationForm.successView.footer}
        </Typography>
      </Box>

      <RedirectModal
        open={redirecting}
        onClose={() => setRedirecting(false)}
        countdown={countdown}
        paymentLink={paymentLink}
      />

      <Snackbar
        open={copied}
        autoHideDuration={4000}
        onClose={onCloseCopied}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={onCloseCopied}
          severity="success"
          variant="filled"
          sx={
            isCircusMode
              ? {
                  backgroundColor: alpha('#2a120f', 0.96),
                  border: '1px solid',
                  borderColor: alpha('#d8b87a', 0.7),
                  color: '#f4ead6',
                  '& .MuiAlert-icon': {
                    color: '#e6c586',
                  },
                  '& .MuiAlert-message': {
                    fontFamily: '"Merriweather", serif',
                  },
                }
              : undefined
          }
        >
          Betreff wurde in die Zwischenablage kopiert
        </Alert>
      </Snackbar>
    </ThemedFormLayout>
  );
};

export default SuccessView;
