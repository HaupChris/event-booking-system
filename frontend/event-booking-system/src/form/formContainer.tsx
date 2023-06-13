import {
	Box,
	Button,
	Card,
	CardContent, Grid,
	LinearProgress,
	LinearProgressProps,
	Typography
} from "@mui/material";
import React, {useState} from "react";
import NameAndAddressForm from "./nameAndAddress";
import {NavigateBefore, NavigateNext} from "@mui/icons-material";

import '../css/formContainer.css';
import {Booking, FormContent} from "./interface";
import SignaturePad from "signature_pad";
import {FormSignature} from "./formSignature";
import TicketForm from "./formTicketSelection";
import BeverageForm from "./formBeverageSelection";
import WorkShiftForm from "./formWorkshifts";
import WorkshiftForm from "./formWorkshifts";
import MaterialsForm from "./formMaterials";


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

function LinearProgressWithLabel(props: LinearProgressProps & { currentValue: number, max: number }) {
	return (
		<Box sx={{display: 'flex', alignItems: 'center'}}>
			<Box sx={{width: '100%', mr: 1}}>
				<LinearProgress variant="determinate" {...props} value={(props.currentValue / props.max) * 100.0}/>
			</Box>
			<Box sx={{minWidth: 35}}>
				<Typography variant="body2" color="text.secondary">
					{props.currentValue} von {props.max}
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
		street: "",
		postal_code: "",
		city: "",
		ticket_id: "",
		beverage_id: "",
		timeslot_priority_1: -1,
		timeslot_priority_2: -1,
		timeslot_priority_3: -1,
		material_ids: [],
		amount_shifts: -1,
		total_price: -1,

	}
}

function getDummyFormContent(): FormContent {
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
						num_booked: 2,
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

export function FormContainer() {
	const [formContent, setFormContent] = useState<FormContent>(getDummyFormContent);
	const [formValidation, setFormValidation] = useState<{ [key in keyof Booking]?: string }>({});
	const [booking, setBooking] = useState<Booking>(getEmptyBooking());
	const [activeStep, setActiveStep] = useState(FormSteps.Workshift);
	const maxSteps = Object.keys(FormSteps).length / 2;

	function validateField(key: keyof Booking, value: any) {
    let errorMessage = '';
    switch (key) {
        case 'last_name':
        case 'first_name':
        case 'email':
        case 'phone':
        case 'street':
        case 'postal_code':
        case 'city':
            errorMessage = value === '' ? 'This field is required.' : '';
            break;
        case 'timeslot_priority_1':
        case 'timeslot_priority_2':
        case 'timeslot_priority_3':
            errorMessage = value === '' ? 'You need to select a priority for at least one timeslot.' : '';
            break;
        // Add cases for other fields as needed
    }
    setFormValidation(prev => ({...prev, [key]: errorMessage}));
}


	function isStepValid() {
		const requiredFields: { [key: number]: (keyof Booking)[] } = {
			[FormSteps.NameAndAddress]: ['last_name', 'first_name', 'email', 'phone', 'street', 'postal_code', 'city'],
			[FormSteps.Ticket]: ['ticket_id'],
			[FormSteps.Beverage]: ['beverage_id'],
			[FormSteps.Workshift]: ['timeslot_priority_1', 'timeslot_priority_2', 'timeslot_priority_3', 'amount_shifts'],
			[FormSteps.Material]: ['material_ids'],
			[FormSteps.Summary]: [],

			// Add required fields for other steps as needed
		};

		const currentStepFields = requiredFields[activeStep];

		if (!currentStepFields) {
			return true;
		}

		let isValid = true;
		if (activeStep !== FormSteps.Workshift) {
			return isValid;
		}

		for (let field of currentStepFields) {
			if (!booking[field]) {
				isValid = false;
			}
			validateField(field, booking[field]);
		}

		return isValid;
	}


	function updateBooking(key: keyof Booking, value: any) {
		setBooking({...booking, [key]: value});
		validateField(key, value);
	}

	function updateMaterialIds(material_ids: Array<number>) {
		setBooking({...booking, material_ids: material_ids});
	}


	return <Card className={"form-container"}>
		<Grid container className={"navigation"}>
			<Grid item xs={12} className={"navigation-progress"}>
				<LinearProgressWithLabel variant="determinate" max={maxSteps} currentValue={activeStep + 1}/>
			</Grid>
			<Grid item xs={12} className={"navigation-buttons"}>
				<Button variant={"outlined"} sx={{'display': activeStep < 1 ? "none" : "inline-block"}}
						onClick={() => setActiveStep(activeStep - 1)}>
					<NavigateBefore/>
				</Button>
				<Button
					variant={"outlined"}
					sx={{'display': activeStep >= maxSteps - 1 ? "none" : "inline-block"}}
					onClick={() => {
						if (isStepValid()) {
							setActiveStep(activeStep + 1)
						}
					}}>
					<NavigateNext/>
				</Button>

			</Grid>
		</Grid>
		<CardContent>
			<Typography variant={"h5"}>Schritt {activeStep + 1}</Typography>
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
			{/*{activeStep === FormSteps.AwarenessCode && <AwarenessCodeForm/>}*/}
			{activeStep === FormSteps.Signature &&
                <FormSignature updateBooking={updateBooking}
							   currentBooking={booking}
							   formValidation={formValidation}
							   formContent={formContent}
				/>}
			{/*{activeStep === FormSteps.Signature && <SignatureForm/>}*/}
			{/*{activeStep === FormSteps.Summary && <SummaryForm/>}*/}
			{/*{activeStep === FormSteps.Confirmation && <ConfirmationForm/>}*/}
		</CardContent>
	</Card>;
}
