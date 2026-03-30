import React from 'react';
import { Box, Typography, Button, Modal, CircularProgress, alpha, useTheme } from '@mui/material';
import { CheckCircleOutline, OpenInNew } from '@mui/icons-material';
import { useThemeMode } from '../../../components/styles/theme';
import { generalConstants, userAreaTexts } from '../../constants/texts';

interface RedirectModalProps {
  open: boolean;
  onClose: () => void;
  countdown: number;
}

const RedirectModal: React.FC<RedirectModalProps> = ({ open, onClose, countdown }) => {
  const theme = useTheme();
  const { mode } = useThemeMode();

  const getModalBackground = () => {
    if (mode === 'circus') {
      return 'radial-gradient(circle at bottom left, #1a0d08 0%, #2d1810 100%)';
    }
    return 'radial-gradient(circle at bottom left, #061429 0%, #071f3b 100%)';
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 350,
          border: '2px solid',
          borderColor: theme.palette.primary.dark,
          borderRadius: '16px',
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: getModalBackground(),
        }}
      >
        <CheckCircleOutline
          sx={{ fontSize: 60, mb: 2, color: theme.palette.success?.main || '#4caf50' }}
        />

        <Typography
          variant="h6"
          component="h2"
          align="center"
          fontWeight="bold"
          sx={{ color: theme.palette.text.primary }}
        >
          {userAreaTexts.confirmationForm.redirectModal.title}
        </Typography>

        <Typography
          sx={{
            mt: 2,
            mb: 3,
            textAlign: 'center',
            color: alpha(theme.palette.text.primary, 0.8),
          }}
        >
          {userAreaTexts.confirmationForm.redirectModal.subtitle}
        </Typography>

        {countdown > 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              mt: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
              <CircularProgress
                variant="determinate"
                value={((5 - countdown) / 5) * 100}
                size={50}
                thickness={5}
                sx={{ color: theme.palette.primary.main }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  fontWeight="bold"
                  sx={{ color: theme.palette.text.primary }}
                >
                  {countdown}
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="subtitle1"
              fontWeight="medium"
              sx={{ color: theme.palette.primary.main }}
            >
              {userAreaTexts.confirmationForm.redirectModal.redirectText(countdown)}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 2, width: '100%' }}>
            <Typography
              sx={{
                mb: 2,
                fontWeight: 'medium',
                textAlign: 'center',
                color: alpha(theme.palette.text.primary, 0.8),
              }}
            >
              {userAreaTexts.confirmationForm.redirectModal.manualRedirectText}
            </Typography>
            <a
              href={generalConstants.paymentLink}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none', width: '100%', display: 'block' }}
            >
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                }}
              >
                {userAreaTexts.confirmationForm.redirectModal.manualRedirectButton}{' '}
                <OpenInNew sx={{ ml: 1 }} />
              </Button>
            </a>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default RedirectModal;
