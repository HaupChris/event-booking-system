import React from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Paper, Box } from "@mui/material";
import { FormProps } from './formContainer';
import { FormContent, TicketOption } from './interface';

interface TicketFormProps extends FormProps {
	formContent: FormContent;
}

function TicketForm(props: TicketFormProps) {
	const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		props.updateBooking('ticket_id', Number((event.target as HTMLInputElement).value));
	};

	const maxNumTicketsPerDay = 120;
	let visitorsThursday = 0;
	let visitorsFriday = 0;
	let visitorsSaturday = 0;

	props.formContent.ticket_options.forEach((option: TicketOption) => {
		if (option.title.includes('Donnerstag')) {
			visitorsThursday += option.num_booked;
		}
		if (option.title.includes('Freitag')) {
			visitorsFriday += option.num_booked;
		}
		if (option.title.includes('Samstag')) {
			visitorsSaturday += option.num_booked;
		}
	});

	function dayIsSoldOut(ticketTitle: string) {
		let isSoldOut = false;

		if (ticketTitle.includes('Donnerstag')) {
			isSoldOut = isSoldOut || visitorsThursday >= maxNumTicketsPerDay;
		}
		if (ticketTitle.includes('Freitag')) {
			isSoldOut = isSoldOut || visitorsFriday >= maxNumTicketsPerDay;
		}
		if (ticketTitle.includes('Samstag')) {
			isSoldOut = isSoldOut || visitorsSaturday >= maxNumTicketsPerDay;
		}

		return isSoldOut;
	}

	return (
		<Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
			<Paper elevation={3} sx={{ p: 3 }}>
				<Typography variant="body1" sx={{ mb: 3 }}>
					Bitte wähle die Tage aus, an denen du am Festival teilnehmen möchtest.
				</Typography>

				<FormControl component="fieldset" error={!!props.formValidation.ticket_id} required fullWidth>
					<RadioGroup
						name="ticketOptions"
						value={props.currentBooking.ticket_id}
						onChange={handleRadioChange}
					>
						{props.formContent.ticket_options.map((option: TicketOption) => (
							<FormControlLabel
								sx={{ padding: "0.5em 0em" }}
								key={option.id}
								disabled={dayIsSoldOut(option.title)}
								value={option.id}
								control={<Radio />}
								label={`${option.title} - ${dayIsSoldOut(option.title) ? 'ausverkauft' : option.price + '€'}`}
							/>
						))}
					</RadioGroup>
				</FormControl>
			</Paper>
		</Box>
	);
}

export default TicketForm;