import {FormProps} from "./formContainer";
import React, {useEffect, useState} from "react";
import WorkShift from "./components/workShift";
import {
	Box,
	Divider,
	FormControl,
	InputLabel,
	List,
	MenuItem,
	Select,
	TextField, Typography
} from "@mui/material";
import {TimeSlot} from "./interface";

function WorkShiftForm(props: FormProps) {
	const [availablePriorities, setAvailabelPriorities] = useState<string[]>(["Höchste", "Mittlere", "Notnagel", ""]);
	const errorMessage = props.formValidation["timeslot_priority_1"];


	useEffect(() => {
		updateAvailablePriorities();
	}, [props.currentBooking.timeslot_priority_1, props.currentBooking.timeslot_priority_2, props.currentBooking.timeslot_priority_3])

	function updateAvailablePriorities() {

		let availablePriorities = ["Höchste", "Mittlere", "Notnagel"];
		if (props.currentBooking.timeslot_priority_1 !== -1) {
			availablePriorities.splice(availablePriorities.indexOf("Höchste"), 1);
		}
		if (props.currentBooking.timeslot_priority_2 !== -1) {
			availablePriorities.splice(availablePriorities.indexOf("Mittlere"), 1);
		}
		if (props.currentBooking.timeslot_priority_3 !== -1) {
			availablePriorities.splice(availablePriorities.indexOf("Notnagel"), 1);
		}

		setAvailabelPriorities(prevPriorities => availablePriorities);
	}


	return <Box
		sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: '90vw'}}>
		<Typography variant="body2">
			Wir freuen uns, wenn du uns bei einer Supportschicht unterstützen könntest!
			Wähle bitte <strong>drei</strong> Prioritäten aus.
			Die Zahlen zeigen, wie viele Helfer:innen schon dabei sind und wie viele wir noch brauchen.
			Möchtest du mit einer bestimmten Person zusammenarbeiten oder bist du bereit, mehr als eine Schicht zu
			übernehmen?
			Lass es uns wissen - wir berücksichtigen dies gerne bei unserer Planung.
		</Typography>
		<Divider sx={{width: '100%', margin: '1em'}}/>
		<Typography variant="body2">
			Supporterbuddy und deine Schichtenanzahl
		</Typography>
		<FormControl sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '90%', marginTop: '16px', marginBottom: '8px'}}>
			<TextField
				error={!!props.formValidation.supporter_buddy}
				variant="outlined"
				margin="normal"
				id="supporter-buddy"
				label="Dein Buddy..."
				name="name"
				value={props.currentBooking.supporter_buddy}
				onChange={e => props.updateBooking("supporter_buddy", e.target.value)}
			/>
			<Select
				sx={{ml: 2}}
				variant={"outlined"}
				labelId="shift-select-label"
				id="shift-select"
				value={props.currentBooking.amount_shifts}
				onChange={e => props.updateBooking('amount_shifts', e.target.value)}>
				<MenuItem value={1}>1</MenuItem>
				<MenuItem value={2}>2</MenuItem>
				<MenuItem value={3}>3</MenuItem>
			</Select>

		</FormControl>
		<Divider sx={{width: '100%', margin: '1em'}}/>
		<List>
			{props.formContent.work_shifts
				.sort((shift_a, shift_b) => {
					const shift_a_workers = shift_a.time_slots.reduce((sum: number, timeslot: TimeSlot) => (sum + timeslot.num_needed - timeslot.num_booked), 0);
					const shift_b_workers = shift_b.time_slots.reduce((sum: number, timeslot: TimeSlot) => (sum + timeslot.num_needed - timeslot.num_booked), 0);
					if (shift_a_workers > shift_b_workers) {
						return -1;
					}
					if (shift_a_workers < shift_b_workers) {
						return 1;
					}
					return 0;
				})
				.map(workShift => (
					<>
						<WorkShift
							key={workShift.id}
							workShift={workShift}
							availablePriorities={availablePriorities}
							currentBooking={props.currentBooking}
							updateBooking={props.updateBooking}
						/>
						<Divider/>
					</>
				))}
		</List>


	</Box>;
}

export default WorkShiftForm;
