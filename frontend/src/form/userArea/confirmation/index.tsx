import React, { useEffect, useState } from "react";
import { Snackbar, Alert } from '@mui/material';
import { SignalCellularNodata } from "@mui/icons-material";
import { Booking, FormContent } from "../interface";
import { BookingState } from "../UserRegistrationFormContainer";

import InitialView from './InitialView';
import SuccessView from './SuccessView';
import ErrorView from './ErrorView';

interface ConfirmationFormProps {
  currentBooking: Booking;
  submitBooking: () => void;
  formContent: FormContent;
  bookingState: BookingState;
}

function findItemById<T extends { id: number }>(array: T[], id: number): T | undefined {
  return array.find(item => item.id === id);
}

function ConfirmationForm(props: ConfirmationFormProps) {
  const { currentBooking, formContent, bookingState } = props;

  // Get booking details
  const ticket = findItemById(formContent.ticket_options, currentBooking.ticket_id);
  const beverage_or_undefined = findItemById(formContent.beverage_options, currentBooking.beverage_id);
  const beverage = beverage_or_undefined ? beverage_or_undefined : { title: "Keine Bierflat" };
  const food_or_undefined = findItemById(formContent.food_options, currentBooking.food_id);
  const food = food_or_undefined ? food_or_undefined : { title: "Kein Essen" };

  const betreff = `WWWW: ${currentBooking.last_name}, ${currentBooking.first_name} - ${ticket?.title} - ${beverage?.title} - ${food?.title} - ${currentBooking.total_price}€`;

  // State management
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [submissionAttempted, setSubmissionAttempted] = useState(false);

  // Handle online/offline status
  useEffect(() => {
    function updateOnlineStatus() {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    }
  }, []);

  // Handle PayPal redirection countdown
  useEffect(() => {
    if (redirecting) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            clearInterval(timer);
            window.open("https://www.paypal.me/StephanHau", "_blank");
          }
          return prevCountdown - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [redirecting]);

  // Event handlers
  const handleCopy = () => {
    navigator.clipboard.writeText(betreff).then();
    setCopied(true);
  };

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setCopied(false);
  };

  const handleSnackbarClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleSubmitBooking = () => {
    setSubmissionAttempted(true);
    if (isOnline) {
      props.submitBooking();
    } else {
      setOpen(true);
    }
  };

  const handlePaypalClick = () => {
    handleCopy();
    setRedirecting(true);
  };

  const handleRetry = () => {
    setSubmissionAttempted(false);
    setTimeout(() => {
      handleSubmitBooking();
    }, 500);
  };

  // Determine which view to show
  if (bookingState.isSubmitted && bookingState.isSuccessful) {
    return (
      <SuccessView
        totalPrice={currentBooking.total_price}
        betreff={betreff}
        onCopy={handleCopy}
        onPaypalClick={handlePaypalClick}
        redirecting={redirecting}
        setRedirecting={setRedirecting}
        countdown={countdown}
        copied={copied}
        onCloseCopied={handleClose}
      />
    );
  } else if (bookingState.isSubmitted && !bookingState.isSuccessful) {
    return (
      <ErrorView onRetry={handleRetry} />
    );
  } else {
    return (
      <>
        <InitialView
          totalPrice={currentBooking.total_price}
          isOnline={isOnline}
          isSubmitting={bookingState.isSubmitting}
          submissionAttempted={submissionAttempted}
          onSubmit={handleSubmitBooking}
        />
        {/* Offline Snackbar */}
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleSnackbarClose}
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
}

export default ConfirmationForm;