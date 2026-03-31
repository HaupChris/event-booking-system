import React from 'react';
import type { Booking, FormContent } from './interface';
import { userAreaTexts } from '../constants/texts';
import { calculateTotalPriceUser } from '../../components/core/utils/Pricing';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateRequiredSelect,
  validateSignature,
  validateTimeslotPriority,
} from '../../utils/validationRules';
import { RegistrationFormContainer } from '../../components/core/forms/RegistrationFormContainer';
import PersonalDetailsForm from './PersonalDetailsForm';
import SummaryForm from './SummaryForm';
import ConfirmationForm from './confirmation/index';
import FoodSelectionForm from './FoodSelectionForm';
import AwarenessCodeForm from './AwarenessCodeForm';
import TicketForm from './TicketSelectionForm';
import BeverageSelectionForm from './BeverageSelectionForm';
import WorkShiftForm from './WorkshiftsForm';
import MaterialsForm from './MaterialsForm';
import SignatureForm from './SignatureForm';
import TestDesignFormStep from './TestDesignFormStep';

const DEV_SIGNATURE_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2w0WQAAAAASUVORK5CYII=';

const getFirstId = <T extends { id: number }>(options: T[]): number => {
  return options.length > 0 ? options[0].id : -1;
};

const getTimeslotPriorities = (formContent: FormContent): [number, number, number] => {
  const selectedIds: number[] = [];

  formContent.work_shifts.forEach((shift) => {
    if (selectedIds.length >= 3) {
      return;
    }

    const maxPerWorkshift = Math.max(1, shift.multiple_selection_possible ?? 1);
    const availableIds = shift.time_slots
      .map((slot) => slot.id)
      .filter((slotId) => !selectedIds.includes(slotId));

    selectedIds.push(...availableIds.slice(0, maxPerWorkshift));
  });

  if (selectedIds.length < 3) {
    const fallbackIds = formContent.work_shifts
      .flatMap((shift) => shift.time_slots.map((slot) => slot.id))
      .filter((slotId) => !selectedIds.includes(slotId));
    selectedIds.push(...fallbackIds);
  }

  if (selectedIds.length === 0) {
    return [-1, -1, -1];
  }

  return [selectedIds[0] ?? -1, selectedIds[1] ?? -1, selectedIds[2] ?? -1];
};

// Form steps enum
enum FormSteps {
  NameAndAddress = 0,
  Test = 1,
  Ticket = 2,
  Beverage = 3,
  Food = 4,
  Workshift = 5,
  Material = 6,
  AwarenessCode = 7,
  Signature = 8,
  Summary = 9,
  Confirmation = 10,
}

// Empty booking initializer
function getEmptyBooking(): Booking {
  return {
    last_name: '',
    first_name: '',
    email: '',
    phone: '',
    invited_by_id: -1,
    ticket_id: -1,
    beverage_id: -1,
    food_id: -1,
    timeslot_priority_1: -1,
    timeslot_priority_2: -1,
    timeslot_priority_3: -1,
    material_ids: [],
    amount_shifts: 1,
    supporter_buddy: '',
    total_price: -1.0,
    signature: '',
    is_paid: false,
    paid_amount: 0,
    payment_date: '',
    payment_notes: '',
    profile_uuid: '',
    profession_ids: [],
  };
}

// Dummy form content for initial render
export function getDummyFormContent(): FormContent {
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
    work_shifts: [
      // ...
    ],
    materials: [
      // ...
    ],
    professions: [],
    orga_inviters: [],
  };
}

// Form props interface
export interface FormProps {
  updateBooking: (key: keyof Booking, value: unknown) => void;
  currentBooking: Booking;
  formValidation: { [key in keyof Booking]?: string };
  formContent: FormContent;
  onDevSeedForm?: () => void;
}

// Booking state interface
export interface BookingState {
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
  invited_by_id: (value: number) => validateRequiredSelect(value, 'eine Person aus dem Orga-Team'),
  ticket_id: (value: number) => validateRequiredSelect(value, 'ein Ticket'),
  timeslot_priority_1: validateTimeslotPriority,
  timeslot_priority_2: validateTimeslotPriority,
  timeslot_priority_3: validateTimeslotPriority,
  signature: validateSignature,
};

export function UserRegistrationFormContainer() {
  return (
    <RegistrationFormContainer
      config={{
        // Type factories
        getEmptyBooking,
        getDummyFormContent,

        // API configuration
        apiEndpoints: {
          formContent: '/api/formcontent',
          submitForm: '/api/submitForm',
        },

        // Storage configuration
        storageConfig: {
          storageKey: 'booking',
          versionKey: 'formVersion',
          currentVersion: '1.5',
        },

        // Validation and form configuration
        validationRules,
        stepTitles: {
          [FormSteps.NameAndAddress]: userAreaTexts.personalDetailsForm.title,
          [FormSteps.Test]: '',
          [FormSteps.Ticket]: userAreaTexts.ticketSelectionForm.title,
          [FormSteps.Beverage]: userAreaTexts.beverageSelectionForm.title,
          [FormSteps.Food]: userAreaTexts.foodSelectionForm.title,
          [FormSteps.Workshift]: userAreaTexts.workshiftsForm.title,
          [FormSteps.Material]: userAreaTexts.materialsForm.title,
          [FormSteps.AwarenessCode]: userAreaTexts.awarenessCodeForm.title,
          [FormSteps.Signature]: userAreaTexts.signatureForm.title,
          [FormSteps.Summary]: userAreaTexts.summaryForm.title,
          [FormSteps.Confirmation]: userAreaTexts.confirmationForm.initialView.title,
        },
        requiredFields: {
          [FormSteps.NameAndAddress]: [
            'last_name',
            'first_name',
            'email',
            'phone',
            'invited_by_id',
          ],
          [FormSteps.Test]: [],
          [FormSteps.Ticket]: ['ticket_id'],
          [FormSteps.Beverage]: [],
          [FormSteps.Food]: [],
          [FormSteps.Workshift]: [
            'timeslot_priority_1',
            'timeslot_priority_2',
            'timeslot_priority_3',
            'amount_shifts',
          ],
          [FormSteps.Material]: [],
          [FormSteps.Signature]: ['signature'],
          [FormSteps.AwarenessCode]: [],
          [FormSteps.Summary]: [],
          [FormSteps.Confirmation]: [],
        },

        // Step components mapping
        stepComponents: {
          [FormSteps.NameAndAddress]: PersonalDetailsForm,
          [FormSteps.Test]: TestDesignFormStep,
          [FormSteps.Ticket]: TicketForm,
          [FormSteps.Beverage]: BeverageSelectionForm,
          [FormSteps.Food]: FoodSelectionForm,
          [FormSteps.Workshift]: WorkShiftForm,
          [FormSteps.Material]: MaterialsForm,
          [FormSteps.AwarenessCode]: AwarenessCodeForm,
          [FormSteps.Signature]: SignatureForm,
          [FormSteps.Summary]: SummaryForm,
          [FormSteps.Confirmation]: ConfirmationForm,
        },

        // Pricing configuration
        calculateTotalPrice: calculateTotalPriceUser,
        priceDependencies: ['beverage_id', 'food_id', 'ticket_id', 'amount_shifts'],
        getDevSeedData: (formContent) => {
          const [timeslotPriority1, timeslotPriority2, timeslotPriority3] =
            getTimeslotPriorities(formContent);
          const timestamp = Date.now();

          return {
            first_name: 'Dev',
            last_name: 'Tester',
            email: `dev.user.${timestamp}@example.com`,
            phone: '01701234567',
            invited_by_id: getFirstId(formContent.orga_inviters),
            ticket_id: getFirstId(formContent.ticket_options),
            beverage_id: getFirstId(formContent.beverage_options),
            food_id: getFirstId(formContent.food_options),
            timeslot_priority_1: timeslotPriority1,
            timeslot_priority_2: timeslotPriority2,
            timeslot_priority_3: timeslotPriority3,
            material_ids:
              formContent.materials.length > 0 ? [formContent.materials[0].id] : ([] as number[]),
            amount_shifts: 1,
            supporter_buddy: 'Dev Buddy',
            signature: DEV_SIGNATURE_IMAGE,
            profession_ids:
              formContent.professions.length > 0
                ? [formContent.professions[0].id]
                : ([] as number[]),
            is_paid: false,
            paid_amount: 0,
            payment_notes: '',
            payment_date: '',
          };
        },

        // Metadata
        maxSteps: Object.keys(FormSteps).length / 2,
      }}
    />
  );
}
