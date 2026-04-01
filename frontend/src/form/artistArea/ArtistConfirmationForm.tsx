import React, { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { SignalCellularNodata } from '@mui/icons-material';
import type { ArtistBooking, ArtistFormContent } from './interface';
import type { ArtistBookingState } from './ArtistRegistrationFormContainer';
import { useThemeMode } from '../../components/styles/theme';
import ArtistConfirmationInitialView from './confirmation/ArtistConfirmationInitialView';
import ArtistConfirmationSuccessView from './confirmation/ArtistConfirmationSuccessView';
import ArtistConfirmationErrorView from './confirmation/ArtistConfirmationErrorView';
import { resolvePaymentLink } from '../../utils/paymentLink';
import { circusButtonSx, circusSectionCardSx } from './confirmation/styles';

interface ArtistConfirmationProps {
  booking: ArtistBooking;
  submitBooking: () => void;
  formContent: ArtistFormContent;
  bookingState: ArtistBookingState;
}

function findItemById<T extends { id: number }>(array: T[], id: number): T | undefined {
  return array.find((item) => item.id === id);
}

function ArtistConfirmationForm(props: ArtistConfirmationProps) {
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';
  const sectionCardSx = isCircusMode ? circusSectionCardSx : undefined;
  const buttonSx = isCircusMode ? circusButtonSx : undefined;

  const paymentLink = resolvePaymentLink(props.formContent.payment_link);
  const ticket = findItemById(props.formContent.ticket_options, props.booking.ticket_id);
  const beverage = findItemById(props.formContent.beverage_options, props.booking.beverage_id) || {
    title: 'Keine Bierflat',
  };
  const food = findItemById(props.formContent.food_options, props.booking.food_id) || {
    title: 'Kein Essen',
  };
  const bandMembers = props.booking.band_members ?? [];
  const isBand = props.booking.artist_type === 'band' && bandMembers.length > 0;
  const betreff = isBand
    ? `WWWW ARTIST BAND: ${props.booking.last_name}, ${props.booking.first_name} + ${bandMembers.length} - Gesamt ${props.booking.total_price}€`
    : `WWWW ARTIST: ${props.booking.last_name}, ${props.booking.first_name} - ${ticket?.title || 'Ticket nicht gefunden'} - ${beverage.title} - ${food.title} - ${props.booking.total_price}€`;

  const [copied, setCopied] = useState(false);
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [submissionAttempted, setSubmissionAttempted] = useState(false);

  useEffect(() => {
    function updateOnlineStatus() {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (!redirecting) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown === 1) {
          window.clearInterval(timer);
          window.open(paymentLink, '_blank');
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [paymentLink, redirecting]);

  const handleCopy = () => {
    navigator.clipboard.writeText(betreff).then();
    setCopied(true);
  };

  const handleSubmit = () => {
    setSubmissionAttempted(true);
    if (isOnline) {
      props.submitBooking();
      return;
    }

    setOfflineOpen(true);
  };

  const handleRetry = () => {
    setSubmissionAttempted(false);
    window.setTimeout(() => {
      handleSubmit();
    }, 500);
  };

  const handlePaypalClick = () => {
    handleCopy();
    setCountdown(5);
    setRedirecting(true);
  };

  if (props.bookingState.isSubmitted && props.bookingState.isSuccessful) {
    return (
      <ArtistConfirmationSuccessView
        totalPrice={props.booking.total_price}
        betreff={betreff}
        copied={copied}
        redirecting={redirecting}
        countdown={countdown}
        paymentLink={paymentLink}
        onCopy={handleCopy}
        onPaypalClick={handlePaypalClick}
        onCloseCopied={() => setCopied(false)}
        onCloseRedirect={() => setRedirecting(false)}
        isCircusMode={isCircusMode}
        sectionCardSx={sectionCardSx}
        buttonSx={buttonSx}
        profileUuid={props.booking.profile_uuid ?? ''}
        profileUuids={props.booking.profile_uuids ?? []}
      />
    );
  }

  if (props.bookingState.isSubmitted && !props.bookingState.isSuccessful) {
    return (
      <ArtistConfirmationErrorView
        onRetry={handleRetry}
        sectionCardSx={sectionCardSx}
        buttonSx={buttonSx}
      />
    );
  }

  return (
    <>
      <ArtistConfirmationInitialView
        totalPrice={props.booking.total_price}
        isOnline={isOnline}
        isSubmitting={props.bookingState.isSubmitting}
        submissionAttempted={submissionAttempted}
        onSubmit={handleSubmit}
        isCircusMode={isCircusMode}
        sectionCardSx={sectionCardSx}
        buttonSx={buttonSx}
      />

      <Snackbar
        open={offlineOpen}
        autoHideDuration={6000}
        onClose={() => setOfflineOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOfflineOpen(false)}
          severity="error"
          icon={<SignalCellularNodata />}
          variant="filled"
        >
          Du bist gerade offline. Bitte stelle sicher, dass du mit dem Internet verbunden bist und
          versuche es erneut.
        </Alert>
      </Snackbar>
    </>
  );
}

export default ArtistConfirmationForm;
