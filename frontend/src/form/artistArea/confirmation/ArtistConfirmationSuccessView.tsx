import React from 'react';
import { Alert, Box, Button, FormHelperText, Snackbar, Typography } from '@mui/material';
import { CheckCircleOutline, ContentCopy, EuroSymbol, OpenInNew } from '@mui/icons-material';
import ThemedFormLayout from '../../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../../components/core/display/FormCard';
import MissionHeading from '../../../components/core/display/MissionHeading';
import SuccessClownVideo from '../../../components/core/display/SuccessClownVideo';
import { artistAreaTexts } from '../../constants/texts';
import ArtistConfirmationRedirectModal from './ArtistConfirmationRedirectModal';
import { OrnateInput } from '../../userArea/TestDesignFormPrimitives';

interface ArtistConfirmationSuccessViewProps {
  totalPrice: number;
  betreff: string;
  copied: boolean;
  redirecting: boolean;
  countdown: number;
  paymentLink: string;
  onCopy: () => void;
  onPaypalClick: () => void;
  onCloseCopied: () => void;
  onCloseRedirect: () => void;
  isCircusMode: boolean;
  sectionCardSx?: object;
  buttonSx?: object;
}

function ArtistConfirmationSuccessView({
  totalPrice,
  betreff,
  copied,
  redirecting,
  countdown,
  paymentLink,
  onCopy,
  onPaypalClick,
  onCloseCopied,
  onCloseRedirect,
  isCircusMode,
  sectionCardSx,
  buttonSx,
}: ArtistConfirmationSuccessViewProps) {
  const handleReadOnlyChange = () => undefined;

  return (
    <ThemedFormLayout
      missionBriefing={artistAreaTexts.confirmationForm.successView.subtitle}
      footerId={artistAreaTexts.confirmationForm.successView.footerId}
    >
      <FormCard sx={sectionCardSx} selected={isCircusMode}>
        <MissionHeading
          title={artistAreaTexts.confirmationForm.successView.title}
          icon={<CheckCircleOutline />}
          withDivider={false}
        />
      </FormCard>

      <SuccessClownVideo />

      {totalPrice > 0 ? (
        <FormCard sx={{ mt: 3, ...(sectionCardSx || {}) }}>
          <MissionHeading
            title={artistAreaTexts.confirmationForm.paymentInfo.title}
            icon={<EuroSymbol />}
          />

          <Box sx={{ px: 2, pb: 2 }}>
            <Typography
              variant="h4"
              align="center"
              sx={{
                mb: 2,
                color: isCircusMode ? '#e8d2ab' : 'primary.main',
                fontFamily: isCircusMode ? '"Rye", serif' : undefined,
                fontWeight: 'bold',
              }}
            >
              {totalPrice}€
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {artistAreaTexts.confirmationForm.paymentInfo.instructionsSubject}
            </Typography>

            <OrnateInput
              label="Überweisungsbetreff"
              icon={<ContentCopy fontSize="large" />}
              value={betreff}
              onChange={handleReadOnlyChange}
              readOnly
              size="compact"
            />

            <Button
              fullWidth
              variant="outlined"
              onClick={onCopy}
              startIcon={<ContentCopy />}
              sx={{ mb: 1, textTransform: 'none' }}
            >
              Betreff kopieren
            </Button>

            <FormHelperText sx={{ mb: 2 }}>
              {artistAreaTexts.confirmationForm.paymentInfo.subjectHelp}
            </FormHelperText>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={onPaypalClick}
              startIcon={<OpenInNew />}
              sx={{ py: 1.5, textTransform: 'none', ...(buttonSx || {}) }}
            >
              {artistAreaTexts.confirmationForm.paymentInfo.paypalButton}
            </Button>

            <FormHelperText sx={{ mt: 2, textAlign: 'center' }}>
              {artistAreaTexts.confirmationForm.paymentInfo.alternativePayment}
            </FormHelperText>
          </Box>
        </FormCard>
      ) : (
        <FormCard sx={{ mt: 3, ...(sectionCardSx || {}) }}>
          <Typography
            variant="h6"
            align="center"
            sx={{
              py: 1,
              color: isCircusMode ? '#e8d2ab' : 'primary.main',
              fontFamily: isCircusMode ? '"Rye", serif' : undefined,
            }}
          >
            Für dich als Künstler*in fallen keine Kosten an.
          </Typography>
        </FormCard>
      )}

      <Typography variant="subtitle1" sx={{ mt: 3, textAlign: 'center' }}>
        {artistAreaTexts.confirmationForm.successView.footer}
      </Typography>

      <ArtistConfirmationRedirectModal
        open={redirecting}
        countdown={countdown}
        paymentLink={paymentLink}
        onClose={onCloseRedirect}
        isCircusMode={isCircusMode}
        buttonSx={buttonSx}
      />

      <Snackbar
        open={copied}
        autoHideDuration={4000}
        onClose={onCloseCopied}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={onCloseCopied}>
          Betreff wurde in die Zwischenablage kopiert
        </Alert>
      </Snackbar>
    </ThemedFormLayout>
  );
}

export default ArtistConfirmationSuccessView;
