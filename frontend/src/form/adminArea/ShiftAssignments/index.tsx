// src/form/adminArea/ShiftAssignments/index.tsx
import React, {useState, useEffect, useContext} from 'react';
import {
    Box, Typography, Button, Alert, IconButton, Tabs, Tab,
    Snackbar, useMediaQuery, useTheme
} from '@mui/material';
import {
    AutoAwesome as AutoAwesomeIcon,
    Refresh as RefreshIcon,
    AccessTime as AccessTimeIcon,
    Person as PersonIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import {TokenContext} from '../../../contexts/AuthContext';
import {useFetchData} from '../useFetchData';
import {
    Assignment, BookingSummary, TimeslotSummary, ViewType,
    SortOrder, TimeslotFilter, BookingFilter, AssignStrategy
} from './types';
import {AssignmentService} from './AssignmentService';
import AutoAssignDialog from './AutoAssignDialog';
import AssignDialog from './AssignDialog';
import TimeslotsView from './TimeslotsView';
import BookingsView from './BookingsView';
import AssignmentDetailsPanel from './AssignmentDetailsPanel';

const ShiftAssignmentsPage: React.FC = () => {
    const {token} = useContext(TokenContext);
    const {regularBookings, formContent} = useFetchData();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [bookingSummary, setBookingSummary] = useState<BookingSummary[]>([]);
    const [timeslotSummary, setTimeslotSummary] = useState<TimeslotSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<ViewType>('timeslots');
    const [autoAssignDialogOpen, setAutoAssignDialogOpen] = useState<boolean>(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState<boolean>(false);
    const [selectedTimeslot, setSelectedTimeslot] = useState<number | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
    const [timeslotFilter, setTimeslotFilter] = useState<TimeslotFilter>('all');
    const [bookingFilter, setBookingFilter] = useState<BookingFilter>('all');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, [token]);

    // Fetch all data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignmentsData, bookingSummaryData, timeslotSummaryData] = await Promise.all([
                AssignmentService.getAssignments(token),
                AssignmentService.getBookingSummary(token),
                AssignmentService.getTimeslotSummary(token)
            ]);

            setAssignments(assignmentsData);
            setBookingSummary(bookingSummaryData);
            setTimeslotSummary(timeslotSummaryData);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load assignment data');
        } finally {
            setLoading(false);
        }
    };

    // Run auto-assignment
    const handleRunAutoAssignment = async (strategy: AssignStrategy) => {
        try {
            const result = await AssignmentService.runAutoAssignment(token, strategy);
            setSuccess(`Auto-assignment completed. Made ${result.assignments_made} assignments.`);
            fetchData();
        } catch (err) {
            console.error('Error running auto-assignment:', err);
            setError('Failed to run auto-assignment');
            throw err;
        }
    };
    // Create assignment
    const handleCreateAssignment = async (bookingId: number, timeslotId: number) => {
        try {
            await AssignmentService.createAssignment(token, bookingId, timeslotId);
            setSuccess('Assignment created successfully');
            setAssignDialogOpen(false);
            fetchData();
        } catch (err: any) {
            console.error('Error creating assignment:', err);
            setError(err.response?.data?.error || 'Failed to create assignment');
            throw err;
        }
    };

    // Delete assignment
    const handleDeleteAssignment = async (assignmentId: number) => {
        try {
            await AssignmentService.deleteAssignment(token, assignmentId);
            setSuccess('Assignment deleted successfully');
            fetchData();
        } catch (err) {
            console.error('Error deleting assignment:', err);
            setError('Failed to delete assignment');
            throw err;
        }
    };

    // Helper to get priority label
    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 1:
                return 'First Choice';
            case 2:
                return 'Second Choice';
            case 3:
                return 'Third Choice';
            default:
                return 'Manual';
        }
    };

    // Helper to get priority color
    const getPriorityColor = (priority: number): "success" | "primary" | "warning" | "default" => {
        switch (priority) {
            case 1:
                return 'success';
            case 2:
                return 'primary';
            case 3:
                return 'warning';
            default:
                return 'default';
        }
    };

    // Filter timeslot summaries based on filter and sort them
    const filteredTimeslots = timeslotSummary.filter(ts => {
        if (timeslotFilter === 'all') return true;
        if (timeslotFilter === 'filled') return ts.is_filled;
        if (timeslotFilter === 'unfilled') return !ts.is_filled;
        return true;
    }).sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.fill_percentage - b.fill_percentage;
        } else {
            return b.fill_percentage - a.fill_percentage;
        }
    });

    // Filter booking summaries based on filter and sort them
    const filteredBookings = bookingSummary.filter(bs => {
        if (bookingFilter === 'all') return true;
        if (bookingFilter === 'assigned') return bs.is_fully_assigned;
        if (bookingFilter === 'unassigned') return !bs.is_fully_assigned;
        return true;
    }).sort((a, b) => {
        if (sortOrder === 'asc') {
            return (a.assigned_shifts / a.max_shifts) - (b.assigned_shifts / b.max_shifts);
        } else {
            return (b.assigned_shifts / b.max_shifts) - (a.assigned_shifts / b.max_shifts);
        }
    });

    // Get assignments for a specific timeslot
    const getAssignmentsForTimeslot = (timeslotId: number) => {
        return assignments.filter(a => a.timeslot_id === timeslotId);
    };

    // Get assignments for a specific booking
    const getAssignmentsForBooking = (bookingId: number) => {
        return assignments.filter(a => a.booking_id === bookingId);
    };

    // Get timeslot details
    const getTimeslotDetails = (timeslotId: number) => {
        return timeslotSummary.find(ts => ts.timeslot_id === timeslotId);
    };

    // Get booking details
    const getBookingDetails = (bookingId: number) => {
        return bookingSummary.find(bs => bs.booking_id === bookingId);
    };

    // Get eligible bookings for a timeslot
    const getEligibleBookingsForTimeslot = (timeslotId: number) => {
        const alreadyAssigned = new Set(
            assignments.filter(a => a.timeslot_id === timeslotId).map(a => a.booking_id)
        );

        return regularBookings.filter(booking => {
            // Get the booking summary
            const summary = bookingSummary.find(bs => bs.booking_id === booking.id);

            // Check if booking is eligible
            return (
                // Not already assigned to this timeslot
                !alreadyAssigned.has(booking.id) &&
                // Has this timeslot as a preference or allow manual assignment
                (booking.timeslot_priority_1 === timeslotId ||
                    booking.timeslot_priority_2 === timeslotId ||
                    booking.timeslot_priority_3 === timeslotId) &&
                // Not fully assigned already
                (summary ? summary.assigned_shifts < summary.max_shifts : true)
            );
        });
    };

    // Get eligible timeslots for a booking
    const getEligibleTimeslotsForBooking = (bookingId: number) => {
        const booking = regularBookings.find(b => b.id === bookingId);
        if (!booking) return [];

        const alreadyAssigned = new Set(
            assignments.filter(a => a.booking_id === bookingId).map(a => a.timeslot_id)
        );

        return timeslotSummary.filter(ts => {
            // Check if timeslot is eligible
            return (
                // Not already assigned to this booking
                !alreadyAssigned.has(ts.timeslot_id) &&
                // Has capacity
                ts.assigned_count < ts.capacity &&
                // Is one of the booking's preferences or allow manual assignment
                (booking.timeslot_priority_1 === ts.timeslot_id ||
                    booking.timeslot_priority_2 === ts.timeslot_id ||
                    booking.timeslot_priority_3 === ts.timeslot_id)
            );
        });
    };

    // Calculate priority level for a booking and timeslot
    const getPriorityForBookingAndTimeslot = (bookingId: number, timeslotId: number): number => {
        const booking = regularBookings.find(b => b.id === bookingId);
        if (!booking) return 0;

        if (booking.timeslot_priority_1 === timeslotId) return 1;
        if (booking.timeslot_priority_2 === timeslotId) return 2;
        if (booking.timeslot_priority_3 === timeslotId) return 3;
        return 0;
    };

    return (
        <Box sx={{p: 2}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h5">Shift Assignments</Typography>

                <Box sx={{display: 'flex', gap: 1}}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AutoAwesomeIcon/>}
                        onClick={() => setAutoAssignDialogOpen(true)}
                    >
                        Auto-Assign
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon/>}
                        onClick={fetchData}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{mb: 2}} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Success Message */}
            {success && (
                <Snackbar
                    open={!!success}
                    autoHideDuration={5000}
                    onClose={() => setSuccess(null)}
                    message={success}
                    action={
                        <IconButton size="small" color="inherit" onClick={() => setSuccess(null)}>
                            <CloseIcon fontSize="small"/>
                        </IconButton>
                    }
                />
            )}

            {/* View Selection Tabs */}
            <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 2}}>
                <Tabs
                    value={currentView}
                    onChange={(_, newValue) => setCurrentView(newValue)}
                    aria-label="assignment view tabs"
                >
                    <Tab
                        label={isMobile ? undefined : "Timeslots"}
                        value="timeslots"
                        icon={isMobile ? <AccessTimeIcon/> : undefined}
                        iconPosition="start"
                    />
                    <Tab
                        label={isMobile ? undefined : "Bookings"}
                        value="bookings"
                        icon={isMobile ? <PersonIcon/> : undefined}
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            {/* Timeslots View */}
            {currentView === 'timeslots' && (
                <>
                    <TimeslotsView
                        timeslots={filteredTimeslots}
                        filter={timeslotFilter}
                        sortOrder={sortOrder}
                        onFilterChange={setTimeslotFilter}
                        onSortOrderToggle={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        onTimeslotSelect={setSelectedTimeslot}
                        onAssignClick={(timeslotId) => {
                            setSelectedTimeslot(timeslotId);
                            setAssignDialogOpen(true);
                        }}
                        isMobile={isMobile}
                    />

                    {/* Selected Timeslot Details */}
                    {selectedTimeslot && (
                        <AssignmentDetailsPanel
                            type="timeslot"
                            assignments={getAssignmentsForTimeslot(selectedTimeslot)}
                            timeslotDetails={getTimeslotDetails(selectedTimeslot)}
                            onClose={() => setSelectedTimeslot(null)}
                            onAssign={() => setAssignDialogOpen(true)}
                            onDelete={handleDeleteAssignment}
                            getPriorityLabel={getPriorityLabel}
                            getPriorityColor={getPriorityColor}
                        />
                    )}
                </>
            )}

            {/* Bookings View */}
            {currentView === 'bookings' && (
                <>
                    <BookingsView
                        bookings={filteredBookings}
                        filter={bookingFilter}
                        sortOrder={sortOrder}
                        onFilterChange={setBookingFilter}
                        onSortOrderToggle={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        onBookingSelect={setSelectedBooking}
                        onAssignClick={(bookingId) => {
                            setSelectedBooking(bookingId);
                            setAssignDialogOpen(true);
                        }}
                        isMobile={isMobile}
                    />

                    {/* Selected Booking Details */}
                    {selectedBooking && (
                        <AssignmentDetailsPanel
                            type="booking"
                            assignments={getAssignmentsForBooking(selectedBooking)}
                            bookingDetails={getBookingDetails(selectedBooking)}
                            onClose={() => setSelectedBooking(null)}
                            onAssign={() => setAssignDialogOpen(true)}
                            onDelete={handleDeleteAssignment}
                            getPriorityLabel={getPriorityLabel}
                            getPriorityColor={getPriorityColor}
                        />
                    )}
                </>
            )}

            {/* Auto Assignment Dialog */}
            <AutoAssignDialog
                open={autoAssignDialogOpen}
                onClose={() => setAutoAssignDialogOpen(false)}
                onRun={handleRunAutoAssignment}
            />

            {/* Assign Dialog */}
            <AssignDialog
                open={assignDialogOpen}
                onClose={() => setAssignDialogOpen(false)}
                currentView={currentView}
                selectedBooking={selectedBooking || undefined}
                selectedTimeslot={selectedTimeslot || undefined}
                eligibleBookings={selectedTimeslot ? getEligibleBookingsForTimeslot(selectedTimeslot) : []}
                eligibleTimeslots={selectedBooking ? getEligibleTimeslotsForBooking(selectedBooking) : []}
                timeslotDetails={selectedTimeslot ? getTimeslotDetails(selectedTimeslot) : undefined}
                bookingDetails={selectedBooking ? getBookingDetails(selectedBooking) : undefined}
                onAssign={handleCreateAssignment}
                getPriorityLabel={getPriorityLabel}
                getPriorityColor={getPriorityColor}
                getPriorityForBookingAndTimeslot={getPriorityForBookingAndTimeslot}
            />
        </Box>
    );
};

export default ShiftAssignmentsPage;