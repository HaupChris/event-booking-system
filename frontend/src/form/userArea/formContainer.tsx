import {Alert, Box, Button, Card, CardContent, Grid, Typography} from "@mui/material";
import '../../css/formContainer.css';
import {NavigateBefore, NavigateNext} from "@mui/icons-material";
import axios from 'axios';
import React, {useContext, useEffect, useState} from "react";

import {Booking, FormContent} from "./interface";

import NameAndAddressForm from "./nameAndAddress";
import FormSignature from "./formSignature";
import TicketForm from "./formTicketSelection";
import BeverageForm from "./formBeverageSelection";
import WorkshiftForm from "./formWorkshifts";
import MaterialsForm from "./formMaterials";
import FormAwarnessCode from "./formAwarenessCode";
import FormSummary from "./formSummary";
import FormConfirmation from "./formConfirmation";
import {AuthContext, TokenContext} from "../../AuthContext";
import fishImage from "../../img/fish.png";
import LinearProgressWithImage from "../components/linearProgressWithImage";
import FormFoodSelection from "./formFoodSelection";


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
    }
}

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
            {
                id: 1,
                title: 'Beverage 1',
                description: 'Delicious beverage 1',
                price: 10,
                num_booked: 5,
            },
            {
                id: 2,
                title: 'Beverage 2',
                description: 'Delicious beverage 2',
                price: 15,
                num_booked: 2,
            },
        ],
        food_options: [
            {
                id: 1,
                title: 'Food 1',
                description: 'Delicious food 1',
                price: 10,
                num_booked: 5,
            },
            {
                id: 2,
                title: 'Food 2',
                description: 'Delicious food 2',
                price: 15,
                num_booked: 2,
            },
        ],
        work_shifts: [
            {
                id: 1,
                title: 'Essen kochen',
                description: 'wir benötigen Menschen, die beim zubereiten der Pizzas helfen',
                time_slots: [
                    {
                        id: 1,
                        title: 'erste Schicht',
                        start_time: '08:00',
                        end_time: '12:00',
                        num_needed: 5,
                        num_booked: 7,
                    },
                    {
                        id: 2,
                        title: 'zweite Schicht',
                        start_time: '12:00',
                        end_time: '16:00',
                        num_needed: 3,
                        num_booked: 1,
                    },
                ],
            },
            {
                id: 2,
                title: 'Shift 2',
                description: 'Afternoon shift',
                time_slots: [
                    {
                        id: 3,
                        title: 'Slot 3',
                        start_time: '14:00',
                        end_time: '18:00',
                        num_needed: 4,
                        num_booked: 2,
                    },
                    {
                        id: 4,
                        title: 'Slot 4',
                        start_time: '18:00',
                        end_time: '22:00',
                        num_needed: 3,
                        num_booked: 1,
                    },
                ],
            },
        ],
        materials: [
            {
                id: 1,
                title: 'Material 1',
                num_needed: 10,
                num_booked: 5,
            },
            {
                id: 2,
                title: 'Material 2',
                num_needed: 15,
                num_booked: 10,
            },
        ],
    };
}

export interface FormProps {
    updateBooking: (key: keyof Booking, value: any) => void;
    currentBooking: Booking;
    formValidation: { [key in keyof Booking]?: string };
    formContent: FormContent;
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

export function FormContainer() {
    const [formContent, setFormContent] = useState<FormContent>(getDummyFormContent);
    const [formValidation, setFormValidation] = useState<{ [key in keyof Booking]?: string }>({});
    const [booking, setBooking] = useState<Booking>(safelyParseJSON(localStorage.getItem('booking'), getEmptyBooking()));
    const [activeStep, setActiveStep] = useState<FormSteps>(safelyParseJSON(localStorage.getItem('activeStep'), FormSteps.NameAndAddress));
    const [bookingState, setBookingState] = useState<BookingState>(safelyParseJSON(localStorage.getItem('bookingState'), {
        isSubmitted: false,
        isSubmitting: false,
        isSuccessful: false
    }));
    const [currentError, setCurrentError] = useState<string>("");

    const {token, setToken} = useContext(TokenContext);
    const maxSteps = Object.keys(FormSteps).length / 2;
    const {auth, setAuth} = useContext(AuthContext);

    const stepTitles = {
        [FormSteps.NameAndAddress]: " Herzlich Willkommen zum Weiher Wald und Weltall-Wahn!",
        [FormSteps.Ticket]: "Ich fliege an folgenden Tagen mit (Sonntag ist Abbau)",
        [FormSteps.Beverage]: "Ein Spacebier gefällig?",
        [FormSteps.Food]: "Wähle deine Astronautenkost",
        [FormSteps.Workshift]: "Tritt der Crew bei",
        [FormSteps.Material]: "Ich bringe folgende Ersatzteile mit",
        [FormSteps.AwarenessCode]: "Ein paar Regeln für unsere Reise durch die Galaxis",
        [FormSteps.Signature]: "Ein Abenteuer auf eigene Gefahr",
        [FormSteps.Summary]: "Zusammenfassung",
        [FormSteps.Confirmation]: "Start in T Minus Gleich"
    }
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

// Define the current version number of the form
    const VERSION_NUMBER = '1.2';

// Function to check and clear outdated data from local storage
    const clearOutdatedData = () => {
        const storedVersion = localStorage.getItem('formVersion');
        if (storedVersion !== VERSION_NUMBER) {
            // Clear outdated data
            localStorage.removeItem('formVersion');
            localStorage.removeItem('formValidation');
            localStorage.removeItem('activeStep');
            localStorage.removeItem('bookingState');
            localStorage.removeItem('currentError');
            localStorage.removeItem('booking');
        }
    };

// Function to load default values from local storage
    const loadDefaultValues = () => {
        // Load default values from localStorage
        const storedFormValidation = safelyParseJSON(localStorage.getItem('formValidation'), {});
        const storedBooking = safelyParseJSON(localStorage.getItem('booking'), getEmptyBooking());
        const storedActiveStep = safelyParseJSON(localStorage.getItem('activeStep'), FormSteps.NameAndAddress);
        const storedBookingState = safelyParseJSON(localStorage.getItem('bookingState'), {
            isSubmitted: false,
            isSuccessful: false,
            isSubmitting: false
        });
        const storedCurrentError = safelyParseJSON(localStorage.getItem('currentError'), "");

        // Set state with loaded default values
        setFormValidation(storedFormValidation);
        setBooking(storedBooking);
        setActiveStep(storedActiveStep);
        setBookingState(storedBookingState);
        setCurrentError(storedCurrentError);
    };

// Call loadDefaultValues function when the component mounts
    useEffect(() => {
        clearOutdatedData();
        loadDefaultValues();
    }, []);

    useEffect(() => {
        localStorage.setItem('formValidation', JSON.stringify(formValidation));
        localStorage.setItem('booking', JSON.stringify(booking));
        localStorage.setItem('activeStep', JSON.stringify(activeStep));
        localStorage.setItem('bookingState', JSON.stringify(bookingState));
        localStorage.setItem('currentError', JSON.stringify(currentError));
        localStorage.setItem('formVersion', VERSION_NUMBER);

    }, [formValidation, booking, activeStep, bookingState, currentError]);

    useEffect(() => {
        axios.get('/api/formcontent', {
                headers: {Authorization: `Bearer ${token}`}
            })
            .then((response) => {
                    setFormContent(response.data);
                }
            )
            .catch((error) => {
                // 	catch 401 and redirect to log in
                setAuth(false);
                setToken("");

            });
    }, []);

    function validateName(value: string, nameString: string): string {
        const pattern = /^[A-Za-zÄÖÜöüß\s]+$/;
        if (value === '') return 'Bitte gib einen ' + nameString + ' an';
        if (!pattern.test(value)) return 'Bitte verwende nur Buchstaben für deinen ' + nameString;
        return '';
    }

    useEffect(() => {
        updateCurrentError();
    }, [formValidation]);

    useEffect(() => {
        setCurrentError("");
    }, [booking]);

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

    function validateField(key: keyof Booking, value: any) {
        let errorMessage = '';
        switch (key) {
            case 'last_name':
                errorMessage = validateName(value, "Nachnamen");
                break
            case 'first_name':
                errorMessage = validateName(value, "Vornamen");
                break
            case 'supporter_buddy':
                errorMessage = validateName(value, "Support Buddy");
                break;
            case 'email':
                errorMessage = validateEmail(value);
                break;
            case 'phone':
                errorMessage = validatePhone(value);
                break;
            case 'ticket_id':
                errorMessage = value === -1 ? 'Bitte wähle ein Ticket aus.' : '';
                break;
            case 'food_id':
                errorMessage = value === -1 ? 'Bitte wähle deine Essensoption aus.' : '';
                break;
            case 'timeslot_priority_1':
                errorMessage = value === -1 ? 'Bitte gib drei Prioritäten an.' : '';
                break;
            case 'timeslot_priority_2':
                errorMessage = value === -1 ? 'Bitte gib drei Prioritäten an.' : '';
                break;
            case 'timeslot_priority_3':
                errorMessage = value === -1 ? 'Bitte gib drei Prioritäten an.' : '';
                break;
            case 'signature':
                errorMessage = value === '' ? 'Wir würden uns freuen, wenn du das Formular unterschreibst' : '';
                break;

        }
        setFormValidation(prev => ({...prev, [key]: errorMessage}));
        return errorMessage;
    }

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

    function updateCurrentError() {
        const errorMessages = requiredFields[activeStep].map(field => formValidation[field]).filter(message => message !== '');
        const errorMessage = errorMessages !== undefined && errorMessages.length > 0 && errorMessages[0] !== undefined ? errorMessages[0] : '';
        setCurrentError(() => errorMessage);
    }

    function updateBooking(key: keyof Booking, value: any) {
        setBooking((prevBooking) => {
            let ticketOption;
            let beverageOption;
            let foodOption;
            let total_price = 0;
            let newBooking = {...prevBooking};

            if (key === 'ticket_id') {
                ticketOption = formContent.ticket_options.find((ticket) => ticket.id === value);
            } else {
                ticketOption = formContent.ticket_options.find((ticket) => ticket.id === prevBooking.ticket_id);
            }

            if (key === 'beverage_id') {
                beverageOption = formContent.beverage_options.find((beverage) => beverage.id === value);
            } else {
                beverageOption = formContent.beverage_options.find((beverage) => beverage.id === prevBooking.beverage_id);
            }

            if (key === 'food_id') {
                foodOption = formContent.food_options.find((food) => food.id === value);
            } else {
                foodOption = formContent.food_options.find((food) => food.id === prevBooking.food_id);
            }

            total_price += ticketOption ? ticketOption.price : 0;
            total_price += beverageOption ? beverageOption.price : 0;
            total_price += foodOption ? foodOption.price : 0;

            newBooking = {...prevBooking, [key]: value, total_price: total_price};

            return newBooking;
        });
    }

    function updateMaterialIds(material_ids: Array<number>) {
        setBooking(() => {
            return {...booking, material_ids: material_ids};
        });
    }

    function submitBooking() {
        setBookingState(prevState => ({ ...prevState, isSubmitting: true }));
        axios.post('/api/submitForm', booking, {
                headers: {Authorization: `Bearer ${token}`}
            })
            .then(function (response: any) {
                // handle success
                setBookingState(() => {
                    return {
                        isSuccessful: true,
                        isSubmitting: false,
                        isSubmitted: true
                    }
                })
                // set an interval after which the user is logged out
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
                    // handle error
                    setBookingState(() => {
                        return {
                            isSuccessful: false,
                            isSubmitted: true,
                            isSubmitting: false
                        };
                    })
                    setTimeout(() => {
                        setToken("");
                        setAuth(false);
                    }, 1000 * 10);
                }
            });
    }


    return <Card className={"form-container"}>
        <Grid container className={"navigation"}>
            <Grid item xs={12} className={"navigation-progress"}>
                <LinearProgressWithImage activeStep={activeStep} maxSteps={maxSteps} variant={"determinate"}
                                         image={fishImage}/>
            </Grid>
            <Grid item xs={12} className={"navigation-buttons"}
                  sx={{display: bookingState.isSubmitted ? "None" : ""}}>
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
            </Grid>
        </Grid>
        <CardContent>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Typography align="center" variant={"h4"} sx={{paddingBottom: "1em"}}>{stepTitles[activeStep]}</Typography>
                <Alert variant={"outlined"} sx={{display: currentError === "" ? "None" : ""}} severity={"error"}>
                    {currentError}
                </Alert>
                {activeStep === FormSteps.NameAndAddress &&
                    <NameAndAddressForm updateBooking={updateBooking}
                                        currentBooking={booking}
                                        formValidation={formValidation}
                                        formContent={formContent}
                    />}
                {activeStep === FormSteps.Ticket &&
                    <TicketForm updateBooking={updateBooking}
                                currentBooking={booking}
                                formValidation={formValidation}
                                formContent={formContent}/>}

                {activeStep === FormSteps.Beverage &&
                    <BeverageForm updateBooking={updateBooking}
                                  currentBooking={booking}
                                  formValidation={formValidation}
                                  formContent={formContent}/>}
                {activeStep === FormSteps.Food &&
                    <FormFoodSelection updateBooking={updateBooking}
                                       currentBooking={booking}
                                       formValidation={formValidation}
                                       formContent={formContent}/>}

                {activeStep === FormSteps.Workshift &&
                    <WorkshiftForm currentBooking={booking}
                                   updateBooking={updateBooking}
                                   formValidation={formValidation}
                                   formContent={formContent}
                    />}
                {activeStep === FormSteps.Material &&
                    <MaterialsForm
                        updateMaterialIds={updateMaterialIds}
                        currentBooking={booking}
                        formValidation={formValidation}
                        formContent={formContent}
                    />}
                {activeStep === FormSteps.AwarenessCode && <FormAwarnessCode/>}
                {activeStep === FormSteps.Signature &&
                    <FormSignature updateBooking={updateBooking}
                                   currentBooking={booking}
                                   formValidation={formValidation}
                                   formContent={formContent}
                    />}
                {activeStep === FormSteps.Summary &&
                    <FormSummary booking={booking} formContent={formContent}/>}
                {activeStep === FormSteps.Confirmation &&
                    <FormConfirmation bookingState={bookingState}
                                      formContent={formContent}
                                      booking={booking}
                                      submitBooking={submitBooking}

                    />

                }
            </Box>
        </CardContent>
    </Card>;
}
