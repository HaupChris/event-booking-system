import {Booking, TimeSlot as TimeSlotType} from '../userArea/interface';
import {
    FormControl, IconButton, Input, InputLabel, LinearProgress,
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
import { PRIORITIES } from "../userArea/constants";

interface TimeSlotProps {
    timeSlot: TimeSlotType;
    selectedPriority: string;
    updateBooking: (key: keyof Booking, value: any) => void;
    availablePriorities: string[];
    currentBooking: Booking;
}

function TimeSlot({timeSlot, selectedPriority, updateBooking, availablePriorities, currentBooking}: TimeSlotProps) {
    const isFull = timeSlot.num_booked >= timeSlot.num_needed;
    const timeslotAvailablePriorities = availablePriorities.concat([selectedPriority]);


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

    const selectedPriorityBorder = selectedPriority === PRIORITIES.FIRST ? '3px solid green' : selectedPriority === PRIORITIES.SECOND ? '3px solid lightgreen' : selectedPriority === PRIORITIES.THIRD ? '3px solid lightgrey' : '1px solid transparent';

    const handleReset = () => {
        if (selectedPriority === PRIORITIES.FIRST) {
            updateBooking("timeslot_priority_1", -1);
        } else if (selectedPriority === PRIORITIES.SECOND) {
            updateBooking("timeslot_priority_2", -1);
        } else if (selectedPriority === PRIORITIES.THIRD) {
            updateBooking("timeslot_priority_3", -1);
        }
    }

    const timeslotNumBooked = timeSlot.num_booked + (currentBooking.timeslot_priority_1 == timeSlot.id ? 1 : 0);


    return <ListItem key={timeSlot.title + '-' + timeSlot.id} sx={{
        border: selectedPriorityBorder,
        opacity: isFull ? '40%' : '100%',
        marginLeft: 0,
        paddingLeft: 0,
        borderRadius: "10px"
    }}>
        <ListItemAvatar>
        	<CircularProgressWithLabel valueCurrent={timeslotNumBooked} valueMax={timeSlot.num_needed}/>
        </ListItemAvatar>
        <LinearProgress color={"secondary"} variant={"determinate"} value={200}/>
        <ListItemText>
            <Typography
                sx={{display: 'inline', mx: 2}}
                component="span"
                variant="body2"
                color="text.primary"
            >
                {`${timeSlot.title}`}

                {timeSlot.start_time.length !== 0 && timeSlot.end_time.length !== 0 ? <>
                    <br/> {`${timeSlot.start_time} - ${timeSlot.end_time}`}</> : ""}
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
                        endAdornment={<IconButton sx={{display: selectedPriority !== "" ? "" : "none", marginRight: 2}}
                                                  onClick={handleReset} size="small"><Close/></IconButton>}
                    />}
                >
                    {timeslotAvailablePriorities.map((priority) => (
                        <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </ListItemText>
    </ListItem>
}

export default TimeSlot;
