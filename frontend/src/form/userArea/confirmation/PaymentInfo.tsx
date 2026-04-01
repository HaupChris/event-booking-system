import React from 'react';
import { Box, Typography, TextField, Button, IconButton, alpha, useTheme } from '@mui/material';
import { EuroSymbol, ContentCopy, OpenInNew } from '@mui/icons-material';
import FormCard from '../../../components/core/display/FormCard';
import MissionHeading from '../../../components/core/display/MissionHeading';
import { useThemeMode } from '../../../components/styles/theme';
import { userAreaTexts } from '../../constants/texts';

interface PaymentInfoProps {
  totalPrice: number;
  betreff: string;
  onCopy: () => void;
  onPaypalClick: () => void;
}

const PaymentInfo: React.FC<PaymentInfoProps> = ({
  totalPrice,
  betreff,
  onCopy,
  onPaypalClick,
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

  const getTextFieldBackground = () => {
    if (isCircusMode) {
      return alpha('#311912', 0.86);
    }
    return alpha('#020c1b', 0.4);
  };

  return (
    <FormCard sx={{ my: 3, ...(sectionCardSx || {}) }}>
      <Box sx={{ p: 2 }}>
        <MissionHeading
          title={userAreaTexts.confirmationForm.paymentInfo.title}
          icon={<EuroSymbol />}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: isCircusMode ? '#e8d2ab' : theme.palette.primary.main,
              fontFamily: isCircusMode ? '"Rye", serif' : undefined,
            }}
          >
            {totalPrice}€
          </Typography>
        </Box>

        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: isCircusMode ? alpha('#e5cf9f', 0.95) : alpha(theme.palette.text.primary, 0.7),
              mb: 1,
              fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
            }}
          >
            {userAreaTexts.confirmationForm.paymentInfo.instructionsSubject}
          </Typography>

          <TextField
            sx={{
              width: '100%',
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: getTextFieldBackground(),
                '& fieldset': {
                  borderColor: isCircusMode
                    ? alpha('#d8b87a', 0.7)
                    : alpha(theme.palette.primary.main, 0.3),
                  borderWidth: isCircusMode ? 2 : 1,
                },
                '&:hover fieldset': {
                  borderColor: isCircusMode
                    ? alpha('#e6c586', 0.85)
                    : alpha(theme.palette.primary.main, 0.5),
                },
                '&.Mui-focused fieldset': {
                  borderColor: isCircusMode ? '#f3d79f' : theme.palette.primary.dark,
                },
              },
              '& .MuiInputBase-input': {
                color: theme.palette.text.primary,
                fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
              },
            }}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <IconButton onClick={onCopy} size="small">
                  <ContentCopy
                    sx={{
                      color: isCircusMode
                        ? alpha('#e6c586', 0.82)
                        : alpha(theme.palette.text.primary, 0.7),
                    }}
                  />
                </IconButton>
              ),
              readOnly: true,
            }}
            value={betreff}
            fullWidth
          />

          <Typography
            variant="body2"
            sx={{
              mb: 3,
              color: isCircusMode ? alpha('#e5cf9f', 0.88) : alpha(theme.palette.text.primary, 0.6),
              fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
            }}
          >
            {userAreaTexts.confirmationForm.paymentInfo.subjectHelp}
          </Typography>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={onPaypalClick}
            startIcon={<OpenInNew />}
            sx={{
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: 3,
              textTransform: 'none',
              ...(isCircusMode && {
                border: '1px solid',
                borderColor: alpha('#f3d79f', 0.75),
                background:
                  'linear-gradient(180deg, rgba(214,150,58,0.98) 0%, rgba(172,103,36,0.97) 100%)',
                color: '#2b140e',
                fontFamily: '"Rye", serif',
                '&:hover': {
                  background:
                    'linear-gradient(180deg, rgba(229,166,72,0.98) 0%, rgba(182,113,40,0.98) 100%)',
                },
              }),
            }}
          >
            {userAreaTexts.confirmationForm.paymentInfo.paypalButton}
          </Button>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: isCircusMode ? alpha('#e5cf9f', 0.82) : alpha(theme.palette.text.primary, 0.6),
              fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
            }}
          >
            {userAreaTexts.confirmationForm.paymentInfo.alternativePayment}
          </Typography>
        </Box>
      </Box>
    </FormCard>
  );
};

export default PaymentInfo;
