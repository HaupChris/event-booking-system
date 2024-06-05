import {Booking, WorkShift as WorkShiftType} from '../interface';
import {Box, Divider, List, ListItem, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import TimeSlot from './timeSlot';
import '../../css/workShift.css';
import portholeImage from "../../img/porthole_transparent.png";

interface WorkShiftProps {
    workShift: WorkShiftType;
    currentBooking: Booking;
    updateBooking: (key: keyof Booking, value: any) => void;
    availablePriorities: string[];
}

function WorkShift({workShift, currentBooking, updateBooking, availablePriorities}: WorkShiftProps) {
    const [sortedTimeSlots, setSortedTimeSlots] = useState(workShift.time_slots);

    useEffect(() => {
        const sorted = [...workShift.time_slots].sort((a, b) => {
            if (a.num_booked >= a.num_needed && b.num_booked < b.num_needed) {
                return 1;
            } else if (b.num_booked >= b.num_needed && a.num_booked < a.num_needed) {
                return -1;
            }
            return 0;
        });

        setSortedTimeSlots(sorted);
    }, [workShift]);


    return (
        <Box sx={{
            display: 'flex',
            'flexDirection': 'column',
            'alignItems': 'center',
            'justifyContent': 'center',
            maxWidth: '90vw',
            marginTop: '8px'
        }}>
            <Box sx={{display: "flex", flexDirection: "column"}}>
                <Typography align={"center"} color={"text-primary"} variant="h5">{workShift.title}</Typography>
                <Typography align={"justify"} sx={{ color: (theme) => theme.palette.text.secondary }} variant="body2">{workShift.description}</Typography>

            </Box>

            <ListItem key={workShift.title + "-" + workShift.id}
                      sx={{paddingLeft: 0, paddingRight: 0, display: 'flex', justifyContent: 'center'}}>
                <List className={'timeslot-list'}>
                    {sortedTimeSlots.map((timeSlot) => {
                        const selectedPriority = currentBooking.timeslot_priority_1 === timeSlot.id
                            ? "Höchste" : currentBooking.timeslot_priority_2 === timeSlot.id
                                ? "Mittlere" : currentBooking.timeslot_priority_3 === timeSlot.id
                                    ? "Notnagel" : "";
                        return <TimeSlot
                            currentBooking={currentBooking}
                            timeSlot={timeSlot}
                            availablePriorities={availablePriorities}
                            selectedPriority={selectedPriority}
                            updateBooking={updateBooking}
                        />;
                    })}
                </List>
            </ListItem>
        </Box>
    );
}

export default WorkShift;
