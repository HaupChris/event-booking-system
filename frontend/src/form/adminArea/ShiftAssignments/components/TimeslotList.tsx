// frontend/src/form/adminArea/ShiftAssignments/components/TimeslotList.tsx

import React, {useState} from 'react';
import {
    Box,
    Paper,
    Typography,
    FormControlLabel,
    Checkbox,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Chip,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tooltip,
    Badge,
    alpha
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Schedule as ScheduleIcon,
    CheckBox as CheckBoxIcon,
    CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
    Assignment as AssignmentIcon,
    Group as GroupIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import {spacePalette} from '../../../../components/styles/theme';
import {WorkshiftWithTimeslots, ShiftAssignmentWithDetails, TimeslotSummary} from '../types';

interface TimeslotListProps {
    workshifts: WorkshiftWithTimeslots[];
    assignments: ShiftAssignmentWithDetails[];
    selectedTimeslots: Set<number>;
    selectedTimeslotForDetails: number | null;
    showOnlyAvailable: boolean;
    onTimeslotSelect: (timeslotId: number) => void;
    onTimeslotDetails: (timeslotId: number) => void;
    onFilterChange: (showAvailable: boolean) => void;
    getTimeslotAssignments: (timeslotId: number) => ShiftAssignmentWithDetails[];
}

const TimeslotList: React.FC<TimeslotListProps> = ({
                                                       workshifts,
                                                       selectedTimeslots,
                                                       selectedTimeslotForDetails,
                                                       showOnlyAvailable,
                                                       onTimeslotSelect,
                                                       onTimeslotDetails,
                                                       onFilterChange,
                                                       getTimeslotAssignments
                                                   }) => {
    const [expandedWorkshifts, setExpandedWorkshifts] = useState<Set<number>>(new Set());

    const toggleWorkshift = (workshiftId: number) => {
        const newExpanded = new Set(expandedWorkshifts);
        if (newExpanded.has(workshiftId)) {
            newExpanded.delete(workshiftId);
        } else {
            newExpanded.add(workshiftId);
        }
        setExpandedWorkshifts(newExpanded);
    };

    const getProgressColor = (assigned: number, capacity: number) => {
        const percentage = (assigned / capacity) * 100;
        if (percentage >= 100) return spacePalette.status.success;
        if (percentage >= 75) return spacePalette.status.warning;
        if (percentage >= 50) return spacePalette.primary.main;
        return spacePalette.status.error;
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        // Handle various time formats
        if (timeStr.includes(':')) {
            return timeStr;
        }
        return timeStr;
    };

    const getTimeslotDisplay = (timeslot: TimeslotSummary) => {
        const assignments = getTimeslotAssignments(timeslot.timeslot_id);
        const progressColor = getProgressColor(timeslot.assigned_count, timeslot.capacity);
        const isSelected = selectedTimeslots.has(timeslot.timeslot_id);
        const isDetailSelected = selectedTimeslotForDetails === timeslot.timeslot_id;

        // Filter out if showing only available and this is filled
        if (showOnlyAvailable && timeslot.is_filled) {
            return null;
        }

        return (
            <ListItem
                key={timeslot.timeslot_id}
                disablePadding
                sx={{
                    borderBottom: 1,
                    borderColor: alpha(spacePalette.primary.main, 0.1),
                    backgroundColor: isDetailSelected
                        ? alpha(spacePalette.primary.main, 0.1)
                        : 'transparent'
                }}
            >
                <ListItemButton
                    onClick={() => onTimeslotDetails(timeslot.timeslot_id)}
                    sx={{
                        py: 1,
                        '&:hover': {
                            backgroundColor: alpha(spacePalette.primary.main, 0.05)
                        }
                    }}
                >
                    {/* Selection checkbox */}
                    <ListItemIcon sx={{minWidth: 32}}>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onTimeslotSelect(timeslot.timeslot_id);
                            }}
                        >
                            {isSelected ? (
                                <CheckBoxIcon color="primary"/>
                            ) : (
                                <CheckBoxOutlineBlankIcon/>
                            )}
                        </IconButton>
                    </ListItemIcon>

                    <ListItemText
                        primary={
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Typography variant="subtitle2" sx={{fontWeight: 'medium'}}>
                                    {timeslot.timeslot_title}
                                </Typography>

                                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                    {/* Assignment count badge */}
                                    <Badge
                                        badgeContent={timeslot.assigned_count}
                                        color={timeslot.is_filled ? 'success' : 'primary'}
                                        max={timeslot.capacity}
                                    >
                                        <GroupIcon
                                            fontSize="small"
                                            color={timeslot.is_filled ? 'success' : 'action'}
                                        />
                                    </Badge>
                                </Box>
                            </Box>
                        }
                        secondary={
                            <Box sx={{mt: 0.5}}>
                                {/* Time information */}
                                {(timeslot.start_time || timeslot.end_time) && (
                                    <Typography variant="caption" color="text.secondary"
                                                sx={{display: 'flex', alignItems: 'center', mb: 0.5}}>
                                        <AccessTimeIcon sx={{fontSize: 12, mr: 0.5}}/>
                                        {formatTime(timeslot.start_time)} - {formatTime(timeslot.end_time)}
                                    </Typography>
                                )}

                                {/* Progress bar */}
                                <Box sx={{display: 'flex', alignItems: 'center', mt: 0.5}}>
                                    <Box sx={{width: '100%', mr: 1}}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={Math.min(timeslot.fill_percentage, 100)}
                                            sx={{
                                                height: 6,
                                                borderRadius: 3,
                                                backgroundColor: alpha(progressColor, 0.2),
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: progressColor,
                                                    borderRadius: 3,
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{minWidth: 'fit-content'}}>
                                        {timeslot.assigned_count}/{timeslot.capacity}
                                    </Typography>
                                </Box>

                                {/* Status chips */}
                                <Box sx={{display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap'}}>
                                    {timeslot.is_filled && (
                                        <Chip
                                            label="Full"
                                            size="small"
                                            color="success"
                                            sx={{height: 20, fontSize: '0.7rem'}}
                                        />
                                    )}

                                    {timeslot.remaining === 0 && !timeslot.is_filled && (
                                        <Chip
                                            label="At Capacity"
                                            size="small"
                                            color="warning"
                                            sx={{height: 20, fontSize: '0.7rem'}}
                                        />
                                    )}

                                    {timeslot.remaining > 0 && (
                                        <Chip
                                            label={`${timeslot.remaining} spots left`}
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                            sx={{height: 20, fontSize: '0.7rem'}}
                                        />
                                    )}

                                    {/* Assigned users section */}
                                    {assignments.length > 0 && (
                                        <Box sx={{
                                            mt: 1,
                                            p: 1,
                                            bgcolor: alpha(spacePalette.primary.main, 0.05),
                                            borderRadius: 1
                                        }}>
                                            <Typography variant="caption"
                                                        sx={{fontWeight: 'bold', color: spacePalette.primary.main}}>
                                                Assigned Participants:
                                            </Typography>
                                            {assignments.map((assignment, idx) => (
                                                <Box key={assignment.id}
                                                     sx={{display: 'flex', alignItems: 'center', mt: 0.5}}>
                                                    <Typography variant="caption" sx={{flex: 1}}>
                                                        • {assignment.first_name} {assignment.last_name}
                                                    </Typography>
                                                    <Chip
                                                        label={`P${assignment.priority || 'M'}`}
                                                        size="small"
                                                        color={
                                                            assignment.priority === 1 ? 'success' :
                                                                assignment.priority === 2 ? 'primary' :
                                                                    assignment.priority === 3 ? 'warning' : 'default'
                                                        }
                                                        sx={{height: 16, fontSize: '0.65rem'}}
                                                        title={
                                                            assignment.priority === 1 ? '1st Priority' :
                                                                assignment.priority === 2 ? '2nd Priority' :
                                                                    assignment.priority === 3 ? '3rd Priority' : 'Manual Assignment'
                                                        }
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>

                                {/* Priority assignments info */}
                                {assignments.some(a => a.priority > 0) && (
                                    <Typography variant="caption" color="text.secondary"
                                                sx={{display: 'block', mt: 0.5}}>
                                        {assignments.filter(a => a.priority === 1).length} first choice, {' '}
                                        {assignments.filter(a => a.priority === 2).length} second choice, {' '}
                                        {assignments.filter(a => a.priority === 3).length} third choice
                                    </Typography>
                                )}
                            </Box>
                        }
                    />
                </ListItemButton>
            </ListItem>
        );
    };

    const totalTimeslots = workshifts.reduce((sum, ws) => sum + ws.timeslots.length, 0);
    const visibleTimeslots = workshifts.reduce((sum, ws) =>
        sum + ws.timeslots.filter(t => !showOnlyAvailable || !t.is_filled).length, 0
    );

    return (
        <Paper elevation={2} sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            {/* Header */}
            <Box sx={{p: 2, borderBottom: 1, borderColor: 'divider'}}>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                    <Typography variant="h6" sx={{display: 'flex', alignItems: 'center'}}>
                        <ScheduleIcon sx={{mr: 1, color: spacePalette.primary.main}}/>
                        Timeslots ({visibleTimeslots}/{totalTimeslots})
                    </Typography>
                </Box>

                {/* Filters */}
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showOnlyAvailable}
                                onChange={(e) => onFilterChange(e.target.checked)}
                                size="small"
                            />
                        }
                        label="Only available"
                        sx={{fontSize: '0.875rem'}}
                    />
                </Box>
            </Box>

            {/* Workshift List */}
            <Box sx={{flex: 1, overflow: 'auto'}}>
                {workshifts.map((workshift) => {
                    const visibleTimeslotsInWorkshift = workshift.timeslots.filter(t =>
                        !showOnlyAvailable || !t.is_filled
                    );

                    if (visibleTimeslotsInWorkshift.length === 0) {
                        return null;
                    }

                    const isExpanded = expandedWorkshifts.has(workshift.id);
                    const totalAssigned = workshift.timeslots.reduce((sum, t) => sum + t.assigned_count, 0);
                    const totalCapacity = workshift.timeslots.reduce((sum, t) => sum + t.capacity, 0);
                    const workshiftProgress = totalCapacity > 0 ? (totalAssigned / totalCapacity) * 100 : 0;

                    return (
                        <Accordion
                            key={workshift.id}
                            expanded={isExpanded}
                            onChange={() => toggleWorkshift(workshift.id)}
                            elevation={0}
                            sx={{
                                '&:before': {display: 'none'},
                                borderBottom: 1,
                                borderColor: 'divider'
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon/>}
                                sx={{
                                    backgroundColor: alpha(spacePalette.primary.main, 0.02),
                                    '&:hover': {
                                        backgroundColor: alpha(spacePalette.primary.main, 0.05)
                                    }
                                }}
                            >
                                <Box sx={{width: '100%'}}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mb: 1
                                    }}>
                                        <Typography variant="subtitle1" sx={{fontWeight: 'medium'}}>
                                            {workshift.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {totalAssigned}/{totalCapacity} assigned
                                        </Typography>
                                    </Box>

                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(workshiftProgress, 100)}
                                        sx={{
                                            height: 4,
                                            borderRadius: 2,
                                            backgroundColor: alpha(spacePalette.primary.main, 0.2),
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: getProgressColor(totalAssigned, totalCapacity),
                                                borderRadius: 2,
                                            }
                                        }}
                                    />
                                </Box>
                            </AccordionSummary>

                            <AccordionDetails sx={{p: 0}}>
                                <List dense>
                                    {workshift.timeslots.map(timeslot => getTimeslotDisplay(timeslot))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    );
                })}

                {/* Empty state */}
                {visibleTimeslots === 0 && (
                    <Box sx={{p: 3, textAlign: 'center'}}>
                        <ScheduleIcon sx={{fontSize: 48, color: 'text.disabled', mb: 1}}/>
                        <Typography variant="body2" color="text.secondary">
                            {showOnlyAvailable ? 'No available timeslots found' : 'No timeslots found'}
                        </Typography>
                        {showOnlyAvailable && (
                            <Typography variant="caption" color="text.secondary">
                                Try disabling the "Only available" filter
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>

            {/* Selection summary */}
            {selectedTimeslots.size > 0 && (
                <Box sx={{
                    p: 1,
                    borderTop: 1,
                    borderColor: 'divider',
                    backgroundColor: alpha(spacePalette.primary.main, 0.05)
                }}>
                    <Typography variant="caption" color="primary">
                        {selectedTimeslots.size} timeslot{selectedTimeslots.size !== 1 ? 's' : ''} selected
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default TimeslotList;