import React from 'react';
import { Box, Button, Modal, Typography, useTheme } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { artistAreaTexts } from '../../constants/texts';

interface ArtistConfirmationRedirectModalProps {
  open: boolean;
  countdown: number;
  paymentLink: string;
  onClose: () => void;
  isCircusMode: boolean;
  buttonSx?: object;
}

function ArtistConfirmationRedirectModal({
  open,
  countdown,
  paymentLink,
  onClose,
  isCircusMode,
  buttonSx,
}: ArtistConfirmationRedirectModalProps) {
  const theme = useTheme();

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 340,
          p: 4,
          borderRadius: '14px',
          border: '2px solid',
          borderColor: isCircusMode ? '#d8b87a' : theme.palette.primary.dark,
          bgcolor: isCircusMode ? 'rgba(26,11,18,0.98)' : theme.palette.background.paper,
        }}
      >
        <Typography align="center" variant="h6" sx={{ mb: 1 }}>
          {artistAreaTexts.confirmationForm.redirectModal.title}
        </Typography>
        <Typography align="center" sx={{ mb: 2 }}>
          {artistAreaTexts.confirmationForm.redirectModal.redirectText(countdown)}
        </Typography>
        <Button
          fullWidth
          variant="contained"
          href={paymentLink}
          target="_blank"
          rel="noreferrer"
          endIcon={<OpenInNew />}
          sx={buttonSx}
        >
          {artistAreaTexts.confirmationForm.redirectModal.manualRedirectButton}
        </Button>
      </Box>
    </Modal>
  );
}

export default ArtistConfirmationRedirectModal;
