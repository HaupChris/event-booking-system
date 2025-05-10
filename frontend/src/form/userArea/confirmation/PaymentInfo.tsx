import React from 'react';
import { Box, Typography, TextField, Button, IconButton, alpha } from '@mui/material';
import { EuroSymbol, ContentCopy, OpenInNew } from '@mui/icons-material';
import FormCard from '../../../components/core/display/FormCard';
import { spacePalette } from '../../../components/styles/theme';

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
  onPaypalClick
}) => {
  return (
    <FormCard
      title="Zahlungsinformationen"
      icon={<EuroSymbol />}
      sx={{ my: 3 }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: spacePalette.primary.main }}
          >
            {totalPrice}€
          </Typography>
        </Box>

        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: alpha('#fff', 0.7), mb: 1 }}
          >
            Bitte verwende diesen Betreff für deine Überweisung:
          </Typography>

          <TextField
            sx={{
              width: '100%',
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: alpha('#020c1b', 0.4),
                '& fieldset': {
                  borderColor: alpha(spacePalette.primary.main, 0.3),
                },
                '&:hover fieldset': {
                  borderColor: alpha(spacePalette.primary.main, 0.5),
                },
                '&.Mui-focused fieldset': {
                  borderColor: spacePalette.primary.dark,
                },
              },
              '& .MuiInputBase-input': {
                color: alpha('#fff', 0.9),
              },
            }}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <IconButton onClick={onCopy} size="small">
                  <ContentCopy sx={{ color: alpha('#fff', 0.7) }} />
                </IconButton>
              ),
              readOnly: true
            }}
            value={betreff}
            fullWidth
          />

          <Typography
            variant="body2"
            sx={{ mb: 3, color: alpha('#fff', 0.6) }}
          >
            Der Betreff hilft uns, deine Zahlung korrekt zuzuordnen.
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
              background: 'linear-gradient(45deg, #1e88e5, #64b5f6)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              }
            }}
          >
            Jetzt mit PayPal bezahlen
          </Button>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', color: alpha('#fff', 0.6) }}
          >
            Kein PayPal? Kontaktiere bitte direkt <strong>Stephan Hauptmann</strong> für
            alternative Zahlungsmöglichkeiten.
          </Typography>
        </Box>
      </Box>
    </FormCard>
  );
};

export default PaymentInfo;