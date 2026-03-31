import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailIcon from '@mui/icons-material/Email';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PendingIcon from '@mui/icons-material/Pending';
import PhoneIcon from '@mui/icons-material/Phone';
import type { ProfileData } from '../../services/profileService';

const cardSx = { borderRadius: 2 };
const cardContentSx = { p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } };

interface ContactCardProps {
  user: ProfileData['user'];
}

interface PaymentCardProps {
  booking: ProfileData['booking'];
  payment: ProfileData['payment'];
  paymentSubject: string;
  onCopySubject: () => void;
  onPayPalClick: () => void;
}

interface BookingSummaryCardProps {
  booking: ProfileData['booking'];
}

interface SummaryTileProps {
  label: string;
  title: string;
  price?: number;
  extra?: string;
}

const SummaryTile: React.FC<SummaryTileProps> = ({ label, title, price, extra }) => (
  <Box sx={{ px: 1, py: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight="bold">
      {title}
    </Typography>
    {typeof price === 'number' && (
      <Typography variant="body2" color="text.secondary">
        {price.toFixed(2)} €
      </Typography>
    )}
    {extra && (
      <Typography variant="body2" color="text.secondary">
        {extra}
      </Typography>
    )}
  </Box>
);

export const ProfileContactCard: React.FC<ContactCardProps> = ({ user }) => (
  <Card variant="outlined" sx={cardSx}>
    <CardContent sx={cardContentSx}>
      <Typography variant="h6" gutterBottom color="primary">
        Kontaktinformationen
      </Typography>
      <Typography variant="body1">
        {user.first_name} {user.last_name}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="body1">{user.email}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="body1">{user.phone_number || 'Nicht angegeben'}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Typ:
        </Typography>
        <Chip
          label={user.is_artist ? 'Artist' : 'Regular'}
          size="small"
          color={user.is_artist ? 'secondary' : 'primary'}
        />
      </Box>
    </CardContent>
  </Card>
);

export const ProfilePaymentCard: React.FC<PaymentCardProps> = ({
  booking,
  payment,
  paymentSubject,
  onCopySubject,
  onPayPalClick,
}) => (
  <Card variant="outlined" sx={cardSx}>
    <CardContent sx={cardContentSx}>
      <Typography variant="h6" gutterBottom color="primary">
        Zahlungsstatus
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {payment.is_paid ? (
          <>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="body1" color="success.main" fontWeight="bold">
              Bezahlt
            </Typography>
          </>
        ) : (
          <>
            <PendingIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="body1" color="warning.main" fontWeight="bold">
              Ausstehend
            </Typography>
          </>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={1}>
        <Grid size={6}>
          <Typography variant="body2" color="text.secondary">
            Gesamtbetrag:
          </Typography>
        </Grid>
        <Grid size={6}>
          <Typography variant="body2" fontWeight="bold">
            {booking.total_price.toFixed(2)} €
          </Typography>
        </Grid>

        {payment.paid_amount > 0 && (
          <>
            <Grid size={6}>
              <Typography variant="body2" color="text.secondary">
                Gezahlt:
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2" fontWeight="bold">
                {payment.paid_amount.toFixed(2)} €
              </Typography>
            </Grid>
          </>
        )}

        {payment.payment_date && (
          <>
            <Grid size={6}>
              <Typography variant="body2" color="text.secondary">
                Zahlungsdatum:
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2">
                {new Date(payment.payment_date).toLocaleDateString('de-DE')}
              </Typography>
            </Grid>
          </>
        )}
      </Grid>

      {payment.payment_notes && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">{payment.payment_notes}</Typography>
        </Alert>
      )}

      {!payment.is_paid && (
        <Box
          sx={{
            mt: 2.5,
            p: 2,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Betreff fuer die Zahlung
          </Typography>
          <TextField
            value={paymentSubject}
            fullWidth
            size="small"
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="Betreff kopieren" edge="end" onClick={onCopySubject}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Beim Klick auf PayPal wird der Betreff automatisch kopiert.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            startIcon={<OpenInNewIcon />}
            onClick={onPayPalClick}
            sx={{ mt: 1.5, textTransform: 'none' }}
          >
            Zu PayPal
          </Button>
        </Box>
      )}
    </CardContent>
  </Card>
);

export const ProfileBookingSummaryCard: React.FC<BookingSummaryCardProps> = ({ booking }) => (
  <Card variant="outlined" sx={cardSx}>
    <CardContent sx={cardContentSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ConfirmationNumberIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" color="primary">
          Buchungs-Zusammenfassung
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {booking.ticket && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryTile label="Ticket" title={booking.ticket.title} price={booking.ticket.price} />
          </Grid>
        )}

        {booking.food && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryTile label="Essen" title={booking.food.title} price={booking.food.price} />
          </Grid>
        )}

        {booking.beverage && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryTile
              label="Getraenke"
              title={booking.beverage.title}
              price={booking.beverage.price}
            />
          </Grid>
        )}

        {booking.amount_shifts !== undefined && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryTile
              label="Schichten"
              title={`${booking.amount_shifts} Schicht${booking.amount_shifts !== 1 ? 'en' : ''}`}
              extra={booking.supporter_buddy ? `Mit: ${booking.supporter_buddy}` : undefined}
            />
          </Grid>
        )}
      </Grid>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Buchung vom:{' '}
        {new Date(booking.timestamp).toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Typography>
    </CardContent>
  </Card>
);
