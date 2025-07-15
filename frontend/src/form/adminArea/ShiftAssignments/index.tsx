// frontend/src/form/adminArea/ShiftAssignments/index.tsx

import React, {useState, useEffect} from 'react';
import {Box, Grid, Typography, Paper, Alert, CircularProgress} from '@mui/material';
import {useContext} from 'react';
import {TokenContext} from '../../../contexts/AuthContext';
import {useFetchData} from '../useFetchData';
import {ShiftAssignmentAPI} from './api';
import {ShiftAssignment} from './types';
import UserList from './components/UserList';
import WorkshiftList from './components/WorkshiftList';
import ActionButtons from './components/ActionButtons';
import StatsCard from '../components/StatsCard';
import {
    Assignment as AssignmentIcon,
    People as PeopleIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

function ShiftAssignmentsPage() {
    const {token} = useContext(TokenContext);
    const {regularBookings, formContent} = useFetchData();

    // State management
    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
    const [selectedTimeslot, setSelectedTimeslot] = useState<number | null>(null);
    const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch assignments on component mount
    useEffect(() => {
        fetchAssignments();
    }, [token]);

    const fetchAssignments = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ShiftAssignmentAPI.getAllAssignments(token);
            setAssignments(data);
        } catch (error) {
            setError('Failed to fetch assignments');
            console.error('Failed to fetch assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const totalUsers = regularBookings.length;
    const totalShiftsWanted = regularBookings.reduce((sum, booking) => sum + booking.amount_shifts, 0);
    const totalShiftsAssigned = assignments.length;
    const fullyAssignedUsers = regularBookings.filter(booking => {
        const userAssignments = assignments.filter(a => a.booking_id === booking.id);
        return userAssignments.length >= booking.amount_shifts;
    }).length;

    const totalTimeslots = formContent.work_shifts.reduce((sum, ws) => sum + ws.time_slots.length, 0);
    const totalCapacity = formContent.work_shifts.reduce((sum, ws) =>
        sum + ws.time_slots.reduce((tsSum, ts) => tsSum + ts.num_needed, 0), 0
    );

    // User selection handlers
    const handleUserSelect = (userId: number) => {
        setSelectedUsers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const handleTimeslotSelect = (timeslotId: number) => {
        setSelectedTimeslot(timeslotId === selectedTimeslot ? null : timeslotId);
    };

    // Assignment actions
    const handleAssignUsers = async () => {
        if (!selectedTimeslot || selectedUsers.size === 0) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const userIds = Array.from(selectedUsers);
            const response = await fetch('/api/shifts/bulk-assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_ids: userIds,
                    timeslot_ids: [selectedTimeslot]
                })
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess(`Successfully assigned ${result.successful_assignments} users`);
                if (result.failed_assignments.length > 0) {
                    setError(`${result.failed_assignments.length} assignments failed`);
                }

                // Refresh assignments and clear selection
                await fetchAssignments();
                setSelectedUsers(new Set());
            } else {
                setError(result.error || 'Failed to assign users');
            }
        } catch (error) {
            setError('Failed to assign users');
            console.error('Assignment error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnassignUsers = async () => {
        if (selectedUsers.size === 0) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Find assignments for selected users
            const userAssignments = assignments.filter(a => selectedUsers.has(a.booking_id));

            // Delete each assignment
            const deletePromises = userAssignments.map(assignment =>
                fetch(`/api/shifts/assignments/${assignment.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            );

            const results = await Promise.allSettled(deletePromises);
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            if (successful > 0) {
                setSuccess(`Successfully removed ${successful} assignments`);
            }
            if (failed > 0) {
                setError(`Failed to remove ${failed} assignments`);
            }

            // Refresh assignments and clear selection
            await fetchAssignments();
            setSelectedUsers(new Set());
        } catch (error) {
            setError('Failed to remove assignments');
            console.error('Unassignment error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSwapUsers = async () => {
        // TODO: Implement swap functionality
        setError('Swap functionality not yet implemented');
    };

    if (loading && assignments.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Box sx={{p: 2}}>
            {/* Statistics Container */}
            <Grid container spacing={3} sx={{mb: 3}}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Total Users"
                        value={totalUsers}
                        icon={<PeopleIcon fontSize="large"/>}
                        color="primary"
                        subtitle={`${fullyAssignedUsers} fully assigned`}
                        progress={(fullyAssignedUsers / totalUsers) * 100}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Shifts Progress"
                        value={`${totalShiftsAssigned}/${totalShiftsWanted}`}
                        icon={<AssignmentIcon fontSize="large"/>}
                        color="info"
                        subtitle="Assigned vs Requested"
                        progress={(totalShiftsAssigned / totalShiftsWanted) * 100}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Timeslots"
                        value={totalTimeslots}
                        icon={<ScheduleIcon fontSize="large"/>}
                        color="primary"
                        subtitle={`${totalCapacity} total capacity`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Completion Rate"
                        value={`${Math.round((fullyAssignedUsers / totalUsers) * 100)}%`}
                        icon={<CheckCircleIcon fontSize="large"/>}
                        color="success"
                        subtitle="Users fully assigned"
                        progress={(fullyAssignedUsers / totalUsers) * 100}
                    />
                </Grid>
            </Grid>

            {/* Alerts */}
            {error && (
                <Alert severity="error" sx={{mb: 2}} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{mb: 2}} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            {/* Instructions */}
            <Paper sx={{p: 2, mb: 3}}>
                <Typography variant="h6" gutterBottom>
                    Instructions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    1. Select users from the left panel by clicking on them
                    2. Select a timeslot from the right panel to see user priorities
                    3. Use the action buttons in the center to assign users to timeslots
                    4. View assignment progress in the statistics above
                </Typography>
            </Paper>

            {/* Main Assignment Interface - Fixed Height */}
            <Box sx={{height: '90vh'}}>
                <Grid container spacing={2} sx={{height: '100%'}}>
                    {/* User List */}
                    <Grid item xs={12} md={5} sx={{height: '100%'}}>
                        <Paper sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{p: 2, borderBottom: 1, borderColor: 'divider'}}>
                                <Typography variant="h6">Participants</Typography>
                            </Box>
                            <UserList
                                regularBookings={regularBookings}
                                selectedTimeslot={selectedTimeslot}
                                onUserSelect={handleUserSelect}
                                selectedUsers={selectedUsers}
                                formContent={formContent}
                                token={token}
                            />
                        </Paper>
                    </Grid>

                    {/* Action Buttons */}
                    <Grid item xs={12} md={2} sx={{height: '100%'}}>
                        <Paper sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{p: 2, borderBottom: 1, borderColor: 'divider'}}>
                                <Typography variant="h6">Actions</Typography>
                            </Box>
                            <ActionButtons
                                selectedUsers={selectedUsers}
                                selectedTimeslot={selectedTimeslot}
                                onAssignUsers={handleAssignUsers}
                                onUnassignUsers={handleUnassignUsers}
                                onSwapUsers={handleSwapUsers}
                                loading={loading}
                            />
                        </Paper>
                    </Grid>

                    {/* Workshift List */}
                    <Grid item xs={12} md={5} sx={{height: '100%'}}>
                        <Paper sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{p: 2, borderBottom: 1, borderColor: 'divider'}}>
                                <Typography variant="h6">Workshifts</Typography>
                            </Box>
                            <WorkshiftList
                                formContent={formContent}
                                selectedTimeslot={selectedTimeslot}
                                onTimeslotSelect={handleTimeslotSelect}
                                token={token}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default ShiftAssignmentsPage;