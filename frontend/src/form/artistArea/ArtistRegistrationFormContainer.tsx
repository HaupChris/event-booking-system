import React from 'react';
import type { ArtistBooking, ArtistFormContent } from './interface';
import { artistAreaTexts } from '../constants/texts';
import { calculateTotalPriceArtist } from '../../components/core/utils/Pricing';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateRequiredSelect,
  validateRequiredText,
  validateSignature,
} from '../../utils/validationRules';
import { RegistrationFormContainer } from '../../components/core/forms/RegistrationFormContainer';
import ArtistPersonalDetailsForm from './ArtistPersonalDetailsForm';
import ArtistTicketSelectionForm from './ArtistTicketSelectionForm';
import ArtistBeverageSelectionForm from './ArtistBeverageSelectionForm';
import ArtistMaterialsForm from './ArtistMaterialsForm';
import ArtistSignatureForm from './ArtistSignatureForm';
import ArtistSummaryForm from './ArtistSummaryForm';
import ArtistConfirmationForm from './ArtistConfirmationForm';
import ArtistPerformanceForm from './ArtistPerformanceForm';
import ArtistFoodSelectionForm from './ArtistFoodSelectionForm';
import ArtistEquipmentForm from './ArtistEquipmentForm';

enum FormSteps {
  PersonalDetails = 0,
  PerformanceDetails = 1,
  Ticket = 2,
  Beverage = 3,
  Food = 4,
  Materials = 5,
  TechnicalRequirements = 6,
  Signature = 7,
  Summary = 8,
  Confirmation = 9,
}

function getEmptyArtistBooking(): ArtistBooking {
  return {
    last_name: '',
    first_name: '',
    email: '',
    phone: '',
    ticket_id: -1,
    beverage_id: -1,
    food_id: -1,
    artist_material_ids: [],
    total_price: 0,
    signature: '',
    is_paid: false,
    paid_amount: 0,
    payment_notes: '',
    payment_date: '',
    equipment: '',
    special_requests: '',
    performance_details: '',
    profession_ids: [],
  };
}

export function getDummyArtistFormContent(): ArtistFormContent {
  return {
    ticket_options: [
      {
        id: 1,
        title: 'Option 1',
        price: -1,
        amount: 10,
        num_booked: 5,
      },
      {
        id: 2,
        title: 'Option 2',
        price: -1,
        amount: 5,
        num_booked: 2,
      },
    ],
    beverage_options: [
      {
        id: 1,
        title: 'Option 1',
        description: '',
        price: -1,
        num_booked: 5,
      },
    ],
    food_options: [
      {
        id: 1,
        title: 'Option 1',
        description: '',
        price: -1,
        num_booked: 5,
      },
    ],
    artist_materials: [],
    professions: [],
  };
}

export interface ArtistFormProps {
  updateBooking: (key: keyof ArtistBooking, value: unknown) => void;
  currentBooking: ArtistBooking;
  formValidation: { [key in keyof ArtistBooking]?: string };
  formContent: ArtistFormContent;
}

export interface ArtistBookingState {
  isSubmitted: boolean;
  isSubmitting: boolean;
  isSuccessful: boolean;
}

// Define validation rules using shared validators
const validationRules = {
  first_name: (value: string) => validateName(value, 'first_name'),
  last_name: (value: string) => validateName(value, 'last_name'),
  email: validateEmail,
  phone: validatePhone,
  ticket_id: (value: number) => validateRequiredSelect(value, 'ein Ticket'),
  performance_details: (value: string) => validateRequiredText(value, 'Details zu deinem Auftritt'),
  signature: validateSignature,
};

export function ArtistRegistrationFormContainer() {
  return (
    <RegistrationFormContainer
      config={{
        // Type factories
        getEmptyBooking: getEmptyArtistBooking,
        getDummyFormContent: getDummyArtistFormContent,

        // API configuration
        apiEndpoints: {
          formContent: '/api/artist/formcontent',
          submitForm: '/api/artist/submitForm',
        },

        // Storage configuration
        storageConfig: {
          storageKey: 'artistBooking',
          versionKey: 'artistFormVersion',
          currentVersion: '1.0',
        },

        // Validation and form configuration
        validationRules,
        stepTitles: {
          [FormSteps.PersonalDetails]: artistAreaTexts.personalDetailsForm.title,
          [FormSteps.PerformanceDetails]: artistAreaTexts.performanceDetailsForm.title,
          [FormSteps.Ticket]: artistAreaTexts.ticketSelectionForm.title,
          [FormSteps.Beverage]: artistAreaTexts.beverageSelectionForm.title,
          [FormSteps.Food]: artistAreaTexts.foodSelectionForm.title,
          [FormSteps.Materials]: artistAreaTexts.materialsForm.title,
          [FormSteps.TechnicalRequirements]: artistAreaTexts.technicalRequirementsForm.title,
          [FormSteps.Signature]: artistAreaTexts.signatureForm.title,
          [FormSteps.Summary]: artistAreaTexts.summaryForm.title,
          [FormSteps.Confirmation]: artistAreaTexts.confirmationForm.initialView.title,
        },
        requiredFields: {
          [FormSteps.PersonalDetails]: ['last_name', 'first_name', 'email', 'phone'],
          [FormSteps.PerformanceDetails]: ['performance_details'],
          [FormSteps.Ticket]: ['ticket_id'],
          [FormSteps.Beverage]: [],
          [FormSteps.Food]: [],
          [FormSteps.Materials]: [],
          [FormSteps.TechnicalRequirements]: [],
          [FormSteps.Signature]: ['signature'],
          [FormSteps.Summary]: [],
          [FormSteps.Confirmation]: [],
        },

        // Step components mapping
        stepComponents: {
          [FormSteps.PersonalDetails]: ArtistPersonalDetailsForm,
          [FormSteps.PerformanceDetails]: ArtistPerformanceForm,
          [FormSteps.Ticket]: ArtistTicketSelectionForm,
          [FormSteps.Beverage]: ArtistBeverageSelectionForm,
          [FormSteps.Food]: ArtistFoodSelectionForm,
          [FormSteps.Materials]: ArtistMaterialsForm,
          [FormSteps.TechnicalRequirements]: ArtistEquipmentForm,
          [FormSteps.Signature]: ArtistSignatureForm,
          [FormSteps.Summary]: ArtistSummaryForm,
          [FormSteps.Confirmation]: ArtistConfirmationForm,
        },

        // Pricing configuration
        calculateTotalPrice: calculateTotalPriceArtist,
        priceDependencies: ['beverage_id', 'food_id', 'ticket_id'],

        // Metadata
        maxSteps: Object.keys(FormSteps).length / 2,
      }}
    />
  );
}
