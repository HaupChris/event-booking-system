import React from 'react';
import { Alert, Box, Button, CircularProgress, FormHelperText, Typography } from '@mui/material';
import { Check, RocketLaunch } from '@mui/icons-material';
import ThemedFormLayout from '../../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../../components/core/display/FormCard';
import MissionHeading from '../../../components/core/display/MissionHeading';
import { artistAreaTexts } from '../../constants/texts';

interface ArtistConfirmationInitialViewProps {
  totalPrice: number;
  isOnline: boolean;
  isSubmitting: boolean;
  submissionAttempted: boolean;
  onSubmit: () => void;
  isCircusMode: boolean;
  sectionCardSx?: object;
  buttonSx?: object;
}

function ArtistConfirmationInitialView({
  totalPrice,
  isOnline,
  isSubmitting,
  submissionAttempted,
  onSubmit,
  isCircusMode,
  sectionCardSx,
  buttonSx,
}: ArtistConfirmationInitialViewProps) {
  return (
    <ThemedFormLayout
      missionBriefing={artistAreaTexts.confirmationForm.initialView.missionBriefing}
      footerId={artistAreaTexts.confirmationForm.initialView.footerId}
    >
      <FormCard selected={isCircusMode} sx={sectionCardSx}>
        <MissionHeading
          title={artistAreaTexts.confirmationForm.initialView.title}
          icon={<RocketLaunch />}
          withDivider={false}
        />
        <Typography variant="body1" align="center" sx={{ mt: 1 }}>
          {artistAreaTexts.confirmationForm.initialView.subtitle}
        </Typography>
      </FormCard>

      <FormCard sx={{ mt: 3, ...(sectionCardSx || {}) }}>
        <Typography variant="h6" align="center">
          {artistAreaTexts.confirmationForm.initialView.totalContribution}
        </Typography>
        <Typography
          variant="h4"
          align="center"
          sx={{
            mt: 1,
            color: isCircusMode ? '#e8d2ab' : 'primary.main',
            fontFamily: isCircusMode ? '"Rye", serif' : undefined,
            fontWeight: 'bold',
          }}
        >
          {totalPrice > 0 ? `${totalPrice}€` : 'Kostenfrei'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            disabled={!isOnline || isSubmitting}
            variant="contained"
            onClick={onSubmit}
            size="large"
            sx={{ py: 1.5, px: { xs: 3, sm: 5 }, minWidth: { xs: '100%', sm: '60%' }, ...buttonSx }}
            startIcon={isSubmitting ? null : <Check />}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              artistAreaTexts.confirmationForm.initialView.submitButton
            )}
          </Button>
        </Box>
      </FormCard>

      {submissionAttempted && !isSubmitting && (
        <Alert severity="error" sx={{ mt: 3, width: '100%' }}>
          {artistAreaTexts.confirmationForm.initialView.errorMessage}
        </Alert>
      )}

      <FormHelperText sx={{ textAlign: 'center', mt: 2 }}>
        {artistAreaTexts.confirmationForm.initialView.paymentNote}
      </FormHelperText>
    </ThemedFormLayout>
  );
}

export default ArtistConfirmationInitialView;
