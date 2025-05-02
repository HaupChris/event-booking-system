import {Booking, TimeSlot as TimeSlotType} from '../userArea/interface';
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
    Paper,
    Box, CircularProgress
} from '@mui/material';
import React from 'react';
import {CircularProgressWithLabel} from './circularProgressWithLabel';
import {Close} from "@mui/icons-material";
import {PRIORITIES} from "../userArea/constants";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface TimeSlotProps {
    timeSlot: TimeSlotType;
    selectedPriority: string;
    updateBooking: (key: keyof Booking, value: any) => void;
    availablePriorities: string[];
    currentBooking: Booking;
}

function TimeSlot({timeSlot, selectedPriority, updateBooking, availablePriorities, currentBooking}: TimeSlotProps) {
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
            elevation={3}
            sx={{
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
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
            <ListItem sx={{
                display: 'flex',
                flexDirection: {xs: 'column', sm: 'row'},
                alignItems: {xs: 'flex-start', sm: 'center'},
                py: {xs: 2, sm: 1},
                px: {xs: 2, sm: 2}
            }}>
                {/* Mobile layout - stacked */}
                <Box sx={{
                    width: '100%',
                    display: {xs: 'flex', sm: 'none'},
                    flexDirection: 'column',
                }}>
                    {/* Row 1: Title */}
                    <Typography
                        component="div"
                        variant="body1"
                        color="text.primary"
                        sx={{width: '100%', mb: 1, fontWeight: 'medium', fontSize: '1.1rem'}}
                    >
                        {timeSlot.title}
                    </Typography>

                    {/* Row 2: Time with icon */}
                    {timeSlot.start_time.length !== 0 && timeSlot.end_time.length !== 0 ? (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2,
                            color: 'text.secondary'
                        }}>
                            <AccessTimeIcon sx={{fontSize: '1rem', mr: 0.5}}/>
                            <Typography variant="body2" component="span">
                                {`${timeSlot.start_time} - ${timeSlot.end_time}`}
                            </Typography>
                        </Box>
                    ) : null}

                    {/* Row 3: Interest indicator and Select in a card */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        p: 0,
                        boxShadow: 1
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2
                        }}>
                            <Box sx={{position: 'relative'}}>
                                <CircularProgress
                                    variant="determinate"
                                    value={timeslotNumBooked > 0 ? (timeslotNumBooked / timeSlot.num_needed) * 100 : 0}
                                    size={40}
                                    thickness={4}
                                    sx={{
                                        color: timeslotNumBooked >= timeSlot.num_needed ? 'error.main' : 'primary.main',
                                        backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                        borderRadius: '50%'
                                    }}
                                />
                                <Box
                                    sx={{
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        right: 0,
                                        position: 'absolute',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Typography variant="caption" component="div" color="text.secondary">
                                        {`${timeslotNumBooked}/${timeSlot.num_needed}`}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" sx={{ml: 2}}>
                                {timeslotNumBooked >= timeSlot.num_needed
                                    ? "Hohe Nachfrage – Zuteilung per Los"
                                    : "Interesse angemeldet"}
                            </Typography>
                        </Box>

                        <FormControl variant="outlined" size="small" sx={{width: '100%'}}>
                            <InputLabel id={`priority-select-label-mobile-${timeSlot.id}`}>Priorität</InputLabel>
                            <Select
                                labelId={`priority-select-label-mobile-${timeSlot.id}`}
                                id={`priority-select-mobile-${timeSlot.id}`}
                                // @ts-ignore
                                value={selectedPriority}
                                onChange={handlePriorityChange}
                                label="Priorität"
                                endAdornment={
                                    selectedPriority ? (
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReset();
                                            }}
                                            size="small"
                                            edge="end"
                                            sx={{marginRight: 2}}
                                        >
                                            <Close fontSize="small"/>
                                        </IconButton>
                                    ) : null
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
                    </Box>
                </Box>

                {/* Desktop layout - improved */}
                <Box sx={{
                    width: '100%',
                    display: {xs: 'none', sm: 'flex'},
                    alignItems: 'center'
                }}>
                    {/* Improved circular progress */}
                    <Box sx={{position: 'relative', mr: 2}}>
                        <CircularProgress
                            variant="determinate"
                            value={timeslotNumBooked > 0 ? (timeslotNumBooked / timeSlot.num_needed) * 100 : 0}
                            size={40}
                            thickness={4}
                            sx={{
                                color: timeslotNumBooked >= timeSlot.num_needed ? 'error.main' : 'primary.main',
                                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                borderRadius: '50%'
                            }}
                        />
                        <Box
                            sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography variant="caption" component="div" color="text.secondary">
                                {`${timeslotNumBooked}/${timeSlot.num_needed}`}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Slot information */}
                    <Box sx={{flexGrow: 1}}>
                        <Typography
                            variant="body1"
                            color="text.primary"
                            sx={{fontWeight: 'medium'}}
                        >
                            {timeSlot.title}
                        </Typography>
                        {timeSlot.start_time.length !== 0 && timeSlot.end_time.length !== 0 ? (
                            <Box sx={{display: 'flex', alignItems: 'center', mt: 0.5}}>
                                <AccessTimeIcon sx={{fontSize: '0.875rem', mr: 0.5, color: 'text.secondary'}}/>
                                <Typography variant="body2" color="text.secondary">
                                    {`${timeSlot.start_time} - ${timeSlot.end_time}`}
                                </Typography>
                            </Box>
                        ) : null}
                    </Box>

                    {/* Status indicator for desktop */}
                    {timeslotNumBooked >= timeSlot.num_needed && (
                        <Typography
                            variant="caption"
                            sx={{
                                mr: 2,
                                color: 'text.secondary',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                px: 1,
                                py: 0.5
                            }}
                        >
                            Hohe Nachfrage – Zuteilung per Los
                        </Typography>
                    )}

                    {/* Priority selection */}
                    <FormControl variant="outlined" size="small" sx={{minWidth: "150px"}}>
                        <InputLabel id={`priority-select-label-${timeSlot.id}`}>Priorität</InputLabel>
                        <Select
                            labelId={`priority-select-label-${timeSlot.id}`}
                            id={`priority-select-${timeSlot.id}`}
                            // @ts-ignore
                            value={selectedPriority}
                            onChange={handlePriorityChange}
                            label="Priorität"
                            endAdornment={
                                selectedPriority ? (
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReset();
                                        }}
                                        size="small"
                                        edge="end"
                                        sx={{marginRight: 2}}
                                    >
                                        <Close fontSize="small"/>
                                    </IconButton>
                                ) : null
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
                </Box>
            </ListItem>
        </Paper>
    );
}

export default TimeSlot;