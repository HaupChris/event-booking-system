import React from 'react';
import {Box, Button, Typography} from '@mui/material';
import {
    Clear,
    ClearAll, Download,
    PersonAdd as PersonAddIcon,
    PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';

interface ActionButtonsProps {
    selectedUsers: Set<number>;
    selectedTimeslot: number | null;
    onAssignUsers: () => void;
    onUnassignUsers: () => void;
    loading: boolean;
    onClearUserSelection: () => void;
    onExportShiftAssignments: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
                                                         selectedUsers,
                                                         selectedTimeslot,
                                                         onAssignUsers,
                                                         onUnassignUsers,
                                                         loading,
                                                         onClearUserSelection,
                                                         onExportShiftAssignments
                                                     }) => {
    const canAssign = selectedUsers.size > 0 && selectedTimeslot !== null;
    const canUnassign = selectedUsers.size > 0;

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            gap: 2
        }}>
            {/* Header */}
            <Box sx={{textAlign: 'center', flexShrink: 0}}>
                <Typography variant="body2" color="text.secondary">
                    {selectedUsers.size} users selected
                </Typography>
            </Box>

            {/* Buttons - Centered */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                flexGrow: 1,
                justifyContent: 'center'
            }}>
                {/* Assign Button */}
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon/>}
                    onClick={onAssignUsers}
                    disabled={!canAssign || loading}
                    color="primary"
                    fullWidth
                    sx={{py: 1.5}}
                >
                    Assign to Timeslot
                </Button>

                {/* Unassign Button */}
                <Button
                    variant="outlined"
                    startIcon={<PersonRemoveIcon/>}
                    onClick={onUnassignUsers}
                    disabled={!canUnassign || loading}
                    color="error"
                    fullWidth
                    sx={{py: 1.5}}
                >
                    Remove Assignment
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<Clear/>}
                    onClick={onClearUserSelection}
                    disabled={!canUnassign || loading}
                    color="error"
                    fullWidth
                    sx={{py: 1.5}}
                >
                    Unselect all Users
                </Button>

                 <Button
                    variant="outlined"
                    startIcon={<Download/>}
                    onClick={onExportShiftAssignments}
                    color="primary"
                    fullWidth
                    sx={{py: 1.5}}
                >
                    Download current assignments
                </Button>
            </Box>

            {/* Status Info */}
            <Box sx={{mt: 'auto', flexShrink: 0}}>
                <Typography variant="caption" color="text.secondary" align="center">
                    {!canAssign && selectedUsers.size > 0 && !selectedTimeslot &&
                        "Select a timeslot to assign users"}
                    {!canAssign && selectedUsers.size === 0 &&
                        "Select users to perform actions"}
                    {canAssign &&
                        `Ready to assign ${selectedUsers.size} user${selectedUsers.size > 1 ? 's' : ''}`}
                </Typography>
            </Box>
        </Box>
    );
};

export default ActionButtons;