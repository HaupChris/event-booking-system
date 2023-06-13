import {FormProps} from "./formContainer";
import React, {useEffect, useState} from "react";
import WorkShift from "./components/workShift";
import {Divider, FormControl, InputLabel, List, MenuItem, Select} from "@mui/material";

function WorkShiftForm(props: FormProps) {
	const [availablePriorities, setAvailabelPriorities] = useState<string[]>(["Höchste", "Mittlere", "Notnagel", ""]);

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


	return (
		<div>
			<List>
				{props.formContent.work_shifts.map(workShift => (
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

			<FormControl>
				<InputLabel id="shift-select-label">Number of Shifts</InputLabel>
				<Select
					labelId="shift-select-label"
					id="shift-select"
					value={props.currentBooking.amount_shifts}
					onChange={e => props.updateBooking('amount_shifts', e.target.value)}>
					<MenuItem value={1}>1</MenuItem>
					<MenuItem value={2}>2</MenuItem>
					<MenuItem value={3}>3</MenuItem>
				</Select>
			</FormControl>
		</div>
	);
}

export default WorkShiftForm;
