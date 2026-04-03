/**
 * Profile Overview
 * ================
 * Dashboard showing key profile information and payment status
 */

import React, { useCallback, useState } from 'react';
import { Alert, Box, Grid, Snackbar, Typography } from '@mui/material';
import type { ProfileData } from '../../services/profileService';
import BookingDetails from './BookingDetails';
import { resolvePaymentLink } from '../../utils/paymentLink';
import { createPaymentSubject } from '../../utils/paymentSubject';
import MissionHeading from '../core/display/MissionHeading';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import {
  ProfileBookingSummaryCard,
  ProfileContactCard,
  ProfilePaymentCard,
} from './ProfileOverviewSections';
import { useThemeMode } from '../styles/theme';
import { useBrandingPack } from '../../branding/useBrandingPack';

interface ProfileOverviewProps {
  profile: ProfileData;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ profile }) => {
  const { user, booking, payment } = profile;
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';
  const [copied, setCopied] = useState(false);
  const paymentLink = resolvePaymentLink(profile.payment_link);

  const paymentSubject = createPaymentSubject({
    firstName: user.first_name,
    lastName: user.last_name,
    ticketTitle: booking.ticket?.title || 'Ticket nicht gefunden',
    beverageTitle: booking.beverage?.title || 'Keine Bierflat',
    foodTitle: booking.food?.title || 'Kein Essen',
    totalPrice: booking.total_price,
  });

  const handleCopySubject = useCallback(() => {
    navigator.clipboard
      .writeText(paymentSubject)
      .then(() => setCopied(true))
      .catch(() => undefined);
  }, [paymentSubject]);

  const handlePayPalClick = useCallback(() => {
    handleCopySubject();
    window.open(paymentLink, '_blank', 'noopener,noreferrer');
  }, [handleCopySubject, paymentLink]);

  const handleCopiedClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setCopied(false);
  };

  return (
    <Box sx={{ pb: 0.5 }}>
      <MissionHeading
        title="Profil Uebersicht"
        subtitle="Deine wichtigsten Daten, Zahlungen und Buchungsdetails"
        icon={<AccountBoxIcon />}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProfileContactCard user={user} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ProfilePaymentCard
            booking={booking}
            payment={payment}
            paymentSubject={paymentSubject}
            onCopySubject={handleCopySubject}
            onPayPalClick={handlePayPalClick}
          />
        </Grid>

        <Grid size={12}>
          <ProfileBookingSummaryCard booking={booking} />
        </Grid>

        <Grid size={12}>
          <Typography
            color="text.primary"
            variant="h6"
            sx={{
              mb: 2,
              mt: 1,
              fontFamily: isCircusMode ? brandingPack.typography.heading : undefined,
            }}
          >
            Weitere Buchungsdetails
          </Typography>
          <BookingDetails profile={profile} />
        </Grid>
      </Grid>

      <Snackbar
        open={copied}
        autoHideDuration={3500}
        onClose={handleCopiedClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCopiedClose} severity="success" variant="filled">
          Betreff wurde in die Zwischenablage kopiert
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileOverview;
