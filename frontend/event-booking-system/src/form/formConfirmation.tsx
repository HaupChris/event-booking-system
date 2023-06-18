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
import {Check, CheckCircleOutline, Download, ErrorOutline, FileCopy, OpenInNew} from "@mui/icons-material";

import '../css/formConfirmation.css';
import {BookingState} from "./formContainer";
import {jsPDF} from "jspdf";

interface FinalBookingProps {
	booking: Booking;
	submitBooking: () => void;
	formContent: FormContent;
	bookingState: BookingState;
	pdfSummary: jsPDF;
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

	const saveSummary = () => {
		props.pdfSummary.save('booking-summary.pdf');
	}

	console.log('formConfirmation.tsx: props.bookingState.isSubmitted: ', props.bookingState.isSubmitted);
	console.log('formConfirmation.tsx: props.bookingState.isSuccessful: ', props.bookingState.isSuccessful);

	return (
		<Box sx={{mt: 3, p: 2, borderRadius: '5px'}}>
			{props.bookingState.isSubmitted ? (props.bookingState.isSuccessful ? (
						<div>
							<div className="icon-container">
								<CheckCircleOutline color="primary" style={{fontSize: 60}}/>
								<Typography variant="h6">
									Du bist dabei!
								</Typography>
							</div>
							<Button onClick={saveSummary} sx={{mb: '1em'}} variant="outlined" color="primary">
								Zusammenfassung der Buchung herunterladen <Download/>
							</Button>

							<div>
								<div className={"checkout"}>
									<Typography variant="h5"  component="div" sx={{mb: '1em'}}>
										Dein Beitrag: <strong>{props.booking.total_price}€</strong>
									</Typography>

									<Typography variant="body2" sx={{mb: '1em'}} component="div">
										<TextField
											sx={{width: {xs: '100%', md: '70%'}}}
											variant={"standard"}
											value={betreff}
											helperText="Betreff für die Überweisung"
										/>
										<Snackbar
											open={copied}
											autoHideDuration={4000}
											onClose={handleClose}
											message="Betreff kopiert"
										/>

									</Typography>
									<Button variant={"outlined"} sx={{mb: '1em'}} onClick={handleCopy}>
										Betreff kopieren <FileCopy/>
									</Button>
									<a
										href="https://paypal.me/ChristianHauptmanny" target="_blank"
										rel="noreferrer">
										<Button variant={"contained"}>
											Zu unserem Paypal <OpenInNew/>
										</Button>
									</a>

								</div>


								<Typography sx={{"pt": 2}} variant={"subtitle2"}>
									Solltest du kein Paypal haben, schreibe dir deinen Beitrag auf und kontaktiere <u>Christian
									Hauptmann</u>.
								</Typography>

							</div>
						</div>)

					:

					(
						<div className="icon-container">
							<ErrorOutline color="error" style={{fontSize: 60}}/>
							<Typography variant="h6">Buchung fehlgeschlagen, bitte Christian Hauptmann
								kontaktieren.</Typography>
						</div>)
			) : (<Box sx={{display: 'flex', 'flexDirection': 'column', 'alignItems': 'center', 'justifyContent': 'center'}}>
					<Typography variant="body1" component="div" sx={{mb: 2}}>
						Wir freuen uns, dass du dabei bist und mit uns zusammen feierst!
						<br/>

					</Typography>

					<Button variant="contained" color="primary" onClick={props.submitBooking}>
						<Check/> Buchung absenden
					</Button>
				</Box>
			)}

		</Box>
	)
		;
}

export default FormConfirmation;
