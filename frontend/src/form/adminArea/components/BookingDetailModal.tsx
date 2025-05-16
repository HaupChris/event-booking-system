import React, { useState } from 'react';
import {
  Box, Typography, Modal, IconButton, TextField, InputAdornment,
  Grid, FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { CombinedBooking } from "../interface";
import { FormContent } from "../../userArea/interface";
import { alpha } from '@mui/material/styles';
import { spacePalette } from '../../../components/styles/theme';
import FormCard from "../../../components/core/display/FormCard";
import { getTimeslotWithWorkshift, calculateTotalPrice } from '../utils/bookingUtils';
import {ArtistFormContent} from "../../artistArea/interface";

interface BookingDetailModalProps {
  open: boolean;
  onClose: () => void;
  selectedBooking: CombinedBooking | null;
  formContent: FormContent;
  artistFormContent: ArtistFormContent;
  token: string;
  onSuccess: () => void;
  onError: (message: string) => void;
  isMobile: boolean;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  open,
  onClose,
  selectedBooking,
  formContent,
  artistFormContent,
  token,
  onSuccess,
  onError,
  isMobile
}) => {
  const [editedBooking, setEditedBooking] = useState<CombinedBooking | null>(selectedBooking);
  const [editMode, setEditMode] = useState(false);

  React.useEffect(() => {
    setEditedBooking(selectedBooking);
    setEditMode(false);
  }, [selectedBooking]);

  const toggleEditMode = () => {
    setEditMode(prev => !prev);
  };

  const handleInputChange = (field: keyof CombinedBooking, value: any) => {
    if (!editedBooking) return;

    // Create updated booking
    const updatedBooking = { ...editedBooking, [field]: value };

    // Recalculate total price when relevant fields change
    if (['ticket_id', 'beverage_id', 'food_id'].includes(field)) {
      updatedBooking.total_price = calculateTotalPrice(
        editedBooking,
        field,
        value,
        formContent,
        artistFormContent
      );
    }

    setEditedBooking(updatedBooking);
  };

  const handleSaveChanges = async () => {
    if (!editedBooking) return;

    try {
      // Determine endpoint based on booking type
      const endpoint = editedBooking.bookingType === 'artist'
        ? `/api/artist/booking/${editedBooking.id}`
        : `/api/booking/${editedBooking.id}`;

      await axios.put(endpoint, editedBooking, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onSuccess();
      setEditMode(false);
    } catch (error) {
      console.error('Error updating booking:', error);
      onError('Failed to update booking');
    }
  };

  if (!editedBooking) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw',
        maxWidth: 700,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 2,
        border: `2px solid ${alpha(spacePalette.primary.main, 0.3)}`,
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" color="text.primary">
            {editMode ? 'Edit Booking' : 'Booking Details'}
            {editedBooking.bookingType === 'artist' && (
              <Chip label="Artist" color="primary" size="small" sx={{ ml: 1 }} />
            )}
          </Typography>
          <Box>
            <IconButton
              onClick={toggleEditMode}
              sx={{
                mr: 1,
                color: editMode ? spacePalette.status.success : spacePalette.primary.main
              }}
            >
              {editMode ? (
                <SaveIcon onClick={handleSaveChanges} />
              ) : (
                <EditIcon />
              )}
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

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
                  <FormCard title="Support Shift Preferences" sx={{ mt: 2 }}>
                    {['timeslot_priority_1', 'timeslot_priority_2', 'timeslot_priority_3'].map((priority, index) => {
                      const timeslotValue = editedBooking[priority as keyof CombinedBooking] as number;
                      const timeslotInfo = getTimeslotWithWorkshift(timeslotValue, formContent);
                      return (
                        <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                          <strong>{`Priority ${index + 1}:`}</strong> {timeslotInfo.workshiftTitle} - {timeslotInfo.timeslotTitle}
                          {timeslotInfo.timeslotStart && timeslotInfo.timeslotEnd ?
                            ` (${timeslotInfo.timeslotStart} - ${timeslotInfo.timeslotEnd})` :
                            ''}
                        </Typography>
                      );
                    })}
                  </FormCard>
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
                  <FormCard title="Artist Information" sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Equipment Details"
                      value={editedBooking.equipment || ''}
                      onChange={(e) => handleInputChange('equipment', e.target.value)}
                      disabled={!editMode}
                      margin="normal"
                    />
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
                  </FormCard>
                </Grid>
              </>
            )}

            {/* Payment information for all booking types */}
            <Grid item xs={12}>
              <FormCard title="Payment Status" sx={{ mt: 2 }}>
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
              </FormCard>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Modal>
  );
};

export default BookingDetailModal;