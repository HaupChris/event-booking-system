import React, {useContext, useEffect, useState} from "react";
import {Alert, Box, CardContent, Typography} from "@mui/material";
import {AuthContext, TokenContext} from "../../contexts/AuthContext";
import axios from 'axios';

import StepNavigation from "../../components/core/navigation/StepNavigation";
import {useFormManagement} from "../../hooks/useFormManagement";
import {ArtistBooking, ArtistFormContent} from "./interface";
import {spacePalette} from "../../components/styles/theme";
import rocketImage from "../../img/rocket.png";
import {artistAreaTexts} from "../constants/texts";
import ArtistPersonalDetailsForm from "./ArtistPersonalDetailsForm";
import ArtistTicketSelectionForm from "./ArtistTicketSelectionForm";
import ArtistBeverageSelectionForm from "./ArtistBeverageSelectionForm";
import ArtistMaterialsForm from "./ArtistMaterialsForm";
import ArtistSignatureForm from "./ArtistSignatureForm";
import ArtistSummaryForm from "./ArtistSummaryForm";
import ArtistConfirmationForm from "./ArtistConfirmationForm";
import ArtistPerformanceForm from "./ArtistPerformanceForm";
import ArtistFoodSelectionForm from "./ArtistFoodSelectionForm";
import ArtistEquipmentForm from "./ArtistEquipmentForm";
import {calculateTotalPriceArtist} from "../../components/core/utils/Pricing";

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
        last_name: "",
        first_name: "",
        email: "",
        phone: "",
        ticket_id: -1,
        beverage_id: -1,
        food_id: -1,
        artist_material_ids: [],
        total_price: 0,
        signature: "",
        is_paid: false,
        paid_amount: 0,
        payment_notes: "",
        payment_date: "",
        equipment: "",
        special_requests: "",
        performance_details: "",
        profession_ids: []
    }
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
        artist_materials: [],
        professions: [],
    };
}

export interface ArtistFormProps {
    updateBooking: (key: keyof ArtistBooking, value: any) => void;
    currentBooking: ArtistBooking;
    formValidation: { [key in keyof ArtistBooking]?: string };
    formContent: ArtistFormContent;
}

export interface ArtistBookingState {
    isSubmitted: boolean;
    isSubmitting: boolean;
    isSuccessful: boolean;
}

const validationRules = {
    first_name: (value: string) => {
        const pattern = /^[A-Za-zÄÖÜäöüß\s]+$/;
        if (value === '') return 'Bitte gib einen Vornamen an';
        if (!pattern.test(value)) return 'Bitte verwende nur Buchstaben für deinen Vornamen';
        return '';
    },
    last_name: (value: string) => {
        const pattern = /^[A-Za-zÄÖÜäöüß\s]+$/;
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
    performance_details: (value: string) => {
        return value === '' ? 'Bitte gib Details zu deinem Auftritt an.' : '';
    },
    signature: (value: string) => {
        return value === '' ? 'Wir würden uns freuen, wenn du das Formular unterschreibst' : '';
    }
};

export function ArtistRegistrationFormContainer() {
    const {
        formState: booking,
        validation: formValidation,
        currentError,
        updateField,
        activeStep,
        handleNext,
        handlePrevious
    } = useFormManagement<ArtistBooking>({
        initialState: getEmptyArtistBooking(),
        validationRules,
        storageKey: 'artistBooking',
        versionKey: 'artistFormVersion',
        currentVersion: '1.0'
    });

    const [formContent, setFormContent] = useState<ArtistFormContent>(getDummyArtistFormContent());
    const [bookingState, setBookingState] = useState<ArtistBookingState>({
        isSubmitted: false,
        isSubmitting: false,
        isSuccessful: false
    });

    const {token, setToken} = useContext(TokenContext);
    const maxSteps = Object.keys(FormSteps).length / 2;
    const {setAuth} = useContext(AuthContext);

    const stepTitles: { [key: number]: string } = {
        [FormSteps.PersonalDetails]: artistAreaTexts.personalDetailsForm.title,
        [FormSteps.PerformanceDetails]: artistAreaTexts.performanceDetailsForm.title,
        [FormSteps.Ticket]: artistAreaTexts.ticketSelectionForm.title,
        [FormSteps.Beverage]: artistAreaTexts.beverageSelectionForm.title,
        [FormSteps.Food]: artistAreaTexts.foodSelectionForm.title,
        [FormSteps.Materials]: artistAreaTexts.materialsForm.title,
        [FormSteps.TechnicalRequirements]: artistAreaTexts.technicalRequirementsForm.title,
        [FormSteps.Signature]: artistAreaTexts.signatureForm.title,
        [FormSteps.Summary]: artistAreaTexts.summaryForm.title,
        [FormSteps.Confirmation]: artistAreaTexts.confirmationForm.initialView.title
    };

    const requiredFields: { [key: number]: (keyof ArtistBooking)[] } = {
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
    };

    useEffect(() => {
        axios.get('/api/artist/formcontent', {
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
        const total_price = calculateTotalPriceArtist(booking, formContent);
        console.log(total_price);
        updateField('total_price', total_price);

    }, [booking.beverage_id, booking.food_id, booking.ticket_id, formContent])

    const handleStepNext = () => {
        handleNext(requiredFields[activeStep]);
    };

    const updateBooking = (key: keyof ArtistBooking, value: any) => {
        updateField(key, value);
    };

    // Submit booking
    const submitBooking = () => {
        setBookingState(prevState => ({...prevState, isSubmitting: true}));

        axios.post('/api/artist/submitForm', booking, {
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

    return <Box sx={{padding: "8px"}}>
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

                {activeStep === FormSteps.PersonalDetails && (
                    <ArtistPersonalDetailsForm
                        updateBooking={updateBooking}
                        currentBooking={booking}
                        formValidation={formValidation}
                        formContent={formContent}
                    />
                )}
                {activeStep === FormSteps.PerformanceDetails && (
                    <ArtistPerformanceForm
                        updateBooking={updateBooking}
                        currentBooking={booking}
                        formValidation={formValidation}
                        formContent={formContent}
                    />
                )}
                {activeStep === FormSteps.Ticket && (
                    <ArtistTicketSelectionForm
                        updateBooking={updateBooking}
                        currentBooking={booking}
                        formValidation={formValidation}
                        formContent={formContent}
                    />
                )}
                {activeStep === FormSteps.Beverage && (
                    <ArtistBeverageSelectionForm
                        updateBooking={updateBooking}
                        currentBooking={booking}
                        formValidation={formValidation}
                        formContent={formContent}
                    />
                )}
                {activeStep === FormSteps.Food && (
                    <ArtistFoodSelectionForm
                        updateBooking={updateBooking}
                        currentBooking={booking}
                        formValidation={formValidation}
                        formContent={formContent}
                    />
                )}
                {activeStep === FormSteps.Materials && (
                    <ArtistMaterialsForm
                        updateBooking={updateBooking}
                        currentBooking={booking}
                        formValidation={formValidation}
                        formContent={formContent}
                    />
                )}
                {activeStep === FormSteps.TechnicalRequirements && (
                    <ArtistEquipmentForm
                        updateBooking={updateBooking}
                        currentBooking={booking}
                        formValidation={formValidation}
                        formContent={formContent}
                    />
                )}
                {activeStep === FormSteps.Signature && (
                    <ArtistSignatureForm
                        updateBooking={updateBooking}
                        currentBooking={booking}
                        formValidation={formValidation}
                        formContent={formContent}
                    />
                )}
                {activeStep === FormSteps.Summary && (
                    <ArtistSummaryForm
                        currentBooking={booking}
                        formContent={formContent}
                    />
                )}
                {activeStep === FormSteps.Confirmation && (
                    <ArtistConfirmationForm
                        booking={booking}
                        submitBooking={submitBooking}
                        formContent={formContent}
                        bookingState={bookingState}
                    />
                )}
            </Box>
        </CardContent>
    </Box>
}