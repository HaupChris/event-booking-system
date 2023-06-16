import {Booking, TimeSlot as TimeSlotType} from '../interface';
import {
	FormControl, IconButton, Input, InputLabel,
	ListItem,
	ListItemAvatar,
	ListItemText,
	MenuItem,
	Select, SelectChangeEvent,
	Typography
} from '@mui/material';
import React from 'react';
import {CircularProgressWithLabel} from './circularProgressWithLabel';
import {Close} from "@mui/icons-material";

interface TimeSlotProps {
	timeSlot: TimeSlotType;
	selectedPriority: string;
	updateBooking: (key: keyof Booking, value: any) => void;
	availablePriorities: string[];
}

function TimeSlot({timeSlot, selectedPriority, updateBooking, availablePriorities}: TimeSlotProps) {
	const isFull = timeSlot.num_booked >= timeSlot.num_needed;
	const timeslotAvailablePriorities = availablePriorities.concat([selectedPriority]);


	const handlePriorityChange = (event: SelectChangeEvent<{ value: unknown }>) => {
		if (event.target.value === "Höchste") {
			updateBooking("timeslot_priority_1", timeSlot.id);
		} else if (event.target.value === "Mittlere") {
			updateBooking("timeslot_priority_2", timeSlot.id);
		} else if (event.target.value === "Notnagel") {
			updateBooking("timeslot_priority_3", timeSlot.id);
		}
	};


	const priorityColor = selectedPriority === "Höchste" ? 'green' : selectedPriority === "Mittlere" ? 'lightgreen' : selectedPriority === "Notnagel" ? 'lightgrey' : 'transparent';
	const selectedPriorityBorder = selectedPriority === "Höchste" ? '1px solid green' : selectedPriority === "Mittlere" ? '1px solid lightgreen' : selectedPriority === "Notnagel" ? '1px solid lightgrey' : '1px solid transparent';

	const handleReset = () => {
		if (selectedPriority === "Höchste") {
			updateBooking("timeslot_priority_1", -1);
		} else if (selectedPriority === "Mittlere") {
			updateBooking("timeslot_priority_2", -1);
		} else if (selectedPriority === "Notnagel") {
			updateBooking("timeslot_priority_3", -1);
		}
	}


	return <ListItem key={timeSlot.title + '-' + timeSlot.id} className={"tetwartasdfsjohnsons"} sx={{border: selectedPriorityBorder, opacity: isFull ? '40%' : '100%', marginLeft: 0, paddingLeft: 0}}>
		<ListItemAvatar>
			<CircularProgressWithLabel valueCurrent={timeSlot.num_booked} valueMax={timeSlot.num_needed}/>
		</ListItemAvatar>

		<ListItemText>
			<Typography
				sx={{display: 'inline', mx: 2}}
				component="span"
				variant="body2"
				color="text.primary"
			>
				{`${timeSlot.title}`}
				<br/>
				{`${timeSlot.start_time} - ${timeSlot.end_time}`}
			</Typography>
		</ListItemText>

		<ListItemText>
			<Typography
				sx={{display: 'inline', mx: 2}}
				component="span"
				variant="body2"
				color="text.secondary"
			>


			</Typography>
		</ListItemText>

		<ListItemText>
			<FormControl variant="standard" sx={{minWidth: "100px"}}>
				<InputLabel id="demo-simple-select-standard-label"> Priorität </InputLabel>
				<Select
					labelId="demo-simple-select-standard-label"
					id="demo-simple-select-standard"
					// @ts-ignore
					value={selectedPriority}
					onChange={handlePriorityChange}
					label="--Select Priority--"
					input={<Input
                        endAdornment={<IconButton sx={{display: selectedPriority !== "" ? "": "none", marginRight: 2}} onClick={handleReset} size="small"><Close/></IconButton>}
                    />}
				>
					{timeslotAvailablePriorities.map((priority) => (
                        <MenuItem value={priority}>{priority}</MenuItem>
                    ))}
				</Select>
			</FormControl>
		</ListItemText>
	</ListItem>
}

export default TimeSlot;
