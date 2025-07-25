import React, {useContext, useEffect, useState} from "react";
import {Alert, Box, CardContent, Typography} from "@mui/material";
import {AuthContext, TokenContext} from "../../contexts/AuthContext";
import axios from 'axios';
import PersonalDetailsForm from "./PersonalDetailsForm";
import SummaryForm from "./SummaryForm";
import ConfirmationForm from "./confirmation/index";
import rocketImage from "../../img/rocket.png";
import StepNavigation from "../../components/core/navigation/StepNavigation";
import {useFormManagement} from "../../hooks/useFormManagement";
import {Booking, FormContent} from "./interface";
import {spacePalette} from "../../components/styles/theme";
import FoodSelectionForm from "./FoodSelectionForm";
import AwarenessCodeForm from "./AwarenessCodeForm";
import TicketForm from "./TicketSelectionForm";
import BeverageSelectionForm from "./BeverageSelectionForm";
import WorkShiftForm from "./WorkshiftsForm";
import MaterialsForm from "./MaterialsForm";
import SignatureForm from "./SignatureForm";
import {userAreaTexts} from "../constants/texts";
import {calculateTotalPriceUser} from "../../components/core/utils/Pricing";


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
    updateBooking: (key: keyof Booking, value: any) => void;
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

// Define validation rules
const validationRules = {
    first_name: (value: string) => {
        const pattern = /^[A-Za-zÄÖÜöüß\s]+$/;
        if (value === '') return 'Bitte gib einen Vornamen an';
        if (!pattern.test(value)) return 'Bitte verwende nur Buchstaben für deinen Vornamen';
        return '';
    },
    last_name: (value: string) => {
        const pattern = /^[A-Za-zÄÖÜöüß\s]+$/;
        if (value === '') return 'Bitte gib einen Nachnamen an';
        if (!pattern.test(value)) return 'Bitte verwende nur Buchstaben für deinen Nachnamen';
        return '';
    },
    email: (value: string) => {
        const pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (value === '') return 'Bitte gib eine Email ein';
        if (!pattern.test(value)) return 'Bitte gib eine gültige Email ein.';
        return '';
    },
    phone: (value: string) => {
        const pattern = /^\d{10,15}$/;
        if (value === '') return 'Bitte gib eine Telefonnummer ein';
        if (!pattern.test(value)) return 'Bitte gib eine gültige Telefonnummer ein';
        return '';
    },
    ticket_id: (value: number) => {
        return value === -1 ? 'Bitte wähle ein Ticket aus.' : '';
    },
    timeslot_priority_1: (value: number) => {
        return value === -1 ? 'Bitte gib drei Prioritäten an.' : '';
    },
    timeslot_priority_2: (value: number) => {
        return value === -1 ? 'Bitte gib drei Prioritäten an.' : '';
    },
    timeslot_priority_3: (value: number) => {
        return value === -1 ? 'Bitte gib drei Prioritäten an.' : '';
    },
    signature: (value: string) => {
        return value === '' ? 'Wir würden uns freuen, wenn du das Formular unterschreibst' : '';
    }
};

export function UserRegistrationFormContainer() {
    // Use our new form management hook
    const {
        formState: booking,
        validation: formValidation,
        currentError,
        updateField,
        activeStep,
        handleNext,
        handlePrevious
    } = useFormManagement<Booking>({
        initialState: getEmptyBooking(),
        validationRules,
        storageKey: 'booking',
        versionKey: 'formVersion',
        currentVersion: '1.2'
    });

    const [formContent, setFormContent] = useState<FormContent>(getDummyFormContent());
    const [bookingState, setBookingState] = useState<BookingState>({
        isSubmitted: false,
        isSubmitting: false,
        isSuccessful: false
    });

    const {token, setToken} = useContext(TokenContext);
    const maxSteps = Object.keys(FormSteps).length / 2;
    const {setAuth} = useContext(AuthContext);

    // Step titles
    const stepTitles: { [key: number]: (string) } = {
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
    };

    // Required fields per step
    const requiredFields: { [key: number]: (keyof Booking)[] } = {
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
    };

    // Fetch form content from API
    useEffect(() => {
        axios.get('/api/formcontent', {
                headers: {Authorization: `Bearer ${token}`}
            })
            .then((response) => {
                setFormContent(response.data);
            })
            .catch((error) => {
                // console.error("API error details:", {
                //     status: error.response?.status,
                //     statusText: error.response?.statusText,
                //     data: error.response?.data,
                //     headers: error.response?.headers
                // });
                setAuth(false);
                setToken("");
            });
    }, [setAuth, setToken, token]);

    useEffect(() => {
        // Calculate total price based on selections
        const total_price = calculateTotalPriceUser(booking, formContent);
        console.log(total_price);
        updateField('total_price', total_price);

    }, [booking.beverage_id, booking.food_id, booking.ticket_id, booking.amount_shifts, formContent])

    const handleStepNext = () => {
        handleNext(requiredFields[activeStep]);
    };

    // Update booking with price calculations
    const updateBooking = (key: keyof Booking, value: any) => {
        updateField(key, value);
    };

    // Submit booking
    const submitBooking = () => {
        setBookingState(prevState => ({...prevState, isSubmitting: true}));

        axios.post('/api/submitForm', booking, {
                headers: {Authorization: `Bearer ${token}`}
            })
            .then(() => {
                setBookingState({
                    isSuccessful: true,
                    isSubmitting: false,
                    isSubmitted: true
                });

                // Auto logout after an hour
                setTimeout(() => {
                    setToken("");
                    setAuth(false);
                }, 1000 * 60 * 60);
            })
            .catch((error) => {
                if (error.status === 401) {
                    setToken("");
                    setAuth(false);
                } else {
                    setBookingState({
                        isSuccessful: false,
                        isSubmitted: true,
                        isSubmitting: false
                    });

                    setTimeout(() => {
                        setToken("");
                        setAuth(false);
                    }, 1000 * 10);
                }
            });
    };

    return (
        <Box sx={{padding: "8px"}}>
            <StepNavigation
                activeStep={activeStep}
                maxSteps={maxSteps}
                progressImage={rocketImage}
                hideNavigation={bookingState.isSubmitted}
                onNext={handleStepNext}
                onPrevious={handlePrevious}
            />
            <CardContent>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Typography
                        color={spacePalette.text.primary}
                        align="center"
                        variant="h4"
                        sx={{paddingBottom: "1em"}}
                    >
                        {stepTitles[activeStep]}
                    </Typography>

                    {currentError && (
                        <Alert variant="outlined" severity="error" sx={{my: 2}}>
                            {currentError}
                        </Alert>
                    )}

                    {/* Render the appropriate form for each step */}
                    {activeStep === FormSteps.NameAndAddress && (
                        <PersonalDetailsForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === FormSteps.Ticket && (
                        <TicketForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === FormSteps.Beverage && (
                        <BeverageSelectionForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === FormSteps.Food && (
                        <FoodSelectionForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === FormSteps.Workshift && (
                        <WorkShiftForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === FormSteps.Material && (
                        <MaterialsForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === FormSteps.AwarenessCode && (
                        <AwarenessCodeForm/>
                    )}
                    {activeStep === FormSteps.Signature && (
                        <SignatureForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === FormSteps.Summary && (
                        <SummaryForm
                            currentBooking={booking}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === FormSteps.Confirmation && (
                        <ConfirmationForm
                            currentBooking={booking}
                            formContent={formContent}
                            submitBooking={submitBooking}
                            bookingState={bookingState}
                        />
                    )}
                </Box>
            </CardContent>
        </Box>
    );
}