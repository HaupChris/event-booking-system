import React, {useState, useContext} from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Modal, IconButton, Select, MenuItem,
    FormControl, InputLabel, Button, TextField, Snackbar, Alert, Grid,
    Switch, FormControlLabel, Chip, InputAdornment
} from '@mui/material';
import {
    Check, Clear, Save, Receipt, MoneyOff,
    CalendarToday, ArrowUpward, ArrowDownward
} from '@mui/icons-material';
import axios from 'axios';
import {useFetchData} from './useFetchData';
import {TokenContext} from "../../contexts/AuthContext";
import {Booking} from "../userArea/interface";
import {CombinedBooking} from "./interface";


const PaymentConfirmationsPage: React.FC = () => {
    const {bookings, formContent, refetch} = useFetchData();
    const [selectedBooking, setSelectedBooking] = useState<CombinedBooking | null>(null);
    const [editedBooking, setEditedBooking] = useState<CombinedBooking | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'amount'>('date');
    const {token} = useContext(TokenContext);


    // Filter bookings based on payment status
    const filteredBookings: Array<CombinedBooking> = bookings.filter(booking => {
        if (filterPaid === 'all') return true;
        if (filterPaid === 'paid') return booking.is_paid;
        if (filterPaid === 'unpaid') return !booking.is_paid;
        return true;
    });

    // Sort bookings
    const sortedBookings = [...filteredBookings].sort((a, b) => {
        if (sortBy === 'name') {
            const nameA = `${a.last_name} ${a.first_name}`.toLowerCase();
            const nameB = `${b.last_name} ${b.first_name}`.toLowerCase();
            return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        } else if (sortBy === 'date') {
            const dateA = a.payment_date || '0';
            const dateB = b.payment_date || '0';
            return sortOrder === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
        } else { // amount
            const amountA = a.paid_amount || 0;
            const amountB = b.paid_amount || 0;
            return sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
        }
    });

    const handleOpenModal = (booking: CombinedBooking) => {
        setSelectedBooking(booking);
        setEditedBooking({...booking});
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedBooking(null);
        setEditedBooking(null);
    };

    const handleInputChange = (field: keyof Booking, value: any) => {
        if (editedBooking) {
            setEditedBooking({
                ...editedBooking,
                [field]: value
            });
        }
    };

    const handleTogglePaid = () => {
        if (editedBooking) {
            setEditedBooking({
                ...editedBooking,
                is_paid: !editedBooking.is_paid,
                payment_date: !editedBooking.is_paid ? new Date().toISOString().split('T')[0] : "",
            });
        }
    };

    const handleSaveChanges = async () => {
        if (!editedBooking) return;

        try {
            const endpoint = editedBooking.bookingType === 'artist'
                ? `/api/artist/booking/${editedBooking.id}/payment`
                : `/api/booking/${editedBooking.id}/payment`;

            await axios.put(endpoint, {
                is_paid: editedBooking.is_paid,
                paid_amount: editedBooking.paid_amount,
                payment_notes: editedBooking.payment_notes,
                payment_date: editedBooking.payment_date
            }, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setSnackbarMessage('Payment status updated successfully');
            setSnackbarSeverity('success');
            setShowSnackbar(true);
            refetch();
            handleCloseModal();
        } catch (error) {
            console.error('Error updating payment status:', error);
            setSnackbarMessage('Failed to update payment status');
            setSnackbarSeverity('error');
            setShowSnackbar(true);
        }
    };
    const getTicketTitle = (ticketId: number) => {
        const ticket = formContent.ticket_options.find(t => t.id === ticketId);
        return ticket ? ticket.title : 'Unknown Ticket';
    };

    const handleCloseSnackbar = () => {
        setShowSnackbar(false);
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    // Calculate payment statistics
    const totalExpected = bookings.reduce((sum, booking) => sum + booking.total_price, 0);
    const totalReceived = bookings.reduce((sum, booking) => sum + (booking.paid_amount || 0), 0);
    const paidBookings = bookings.filter(b => b.is_paid).length;
    const unpaidBookings = bookings.filter(b => !b.is_paid).length;

    return (
        <Box sx={{p: 2}}>
            <Typography variant="h4" gutterBottom>Payment Confirmations</Typography>

            {/* Statistics Cards */}
            <Grid container spacing={2} sx={{mb: 3}}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{p: 2, bgcolor: 'primary', color: 'white'}}>
                        <Typography variant="h6">Total Expected</Typography>
                        <Typography variant="h4">€{totalExpected.toFixed(2)}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{p: 2, bgcolor: 'success.light', color: 'white'}}>
                        <Typography variant="h6">Total Received</Typography>
                        <Typography variant="h4">€{totalReceived.toFixed(2)}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{p: 2, bgcolor: 'info.light', color: 'white'}}>
                        <Typography variant="h6">Paid Bookings</Typography>
                        <Typography variant="h4">{paidBookings} / {bookings.length}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{p: 2, bgcolor: unpaidBookings > 0 ? 'warning.light' : 'success.light', color: 'white'}}>
                        <Typography variant="h6">Unpaid Bookings</Typography>
                        <Typography variant="h4">{unpaidBookings}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Filters and Sorting */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <FormControl sx={{minWidth: 150}}>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                        value={filterPaid}
                        onChange={(e) => setFilterPaid(e.target.value as 'all' | 'paid' | 'unpaid')}
                        label="Payment Status"
                        size="small"
                    >
                        <MenuItem value="all">All Bookings</MenuItem>
                        <MenuItem value="paid">Paid Only</MenuItem>
                        <MenuItem value="unpaid">Unpaid Only</MenuItem>
                    </Select>
                </FormControl>

                <Box display="flex" alignItems="center">
                    <FormControl sx={{minWidth: 120, mr: 1}}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'amount')}
                            label="Sort By"
                            size="small"
                        >
                            <MenuItem value="name">Name</MenuItem>
                            <MenuItem value="date">Payment Date</MenuItem>
                            <MenuItem value="amount">Amount Paid</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="outlined"
                        size="small"
                        onClick={toggleSortOrder}
                        startIcon={sortOrder === 'asc' ? <ArrowUpward/> : <ArrowDownward/>}
                    >
                        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </Button>
                </Box>
            </Box>

            {/* Payments Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Ticket</TableCell>
                            <TableCell>Expected Amount</TableCell>
                            <TableCell>Paid Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Payment Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedBookings.map((booking) => (
                            <TableRow
                                key={booking.id}
                                sx={{
                                    bgcolor: booking.is_paid
                                        ? 'rgba(76, 175, 80, 0.1)' // Light green for paid
                                        : 'rgba(255, 152, 0, 0.1)' // Light orange for unpaid
                                }}
                            >
                                <TableCell>
                                    {booking.bookingType === 'artist' ? (
                                        <Chip label="Artist" color="primary" size="small"/>
                                    ) : (
                                        <Chip label="Regular" size="small"/>
                                    )}
                                </TableCell>
                                <TableCell>{booking.last_name}, {booking.first_name}</TableCell>
                                <TableCell>{getTicketTitle(booking.ticket_id)}</TableCell>
                                <TableCell>€{booking.total_price.toFixed(2)}</TableCell>
                                <TableCell>€{(booking.paid_amount || 0).toFixed(2)}</TableCell>
                                <TableCell>
                                    {booking.is_paid ? (
                                        <Chip icon={<Check/>} label="Paid" color="success" size="small"/>
                                    ) : (
                                        <Chip icon={<MoneyOff/>} label="Unpaid" color="warning" size="small"/>
                                    )}
                                </TableCell>
                                <TableCell>{booking.payment_date || '—'}</TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpenModal(booking)}
                                        title="Manage Payment"
                                    >
                                        <Receipt/>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Payment Management Modal */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '90vw', maxWidth: 500, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 3
                }}>
                    {editedBooking && (
                        <>
                            <Typography variant="h5" color={"text.primary"} gutterBottom>Payment Management</Typography>
                            <Typography color={"text.primary"} variant="subtitle1">
                                {editedBooking.first_name} {editedBooking.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {getTicketTitle(editedBooking.ticket_id)} - Expected:
                                €{editedBooking.total_price.toFixed(2)}
                            </Typography>

                            <Grid container spacing={2} sx={{mt: 2}}>
                                <Grid item xs={12}>
                                    <FormControlLabel

                                        control={
                                            <Switch
                                                checked={editedBooking.is_paid}
                                                onChange={handleTogglePaid}
                                                color={editedBooking.is_paid ? "success" : "error"}
                                            />
                                        }
                                        label={<Typography
                                            color={editedBooking.is_paid ? "success.light" : "error"}>{editedBooking.is_paid ? 'Ist bezahlt' : 'Noch nicht bezahlt'}</Typography>}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Paid Amount"
                                        type="number"
                                        value={editedBooking.paid_amount || ''}
                                        onChange={(e) => handleInputChange('paid_amount', parseFloat(e.target.value) || 0)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Payment Date"
                                        type="date"
                                        value={editedBooking.payment_date || ''}
                                        onChange={(e) => handleInputChange('payment_date', e.target.value)}
                                        InputLabelProps={{shrink: true}}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarToday fontSize="small"/>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Payment Notes"
                                        multiline
                                        rows={3}
                                        value={editedBooking.payment_notes || ''}
                                        onChange={(e) => handleInputChange('payment_notes', e.target.value)}
                                        placeholder="Enter any notes about the payment..."
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{mt: 3, display: 'flex', justifyContent: 'flex-end'}}>
                                <Button
                                    variant="outlined"
                                    onClick={handleCloseModal}
                                    sx={{mr: 1}}
                                    startIcon={<Clear/>}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSaveChanges}
                                    startIcon={<Save/>}
                                >
                                    Save Changes
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>

            <Snackbar
                open={showSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PaymentConfirmationsPage;