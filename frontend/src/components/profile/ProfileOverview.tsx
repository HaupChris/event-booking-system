/**
 * Profile Overview
 * ================
 * Dashboard showing key profile information and payment status
 */

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import type { ProfileData } from '../../services/profileService';
import BookingDetails from './BookingDetails';

interface ProfileOverviewProps {
  profile: ProfileData;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ profile }) => {
  const { user, booking, payment } = profile;
  const cardSx = { borderRadius: 2 };
  const cardContentSx = { p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } };
  console.log(booking);

  return (
    <Box>
      <Typography variant="h5" color={"text.primary"} sx={{ mb: 2 }}>
        Profil Übersicht
      </Typography>

      <Grid container spacing={3}>
        {/* User Info */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={cardSx}>
            <CardContent sx={cardContentSx}>
              <Typography variant="h6" gutterBottom color="primary">
                Kontaktinformationen
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
                  label={user.is_artist ? 'Künstler' : 'Regular'}
                  size="small"
                  color={user.is_artist ? 'secondary' : 'primary'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Status */}
        <Grid item xs={12} md={6}>
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
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Gesamtbetrag:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight="bold">
                    {booking.total_price.toFixed(2)} €
                  </Typography>
                </Grid>

                {payment.paid_amount > 0 && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Gezahlt:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="bold">
                        {payment.paid_amount.toFixed(2)} €
                      </Typography>
                    </Grid>
                  </>
                )}

                {payment.payment_date && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Zahlungsdatum:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Summary */}
        <Grid item xs={12}>
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
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ px: 1, py: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Ticket
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {booking.ticket.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.ticket.price.toFixed(2)} €
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {booking.food && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ px: 1, py: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Essen
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {booking.food.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.food.price.toFixed(2)} €
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {booking.beverage && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ px: 1, py: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Getränke
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {booking.beverage.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.beverage.price.toFixed(2)} €
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {booking.amount_shifts !== undefined && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ px: 1, py: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Schichten
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {booking.amount_shifts} Schicht{booking.amount_shifts !== 1 ? 'en' : ''}
                      </Typography>
                      {booking.supporter_buddy && (
                        <Typography variant="body2" color="text.secondary">
                          Mit: {booking.supporter_buddy}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Buchung vom: {new Date(booking.timestamp).toLocaleDateString('de-DE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Typography color="text.primary" variant="h6" sx={{ mb: 2 }}>
            Weitere Buchungsdetails
          </Typography>
          <BookingDetails profile={profile} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileOverview;
