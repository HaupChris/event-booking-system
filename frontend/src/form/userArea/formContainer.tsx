// src/form/userArea/formContainer.tsx (refactored)
import React, {useContext, useEffect, useState} from "react";
import {Alert, Box, CardContent, Typography} from "@mui/material";
import {AuthContext, TokenContext} from "../../AuthContext";
import axios from 'axios';

// Import form steps
import NameAndAddressForm from "./nameAndAddress";
import FormSignature from "./formSignature";
import TicketForm from "./formTicketSelection";
import BeverageForm from "./formBeverageSelection";
import WorkshiftForm from "./formWorkshifts";
import MaterialsForm from "./formMaterials";
import FormAwarnessCode from "./formAwarenessCode";
import FormSummary from "./formSummary";
import FormConfirmation from "./formConfirmation";

// Import new components
import rocketImage from "../../img/rocket.png";
import StepNavigation from "../../components/core/navigation/StepNavigation";
import {useFormManagement} from "../../hooks/useFormManagement";
import {Booking, FormContent} from "./interface";
import {spacePalette} from "../../components/styles/theme";
import FormFoodSelection from "./formFoodSelection";
import FormAwarenessCode from "./formAwarenessCode";

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
        payment_notes: ""
    }
}

// Dummy form content for initial render
export function getDummyFormContent(): FormContent {
    return {
        ticket_options: [
            {
                id: 1,
                title: 'Option 1',
                price: 100,
                amount: 10,
                num_booked: 5,
            },
            {
                id: 2,
                title: 'Option 2',
                price: 200,
                amount: 5,
                num_booked: 2,
            },
        ],
        beverage_options: [
            // ...
        ],
        food_options: [
            // ...
        ],
        work_shifts: [
            // ...
        ],
        materials: [
            // ...
        ]
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

export function FormContainer() {
    // Use our new form management hook
    const {
        formState: booking,
        validation: formValidation,
        currentError,
        updateField,
        validateStep,
        resetForm
    } = useFormManagement<Booking>({
        initialState: getEmptyBooking(),
        validationRules,
        storageKey: 'booking',
        versionKey: 'formVersion',
        currentVersion: '1.2'
    });

    const [formContent, setFormContent] = useState<FormContent>(getDummyFormContent());
    const [activeStep, setActiveStep] = useState<FormSteps>(FormSteps.NameAndAddress);
    const [bookingState, setBookingState] = useState<BookingState>({
        isSubmitted: false,
        isSubmitting: false,
        isSuccessful: false
    });

    const {token, setToken} = useContext(TokenContext);
    const maxSteps = Object.keys(FormSteps).length / 2;
    const {setAuth} = useContext(AuthContext);

    // Step titles
    const stepTitles = {
        [FormSteps.NameAndAddress]: "Herzlich Willkommen zum Weiher Wald und Weltall-Wahn!",
        [FormSteps.Ticket]: "Wann fliegst du mit?",
        [FormSteps.Beverage]: "Ein Spacebier gefällig?",
        [FormSteps.Food]: "Wähle deine Astronautenkost",
        [FormSteps.Workshift]: "Tritt der Crew bei",
        [FormSteps.Material]: "Ich bringe folgende Ersatzteile mit",
        [FormSteps.AwarenessCode]: "Ein paar Regeln für unsere Reise durch die Galaxis",
        [FormSteps.Signature]: "Ein Abenteuer auf eigene Gefahr",
        [FormSteps.Summary]: "Zusammenfassung",
        [FormSteps.Confirmation]: "Start in T Minus Gleich"
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
                console.error("API error details:", {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    headers: error.response?.headers
                });
                setAuth(false);
                setToken("");
            });
    }, [setAuth, setToken, token]);

    // Handle navigating to next step
    const handleNext = () => {
        if (validateStep(requiredFields[activeStep])) {
            setActiveStep(prevStep => prevStep + 1);
        }
    };

    // Handle navigating to previous step
    const handlePrevious = () => {
        if (activeStep > 0) {
            setActiveStep(prevStep => prevStep - 1);
        }
    };

    // Update booking with price calculations
    const updateBooking = (key: keyof Booking, value: any) => {
        updateField(key, value);

        // Calculate total price when relevant fields change
        if (['ticket_id', 'beverage_id', 'food_id'].includes(key)) {
            // Calculate total price based on selections
            let total_price = 0;

            // Add ticket price if selected
            if (key === 'ticket_id' || booking.ticket_id !== -1) {
                const ticketId = key === 'ticket_id' ? value : booking.ticket_id;
                const ticketOption = formContent.ticket_options.find(t => t.id === ticketId);
                if (ticketOption) {
                    total_price += ticketOption.price;
                }
            }

            // Add beverage price if selected
            if (key === 'beverage_id' || booking.beverage_id !== -1) {
                const beverageId = key === 'beverage_id' ? value : booking.beverage_id;
                const beverageOption = formContent.beverage_options.find(b => b.id === beverageId);
                if (beverageOption) {
                    total_price += beverageOption.price;
                }
            }

            // Add food price if selected
            if (key === 'food_id' || booking.food_id !== -1) {
                const foodId = key === 'food_id' ? value : booking.food_id;
                const foodOption = formContent.food_options.find(f => f.id === foodId);
                if (foodOption) {
                    total_price += foodOption.price;
                }
            }

            updateField('total_price', total_price);
        }
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
                console.log(error);

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
                onNext={handleNext}
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
                        <NameAndAddressForm
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
                        <BeverageForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === FormSteps.Food && (
                        <FormFoodSelection
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === FormSteps.Workshift && (
                        <WorkshiftForm
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
                        <FormAwarenessCode/>
                    )}
                    {activeStep === FormSteps.Signature && (
                        <FormSignature
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === FormSteps.Summary && (
                        <FormSummary
                            currentBooking={booking}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === FormSteps.Confirmation && (
                        <FormConfirmation
                            currentBooking={booking}
                            formContent={formContent}
                            submitBooking={submitBooking}
                            bookingState={bookingState}
                        />
                    )}




                    {/* ... remaining steps */}
                </Box>
            </CardContent>
        </Box>
    );
}