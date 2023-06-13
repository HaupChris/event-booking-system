import {Booking, WorkShift as WorkShiftType} from '../interface';
import {Divider, List, ListItem, Typography} from '@mui/material';
import React from 'react';
import TimeSlot from './timeSlot';

interface WorkShiftProps {
	workShift: WorkShiftType;
	currentBooking: Booking;
	updateBooking: (key: keyof Booking, value: any) => void;
	availablePriorities: string[];
}

function WorkShift({workShift, currentBooking, updateBooking, availablePriorities}: WorkShiftProps) {
	return (
		<div>
			<Typography variant="h6">{workShift.title}</Typography>
			<Typography variant="body2">{workShift.description}</Typography>
			<ListItem>
				<List>
					{workShift.time_slots.map((timeSlot) => {
						const selectedPriority = currentBooking.timeslot_priority_1 === timeSlot.id
							? "Höchste" : currentBooking.timeslot_priority_2 === timeSlot.id
								? "Mittlere" : currentBooking.timeslot_priority_3 === timeSlot.id
									? "Notnagel" : "";

						return <>

							<TimeSlot
								key={timeSlot.id}
								timeSlot={timeSlot}
								availablePriorities={availablePriorities}
								selectedPriority={selectedPriority}
								updateBooking={updateBooking}
							/>


						</>
					})}
				</List>

			</ListItem>
		</div>
	);
}

export default WorkShift;
