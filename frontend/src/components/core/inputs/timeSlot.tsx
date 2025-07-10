import {Booking, TimeSlot as TimeSlotType} from '../../../form/userArea/interface';
import {
    Box,
    FormControl,
    ListItem,
    Typography,
    Paper,
    alpha
} from '@mui/material';
import React from 'react';
import {PRIORITIES} from "../../../form/userArea/constants";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventBusyIcon from '@mui/icons-material/EventBusy';
import Chip from '@mui/material/Chip';
import WWSelect from "./WWSelect";
import {spacePalette} from "../../styles/theme";
import {ArrowCircleDown, ArrowCircleLeft, ArrowCircleUp, EventAvailable} from "@mui/icons-material";
import CircularProgressWithLabel from "../feedback/CircularProgressWithLabel";

interface TimeSlotProps {
    timeSlot: TimeSlotType;
    selectedPriority: string;
    updateBooking: (key: keyof Booking, value: any) => void;
    availablePriorities: string[];
    currentBooking: Booking;
}

function TimeSlot({timeSlot, selectedPriority, updateBooking, availablePriorities, currentBooking}: TimeSlotProps) {
    const timeslotAvailablePriorities = availablePriorities.concat([selectedPriority]).filter(p => p !== "");

    const options = timeslotAvailablePriorities.map(priority => ({
        value: priority,
        label: priority
    }));

    const handlePriorityChange = (newPriority: string | number | null) => {
        if (newPriority === null || newPriority === undefined) {
            handleReset();
        } else if (newPriority === PRIORITIES.FIRST) {
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
        if (selectedPriority === PRIORITIES.FIRST) return spacePalette.status.success; // success.main
        if (selectedPriority === PRIORITIES.SECOND) return spacePalette.status.info; // info.main
        if (selectedPriority === PRIORITIES.THIRD) return spacePalette.status.warning; // warning.main
        return 'transparent';
    };

    const getPriorityColor = () => {
        if (selectedPriority === PRIORITIES.FIRST) return 'success';
        if (selectedPriority === PRIORITIES.SECOND) return 'info';
        if (selectedPriority === PRIORITIES.THIRD) return 'warning';
        return 'default';
    };

    const getPriorityIcon = () => {
        if (selectedPriority === PRIORITIES.FIRST) return <ArrowCircleUp sx={{fontSize: '0.8rem'}}/>;
        if (selectedPriority === PRIORITIES.SECOND) return <ArrowCircleLeft sx={{fontSize: '0.8rem'}}/>;
        if (selectedPriority === PRIORITIES.THIRD) return <ArrowCircleDown sx={{fontSize: '0.8rem'}}/>;
        return <></>;
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
            elevation={2}
            sx={{
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
                mb: 2,
                border: selectedPriority ? `2px solid ${getPriorityBorderColor()}` : '1px solid',
                borderColor: selectedPriority ? getPriorityBorderColor() : alpha('#90caf9', 0.3),
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                background: alpha('#020c1b', 0.7),
                position: 'relative',
                overflow: 'hidden',
                boxShadow: selectedPriority
                    ? `0 0 12px ${alpha(getPriorityBorderColor(), 0.3)}`
                    : 'none',
            }}
        >
            {/* Futuristic scanner line animation for selected option */}
            {selectedPriority && (
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    zIndex: 1,
                    overflow: 'hidden',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '100%',
                        height: '2px',
                        background: `linear-gradient(to right, transparent, ${getPriorityBorderColor()}, transparent)`,
                        top: 0,
                        animation: 'scanDown 2s infinite',
                    },
                    '@keyframes scanDown': {
                        '0%': {transform: 'translateY(0)'},
                        '100%': {transform: 'translateY(100%)'}
                    }
                }}/>
            )}

            <ListItem sx={{
                display: 'flex',
                flexDirection: {xs: 'column', sm: 'row'},
                alignItems: {xs: 'flex-start', sm: 'center'},
                py: {xs: 2, sm: 1.5},
                px: {xs: 2, sm: 2.5},
                position: 'relative',
                zIndex: 2,
            }}>
                {/* Mobile layout - stacked */}
                <Box sx={{
                    width: '100%',
                    display: "flex",
                    flexDirection: 'column',
                }}>
                    {/* Priority Chip - if selected */}
                    {selectedPriority && (
                        <Chip
                            icon={getPriorityIcon()}
                            label={selectedPriority}
                            color={getPriorityColor()}
                            size="small"
                            sx={{
                                alignSelf: 'flex-start',
                                mb: 1,
                                fontWeight: 'medium',
                                '& .MuiChip-label': {
                                    px: 1
                                }
                            }}
                        />
                    )}

                    {/* Row 1: Title */}
                    <Typography
                        component="div"
                        variant="body1"
                        color="text.primary"
                        sx={{
                            width: '100%',
                            mb: 1,
                            fontWeight: 'medium',
                            fontSize: '1.1rem',
                            color: alpha('#fff', 0.9)
                        }}
                    >
                        {timeSlot.title}
                    </Typography>

                    {/* Row 2: Time with icon */}
                    {timeSlot.start_time.length !== 0 && timeSlot.end_time.length !== 0 ? (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2,
                            color: alpha('#fff', 0.7)
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
                        bgcolor: alpha('#000', 0.2),
                        borderRadius: 1,
                        p: 1.5,
                        border: '1px solid',
                        borderColor: alpha('#90caf9', 0.2),
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2
                        }}>
                            <Box sx={{position: 'relative', mr: 2}}>
                                <CircularProgressWithLabel
                                    valueCurrent={timeslotNumBooked}
                                    valueMax={timeSlot.num_needed}
                                />
                            </Box>

                            {timeslotNumBooked > timeSlot.num_needed ? (
                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    <EventBusyIcon sx={{color: '#f44336', fontSize: '1rem', mr: 0.5}}/>
                                    <Typography variant="body2" sx={{color: alpha('#fff', 0.7)}}>
                                        Hohe Nachfrage – Zuteilung per Los
                                    </Typography>
                                </Box>
                            ) : timeslotNumBooked == timeSlot.num_needed ? (
                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                        <EventAvailable sx={{color: '#f44336', fontSize: '1rem', mr: 0.5}}/>
                                        <Typography variant="body2" sx={{color: alpha('#fff', 0.7)}}>
                                            Anzahl erreicht
                                        </Typography>
                                    </Box>
                                ) :
                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    <Typography variant="body2" sx={{color: alpha('#fff', 0.7)}}>
                                        {timeslotNumBooked === 0 ? "Dringend gesucht" : "Interesse angemeldet"}
                                    </Typography>
                                </Box>
                            }
                        </Box>

                        <FormControl variant="outlined" size="small" sx={{width: '100%'}}>
                            <WWSelect
                                id={`priority-select-mobile-${timeSlot.id}`}
                                options={options}
                                value={selectedPriority || ''}
                                onChange={handlePriorityChange}
                                placeholder="Priorität wählen"
                                allowClear={true}
                            />
                        </FormControl>
                    </Box>
                </Box>
            </ListItem>
        </Paper>
    );
}

export default TimeSlot;