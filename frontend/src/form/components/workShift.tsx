import {Booking, WorkShift as WorkShiftType} from '../userArea/interface';
import {Box, List, ListItem, Typography, alpha} from '@mui/material';
import React, {useEffect, useState} from 'react';
import TimeSlot from './timeSlot';
import '../../css/workShift.css';
import {PRIORITIES} from "../userArea/constants";
import AssignmentIcon from '@mui/icons-material/Assignment';

interface WorkShiftProps {
    workShift: WorkShiftType;
    currentBooking: Booking;
    updateBooking: (key: keyof Booking, value: any) => void;
    availablePriorities: string[];
}

function WorkShift({workShift, currentBooking, updateBooking, availablePriorities}: WorkShiftProps) {
    const [sortedTimeSlots, setSortedTimeSlots] = useState(workShift.time_slots);

    useEffect(() => {
        // Sort time slots so that filled ones appear at the bottom
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
            mb: 3,
            p: 0,
            borderRadius: '10px',
        }}>
            {/* Shift Title & Description */}
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                mb: 3,
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                }}>
                    <AssignmentIcon sx={{ color: '#64b5f6', mr: 1 }} />
                    <Typography
                        color="primary"
                        variant="h5"
                        sx={{
                            fontWeight: 'medium',
                        }}
                    >
                        {workShift.title}
                    </Typography>
                </Box>

                <Typography
                    sx={{
                        color: alpha('#fff', 0.7),
                        pl: 4, // Align with title (after icon)
                    }}
                    variant="body2"
                >
                    {workShift.description}
                </Typography>
            </Box>

            {/* TimeSlots List */}
            <ListItem
                key={workShift.title + "-" + workShift.id}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    p: 0
                }}
            >
                <List
                    className="timeslot-list"
                    sx={{
                        width: '100%',
                        pl: 0
                    }}
                >
                    {sortedTimeSlots.map((timeSlot) => {
                        const selectedPriority = currentBooking.timeslot_priority_1 === timeSlot.id
                            ? PRIORITIES.FIRST
                            : currentBooking.timeslot_priority_2 === timeSlot.id
                                ? PRIORITIES.SECOND
                                : currentBooking.timeslot_priority_3 === timeSlot.id
                                    ? PRIORITIES.THIRD
                                    : "";

                        return (
                            <TimeSlot
                                key={timeSlot.id}
                                currentBooking={currentBooking}
                                timeSlot={timeSlot}
                                availablePriorities={availablePriorities}
                                selectedPriority={selectedPriority}
                                updateBooking={updateBooking}
                            />
                        );
                    })}
                </List>
            </ListItem>
        </Box>
    );
}

export default WorkShift;