import {Alert, Box, Button, Card, CardContent, Typography} from "@mui/material";
import '../../css/formContainer.css';
import {NavigateBefore, NavigateNext} from "@mui/icons-material";
import axios from 'axios';
import React, {useContext, useEffect, useState} from "react";

import {AuthContext, TokenContext} from "../../AuthContext";
import rocketImage from "../../img/rocket.png";
import LinearProgressWithImage from "../components/linearProgressWithImage";

// Import artist-specific components
import ArtistNameAndAddressForm from "./artistNameAndAddress";
import ArtistTicketForm from "./artistTicketSelection";
import ArtistBeverageForm from "./artistBeverageSelection";
import ArtistFoodForm from "./artistFoodSelection";
import ArtistMaterialsForm from "./artistMaterials";
import ArtistEquipmentForm from "./artistEquipment";
import ArtistPerformanceForm from "./artistPerformance";
import ArtistSignatureForm from "./artistSignature";
import ArtistSummary from "./artistSummary";
import ArtistConfirmation from "./artistConfirmation";
import FormAwarnessCode from "../userArea/AwarenessCodeForm";
import {getDummyFormContent} from "../userArea/UserRegistrationFormContainer";
import {ArtistBooking, ArtistFormContent} from "./interface";

enum ArtistFormSteps {
    NameAndAddress = 0,
    Ticket = 1,
    Beverage = 2,
    Food = 3,
    Materials = 4,
    Equipment = 5,
    Performance = 6,
    AwarenessCode = 7,
    Signature = 8,
    Summary = 9,
    Confirmation = 10,
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
        total_price: 0, // Artists start with no cost
        signature: "",
        is_paid: false,
        paid_amount: 0,
        payment_date: "",
        payment_notes: "",
        equipment: "",
        special_requests: "",
        performance_details: "",
        artist_material_ids: []
    }
}

export function getDummyFormContentArtists(): ArtistFormContent {
    // Similar to the regular getDummyFormContent but including artist_materials
    const baseContent = getDummyFormContent();

    return {
        ...baseContent,
        artist_materials: [
            {
                id: 1,
                title: 'Instrument/Equipment',
                num_needed: 5,
                num_booked: 0
            },
            {
                id: 2,
                title: 'Sound Equipment',
                num_needed: 3,
                num_booked: 0
            }
        ]
    };
}

export interface ArtistFormProps {
    updateBooking: (key: keyof ArtistBooking, value: any) => void;
    currentBooking: ArtistBooking;
    formValidation: { [key in keyof ArtistBooking]?: string };
    formContent: ArtistFormContent;
}

export interface BookingState {
    isSubmitted: boolean;
    isSubmitting: boolean;
    isSuccessful: boolean;
}

function safelyParseJSON<T>(json: string | null, fallback: T): T {
    try {
        if (json === null) {
            return fallback;
        }
        return JSON.parse(json);
    } catch (e) {
        return fallback;
    }
}

export function ArtistFormContainer() {
    const [formContent, setFormContent] = useState<ArtistFormContent>(getDummyFormContentArtists());
    const [formValidation, setFormValidation] = useState<{ [key in keyof ArtistBooking]?: string }>({});
    const [booking, setBooking] = useState<ArtistBooking>(safelyParseJSON(localStorage.getItem('artistBooking'), getEmptyArtistBooking()));
    const [activeStep, setActiveStep] = useState<ArtistFormSteps>(safelyParseJSON(localStorage.getItem('artistActiveStep'), ArtistFormSteps.NameAndAddress));
    const [bookingState, setBookingState] = useState<BookingState>(safelyParseJSON(localStorage.getItem('artistBookingState'), {
        isSubmitted: false,
        isSubmitting: false,
        isSuccessful: false
    }));
    const [currentError, setCurrentError] = useState<string>("");

    const {token, setToken} = useContext(TokenContext);
    const maxSteps = Object.keys(ArtistFormSteps).length / 2;
    const {auth, setAuth} = useContext(AuthContext);

    const stepTitles = {
        [ArtistFormSteps.NameAndAddress]: "Willkommen zum Weiher Wald und Weltall-Wahn! (Künstler-Registrierung)",
        [ArtistFormSteps.Ticket]: "An welchen Tagen bist du auf dem Festival?",
        [ArtistFormSteps.Beverage]: "Getränke für Künstler (kostenlos)",
        [ArtistFormSteps.Food]: "Dein Essen (erste Mahlzeit kostenlos)",
        [ArtistFormSteps.Materials]: "Welche Materialien kannst du mitbringen?",
        [ArtistFormSteps.Equipment]: "Benötigte Ausrüstung und technische Anforderungen",
        [ArtistFormSteps.Performance]: "Details zu deinem Auftritt",
        [ArtistFormSteps.AwarenessCode]: "Ein paar Regeln für unsere Reise durch die Galaxis",
        [ArtistFormSteps.Signature]: "Ein Abenteuer auf eigene Gefahr",
        [ArtistFormSteps.Summary]: "Zusammenfassung",
        [ArtistFormSteps.Confirmation]: "Start in T Minus Gleich"
    }

    const requiredFields: { [key: number]: (keyof ArtistBooking)[] } = {
        [ArtistFormSteps.NameAndAddress]: ['last_name', 'first_name', 'email', 'phone'],
        [ArtistFormSteps.Ticket]: ['ticket_id'],
        [ArtistFormSteps.Beverage]: [],
        [ArtistFormSteps.Food]: [],
        [ArtistFormSteps.Materials]: [],
        [ArtistFormSteps.Equipment]: ['equipment'],
        [ArtistFormSteps.Performance]: ['performance_details'],
        [ArtistFormSteps.AwarenessCode]: [],
        [ArtistFormSteps.Signature]: ['signature'],
        [ArtistFormSteps.Summary]: [],
        [ArtistFormSteps.Confirmation]: [],
    };

    // Define version number
    const VERSION_NUMBER = '1.0';

    // Clear outdated data
    const clearOutdatedData = () => {
        const storedVersion = localStorage.getItem('artistFormVersion');
        if (storedVersion !== VERSION_NUMBER) {
            localStorage.removeItem('artistFormValidation');
            localStorage.removeItem('artistActiveStep');
            localStorage.removeItem('artistBookingState');
            localStorage.removeItem('artistCurrentError');
            localStorage.removeItem('artistBooking');
        }
    };

    // Load default values
    const loadDefaultValues = () => {
        const storedFormValidation = safelyParseJSON(localStorage.getItem('artistFormValidation'), {});
        const storedBooking = safelyParseJSON(localStorage.getItem('artistBooking'), getEmptyArtistBooking());
        const storedActiveStep = safelyParseJSON(localStorage.getItem('artistActiveStep'), ArtistFormSteps.NameAndAddress);
        const storedBookingState = safelyParseJSON(localStorage.getItem('artistBookingState'), {
            isSubmitted: false,
            isSuccessful: false,
            isSubmitting: false
        });
        const storedCurrentError = safelyParseJSON(localStorage.getItem('artistCurrentError'), "");

        setFormValidation(storedFormValidation);
        setBooking(storedBooking);
        setActiveStep(storedActiveStep);
        setBookingState(storedBookingState);
        setCurrentError(storedCurrentError);
    };

    // Load default values on component mount
    useEffect(() => {
        clearOutdatedData();
        loadDefaultValues();
    }, []);

    // Store form state to localStorage
    useEffect(() => {
        localStorage.setItem('artistFormValidation', JSON.stringify(formValidation));
        localStorage.setItem('artistBooking', JSON.stringify(booking));
        localStorage.setItem('artistActiveStep', JSON.stringify(activeStep));
        localStorage.setItem('artistBookingState', JSON.stringify(bookingState));
        localStorage.setItem('artistCurrentError', JSON.stringify(currentError));
        localStorage.setItem('artistFormVersion', VERSION_NUMBER);
    }, [formValidation, booking, activeStep, bookingState, currentError]);

    // Fetch form content from API
    useEffect(() => {
        axios.get('/api/artist/formcontent', {
                headers: {Authorization: `Bearer ${token}`}
            })
            .then((response) => {
                console.log("API response success:", response.data);
                setFormContent(response.data);
            })
            .catch((error) => {
                console.error("API error details:", error);
                setAuth(false);
                setToken("");
            });
    }, []);

    // Validation functions
    function validateName(value: string, nameString: string): string {
        const pattern = /^[A-Za-zÄÖÜöüß\s]+$/;
        if (value === '') return 'Bitte gib einen ' + nameString + ' an';
        if (!pattern.test(value)) return 'Bitte verwende nur Buchstaben für deinen ' + nameString;
        return '';
    }

    function validateEmail(value: any): string {
        const pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (value === '') return 'Bitte gib eine Email ein';
        if (!pattern.test(value)) return 'Bitte gib eine gültige Email ein.';
        return '';
    }

    function validatePhone(value: any): string {
        const pattern = /^\d{10,15}$/;
        if (value === '') return 'Bitte gib eine Telefonnummer ein';
        if (!pattern.test(value)) return 'Bitte gib eine gültige Telefonnummer ein';
        return '';
    }

    // Update error when validation changes
    useEffect(() => {
        updateCurrentError();
    }, [formValidation]);

    // Clear error when booking changes
    useEffect(() => {
        setCurrentError("");
    }, [booking]);

    // Validate a specific field
    function validateField(key: keyof ArtistBooking, value: any) {
        let errorMessage = '';
        switch (key) {
            case 'last_name':
                errorMessage = validateName(value, "Nachnamen");
                break;
            case 'first_name':
                errorMessage = validateName(value, "Vornamen");
                break;
            case 'email':
                errorMessage = validateEmail(value);
                break;
            case 'phone':
                errorMessage = validatePhone(value);
                break;
            case 'ticket_id':
                errorMessage = value === -1 ? 'Bitte wähle deine Anwesenheitstage.' : '';
                break;
            case 'equipment':
                errorMessage = value === '' ? 'Bitte gib deine technischen Anforderungen an.' : '';
                break;
            case 'performance_details':
                errorMessage = value === '' ? 'Bitte gib Details zu deinem Auftritt an.' : '';
                break;
            case 'signature':
                errorMessage = value === '' ? 'Wir würden uns freuen, wenn du das Formular unterschreibst' : '';
                break;
        }
        setFormValidation(prev => ({...prev, [key]: errorMessage}));
        return errorMessage;
    }

    // Check if current step is valid
    function isStepValid() {
        const currentStepFields = requiredFields[activeStep];

        if (!currentStepFields) {
            return false;
        }

        let isValid = true;
        let errorMessage = '';
        for (let field of currentStepFields) {
            errorMessage = validateField(field, booking[field]);
            if (errorMessage !== '') {
                isValid = false;
                break;
            }
        }
        return isValid;
    }

    // Update current error message
    function updateCurrentError() {
        const errorMessages = requiredFields[activeStep].map(field => formValidation[field]).filter(message => message !== '');
        const errorMessage = errorMessages !== undefined && errorMessages.length > 0 && errorMessages[0] !== undefined ? errorMessages[0] : '';
        setCurrentError(() => errorMessage);
    }

    // Update booking data
    function updateBooking(key: keyof ArtistBooking, value: any) {
        setBooking((prevBooking) => {
            let newBooking = {...prevBooking, [key]: value};

            // Special pricing rules for artists
            let total_price = 0;

            // Food is charged only for the second meal
            if (key === 'food_id' && value !== -1) {
                const foodOption = formContent.food_options.find(f => f.id === value);
                // First meal is free, only charge for additional meals
                if (foodOption && foodOption.title.includes("Beide Essen")) {
                    total_price += foodOption.price;
                }
            } else if (prevBooking.food_id !== -1) {
                const foodOption = formContent.food_options.find(f => f.id === prevBooking.food_id);
                if (foodOption && foodOption.title.includes("Beide Essen")) {
                    total_price += foodOption.price;
                }
            }

            // Tickets and beverages are free for artists
            newBooking.total_price = total_price;

            return newBooking;
        });
    }

    // Update artist materials
    function updateArtistMaterialIds(artistMaterialIds: Array<number>) {
        setBooking(prevBooking => ({
            ...prevBooking,
            artist_material_ids: artistMaterialIds
        }));
    }

    // Submit booking
    function submitBooking() {
        setBookingState(prevState => ({...prevState, isSubmitting: true}));

        axios.post('/api/submitArtistForm', booking, {
                headers: {Authorization: `Bearer ${token}`}
            })
            .then(function (response: any) {
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
            .catch(function (error: any) {
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
    }

    return (
        <Card className={"form-container"}>
            <Box className={"navigation"}>
                <Box className={"navigation-progress"}>
                    <LinearProgressWithImage activeStep={activeStep} maxSteps={maxSteps} variant={"determinate"}
                                             image={rocketImage}/>
                </Box>
                <Box className={"navigation-buttons"} sx={{display: bookingState.isSubmitted ? "None" : ""}}>
                    <Button variant={"outlined"} sx={{'opacity': activeStep < 1 ? "0" : "100%"}}
                            onClick={() => {
                                if (activeStep > 0) {
                                    setActiveStep(activeStep - 1);
                                    setCurrentError("");
                                }
                            }}>
                        <NavigateBefore/>
                    </Button>
                    <Button
                        variant={"outlined"}
                        sx={{'display': activeStep >= maxSteps - 1 ? "none" : "inline-block"}}
                        onClick={() => {
                            if (isStepValid()) {
                                setActiveStep(activeStep + 1);
                                setCurrentError("");
                            }
                        }}>
                        <NavigateNext/>
                    </Button>
                </Box>
            </Box>
            <CardContent>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Typography align="center" variant={"h4"} sx={{paddingBottom: "1em"}}>
                        {stepTitles[activeStep]}
                    </Typography>
                    <Alert variant={"outlined"} sx={{display: currentError === "" ? "None" : ""}} severity={"error"}>
                        {currentError}
                    </Alert>

                    {/* Render the appropriate form for each step */}
                    {activeStep === ArtistFormSteps.NameAndAddress && (
                        <ArtistNameAndAddressForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === ArtistFormSteps.Ticket && (
                        <ArtistTicketForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === ArtistFormSteps.Beverage && (
                        <ArtistBeverageForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === ArtistFormSteps.Food && (
                        <ArtistFoodForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === ArtistFormSteps.Materials && (
                        <ArtistMaterialsForm
                            updateBooking={updateBooking}
                            updateArtistMaterialIds={updateArtistMaterialIds}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === ArtistFormSteps.Equipment && (
                        <ArtistEquipmentForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === ArtistFormSteps.Performance && (
                        <ArtistPerformanceForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === ArtistFormSteps.AwarenessCode && (
                        <FormAwarnessCode/>
                    )}
                    {activeStep === ArtistFormSteps.Signature && (
                        <ArtistSignatureForm
                            updateBooking={updateBooking}
                            currentBooking={booking}
                            formValidation={formValidation}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === ArtistFormSteps.Summary && (
                        <ArtistSummary
                            booking={booking}
                            formContent={formContent}
                        />
                    )}
                    {activeStep === ArtistFormSteps.Confirmation && (
                        <ArtistConfirmation
                            bookingState={bookingState}
                            formContent={formContent}
                            booking={booking}
                            submitBooking={submitBooking}
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}