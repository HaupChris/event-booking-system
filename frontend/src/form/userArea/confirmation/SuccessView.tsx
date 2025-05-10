import React, { useState } from 'react';
import { Box, Typography, Snackbar, Alert, alpha } from '@mui/material';
import { Celebration, CheckCircleOutline } from '@mui/icons-material';
import SpacePanelLayout from '../../../components/core/layouts/SpacePanelLayout';
import FormCard from '../../../components/core/display/FormCard';
import AnimatedRocket from '../../components/animatedRocket';
import PaymentInfo from './PaymentInfo';
import RedirectModal from './RedirectModal';
import { spacePalette } from '../../../components/styles/theme';

interface SuccessViewProps {
  totalPrice: number;
  betreff: string;
  onCopy: () => void;
  onPaypalClick: () => void;
  redirecting: boolean;
  setRedirecting: (value: boolean) => void;
  countdown: number;
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
  copied,
  onCloseCopied
}) => {
  const [showRocket, setShowRocket] = useState(true);

  return (
    <SpacePanelLayout
      missionBriefing="Deine Registrierung für das Weiher Wald & Weltall-Wahn war erfolgreich! Bitte bestätige jetzt deine Teilnahme durch Zahlung."
      footerId="WWWW-BOOKING-CONFIRMATION // ID-2025"
    >
      {/* Success Header */}
      <FormCard
        sx={{ mb: 3 }}
        selected={true}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2
        }}>
          <CheckCircleOutline sx={{ color: spacePalette.status.success, fontSize: 60, mb: 1 }} />
          <Typography
            variant="h5"
            fontWeight="bold"
            align="center"
            sx={{ color: alpha('#fff', 0.9) }}
          >
            Deine Buchung war erfolgreich!
          </Typography>
        </Box>
      </FormCard>

      {showRocket && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
            position: 'relative',
          }}
        >
          <AnimatedRocket onAnimationComplete={() => setShowRocket(false)} />
        </Box>
      )}

      <Typography
        variant="body1"
        paragraph
        sx={{
          mb: 3,
          fontSize: '1.1rem',
          color: alpha('#fff', 0.8),
          textAlign: 'center',
        }}
      >
        Du erhältst in Kürze eine Bestätigungsmail mit allen Details zu deiner Buchung. Bitte
        prüfe auch deinen Spam-Ordner, falls die Mail nicht sofort ankommt.
      </Typography>

      {/* Payment Box */}
      <PaymentInfo
        totalPrice={totalPrice}
        betreff={betreff}
        onCopy={onCopy}
        onPaypalClick={onPaypalClick}
      />

      <Box sx={{
        mt: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Celebration sx={{ mr: 1, color: spacePalette.primary.main }} />
        <Typography
          variant="subtitle1"
          fontWeight="medium"
          sx={{ color: alpha('#fff', 0.8) }}
        >
          Wir freuen uns auf dich beim Weiher Wald und Weltall-Wahn!
        </Typography>
      </Box>

      {/* Render the PayPal redirect modal */}
      <RedirectModal
        open={redirecting}
        onClose={() => setRedirecting(false)}
        countdown={countdown}
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
    </SpacePanelLayout>
  );
};

export default SuccessView;