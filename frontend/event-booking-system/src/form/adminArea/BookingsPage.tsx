import React, {useContext, useEffect, useState} from 'react';
import {
    Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Modal, IconButton, Select, MenuItem, FormControl, InputLabel, Button
} from '@mui/material';
import {TokenContext} from '../../AuthContext';
import axios from 'axios';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {useFetchData, Booking} from "./useFetchData";


const BookingsPage: React.FC = () => {

    const {bookings, formContent} = useFetchData();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [sortCriterion, setSortCriterion] = useState('timestamp');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const {token} = useContext(TokenContext);


    const handleOpenModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedBooking(null);
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
        return {workshiftTitle: 'Unknown', timeslotTitle: 'Unknown'};
    };

    const sortBookings = (a: Booking, b: Booking) => {
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

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <FormControl variant="outlined" size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={sortCriterion}
                        onChange={(e) => setSortCriterion(e.target.value as string)}
                        label="Sort By"
                    >
                        <MenuItem value="first_name">First Name</MenuItem>
                        <MenuItem value="last_name">Last Name</MenuItem>
                        <MenuItem value="timestamp">Timestamp</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon/> : <ArrowDownwardIcon/>}
                >
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>First Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Timestamp</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bookings.sort(sortBookings).map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell>{booking.first_name}</TableCell>
                                <TableCell>{booking.last_name}</TableCell>
                                <TableCell>{booking.timestamp}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenModal(booking)}>
                                        <MoreHorizIcon/>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '90vw', maxWidth: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 2
                }}>
                    <IconButton onClick={handleCloseModal} sx={{position: 'absolute', top: 8, right: 8}}>
                        <CloseIcon/>
                    </IconButton>
                    {selectedBooking && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Booking Details
                            </Typography>
                            <Typography variant="body1"><strong>First Name:</strong> {selectedBooking.first_name}
                            </Typography>
                            <Typography variant="body1"><strong>Last Name:</strong> {selectedBooking.last_name}
                            </Typography>
                            <Typography variant="body1"><strong>Email:</strong> {selectedBooking.email}</Typography>
                            <Typography variant="body1"><strong>Phone:</strong> {selectedBooking.phone}</Typography>
                            <Typography
                                variant="body1"><strong>Ticket:</strong> {getOptionTitle(selectedBooking.ticket_id, formContent.ticket_options)}
                            </Typography>
                            <Typography
                                variant="body1"><strong>Beverage:</strong> {getOptionTitle(selectedBooking.beverage_id, formContent.beverage_options)}
                            </Typography>
                            <Typography
                                variant="body1"><strong>Food:</strong> {getOptionTitle(selectedBooking.food_id, formContent.food_options)}
                            </Typography>
                            {['timeslot_priority_1', 'timeslot_priority_2', 'timeslot_priority_3'].map((priority, index) => {
                                const timeslotInfo = getTimeslotWithWorkshift(selectedBooking[priority as keyof Booking]);
                                return (
                                    <Typography variant="body1" key={index}>
                                        <strong>{`Priority ${index + 1} Timeslot:`}</strong> {timeslotInfo.workshiftTitle} - {timeslotInfo.timeslotTitle} {timeslotInfo.timeslotEnd !== "" ? `(${timeslotInfo.timeslotStart} - ${timeslotInfo.timeslotEnd})` : `(${timeslotInfo.timeslotStart})`}
                                    </Typography>
                                );
                            })}
                            <Typography variant="body1"><strong>Amount Shifts:</strong> {selectedBooking.amount_shifts}
                            </Typography>
                            <Typography variant="body1"><strong>Supporter
                                Buddy:</strong> {selectedBooking.supporter_buddy}</Typography>
                            <Typography variant="body1"><strong>Total Price:</strong> {selectedBooking.total_price}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Modal>
        </Box>
    );
};

export default BookingsPage;
