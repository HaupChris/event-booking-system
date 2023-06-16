import {
	Button,
	Box,
	Typography,
	TextField,
	InputAdornment,
	IconButton,
	Snackbar,
} from '@mui/material';
import {Booking, FormContent} from "./interface";
import React, {useState} from "react";
import {CheckCircleOutline, ErrorOutline, FileCopy} from "@mui/icons-material";

import '../css/formConfirmation.css';
import {BookingState} from "./formContainer";

interface FinalBookingProps {
	booking: Booking;
	submitBooking: () => void;
	formContent: FormContent;
	bookingState: BookingState;
}

function findItemById<T extends { id: number }>(array: T[], id: number): T | undefined {
	return array.find(item => item.id === id);
}

function FormConfirmation(props: FinalBookingProps) {
	const ticket = findItemById(props.formContent.ticket_options, props.booking.ticket_id);
	const beverage_or_undefined = findItemById(props.formContent.beverage_options, props.booking.beverage_id);
	const beverage = beverage_or_undefined ? beverage_or_undefined : {title: "Keine Bierflat"};
	const betreff = `WWWW: ${props.booking.last_name}, ${props.booking.first_name} - ${ticket?.title}, ${beverage?.title}`;
	const [copied, setCopied] = useState(false);
	const handleCopy = () => {
		navigator.clipboard.writeText(betreff);
		setCopied(true);
	}

	const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}

		setCopied(false);
	};

	console.log('formConfirmation.tsx: props.bookingState.isSubmitted: ', props.bookingState.isSubmitted);
	console.log('formConfirmation.tsx: props.bookingState.isSuccessful: ', props.bookingState.isSuccessful);

	return (
		<Box sx={{mt: 3, p: 2, borderRadius: '5px'}}>
			<Typography variant="body1" component="div" sx={{mb: 2}}>
				Wir freuen uns, dass du dabei bist!
				<br/>
				Bitte überweise noch kurz den Betrag von <strong>{props.booking.total_price}€ </strong> auf <a
				href="https://paypal.me/ChristianHauptmanny" target="_blank"
				rel="noreferrer">unser Paypal</a>.
			</Typography>

			<Typography variant="body1" component="div" sx={{mb: 2}}>
				<TextField
					sx={{width: {xs: '100%', md: '70%'}}}
					variant={"standard"}
					value={betreff}
					helperText="Betreff für die Überweisung"
					InputProps={{
						readOnly: true,
						endAdornment: (
							<InputAdornment position="end">
								<IconButton onClick={handleCopy}>
									<FileCopy/>
								</IconButton>
							</InputAdornment>
						)
					}}
				/>
				<Snackbar
					open={copied}
					autoHideDuration={4000}
					onClose={handleClose}
					message="Betreff kopiert"
				/>
				<br/>
				<br/>

			</Typography>

			{props.bookingState.isSubmitted ? ( props.bookingState.isSuccessful ? (
				<div className="icon-container">
					<CheckCircleOutline color="primary" style={{fontSize: 60}}/>
					<Typography variant="h6">Buchung erfolgreich</Typography>
				</div> ) : (
				<div className="icon-container">
					<ErrorOutline color="error" style={{fontSize: 60}}/>
					<Typography variant="h6">Buchung fehlgeschlagen, bitte Christian Hauptmann kontaktieren.</Typography>
				</div> )
			) : (
				<Button variant="contained" color="primary" onClick={props.submitBooking}>
					Buchung absenden
				</Button>
			)}
			<Typography sx={{"pt": 2}} variant={"subtitle2"}>
				Solltest du kein Paypal haben, schreibe dir deinen Beitrag auf und kontaktiere <u>Christian
				Hauptmann</u>.
			</Typography>
		</Box>
	);
}

export default FormConfirmation;
