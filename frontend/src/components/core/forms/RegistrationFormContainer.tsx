/**
 * Generic registration form container that handles multi-step form flow.
 * Consolidates logic from UserRegistrationFormContainer and ArtistRegistrationFormContainer.
 */

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Box, CardContent, Typography } from '@mui/material';
import { AuthContext, TokenContext } from '../../../contexts/AuthContext';
import axios from 'axios';
import StepNavigation from '../navigation/StepNavigation';
import { useFormManagement } from '../../../hooks/useFormManagement';
import taenzerinImage from '../../../img/taenzerin.png';
import { useBrandingPack } from '../../../branding/useBrandingPack';

/**
 * Configuration for the registration form container
 */
export interface RegistrationFormConfig<
  TBooking extends object,
  TFormContent extends object,
  _TFormSteps extends number = number,
> {
  // Type factories
  getEmptyBooking: () => TBooking;
  getDummyFormContent: () => TFormContent;

  // API configuration
  apiEndpoints: {
    formContent: string;
    submitForm: string;
  };

  // Storage configuration
  storageConfig: {
    storageKey: string;
    versionKey: string;
    currentVersion: string;
  };

  // Validation and form configuration
  validationRules: { [K in keyof Partial<TBooking>]: (value: TBooking[K]) => string };
  validateStep?: (activeStep: number, booking: TBooking, formContent: TFormContent) => string;
  stepTitles: { [key: number]: string };
  requiredFields: { [key: number]: (keyof TBooking)[] };

  // Step components mapping
  stepComponents: {
    [key: number]: React.ElementType;
  };

  // Pricing configuration
  calculateTotalPrice: (booking: TBooking, formContent: TFormContent) => number;
  priceDependencies: (keyof TBooking)[];

  // Optional development seeding helper
  getDevSeedData?: (formContent: TFormContent, booking: TBooking) => Partial<TBooking>;

  // Metadata
  maxSteps: number;
}

/**
 * Booking state interface
 */
export interface BookingState {
  isSubmitted: boolean;
  isSubmitting: boolean;
  isSuccessful: boolean;
}

/**
 * Generic registration form container props
 */
interface RegistrationFormContainerProps<
  TBooking extends object,
  TFormContent extends object,
  TFormSteps extends number,
> {
  config: RegistrationFormConfig<TBooking, TFormContent, TFormSteps>;
}

/**
 * Generic registration form container component
 */
export function RegistrationFormContainer<
  TBooking extends object,
  TFormContent extends object,
  TFormSteps extends number,
>({ config }: RegistrationFormContainerProps<TBooking, TFormContent, TFormSteps>) {
  const brandingPack = useBrandingPack();

  // Use form management hook
  const {
    formState: booking,
    validation: formValidation,
    currentError,
    setCurrentError,
    updateField,
    activeStep,
    handleNext,
    handlePrevious,
  } = useFormManagement<TBooking>({
    initialState: config.getEmptyBooking(),
    validationRules: config.validationRules,
    storageKey: config.storageConfig.storageKey,
    versionKey: config.storageConfig.versionKey,
    currentVersion: config.storageConfig.currentVersion,
  });

  const [formContent, setFormContent] = useState<TFormContent>(config.getDummyFormContent());
  const [bookingState, setBookingState] = useState<BookingState>({
    isSubmitted: false,
    isSubmitting: false,
    isSuccessful: false,
  });

  const { token, setToken } = useContext(TokenContext);
  const { setAuth } = useContext(AuthContext);

  // Fetch form content from API
  useEffect(() => {
    axios
      .get(config.apiEndpoints.formContent, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setFormContent(response.data);
        setCurrentError('');
      })
      .catch((error) => {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status === 401) {
          setAuth(false);
          setToken('');
          return;
        }

        setCurrentError('Server nicht erreichbar. Bitte pruefe, ob das Backend laeuft.');
      });
  }, [config.apiEndpoints.formContent, setAuth, setCurrentError, setToken, token]);

  // Calculate total price when dependencies change
  useEffect(() => {
    const total_price = config.calculateTotalPrice(booking, formContent);

    const currentTotalPrice = (booking as Record<string, unknown>).total_price;
    if (currentTotalPrice === total_price) {
      return;
    }

    updateField(
      'total_price' as keyof TBooking,
      total_price as unknown as TBooking[keyof TBooking]
    );
  }, [booking, config, formContent, updateField]);

  const handleStepNext = () => {
    const customStepError = config.validateStep?.(activeStep, booking, formContent);
    if (customStepError) {
      setCurrentError(customStepError);
      return;
    }

    handleNext(config.requiredFields[activeStep]);
  };

  const updateBooking = useCallback(
    (key: keyof TBooking, value: TBooking[keyof TBooking]) => {
      updateField(key, value);
    },
    [updateField]
  );

  const handleDevSeedForm = useCallback(() => {
    if (!config.getDevSeedData) {
      return;
    }

    const seededData = config.getDevSeedData(formContent, booking);
    Object.entries(seededData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateField(key as keyof TBooking, value as TBooking[keyof TBooking]);
      }
    });
    setCurrentError('');
  }, [booking, config, formContent, setCurrentError, updateField]);

  // Submit booking
  const submitBooking = () => {
    setBookingState((prevState) => ({ ...prevState, isSubmitting: true }));

    axios
      .post(config.apiEndpoints.submitForm, booking, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const profileUuid =
          typeof response.data?.profile_uuid === 'string' ? response.data.profile_uuid : '';
        const profileUuids = Array.isArray(response.data?.profile_uuids)
          ? response.data.profile_uuids.filter(
              (uuid: unknown): uuid is string => typeof uuid === 'string' && uuid.trim().length > 0
            )
          : [];

        if (profileUuid) {
          updateField(
            'profile_uuid' as keyof TBooking,
            profileUuid as unknown as TBooking[keyof TBooking]
          );
        }

        if (profileUuids.length > 0) {
          updateField(
            'profile_uuids' as keyof TBooking,
            profileUuids as unknown as TBooking[keyof TBooking]
          );
        }

        setBookingState({
          isSuccessful: true,
          isSubmitting: false,
          isSubmitted: true,
        });

        // Auto logout after an hour
        setTimeout(
          () => {
            setToken('');
            setAuth(false);
          },
          1000 * 60 * 60
        );
      })
      .catch((error) => {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;

        if (status === 401) {
          setToken('');
          setAuth(false);
        } else {
          setBookingState({
            isSuccessful: false,
            isSubmitted: true,
            isSubmitting: false,
          });
          setCurrentError(
            'Absenden fehlgeschlagen. Bitte pruefe die Serververbindung und versuche es erneut.'
          );
        }
      });
  };

  // Render the current step's component
  const renderCurrentStep = () => {
    const StepComponent = config.stepComponents[activeStep];

    if (!StepComponent) {
      return null;
    }

    // Check if component needs form props
    const componentName =
      typeof StepComponent === 'string'
        ? StepComponent
        : (StepComponent as { displayName?: string; name?: string }).displayName ||
          (StepComponent as { displayName?: string; name?: string }).name ||
          '';
    const needsFormProps =
      !componentName?.includes('Confirmation') &&
      !componentName?.includes('Summary') &&
      !componentName?.includes('AwarenessCode');

    if (needsFormProps) {
      return (
        <StepComponent
          updateBooking={updateBooking}
          currentBooking={booking}
          formValidation={formValidation}
          formContent={formContent}
          onDevSeedForm={activeStep === 0 ? handleDevSeedForm : undefined}
        />
      );
    } else {
      // Special handling for confirmation, summary, and awareness code forms
      // Pass all possible props and let the component use what it needs
      const SpecialComponent = StepComponent as React.ComponentType<{
        currentBooking: TBooking;
        booking: TBooking;
        formContent: TFormContent;
        submitBooking: () => void;
        bookingState: BookingState;
      }>;
      return (
        <SpecialComponent
          currentBooking={booking}
          booking={booking}
          formContent={formContent}
          submitBooking={submitBooking}
          bookingState={bookingState}
        />
      );
    }
  };

  return (
    <Box sx={{ padding: '8px' }}>
      <StepNavigation
        activeStep={activeStep}
        maxSteps={config.maxSteps}
        progressImage={taenzerinImage}
        hideNavigation={bookingState.isSubmitted}
        onNext={handleStepNext}
        onPrevious={handlePrevious}
      />
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {config.stepTitles[activeStep] && (
            <Typography
              color="text.primary"
              align="center"
              variant="h4"
              sx={{ paddingBottom: '1em', fontFamily: brandingPack.typography.display }}
            >
              {config.stepTitles[activeStep]}
            </Typography>
          )}

          {currentError && (
            <Alert variant="outlined" severity="error" sx={{ my: 2 }}>
              {currentError}
            </Alert>
          )}

          {renderCurrentStep()}
        </Box>
      </CardContent>
    </Box>
  );
}
