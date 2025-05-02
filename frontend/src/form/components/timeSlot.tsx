import { Booking, TimeSlot as TimeSlotType } from '../userArea/interface';
import {
    FormControl,
    IconButton,
    Input,
    InputLabel,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography,
    Paper
} from '@mui/material';
import React from 'react';
import { CircularProgressWithLabel } from './circularProgressWithLabel';
import { Close } from "@mui/icons-material";
import { PRIORITIES } from "../userArea/constants";

interface TimeSlotProps {
    timeSlot: TimeSlotType;
    selectedPriority: string;
    updateBooking: (key: keyof Booking, value: any) => void;
    availablePriorities: string[];
    currentBooking: Booking;
}

function TimeSlot({ timeSlot, selectedPriority, updateBooking, availablePriorities, currentBooking }: TimeSlotProps) {
    const isFull = timeSlot.num_booked >= timeSlot.num_needed;
    const timeslotAvailablePriorities = availablePriorities.concat([selectedPriority]).filter(p => p !== "");

    const handlePriorityChange = (event: SelectChangeEvent<{ value: unknown }>) => {
        const newPriority = event.target.value as string;

        if (newPriority === PRIORITIES.FIRST) {
            updateBooking("timeslot_priority_1", timeSlot.id);
            if (currentBooking.timeslot_priority_2 === timeSlot.id) {
                updateBooking("timeslot_priority_2", -1);
            }
            if (currentBooking.timeslot_priority_3 === timeSlot.id) {
                updateBooking("timeslot_priority_3", -1);
            }
        } else if (newPriority === PRIORITIES.SECOND) {
            updateBooking("timeslot_priority_2", timeSlot.id);
            if (currentBooking.timeslot_priority_1 === timeSlot.id) {
                updateBooking("timeslot_priority_1", -1);
            }
            if (currentBooking.timeslot_priority_3 === timeSlot.id) {
                updateBooking("timeslot_priority_3", -1);
            }
        } else if (newPriority === PRIORITIES.THIRD) {
            updateBooking("timeslot_priority_3", timeSlot.id);
            if (currentBooking.timeslot_priority_1 === timeSlot.id) {
                updateBooking("timeslot_priority_1", -1);
            }
            if (currentBooking.timeslot_priority_2 === timeSlot.id) {
                updateBooking("timeslot_priority_2", -1);
            }
        }
    };

    const getPriorityBorderColor = () => {
        if (selectedPriority === PRIORITIES.FIRST) return 'success.main';
        if (selectedPriority === PRIORITIES.SECOND) return 'info.main';
        if (selectedPriority === PRIORITIES.THIRD) return 'warning.main';
        return 'transparent';
    };

    const handleReset = () => {
        if (selectedPriority === PRIORITIES.FIRST) {
            updateBooking("timeslot_priority_1", -1);
        } else if (selectedPriority === PRIORITIES.SECOND) {
            updateBooking("timeslot_priority_2", -1);
        } else if (selectedPriority === PRIORITIES.THIRD) {
            updateBooking("timeslot_priority_3", -1);
        }
    };

    const timeslotNumBooked = timeSlot.num_booked + (currentBooking.timeslot_priority_1 === timeSlot.id ? 1 : 0);

    return (
        <Paper
            elevation={1}
            sx={{
                mb: 2,
                border: selectedPriority ? `2px solid` : 'none',
                borderColor: getPriorityBorderColor(),
                borderRadius: 2,
                opacity: isFull ? 0.6 : 1,
                transition: 'all 0.3s ease',
                background: 'rgba(26, 26, 26, 0.3)',
                '&:hover': {
                    background: 'rgba(26, 26, 26, 0.5)',
                }
            }}
        >
            <ListItem>
                <ListItemAvatar>
                    <CircularProgressWithLabel
                        valueCurrent={timeslotNumBooked}
                        valueMax={timeSlot.num_needed}
                    />
                </ListItemAvatar>

                <ListItemText>
                    <Typography
                        sx={{ display: 'inline', mx: 2 }}
                        component="span"
                        variant="body1"
                        color="text.primary"
                    >
                        {timeSlot.title}
                        {timeSlot.start_time.length !== 0 && timeSlot.end_time.length !== 0 ? (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                component="div"
                                sx={{ mt: 0.5 }}
                            >
                                {`${timeSlot.start_time} - ${timeSlot.end_time}`}
                            </Typography>
                        ) : null}
                    </Typography>
                </ListItemText>

                <FormControl variant="standard" sx={{ minWidth: "120px" }}>
                    {selectedPriority ? "" :  <InputLabel id={`priority-select-label-${timeSlot.id}`}>Priorität</InputLabel>}
                    <Select
                        labelId={`priority-select-label-${timeSlot.id}`}
                        id={`priority-select-${timeSlot.id}`}
                        // @ts-ignore
                        value={selectedPriority}
                        onChange={handlePriorityChange}
                        label="Priorität"
                        input={
                            <Input
                                endAdornment={
                                    selectedPriority ? (
                                        <IconButton
                                            onClick={handleReset}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            <Close fontSize="small" />
                                        </IconButton>
                                    ) : null
                                }
                            />
                        }
                        disabled={isFull && !selectedPriority}
                    >
                        {timeslotAvailablePriorities.map((priority) => (
                            <MenuItem key={priority} value={priority}>
                                {priority}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </ListItem>
        </Paper>
    );
}

export default TimeSlot;