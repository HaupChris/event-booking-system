import React from 'react';
import { FormProps } from './formContainer';
import {FormControl, FormControlLabel, Radio, RadioGroup, Typography} from "@mui/material";


function BeverageForm(props: FormProps) {
	const handleBeverageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		props.updateBooking('beverage_id', Number((event.target as HTMLInputElement).value));
	};

	return (
		<FormControl component="fieldset">
			<Typography variant="body1" component="div" sx={{mb: 2, mt:2}}>
				Auf dem Festival steht eine frei zugängliche Zapfanlage, an der du dich für den gebuchten Tag so oft du willst bedienen kannst.
			</Typography>
			<RadioGroup aria-label="beverage" name="beverage_id" value={props.currentBooking.beverage_id} onChange={handleBeverageChange}>
				{props.formContent.beverage_options.map(option => (
					<FormControlLabel
						key={option.id}
						value={option.id.toString()}
						control={<Radio />}
						label={option.title + ' - ' + option.price + ' €'}
					/>
				))}
				<FormControlLabel
						key={-1}
						value={"-1"}
						control={<Radio />}
						label={'Kein Bier für mich'}
					/>
			</RadioGroup>
		</FormControl>
	);
};

export default BeverageForm;
