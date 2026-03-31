import React from 'react';
import { Box, Typography, Snackbar, Alert, alpha, useTheme, Button } from '@mui/material';
import { Celebration, CheckCircleOutline, OpenInNew } from '@mui/icons-material';
import ThemedFormLayout from '../../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../../components/core/display/FormCard';
import SuccessClownVideo from '../../../components/core/display/SuccessClownVideo';
import PaymentInfo from './PaymentInfo';
import RedirectModal from './RedirectModal';
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

  return (
    <ThemedFormLayout
      missionBriefing={userAreaTexts.confirmationForm.successView.subtitle}
      footerId={userAreaTexts.confirmationForm.successView.footerId}
    >
      {/* Success Header */}
      <FormCard sx={{ mb: 3 }} selected={true}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 2,
          }}
        >
          <CheckCircleOutline
            sx={{ color: theme.palette.success?.main || '#4caf50', fontSize: 60, mb: 1 }}
          />
          <Typography
            variant="h5"
            fontWeight="bold"
            align="center"
            sx={{ color: theme.palette.text.primary }}
          >
            {userAreaTexts.confirmationForm.successView.title}
          </Typography>
        </Box>
      </FormCard>

      <SuccessClownVideo />

      {/* Payment Box */}
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
          borderRadius: 2,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.35),
          backgroundColor: alpha(theme.palette.primary.dark, 0.08),
        }}
      >
        <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.85), mb: 1 }}>
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
            sx={{ textTransform: 'none' }}
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
            sx={{ textTransform: 'none' }}
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
          sx={{ color: alpha(theme.palette.text.primary, 0.8) }}
        >
          {userAreaTexts.confirmationForm.successView.footer}
        </Typography>
      </Box>

      {/* Render the PayPal redirect modal */}
      <RedirectModal
        open={redirecting}
        onClose={() => setRedirecting(false)}
        countdown={countdown}
        paymentLink={paymentLink}
      />

      {/* Snackbar for copy confirmation */}
      <Snackbar
        open={copied}
        autoHideDuration={4000}
        onClose={onCloseCopied}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={onCloseCopied} severity="success" variant="filled">
          Betreff wurde in die Zwischenablage kopiert
        </Alert>
      </Snackbar>
    </ThemedFormLayout>
  );
};

export default SuccessView;
