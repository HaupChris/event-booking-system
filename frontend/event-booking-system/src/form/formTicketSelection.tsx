import { FormControl, FormControlLabel, Radio, RadioGroup, FormHelperText } from "@mui/material";
import { FormProps } from './formContainer';
import {FormContent, TicketOption} from './interface';
import React from "react";

interface TicketFormProps extends FormProps {
	formContent: FormContent;
}

function TicketForm(props: TicketFormProps) {
	const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		props.updateBooking('ticket_id', Number((event.target as HTMLInputElement).value));
	};

	const maxNumTicketsPerDay = 110;
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
			isSoldOut =  isSoldOut || visitorsThursday >= maxNumTicketsPerDay;
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
		<FormControl component="fieldset" error={!!props.formValidation.ticket_id} required>
			<RadioGroup
				name="ticketOptions"
				value={props.currentBooking.ticket_id}
				onChange={handleRadioChange}
			>
				{props.formContent.ticket_options.map((option: TicketOption) => (
					<FormControlLabel
						key={option.id}
						disabled={dayIsSoldOut(option.title)}
						value={option.id}
						control={<Radio />}
						label={`${option.title} - ${dayIsSoldOut(option.title) ? 'ausverkauft' : option.price + '€'}`}
					/>
				))}
			</RadioGroup>
		</FormControl>
	);
}

export default TicketForm;
