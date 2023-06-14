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
						value={option.id}
						control={<Radio />}
						label={`${option.title} - ${option.price}€`}
					/>
				))}
			</RadioGroup>
		</FormControl>
	);
}

export default TicketForm;
