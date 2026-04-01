import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import ThemedFormLayout from '../../../components/core/layouts/ThemedFormLayout';
import FormCard from '../../../components/core/display/FormCard';
import MissionHeading from '../../../components/core/display/MissionHeading';
import { artistAreaTexts } from '../../constants/texts';

interface ArtistConfirmationErrorViewProps {
  onRetry: () => void;
  sectionCardSx?: object;
  buttonSx?: object;
}

function ArtistConfirmationErrorView({
  onRetry,
  sectionCardSx,
  buttonSx,
}: ArtistConfirmationErrorViewProps) {
  return (
    <ThemedFormLayout
      missionBriefing={artistAreaTexts.confirmationForm.errorView.missionBriefing}
      footerId={artistAreaTexts.confirmationForm.errorView.footerId}
    >
      <FormCard sx={{ mb: 3, ...(sectionCardSx || {}) }}>
        <MissionHeading
          title={artistAreaTexts.confirmationForm.errorView.title}
          icon={<ErrorOutline />}
          withDivider={false}
        />
      </FormCard>

      <Typography variant="body1" paragraph align="center">
        {artistAreaTexts.confirmationForm.errorView.subtitle}
      </Typography>

      <FormCard sx={sectionCardSx}>
        <Box component="ul" sx={{ pl: 4, pr: 2, py: 2, mb: 0 }}>
          {artistAreaTexts.confirmationForm.errorView.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </Box>
      </FormCard>

      <Typography variant="body1" paragraph sx={{ textAlign: 'center', mt: 2 }}>
        {artistAreaTexts.confirmationForm.errorView.contactInfo}
      </Typography>

      <Button fullWidth variant="contained" onClick={onRetry} sx={{ py: 1.5, ...buttonSx }}>
        {artistAreaTexts.confirmationForm.errorView.retryButton}
      </Button>
    </ThemedFormLayout>
  );
}

export default ArtistConfirmationErrorView;
