import React from 'react';
import { Box, Typography, Button, Modal, CircularProgress, alpha, useTheme } from '@mui/material';
import { CheckCircleOutline, OpenInNew } from '@mui/icons-material';
import { useThemeMode } from '../../../components/styles/theme';
import { userAreaTexts } from '../../constants/texts';

interface RedirectModalProps {
  open: boolean;
  onClose: () => void;
  countdown: number;
  paymentLink: string;
}

const RedirectModal: React.FC<RedirectModalProps> = ({ open, onClose, countdown, paymentLink }) => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';

  const getModalBackground = () => {
    if (isCircusMode) {
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
          borderColor: isCircusMode ? alpha('#d8b87a', 0.92) : theme.palette.primary.dark,
          borderRadius: '16px',
          boxShadow: isCircusMode
            ? '0 16px 34px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(244,205,142,0.2)'
            : 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: getModalBackground(),
          backgroundImage: isCircusMode ? 'none' : undefined,
        }}
      >
        <CheckCircleOutline
          sx={{
            fontSize: 60,
            mb: 2,
            color: isCircusMode ? '#e6c586' : theme.palette.success?.main || '#4caf50',
          }}
        />

        <Typography
          variant="h6"
          component="h2"
          align="center"
          fontWeight="bold"
          sx={{
            color: isCircusMode ? '#f4ead6' : theme.palette.text.primary,
            fontFamily: isCircusMode ? '"Rye", serif' : undefined,
          }}
        >
          {userAreaTexts.confirmationForm.redirectModal.title}
        </Typography>

        <Typography
          sx={{
            mt: 2,
            mb: 3,
            textAlign: 'center',
            color: isCircusMode ? alpha('#f4ead6', 0.88) : alpha(theme.palette.text.primary, 0.8),
            fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
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
                sx={{ color: isCircusMode ? '#e6c586' : theme.palette.primary.main }}
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
                  sx={{
                    color: isCircusMode ? '#f4ead6' : theme.palette.text.primary,
                    fontFamily: isCircusMode ? '"Rye", serif' : undefined,
                  }}
                >
                  {countdown}
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="subtitle1"
              fontWeight="medium"
              sx={{
                color: isCircusMode ? '#e8d2ab' : theme.palette.primary.main,
                fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
              }}
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
                color: isCircusMode
                  ? alpha('#f4ead6', 0.88)
                  : alpha(theme.palette.text.primary, 0.8),
                fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
              }}
            >
              {userAreaTexts.confirmationForm.redirectModal.manualRedirectText}
            </Typography>
            <Button
              fullWidth
              variant="contained"
              size="large"
              href={paymentLink}
              target="_blank"
              rel="noreferrer"
              endIcon={<OpenInNew />}
              sx={{
                py: 1.5,
                ...(isCircusMode && {
                  border: '1px solid',
                  borderColor: alpha('#f3d79f', 0.75),
                  background:
                    'linear-gradient(180deg, rgba(214,150,58,0.98) 0%, rgba(172,103,36,0.97) 100%)',
                  color: '#2b140e',
                  fontFamily: '"Rye", serif',
                  textTransform: 'none',
                  '&:hover': {
                    background:
                      'linear-gradient(180deg, rgba(229,166,72,0.98) 0%, rgba(182,113,40,0.98) 100%)',
                  },
                }),
              }}
            >
              {userAreaTexts.confirmationForm.redirectModal.manualRedirectButton}
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default RedirectModal;
