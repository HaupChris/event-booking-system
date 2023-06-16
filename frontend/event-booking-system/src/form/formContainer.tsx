import {
	Alert,
	Box,
	Button,
	Card,
	CardContent, Grid,
	LinearProgress,
	LinearProgressProps,
	Typography
} from "@mui/material";
import '../css/formContainer.css';
import {NavigateBefore, NavigateNext} from "@mui/icons-material";
import axios from 'axios';
import React, {useContext, useEffect, useState} from "react";

import {Booking, FormContent} from "./interface";

import NameAndAddressForm from "./nameAndAddress";
import {FormSignature} from "./formSignature";
import TicketForm from "./formTicketSelection";
import BeverageForm from "./formBeverageSelection";
import WorkshiftForm from "./formWorkshifts";
import MaterialsForm from "./formMaterials";
import FormAwarnessCode from "./formAwarenessCode";
import FormSummary from "./formSummary";
import FormConfirmation from "./formConfirmation";
import {AuthContext, TokenContext} from "../AuthContext";
import {jsPDF} from "jspdf";


enum FormSteps {
	NameAndAddress = 0,
	Ticket = 1,
	Beverage = 2,
	Workshift = 3,
	Material = 4,
	AwarenessCode = 5,
	Signature = 6,
	Summary = 7,
	Confirmation = 8,
}


function LinearProgressWithLabel(props: LinearProgressProps & { currentvalue: number, max: number }) {
	return (
		<Box sx={{display: 'flex', alignItems: 'center'}}>
			<Box sx={{width: '100%', mr: 1}}>
				<LinearProgress variant="determinate" {...props} value={(props.currentvalue / props.max) * 100.0}/>
			</Box>
			<Box sx={{minWidth: 70}}>
				<Typography variant="body2" color="text.primary">
					{props.currentvalue} von {props.max}
				</Typography>
			</Box>
		</Box>
	);
}

function getEmptyBooking(): Booking {
	return {
		last_name: "",
		first_name: "",
		email: "",
		phone: "",
		ticket_id: -1,
		beverage_id: -1,
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
	isSuccessful: boolean;
}


export function FormContainer() {
	const [formContent, setFormContent] = useState<FormContent>(getDummyFormContent);
	const [formValidation, setFormValidation] = useState<{ [key in keyof Booking]?: string }>({});
	const [booking, setBooking] = useState<Booking>(getEmptyBooking());
	const [activeStep, setActiveStep] = useState(FormSteps.NameAndAddress);
	const maxSteps = Object.keys(FormSteps).length / 2;
	const [currentError, setCurrentError] = useState<string>("");
	const [bookingState, setBookingState] = useState<BookingState>({isSubmitted: false, isSuccessful: false});
	const [pdfSummary, setPdfSummary] = useState<jsPDF>(new jsPDF());


	const {token, setToken} = useContext(TokenContext);
	const {auth, setAuth} = useContext(AuthContext);
	const stepTitles = ["Persönliche Infos",
		"Ich komme an folgenden Tagen",
		"Bierflatrate wählen (1 Tag = 5 Liter)",
		"Festival Support",
		"Ich kann folgende Materialien mitbringen",
		"Damit wir alle eine entspannte Zeit haben",
		"",
		"Zusammenfassung",
		"Fast geschafft!"
	]

	const requiredFields: { [key: number]: (keyof Booking)[] } = {
		[FormSteps.NameAndAddress]: ['last_name', 'first_name', 'email', 'phone'],
		[FormSteps.Ticket]: ['ticket_id'],
		[FormSteps.Beverage]: [],
		[FormSteps.Workshift]: ['timeslot_priority_1', 'amount_shifts'],
		[FormSteps.Material]: [],
		[FormSteps.Signature]: ['signature'],
		[FormSteps.AwarenessCode]: [],
		[FormSteps.Summary]: [],
		[FormSteps.Confirmation]: [],

	};

	useEffect(() => {


		axios.get('/api/formcontent', {
			headers: {Authorization: `Bearer ${token}`}
		})
			.then((response) => {
					setFormContent(response.data);
				}
			)
			.catch((error) => {
			// 	catch 401 and redirect to login
				if (error.response.status === 401 || error.response.status === 403 || error.response.status === 500) {
					setAuth(false);
					setToken("");
				}
			});

	}, []);

	// useEffect(() => {
	// 	isStepValid();
	// }, [booking]);


	useEffect(() => {
		updateCurrentError();
	}, [formValidation]);

	useEffect(() => {
		updateTotalPrice();
	}, [booking.ticket_id, booking.beverage_id]);

	function updateTotalPrice() {
		let totalPrice = 0;
		if (booking.ticket_id !== -1) {
			const ticket = formContent.ticket_options.find((ticket) => ticket.id === booking.ticket_id);
			if (ticket) {
				totalPrice += ticket.price;
			}
		}
		if (booking.beverage_id !== -1) {
			const beverage = formContent.beverage_options.find((beverage) => beverage.id === booking.beverage_id);
			if (beverage) {
				totalPrice += beverage.price;
			}
		}
		setBooking({...booking, total_price: totalPrice});
	}

	function validateName(value: string, nameString: string): string {
		const pattern = /^[A-Za-zÄÖÜööüß\s]+$/;
		if (value === '') return 'Bitte gib einen ' + nameString + ' an';
		if (!pattern.test(value)) return 'Bitte verwende nur Buchstaben für deinen ' + nameString;
		return '';
	}

	useEffect(() => {
		setCurrentError("");
	}, [booking]);

	function validateEmail(value: any): string {
		if (value === '') return 'Bitte gib eine Email ein';
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
			case 'timeslot_priority_1':
				errorMessage = value === -1 ? 'Bitte wähle eine Schicht mit höchster Priorität aus.' : '';
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
		setBooking({...booking, [key]: value});
	}

	function updateMaterialIds(material_ids: Array<number>) {
		setBooking({...booking, material_ids: material_ids});
	}

	function submitBooking() {

		axios.post('/api/submitForm', booking, {
			headers: {Authorization: `Bearer ${token}`}
		})
			.then(function (response: any) {
				// handle success
				console.log("booking  successful");
				setBookingState( () => {
					return {
						isSuccessful: true,
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
				// handle error
				console.log("booking failed");
				setBookingState(() => {
					return {
						isSuccessful: false,
						isSubmitted: true
					};
				})

				setTimeout(() => {
					setToken("");
					setAuth(false);
				}, 1000 * 10);
			});

	}


	return <Card className={"form-container"}>
		<Grid container className={"navigation"}>
			<Grid item xs={11} className={"navigation-progress"}>
				<LinearProgressWithLabel variant="determinate" max={maxSteps} currentvalue={activeStep + 1}/>
			</Grid>
			<Grid item xs={12} className={"navigation-buttons"} sx={{display: bookingState.isSubmitted ? "None" : ""}}>
				<Button variant={"outlined"} sx={{'display': activeStep < 1 ? "none" : "inline-block"}}
						onClick={() => {
							setActiveStep(activeStep - 1);
							setCurrentError("");
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
						} else {
							updateCurrentError();
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
				<Typography variant={"h5"}>{stepTitles[activeStep]}</Typography>
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
				{activeStep === FormSteps.Summary && <FormSummary booking={booking} formContent={formContent} setPdfSummary={setPdfSummary} pdfSummary={pdfSummary}/>}
				{activeStep === FormSteps.Confirmation &&
                    <FormConfirmation bookingState={bookingState}
                                      formContent={formContent}
                                      booking={booking}
                                      submitBooking={submitBooking}
									  pdfSummary={pdfSummary}

					/>

				}
			</Box>
		</CardContent>
	</Card>;
}
