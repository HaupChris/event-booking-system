import React, { useState, useEffect, useContext } from 'react';
import { Box, Grid, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { TokenContext } from '../../../contexts/AuthContext';
import { useFetchData } from '../useFetchData';
import { ShiftAssignmentAPI } from './api';
import type { ShiftAssignment } from './types';
import UserList from './components/UserList';
import WorkshiftList from './components/WorkshiftList';
import ActionButtons from './components/ActionButtons';
import StatisticsGrid from './components/StatisticsGrid';
import { exportShiftAssignments } from './utils/exportUtils';

function ShiftAssignmentsPage() {
    const {token} = useContext(TokenContext);
    const {regularBookings, formContent} = useFetchData();

    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
    const [selectedTimeslot, setSelectedTimeslot] = useState<number | null>(null);
    const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch assignments on component mount
    useEffect(() => {
        fetchAssignments().then();
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

    const totalTimeslots = formContent.work_shifts.reduce(
      (sum, ws) => sum + ws.time_slots.length,
      0
    );
    const totalCapacity = formContent.work_shifts.reduce(
      (sum, ws) => sum + ws.time_slots.reduce((tsSum, ts) => tsSum + ts.num_needed, 0),
      0
    );

    const handleExportShiftAssignments = () => {
      exportShiftAssignments(assignments);
    };

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
        setSelectedTimeslot((prevSelectedTimeslot) =>
          timeslotId === prevSelectedTimeslot ? null : timeslotId
        );
    };

    // Assignment actions
    const handleAssignUsers = async () => {
        if (selectedTimeslot === null || selectedUsers.size === 0) return;

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

    const handleUnassignFromTimeslot = async () => {
        if (selectedUsers.size === 0 || selectedTimeslot === null) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Find assignments for selected users AND selected timeslot
            const userAssignments = assignments.filter(a =>
                selectedUsers.has(a.booking_id) && a.timeslot_id === selectedTimeslot
            );

            if (userAssignments.length === 0) {
                setError('No assignments found for selected users and timeslot');
                setLoading(false);
                return;
            }

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
                setSuccess(`Successfully removed ${successful} assignment(s) from timeslot`);
            }
            if (failed > 0) {
                setError(`Failed to remove ${failed} assignment(s)`);
            }

            // Refresh assignments and clear selection
            await fetchAssignments();
            setSelectedUsers(new Set());
        } catch (error) {
            setError('Failed to remove assignments from timeslot');
            console.error('Unassignment error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnassignAllShifts = async () => {
        if (selectedUsers.size === 0) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Find ALL assignments for selected users
            const userAssignments = assignments.filter(a => selectedUsers.has(a.booking_id));

            if (userAssignments.length === 0) {
                setError('No assignments found for selected users');
                setLoading(false);
                return;
            }

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
                setSuccess(`Successfully removed all ${successful} assignment(s)`);
            }
            if (failed > 0) {
                setError(`Failed to remove ${failed} assignment(s)`);
            }

            // Refresh assignments and clear selection
            await fetchAssignments();
            setSelectedUsers(new Set());
        } catch (error) {
            setError('Failed to remove all assignments');
            console.error('Unassignment error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearUserSelection = () => {
        setSelectedUsers(() => new Set());
    };

    if (loading && assignments.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <StatisticsGrid
                totalUsers={totalUsers}
                fullyAssignedUsers={fullyAssignedUsers}
                totalShiftsAssigned={totalShiftsAssigned}
                totalShiftsWanted={totalShiftsWanted}
                totalTimeslots={totalTimeslots}
                totalCapacity={totalCapacity}
                assignments={assignments}
            />

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
                                assignments={assignments}
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
                                onUnassignFromTimeslot={handleUnassignFromTimeslot}
                                onUnassignAllShifts={handleUnassignAllShifts}
                                loading={loading}
                                onClearUserSelection={handleClearUserSelection}
                                onExportShiftAssignments={handleExportShiftAssignments}
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
                                assignments={assignments}
                                bookings={regularBookings}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default ShiftAssignmentsPage;