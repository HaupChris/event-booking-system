import {Booking, TimeSlot as TimeSlotType} from '../userArea/interface';
import {
    Box,
    FormControl,
    IconButton,
    ListItem,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography,
    Paper,
    alpha,
    CircularProgress
} from '@mui/material';
import React from 'react';
import {Close} from "@mui/icons-material";
import {PRIORITIES} from "../userArea/constants";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import Chip from '@mui/material/Chip';

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

    const handlePriorityChange = (event: SelectChangeEvent) => {
        const newPriority = event.target.value;

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
        if (selectedPriority === PRIORITIES.FIRST) return '#4caf50'; // success.main
        if (selectedPriority === PRIORITIES.SECOND) return '#2196f3'; // info.main
        if (selectedPriority === PRIORITIES.THIRD) return '#ff9800'; // warning.main
        return 'transparent';
    };

    const getPriorityColor = () => {
        if (selectedPriority === PRIORITIES.FIRST) return 'success';
        if (selectedPriority === PRIORITIES.SECOND) return 'info';
        if (selectedPriority === PRIORITIES.THIRD) return 'warning';
        return 'default';
    };

    const getPriorityIcon = () => {
        if (selectedPriority === PRIORITIES.FIRST) return <PriorityHighIcon sx={{ fontSize: '0.8rem' }} />;
        if (selectedPriority === PRIORITIES.SECOND) return <PriorityHighIcon sx={{ fontSize: '0.8rem' }} />;
        if (selectedPriority === PRIORITIES.THIRD) return <PriorityHighIcon sx={{ fontSize: '0.8rem' }} />;
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

    // Get dynamic styling for the capacity indicator
    const getCapacityColor = () => {
        if (timeslotNumBooked >= timeSlot.num_needed) return '#f44336'; // error.main
        if (timeslotNumBooked / timeSlot.num_needed > 0.7) return '#ff9800'; // warning.main
        return '#4caf50'; // success.main
    };

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
                opacity: isFull && !selectedPriority ? 0.6 : 1,
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
                        '0%': { transform: 'translateY(0)' },
                        '100%': { transform: 'translateY(100%)' }
                    }
                }} />
            )}

            <ListItem sx={{
                display: 'flex',
                flexDirection: {xs: 'column', sm: 'row'},
                alignItems: {xs: 'flex-start', sm: 'center'},
                py: { xs: 2, sm: 1.5 },
                px: { xs: 2, sm: 2.5 },
                position: 'relative',
                zIndex: 2,
            }}>
                {/* Mobile layout - stacked */}
                <Box sx={{
                    width: '100%',
                    display: {xs: 'flex', sm: 'none'},
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
                        // width: '100%',
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
                                <CircularProgress
                                    variant="determinate"
                                    value={timeslotNumBooked > 0 ? (timeslotNumBooked / timeSlot.num_needed) * 100 : 0}
                                    size={40}
                                    thickness={4}
                                    sx={{
                                        color: getCapacityColor(),
                                        backgroundColor: alpha('#000', 0.3),
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
                                    <Typography variant="caption" component="div" sx={{ color: alpha('#fff', 0.9) }}>
                                        {`${timeslotNumBooked}/${timeSlot.num_needed}`}
                                    </Typography>
                                </Box>
                            </Box>

                            {timeslotNumBooked >= timeSlot.num_needed ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <EventBusyIcon sx={{ color: '#f44336', fontSize: '1rem', mr: 0.5 }} />
                                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>
                                        Hohe Nachfrage – Zuteilung per Los
                                    </Typography>
                                </Box>
                            ) : (
                                <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>
                                    {timeslotNumBooked === 0 ? "Keine Anmeldungen bisher" : "Interesse angemeldet"}
                                </Typography>
                            )}
                        </Box>

                        <FormControl variant="outlined" size="small" sx={{width: '100%'}}>
                            <Select
                                id={`priority-select-mobile-${timeSlot.id}`}
                                value={selectedPriority}
                                onChange={handlePriorityChange}
                                displayEmpty
                                renderValue={(selected) => {
                                    if (!selected) {
                                        return <Typography variant="body2" sx={{ color: alpha('#fff', 0.5) }}>Priorität wählen</Typography>;
                                    }
                                    return selected;
                                }}
                                endAdornment={
                                    selectedPriority ? (
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReset();
                                            }}
                                            size="small"
                                            edge="end"
                                            sx={{marginRight: 2, color: alpha('#fff', 0.7)}}
                                        >
                                            <Close fontSize="small"/>
                                        </IconButton>
                                    ) : null
                                }
                                disabled={isFull && !selectedPriority}
                                sx={{
                                    bgcolor: alpha('#000', 0.2),
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: alpha('#64b5f6', 0.3),
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: alpha('#64b5f6', 0.5),
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#1e88e5',
                                    },
                                    '& .MuiSelect-select': {
                                        color: alpha('#fff', 0.9),
                                    }
                                }}
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
                    {/* Capacity progress */}
                    <Box sx={{position: 'relative', mr: 3, ml: 1}}>
                        <CircularProgress
                            variant="determinate"
                            value={timeslotNumBooked > 0 ? (timeslotNumBooked / timeSlot.num_needed) * 100 : 0}
                            size={46}
                            thickness={4}
                            sx={{
                                color: getCapacityColor(),
                                backgroundColor: alpha('#000', 0.3),
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
                            <Typography variant="caption" component="div" sx={{ color: alpha('#fff', 0.9), fontWeight: 'medium' }}>
                                {`${timeslotNumBooked}/${timeSlot.num_needed}`}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Slot information */}
                    <Box sx={{flexGrow: 1}}>
                        {selectedPriority && (
                            <Chip
                                icon={getPriorityIcon()}
                                label={selectedPriority}
                                color={getPriorityColor()}
                                size="small"
                                sx={{
                                    mb: 0.5,
                                    fontWeight: 'medium',
                                    '& .MuiChip-label': {
                                        px: 1
                                    }
                                }}
                            />
                        )}

                        <Typography
                            variant="body1"
                            sx={{
                                color: alpha('#fff', 0.9),
                                fontWeight: 'medium'
                            }}
                        >
                            {timeSlot.title}
                        </Typography>

                        {timeSlot.start_time.length !== 0 && timeSlot.end_time.length !== 0 ? (
                            <Box sx={{display: 'flex', alignItems: 'center', mt: 0.5}}>
                                <AccessTimeIcon sx={{fontSize: '0.875rem', mr: 0.5, color: alpha('#fff', 0.6)}}/>
                                <Typography variant="body2" sx={{ color: alpha('#fff', 0.6) }}>
                                    {`${timeSlot.start_time} - ${timeSlot.end_time}`}
                                </Typography>
                            </Box>
                        ) : null}
                    </Box>

                    {/* Status indicator for desktop */}
                    {timeslotNumBooked >= timeSlot.num_needed && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mr: 2,
                            p: 0.75,
                            px: 1.5,
                            borderRadius: '4px',
                            bgcolor: alpha('#f44336', 0.1),
                            border: '1px solid',
                            borderColor: alpha('#f44336', 0.3),
                        }}>
                            <EventBusyIcon sx={{ color: '#f44336', fontSize: '0.875rem', mr: 0.5 }} />
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#f44336',
                                    fontWeight: 'medium',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                Hohe Nachfrage
                            </Typography>
                        </Box>
                    )}

                    {/* Priority selection */}
                    <FormControl variant="outlined" size="small" sx={{minWidth: "150px"}}>
                        <Select
                            id={`priority-select-${timeSlot.id}`}
                            value={selectedPriority}
                            onChange={handlePriorityChange}
                            displayEmpty
                            renderValue={(selected) => {
                                if (!selected) {
                                    return <Typography variant="body2" sx={{ color: alpha('#fff', 0.5) }}>Priorität wählen</Typography>;
                                }
                                return selected;
                            }}
                            endAdornment={
                                selectedPriority ? (
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReset();
                                        }}
                                        size="small"
                                        edge="end"
                                        sx={{marginRight: 2, color: alpha('#fff', 0.7)}}
                                    >
                                        <Close fontSize="small"/>
                                    </IconButton>
                                ) : null
                            }
                            disabled={isFull && !selectedPriority}
                            sx={{
                                bgcolor: alpha('#000', 0.2),
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: alpha('#64b5f6', 0.3),
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: alpha('#64b5f6', 0.5),
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1e88e5',
                                },
                                '& .MuiSelect-select': {
                                    color: alpha('#fff', 0.9),
                                }
                            }}
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