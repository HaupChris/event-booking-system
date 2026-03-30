import React from "react";
import type {Booking, FormContent} from "./interface";
import {userAreaTexts} from "../constants/texts";
import {calculateTotalPriceUser} from "../../components/core/utils/Pricing";
import {
    validateName,
    validateEmail,
    validatePhone,
    validateRequiredSelect,
    validateSignature,
    validateTimeslotPriority
} from "../../utils/validationRules";
import {RegistrationFormContainer} from "../../components/core/forms/RegistrationFormContainer";
import PersonalDetailsForm from "./PersonalDetailsForm";
import SummaryForm from "./SummaryForm";
import ConfirmationForm from "./confirmation/index";
import FoodSelectionForm from "./FoodSelectionForm";
import AwarenessCodeForm from "./AwarenessCodeForm";
import TicketForm from "./TicketSelectionForm";
import BeverageSelectionForm from "./BeverageSelectionForm";
import WorkShiftForm from "./WorkshiftsForm";
import MaterialsForm from "./MaterialsForm";
import SignatureForm from "./SignatureForm";

// Form steps enum
enum FormSteps {
    NameAndAddress = 0,
    Ticket = 1,
    Beverage = 2,
    Food = 3,
    Workshift = 4,
    Material = 5,
    AwarenessCode = 6,
    Signature = 7,
    Summary = 8,
    Confirmation = 9,
}

// Empty booking initializer
function getEmptyBooking(): Booking {
    return {
        last_name: "",
        first_name: "",
        email: "",
        phone: "",
        ticket_id: -1,
        beverage_id: -1,
        food_id: -1,
        timeslot_priority_1: -1,
        timeslot_priority_2: -1,
        timeslot_priority_3: -1,
        material_ids: [],
        amount_shifts: 1,
        supporter_buddy: "",
        total_price: -1.0,
        signature: "",
        is_paid: false,
        paid_amount: 0,
        payment_date: "",
        payment_notes: "",
        profile_uuid: "",
        profession_ids: []
    }
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
                description: "",
                price: -1,
                num_booked: 5,
            },
        ],
        food_options: [
            {
                id: 1,
                title: 'Option 1',
                description: "",
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
        professions: []
    };
}

// Form props interface
export interface FormProps {
    updateBooking: (key: keyof Booking, value: unknown) => void;
    currentBooking: Booking;
    formValidation: { [key in keyof Booking]?: string };
    formContent: FormContent;
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
    ticket_id: (value: number) => validateRequiredSelect(value, 'ein Ticket'),
    timeslot_priority_1: validateTimeslotPriority,
    timeslot_priority_2: validateTimeslotPriority,
    timeslot_priority_3: validateTimeslotPriority,
    signature: validateSignature
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
                    submitForm: '/api/submitForm'
                },

                // Storage configuration
                storageConfig: {
                    storageKey: 'booking',
                    versionKey: 'formVersion',
                    currentVersion: '1.3'
                },

                // Validation and form configuration
                validationRules,
                stepTitles: {
                    [FormSteps.NameAndAddress]: userAreaTexts.personalDetailsForm.title,
                    [FormSteps.Ticket]: userAreaTexts.ticketSelectionForm.title,
                    [FormSteps.Beverage]: userAreaTexts.beverageSelectionForm.title,
                    [FormSteps.Food]: userAreaTexts.foodSelectionForm.title,
                    [FormSteps.Workshift]: userAreaTexts.workshiftsForm.title,
                    [FormSteps.Material]: userAreaTexts.materialsForm.title,
                    [FormSteps.AwarenessCode]: userAreaTexts.awarenessCodeForm.title,
                    [FormSteps.Signature]: userAreaTexts.signatureForm.title,
                    [FormSteps.Summary]: userAreaTexts.summaryForm.title,
                    [FormSteps.Confirmation]: userAreaTexts.confirmationForm.initialView.title
                },
                requiredFields: {
                    [FormSteps.NameAndAddress]: ['last_name', 'first_name', 'email', 'phone'],
                    [FormSteps.Ticket]: ['ticket_id'],
                    [FormSteps.Beverage]: [],
                    [FormSteps.Food]: [],
                    [FormSteps.Workshift]: ['timeslot_priority_1', 'timeslot_priority_2', 'timeslot_priority_3', 'amount_shifts'],
                    [FormSteps.Material]: [],
                    [FormSteps.Signature]: ['signature'],
                    [FormSteps.AwarenessCode]: [],
                    [FormSteps.Summary]: [],
                    [FormSteps.Confirmation]: [],
                },

                // Step components mapping
                stepComponents: {
                    [FormSteps.NameAndAddress]: PersonalDetailsForm,
                    [FormSteps.Ticket]: TicketForm,
                    [FormSteps.Beverage]: BeverageSelectionForm,
                    [FormSteps.Food]: FoodSelectionForm,
                    [FormSteps.Workshift]: WorkShiftForm,
                    [FormSteps.Material]: MaterialsForm,
                    [FormSteps.AwarenessCode]: AwarenessCodeForm,
                    [FormSteps.Signature]: SignatureForm,
                    [FormSteps.Summary]: SummaryForm,
                    [FormSteps.Confirmation]: ConfirmationForm
                },

                // Pricing configuration
                calculateTotalPrice: calculateTotalPriceUser,
                priceDependencies: ['beverage_id', 'food_id', 'ticket_id', 'amount_shifts'],

                // Metadata
                maxSteps: Object.keys(FormSteps).length / 2
            }}
        />
    );
}
