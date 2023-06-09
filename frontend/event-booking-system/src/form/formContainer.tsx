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
import { FormContent } from "./interface";


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

export function FormContainer() {
	const [formContent, setFormContent] = useState<FormContent | null>(null);
	const [activeStep, setActiveStep] = useState(1);
	const [userInputs, setUserInputs] = useState<any>({});
	const maxSteps = Object.keys(FormSteps).length / 2;

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
				<Button variant={"outlined"} sx={{'display': activeStep >= maxSteps - 1 ? "none" : "inline-block"}}
						onClick={() => setActiveStep(activeStep + 1)}>
					<NavigateNext/>
				</Button>
			</Grid>
		</Grid>
		<CardContent>
			<Typography variant={"h5"}>Schritt {activeStep + 1}</Typography>
			{activeStep === FormSteps.NameAndAddress && <NameAndAddressForm/>}
			{/*{activeStep === FormSteps.Ticket && <TicketForm/>}*/}
			{/*{activeStep === FormSteps.Beverage && <BeverageForm/>}*/}
			{/*{activeStep === FormSteps.Workshift && <WorkshiftForm/>}*/}
			{/*{activeStep === FormSteps.Material && <MaterialForm/>}*/}
			{/*{activeStep === FormSteps.AwarenessCode && <AwarenessCodeForm/>}*/}
			{/*{activeStep === FormSteps.Signature && <SignatureForm/>}*/}
			{/*{activeStep === FormSteps.Summary && <SummaryForm/>}*/}
			{/*{activeStep === FormSteps.Confirmation && <ConfirmationForm/>}*/}
		</CardContent>
	</Card>;
}
