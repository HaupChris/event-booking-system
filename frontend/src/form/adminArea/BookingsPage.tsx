// src/form/adminArea/BookingsPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Modal, IconButton, Select, MenuItem,
  FormControl, InputLabel, Button, TextField, Snackbar, Alert, Grid,
  InputAdornment, Chip, Tab, Tabs, useMediaQuery, useTheme, FormControlLabel, Checkbox, Tooltip, Menu
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ArrowUpwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowUpward';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import axios from 'axios';
import { useFetchData } from "./useFetchData";
import { TokenContext } from "../../contexts/AuthContext";
import { Search } from "@mui/icons-material";

const BookingsPage: React.FC = () => {
  // Use the updated useFetchData hook that separates booking types
  const { regularBookings, artistBookings, formContent, artistFormContent, refetch } = useFetchData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<{[key: string]: boolean}>({
    type: true,
    name: true,
    email: !isMobile,
    ticket: !isMobile,
    price: !isMobile,
    actions: true,
  });

  // Column filter menu state
  const [columnFilterAnchorEl, setColumnFilterAnchorEl] = useState<null | HTMLElement>(null);
  const columnFilterOpen = Boolean(columnFilterAnchorEl);

  // State for filtering and viewing
  const [viewType, setViewType] = useState('all'); // 'all', 'regular', 'artist'
  const [viewTypeAnchorEl, setViewTypeAnchorEl] = useState<null | HTMLElement>(null);
  const viewTypeMenuOpen = Boolean(viewTypeAnchorEl);

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [editedBooking, setEditedBooking] = useState<any | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [sortCriterion, setSortCriterion] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const { token } = React.useContext(TokenContext);

  // Set default column visibility based on screen size
  useEffect(() => {
    setColumnVisibility({
      type: true,
      name: true,
      email: !isMobile,
      ticket: !isMobile,
      price: !isMobile,
      actions: true,
    });
  }, [isMobile]);

  // Combine bookings based on the selected view type
  const getAllBookings = () => {
    const regularWithType = regularBookings.map(b => ({ ...b, bookingType: 'regular' }));
    const artistsWithType = artistBookings.map(b => ({ ...b, bookingType: 'artist' }));

    switch (viewType) {
      case 'regular':
        return regularWithType;
      case 'artist':
        return artistsWithType;
      case 'all':
      default:
        return [...regularWithType, ...artistsWithType];
    }
  };

  const bookings = getAllBookings();

  const handleOpenModal = (booking: any) => {
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

  const handleInputChange = (field: string, value: any) => {
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
      // Determine the correct endpoint based on booking type
      const endpoint = editedBooking.bookingType === 'artist'
        ? `/api/artist/booking/${editedBooking.id}`
        : `/api/booking/${editedBooking.id}`;

      await axios.put(endpoint, editedBooking, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSnackbarMessage('Booking updated successfully');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
      refetch().then(); // Refresh data
      setEditMode(false);
    } catch (error) {
      console.error('Error updating booking:', error);
      setSnackbarMessage('Failed to update booking');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
  };

  const getTicketTitle = (id: number, bookingType: string) => {
    const options = bookingType === 'artist'
      ? artistFormContent.ticket_options
      : formContent.ticket_options;

    const option = options.find(opt => opt.id === id);
    return option ? option.title : 'Unknown';
  };

  const getTimeslotWithWorkshift = (id: number) => {
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
    return { workshiftTitle: 'Unknown', timeslotTitle: 'Unknown', timeslotStart: '', timeslotEnd: '' };
  };

  const sortBookings = (a: any, b: any) => {
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
    booking.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const handleViewChange = (event: React.SyntheticEvent, newValue: string) => {
    setViewType(newValue);
  };

  // Handle view type dropdown menu
  const handleViewTypeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setViewTypeAnchorEl(event.currentTarget);
  };

  const handleViewTypeMenuClose = () => {
    setViewTypeAnchorEl(null);
  };

  const handleViewTypeSelect = (type: string) => {
    setViewType(type);
    handleViewTypeMenuClose();
  };

  // Handle column filter menu
  const handleColumnFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColumnFilterAnchorEl(event.currentTarget);
  };

  const handleColumnFilterClose = () => {
    setColumnFilterAnchorEl(null);
  };

  const handleColumnVisibilityChange = (column: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  return (
    <Box>
      {/* Control panel */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        mb: 2,
        gap: 1,
        p: 1,
        backgroundColor: 'background.paper',
        borderRadius: 1
      }}>
        {/* View Type Selection - Either Tabs or Dropdown based on screen size */}
        {isMobile ? (
          <Box>
            <Button
              variant="outlined"
              onClick={handleViewTypeMenuOpen}
              endIcon={<FilterAltIcon />}
              size="small"
            >
              {viewType === 'all' ? 'All Bookings' :
               viewType === 'regular' ? 'Regular' : 'Artists'}
            </Button>
            <Menu
              anchorEl={viewTypeAnchorEl}
              open={viewTypeMenuOpen}
              onClose={handleViewTypeMenuClose}
            >
              <MenuItem onClick={() => handleViewTypeSelect('all')}>All Bookings</MenuItem>
              <MenuItem onClick={() => handleViewTypeSelect('regular')}>Regular Participants</MenuItem>
              <MenuItem onClick={() => handleViewTypeSelect('artist')}>Artists</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Tabs
            value={viewType}
            onChange={handleViewChange}
            sx={{ minWidth: '300px' }}
          >
            <Tab label="All Bookings" value="all" />
            <Tab label="Regular Participants" value="regular" />
            <Tab label="Artists" value="artist" />
          </Tabs>
        )}

        {/* Column Visibility Button */}
        <Box>
          <Tooltip title="Select visible columns">
            <IconButton
              onClick={handleColumnFilterOpen}
              color="primary"
              size="small"
            >
              <ViewColumnIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={columnFilterAnchorEl}
            open={columnFilterOpen}
            onClose={handleColumnFilterClose}
          >
            <MenuItem disabled>
              <Typography variant="subtitle2">Show Columns</Typography>
            </MenuItem>
            <MenuItem>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={columnVisibility.type}
                    onChange={() => handleColumnVisibilityChange('type')}
                  />
                }
                label="Type"
              />
            </MenuItem>
            <MenuItem>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={columnVisibility.name}
                    onChange={() => handleColumnVisibilityChange('name')}
                  />
                }
                label="Name"
              />
            </MenuItem>
            <MenuItem>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={columnVisibility.email}
                    onChange={() => handleColumnVisibilityChange('email')}
                  />
                }
                label="Email"
              />
            </MenuItem>
            <MenuItem>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={columnVisibility.ticket}
                    onChange={() => handleColumnVisibilityChange('ticket')}
                  />
                }
                label="Ticket"
              />
            </MenuItem>
            <MenuItem>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={columnVisibility.price}
                    onChange={() => handleColumnVisibilityChange('price')}
                  />
                }
                label="Price"
              />
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Search and Sort Controls */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        gap: 1,
        p: 1
      }}>
        {/* Search */}
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: isMobile ? '100%' : '60%' }}
        />

        {/* Sort Controls */}
        <Box sx={{
          display: 'flex',
          gap: 1,
          mt: "1em",
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'space-between' : 'flex-end'
        }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortCriterion}
              onChange={(e) => setSortCriterion(e.target.value as string)}
              label="Sort By"
            >
              <MenuItem value="first_name">First Name</MenuItem>
              <MenuItem value="last_name">Last Name</MenuItem>
              <MenuItem value="timestamp">Registration Date</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            size="small"
          >
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </Button>
        </Box>
      </Box>

      {/* Bookings Table */}
      <TableContainer component={Paper}>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              {columnVisibility.type && <TableCell>Type</TableCell>}
              {columnVisibility.name && <TableCell>Name</TableCell>}
              {columnVisibility.email && <TableCell>Email</TableCell>}
              {columnVisibility.ticket && <TableCell>Ticket</TableCell>}
              {columnVisibility.price && <TableCell>Price</TableCell>}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBookings.sort(sortBookings).map((booking) => (
              <TableRow
                key={`${booking.bookingType}-${booking.id}`}
                sx={{
                  bgcolor: booking.bookingType === 'artist'
                    ? 'rgba(25, 118, 210, 0.08)'  // Light blue for artists
                    : 'transparent'
                }}
              >
                {columnVisibility.type && (
                  <TableCell>
                    {booking.bookingType === 'artist' ? (
                      <Chip label="Artist" color="primary" size="small" />
                    ) : (
                      <Chip label="Regular" color="default" size="small" />
                    )}
                  </TableCell>
                )}
                {columnVisibility.name && (
                  <TableCell>{booking.first_name} {booking.last_name}</TableCell>
                )}
                {columnVisibility.email && (
                  <TableCell>{booking.email}</TableCell>
                )}
                {columnVisibility.ticket && (
                  <TableCell>{getTicketTitle(booking.ticket_id, booking.bookingType)}</TableCell>
                )}
                {columnVisibility.price && (
                  <TableCell>€{booking.total_price.toFixed(2)}</TableCell>
                )}
                <TableCell>
                  <IconButton onClick={() => handleOpenModal(booking)} size="small">
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
          width: '90vw', maxWidth: 700, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 2,
          maxHeight: '90vh', overflow: 'auto'
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              {editMode ? 'Edit Booking' : 'Booking Details'}
              {editedBooking?.bookingType === 'artist' && (
                <Chip label="Artist" color="primary" size="small" sx={{ ml: 1 }} />
              )}
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
            <Box>
              <Grid container spacing={2}>
                {/* Common fields for both booking types */}
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
                      {(editedBooking.bookingType === 'artist' ? artistFormContent.ticket_options : formContent.ticket_options).map((ticket) => (
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
                      {(editedBooking.bookingType === 'artist' ? artistFormContent.beverage_options : formContent.beverage_options).map((beverage) => (
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
                      {(editedBooking.bookingType === 'artist' ? artistFormContent.food_options : formContent.food_options).map((food) => (
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

                {/* Booking type specific fields */}
                {editedBooking.bookingType === 'regular' && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>Support Shift Preferences:</Typography>
                      {['timeslot_priority_1', 'timeslot_priority_2', 'timeslot_priority_3'].map((priority, index) => {
                        const timeslotValue = editedBooking[priority];
                        const timeslotInfo = getTimeslotWithWorkshift(timeslotValue);
                        return (
                          <Typography key={index} variant="body2">
                            <strong>{`Priority ${index + 1}:`}</strong> {timeslotInfo.workshiftTitle} - {timeslotInfo.timeslotTitle}
                            {timeslotInfo.timeslotStart && timeslotInfo.timeslotEnd ?
                              ` (${timeslotInfo.timeslotStart} - ${timeslotInfo.timeslotEnd})` :
                              ''}
                          </Typography>
                        );
                      })}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Number of Shifts"
                        type="number"
                        value={editedBooking.amount_shifts}
                        onChange={(e) => handleInputChange('amount_shifts', parseInt(e.target.value))}
                        disabled={!editMode}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Supporter Buddy"
                        value={editedBooking.supporter_buddy}
                        onChange={(e) => handleInputChange('supporter_buddy', e.target.value)}
                        disabled={!editMode}
                        margin="normal"
                      />
                    </Grid>
                  </>
                )}

                {editedBooking.bookingType === 'artist' && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Equipment Details"
                        value={editedBooking.artist_equipment || ''}
                        onChange={(e) => handleInputChange('artist_equipment', e.target.value)}
                        disabled={!editMode}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Special Requests"
                        value={editedBooking.special_requests || ''}
                        onChange={(e) => handleInputChange('special_requests', e.target.value)}
                        disabled={!editMode}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Performance Details"
                        value={editedBooking.performance_details || ''}
                        onChange={(e) => handleInputChange('performance_details', e.target.value)}
                        disabled={!editMode}
                        margin="normal"
                      />
                    </Grid>
                  </>
                )}

                {/* Payment information for all booking types */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Payment Status:</Typography>
                  <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Paid</InputLabel>
                      <Select
                        value={editedBooking.is_paid ? 1 : 0}
                        onChange={(e) => handleInputChange('is_paid', e.target.value === 1)}
                        disabled={!editMode}
                        label="Paid"
                      >
                        <MenuItem value={1}>Yes</MenuItem>
                        <MenuItem value={0}>No</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Paid Amount"
                      type="number"
                      value={editedBooking.paid_amount || 0}
                      onChange={(e) => handleInputChange('paid_amount', parseFloat(e.target.value))}
                      disabled={!editMode}
                      margin="normal"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">€</InputAdornment>,
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Payment Date"
                      type="date"
                      value={editedBooking.payment_date || ''}
                      onChange={(e) => handleInputChange('payment_date', e.target.value)}
                      disabled={!editMode}
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
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