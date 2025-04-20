// Path: frontend/src/form/adminArea/BookingsPage.tsx (modified version)

import React, { useState } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Modal, IconButton, Select, MenuItem,
    FormControl, InputLabel, Button, TextField, Snackbar, Alert, Grid, InputAdornment
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from 'axios';
import { useFetchData, BookingWithTimestamp} from "./useFetchData";
import { TokenContext } from "../../AuthContext";

const BookingsPage: React.FC = () => {
    const { bookings, formContent, refetch } = useFetchData();
    const [selectedBooking, setSelectedBooking] = useState<BookingWithTimestamp | null>(null);
    const [editedBooking, setEditedBooking] = useState<BookingWithTimestamp | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [sortCriterion, setSortCriterion] = useState('timestamp');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const { token } = React.useContext(TokenContext);

    const handleOpenModal = (booking: BookingWithTimestamp) => {
        setSelectedBooking(booking);
        setEditedBooking({...booking}); // Create a copy for editing
        setOpenModal(true);
        setEditMode(false);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedBooking(null);
        setEditedBooking(null);
        setEditMode(false);
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    const handleInputChange = (field: keyof BookingWithTimestamp, value: any) => {
        if (editedBooking) {
            setEditedBooking({
                ...editedBooking,
                [field]: value
            });
        }
    };

    const handleSaveChanges = async () => {
        if (!editedBooking) return;

        try {
            await axios.put(`/api/booking/${editedBooking.id}`, editedBooking, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSnackbarMessage('Booking updated successfully');
            setSnackbarSeverity('success');
            setShowSnackbar(true);
            refetch(); // Refresh data
            setEditMode(false);
        } catch (error) {
            console.error('Error updating booking:', error);
            setSnackbarMessage('Failed to update booking');
            setSnackbarSeverity('error');
            setShowSnackbar(true);
        }
    };

    const getOptionTitle = (id: number, options: { id: number; title: string }[]) => {
        const option = options.find(option => option.id === id);
        return option ? option.title : 'Unknown';
    };

    const getTimeslotWithWorkshift = (id: number | string | number[]) => {
        for (const shift of formContent.work_shifts) {
            const timeslot = shift.time_slots.find(slot => slot.id === id);
            if (timeslot) {
                return {
                    workshiftTitle: shift.title,
                    timeslotTitle: timeslot.title,
                    timeslotStart: timeslot.start_time,
                    timeslotEnd: timeslot.end_time
                };
            }
        }
        return { workshiftTitle: 'Unknown', timeslotTitle: 'Unknown' };
    };

    const sortBookings = (a: BookingWithTimestamp, b: BookingWithTimestamp) => {
        const compare = (aValue: string | number, bValue: string | number) => {
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        };

        switch (sortCriterion) {
            case 'first_name':
                return compare(a.first_name, b.first_name);
            case 'last_name':
                return compare(a.last_name, b.last_name);
            case 'timestamp':
            default:
                return compare(a.timestamp, b.timestamp);
        }
    };

    const filteredBookings = bookings.filter(booking =>
        booking.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.last_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCloseSnackbar = () => {
        setShowSnackbar(false);
    };

    return (
        <Box>
            <Box mx={2} mb={2}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Suche nach Vorname oder Nachname"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mx={2} mb={2}>
                <FormControl variant="outlined" size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={sortCriterion}
                        onChange={(e) => setSortCriterion(e.target.value as string)}
                        label="Sort By"
                    >
                        <MenuItem value="first_name">Vorname</MenuItem>
                        <MenuItem value="last_name">Nachname</MenuItem>
                        <MenuItem value="timestamp">Anmeldedatum</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                >
                    {sortOrder === 'asc' ? 'Aufsteigend' : 'Absteigend'}
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Vorname</TableCell>
                            <TableCell>Nachname</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Ticket</TableCell>
                            <TableCell>Preis</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBookings.sort(sortBookings).map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell>{booking.first_name}</TableCell>
                                <TableCell>{booking.last_name}</TableCell>
                                <TableCell>{booking.email}</TableCell>
                                <TableCell>{getOptionTitle(booking.ticket_id, formContent.ticket_options)}</TableCell>
                                <TableCell>€{booking.total_price.toFixed(2)}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenModal(booking)}>
                                        <MoreHorizIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Detail/Edit Modal */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '90vw', maxWidth: 600, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 2
                }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                            {editMode ? 'Edit Booking' : 'Booking Details'}
                        </Typography>
                        <Box>
                            <IconButton onClick={toggleEditMode} sx={{ mr: 1 }}>
                                {editMode ? <SaveIcon onClick={handleSaveChanges} /> : <EditIcon />}
                            </IconButton>
                            <IconButton onClick={handleCloseModal}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {editedBooking && (
                        <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        value={editedBooking.first_name}
                                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        value={editedBooking.last_name}
                                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        value={editedBooking.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        value={editedBooking.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Ticket</InputLabel>
                                        <Select
                                            value={editedBooking.ticket_id}
                                            onChange={(e) => handleInputChange('ticket_id', e.target.value)}
                                            disabled={!editMode}
                                            label="Ticket"
                                        >
                                            {formContent.ticket_options.map((ticket) => (
                                                <MenuItem key={ticket.id} value={ticket.id}>
                                                    {ticket.title} - €{ticket.price}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Beverage</InputLabel>
                                        <Select
                                            value={editedBooking.beverage_id}
                                            onChange={(e) => handleInputChange('beverage_id', e.target.value)}
                                            disabled={!editMode}
                                            label="Beverage"
                                        >
                                            <MenuItem value={-1}>No Beverage</MenuItem>
                                            {formContent.beverage_options.map((beverage) => (
                                                <MenuItem key={beverage.id} value={beverage.id}>
                                                    {beverage.title} - €{beverage.price}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Food</InputLabel>
                                        <Select
                                            value={editedBooking.food_id}
                                            onChange={(e) => handleInputChange('food_id', e.target.value)}
                                            disabled={!editMode}
                                            label="Food"
                                        >
                                            <MenuItem value={-1}>No Food</MenuItem>
                                            {formContent.food_options.map((food) => (
                                                <MenuItem key={food.id} value={food.id}>
                                                    {food.title} - €{food.price}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Total Price"
                                        type="number"
                                        value={editedBooking.total_price}
                                        onChange={(e) => handleInputChange('total_price', parseFloat(e.target.value))}
                                        disabled={!editMode}
                                        margin="normal"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>Support Shift Preferences:</Typography>
                                    {['timeslot_priority_1', 'timeslot_priority_2', 'timeslot_priority_3'].map((priority, index) => {
                                        const timeslotValue = editedBooking[priority as keyof BookingWithTimestamp];
                                        const timeslotInfo = getTimeslotWithWorkshift(timeslotValue as number);
                                        // const timeslotInfo = getTimeslotWithWorkshift(editedBooking[priority as keyof BookingWithTimestamp]);
                                        return (
                                            <Typography key={index} variant="body2">
                                                <strong>{`Priority ${index + 1}:`}</strong> {timeslotInfo.workshiftTitle} - {timeslotInfo.timeslotTitle} 
                                                {timeslotInfo.timeslotStart && timeslotInfo.timeslotEnd ? 
                                                    ` (${timeslotInfo.timeslotStart} - ${timeslotInfo.timeslotEnd})` : 
                                                    timeslotInfo.timeslotStart ? ` (${timeslotInfo.timeslotStart})` : ''}
                                            </Typography>
                                        );
                                    })}
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Box>
            </Modal>

            <Snackbar 
                open={showSnackbar} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BookingsPage;