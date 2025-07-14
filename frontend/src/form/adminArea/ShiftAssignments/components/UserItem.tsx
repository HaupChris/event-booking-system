import React from 'react';
import {
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    IconButton,
    Typography,
    Box,
    Chip,
    LinearProgress,
    Badge,
    alpha
} from '@mui/material';
import {
    CheckBox as CheckBoxIcon,
    CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
    Assignment as AssignmentIcon,

} from '@mui/icons-material';
import {spacePalette} from '../../../../components/styles/theme';
import {BookingSummary, ShiftAssignmentWithDetails} from '../types';

interface UserItemProps {
    user: BookingSummary;
    isSelected: boolean;
    isDetailSelected: boolean;
    selectedTimeslotId?: number | null;
    assignments: ShiftAssignmentWithDetails[];
    onSelect: (userId: number) => void;
    onDetails: (userId: number) => void;
}

const UserItem: React.FC<UserItemProps> = ({
                                               user,
                                               isSelected,
                                               isDetailSelected,
                                               selectedTimeslotId,
                                               assignments,
                                               onSelect,
                                               onDetails
                                           }) => {

    // Calculate completion percentage
    const completionPercentage = (user.assigned_shifts / user.max_shifts) * 100;

    // Get progress color based on completion
    const getProgressColor = () => {
        if (completionPercentage >= 100) return spacePalette.status.success;
        if (completionPercentage >= 75) return spacePalette.primary.main;
        if (completionPercentage >= 50) return spacePalette.status.warning;
        return spacePalette.status.error;
    };

    // Check if user has selected the current timeslot and with what priority
    const getTimeslotPriority = (): { hasPriority: boolean; priority?: number; color?: string; label?: string } => {
        if (!selectedTimeslotId || !user.priority_timeslots) return {hasPriority: false};

        for (const [priority, timeslotId] of Object.entries(user.priority_timeslots)) {
            if (timeslotId === selectedTimeslotId) {
                const priorityNum = parseInt(priority);
                return {
                    hasPriority: true,
                    priority: priorityNum,
                    color: priorityNum === 1 ? 'success' : priorityNum === 2 ? 'info' : 'warning',
                    label: priorityNum === 1 ? '1st Choice' : priorityNum === 2 ? '2nd Choice' : '3rd Choice'
                };
            }
        }

        return {hasPriority: false};
    };

    const timeslotPriority = getTimeslotPriority();
    const progressColor = getProgressColor();

    // Determine background color based on selection state
    const getBackgroundColor = () => {
        if (isDetailSelected) {
            return alpha(spacePalette.primary.main, 0.15);
        }
        if (isSelected) {
            return alpha(spacePalette.primary.main, 0.08);
        }
        if (timeslotPriority.hasPriority) {
            const priorityColor = timeslotPriority.priority === 1 ? spacePalette.status.success :
                timeslotPriority.priority === 2 ? spacePalette.status.info :
                    spacePalette.status.warning;
            return alpha(priorityColor, 0.05);
        }
        return 'transparent';
    };

    // Get border color for priority indication
    const getBorderColor = () => {
        if (isDetailSelected) {
            return spacePalette.primary.main;
        }
        if (timeslotPriority.hasPriority) {
            return timeslotPriority.priority === 1 ? spacePalette.status.success :
                timeslotPriority.priority === 2 ? spacePalette.status.info :
                    spacePalette.status.warning;
        }
        return alpha(spacePalette.primary.main, 0.1);
    };

    return (
        <ListItem
            disablePadding
            sx={{
                borderBottom: 1,
                borderColor: alpha(spacePalette.primary.main, 0.1),
                backgroundColor: getBackgroundColor(),
                borderLeft: timeslotPriority.hasPriority || isDetailSelected ? '4px solid' : 'none',
                borderLeftColor: getBorderColor(),
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    backgroundColor: alpha(spacePalette.primary.main, 0.1),
                }
            }}
        >
            <ListItemButton
                onClick={() => onDetails(user.booking_id)}
                sx={{
                    py: 1.5,
                    px: 2,
                    '&:hover': {
                        backgroundColor: 'transparent'
                    }
                }}
            >
                {/* Selection checkbox */}
                <ListItemIcon sx={{minWidth: 40}}>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(user.booking_id);
                        }}
                        sx={{
                            color: isSelected ? spacePalette.primary.main : 'inherit'
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
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5}}>
                            <Typography variant="subtitle2" sx={{fontWeight: 'medium', color: alpha('#fff', 0.9)}}>
                                {user.first_name} {user.last_name}
                            </Typography>

                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                {/* Assignment status badge */}
                                <Badge
                                    badgeContent={user.assigned_shifts}
                                    color={user.is_fully_assigned ? 'success' : 'primary'}
                                    max={user.max_shifts}
                                >
                                    <AssignmentIcon
                                        fontSize="small"
                                        color={user.is_fully_assigned ? 'success' : 'action'}
                                    />
                                </Badge>

                                {/* Priority indicator for selected timeslot */}
                                {timeslotPriority.hasPriority && (
                                    <Chip
                                        label={timeslotPriority.label}
                                        size="small"
                                        color={timeslotPriority.color as any}
                                        sx={{
                                            height: 20,
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>
                    }
                    secondary={
                        <Box>
                            {/* Email */}
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: 'block',
                                    mb: 1,
                                    color: alpha('#fff', 0.6)
                                }}
                            >
                                {user.email}
                            </Typography>

                            {/* Shift progress information */}
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        mr: 1,
                                        minWidth: 100,
                                        color: alpha('#fff', 0.7)
                                    }}
                                >
                                    Shifts: {user.assigned_shifts}/{user.max_shifts}
                                </Typography>
                                <Box sx={{width: '100%', mr: 1}}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(completionPercentage, 100)}
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
                                <Typography
                                    variant="caption"
                                    sx={{
                                        minWidth: 35,
                                        color: alpha('#fff', 0.6)
                                    }}
                                >
                                    {Math.round(completionPercentage)}%
                                </Typography>
                            </Box>

                            {/* Status chips and buddy info */}
                            <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center'}}>
                                {user.is_fully_assigned && (
                                    <Chip
                                        label="Complete"
                                        size="small"
                                        color="success"
                                        sx={{height: 18, fontSize: '0.65rem'}}
                                    />
                                )}

                                {user.supporter_buddy && (
                                    <Chip
                                        label={`Buddy: ${user.supporter_buddy}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.65rem',
                                            maxWidth: 120,
                                            '& .MuiChip-label': {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }
                                        }}
                                    />
                                )}

                                {assignments.length > 0 && (
                                    <Chip
                                        label={`${assignments.length} assigned`}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        sx={{height: 18, fontSize: '0.65rem'}}
                                    />
                                )}

                                {/* Show wants to work info */}
                                <Chip
                                    label={`Wants ${user.max_shifts} shift${user.max_shifts !== 1 ? 's' : ''}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        height: 18,
                                        fontSize: '0.65rem',
                                        color: alpha('#fff', 0.7),
                                        borderColor: alpha('#fff', 0.3)
                                    }}
                                />
                            </Box>
                        </Box>
                    }
                />
            </ListItemButton>
        </ListItem>
    );
};

export default UserItem;