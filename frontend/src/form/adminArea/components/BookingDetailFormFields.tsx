import React from 'react';
import {
  Box,
  Chip,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import FormCard from '../../../components/core/display/FormCard';
import type { ArtistFormContent } from '../../artistArea/interface';
import type { FormContent } from '../../userArea/interface';
import type { CombinedBooking } from '../interface';
import { calculateTotalPrice, getTimeslotWithWorkshift } from '../utils/bookingUtils';

interface BookingDetailFormFieldsProps {
  editedBooking: CombinedBooking;
  editMode: boolean;
  isMobile: boolean;
  formContent: FormContent;
  artistFormContent: ArtistFormContent;
  onInputChange: (
    field: keyof CombinedBooking,
    value: CombinedBooking[keyof CombinedBooking]
  ) => void;
}

const BookingDetailFormFields: React.FC<BookingDetailFormFieldsProps> = ({
  editedBooking,
  editMode,
  isMobile,
  formContent,
  artistFormContent,
  onInputChange,
}) => {
  const ticketOptions =
    editedBooking.bookingType === 'artist'
      ? artistFormContent.ticket_options
      : formContent.ticket_options;
  const beverageOptions =
    editedBooking.bookingType === 'artist'
      ? artistFormContent.beverage_options
      : formContent.beverage_options;
  const foodOptions =
    editedBooking.bookingType === 'artist'
      ? artistFormContent.food_options
      : formContent.food_options;

  const pricingAwareInputChange = (
    field: keyof CombinedBooking,
    value: CombinedBooking[keyof CombinedBooking]
  ) => {
    if (field === 'ticket_id' || field === 'beverage_id' || field === 'food_id') {
      const updatedBooking = { ...editedBooking, [field]: value };
      const totalPrice = calculateTotalPrice(
        editedBooking,
        field,
        value,
        formContent,
        artistFormContent
      );
      onInputChange('total_price', totalPrice);
      onInputChange(field, updatedBooking[field]);
      return;
    }

    onInputChange(field, value);
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="First Name"
          value={editedBooking.first_name}
          onChange={(event) => onInputChange('first_name', event.target.value)}
          disabled={!editMode}
          margin="normal"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Last Name"
          value={editedBooking.last_name}
          onChange={(event) => onInputChange('last_name', event.target.value)}
          disabled={!editMode}
          margin="normal"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Email"
          value={editedBooking.email}
          onChange={(event) => onInputChange('email', event.target.value)}
          disabled={!editMode}
          margin="normal"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Phone"
          value={editedBooking.phone}
          onChange={(event) => onInputChange('phone', event.target.value)}
          disabled={!editMode}
          margin="normal"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Ticket</InputLabel>
          <Select
            value={editedBooking.ticket_id}
            onChange={(event) => pricingAwareInputChange('ticket_id', event.target.value)}
            disabled={!editMode}
            label="Ticket"
          >
            {ticketOptions.map((ticket) => (
              <MenuItem key={ticket.id} value={ticket.id}>
                {ticket.title} - €{ticket.price}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Beverage</InputLabel>
          <Select
            value={editedBooking.beverage_id}
            onChange={(event) => pricingAwareInputChange('beverage_id', event.target.value)}
            disabled={!editMode}
            label="Beverage"
          >
            <MenuItem value={-1}>No Beverage</MenuItem>
            {beverageOptions.map((beverage) => (
              <MenuItem key={beverage.id} value={beverage.id}>
                {beverage.title} - €{beverage.price}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Food</InputLabel>
          <Select
            value={editedBooking.food_id}
            onChange={(event) => pricingAwareInputChange('food_id', event.target.value)}
            disabled={!editMode}
            label="Food"
          >
            <MenuItem value={-1}>No Food</MenuItem>
            {foodOptions.map((food) => (
              <MenuItem key={food.id} value={food.id}>
                {food.title} - €{food.price}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Total Price"
          type="number"
          value={editedBooking.total_price}
          onChange={(event) => onInputChange('total_price', parseFloat(event.target.value))}
          disabled={!editMode}
          margin="normal"
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
          }}
        />
      </Grid>

      <FormCard title={'Professions'} sx={{ ml: 2, width: '100%' }}>
        {editedBooking.profession_ids.length === 0
          ? 'Keine Professions angegeben.'
          : editedBooking.profession_ids.map((professionId) => {
              const professions =
                editedBooking.bookingType === 'regular'
                  ? formContent.professions
                  : artistFormContent.professions;
              const professionTitle = professions.find(
                (profession) => profession.id === professionId
              )?.title;

              return professionTitle ? (
                <Chip key={professionId} label={professionTitle} color="primary" size="small" />
              ) : null;
            })}
      </FormCard>

      {editedBooking.bookingType === 'regular' && (
        <>
          <Grid size={12}>
            <FormCard title="Support Shift Preferences" sx={{ mt: 2 }}>
              {['timeslot_priority_1', 'timeslot_priority_2', 'timeslot_priority_3'].map(
                (priority, index) => {
                  const timeslotValue = editedBooking[priority as keyof CombinedBooking] as number;
                  const timeslotInfo = getTimeslotWithWorkshift(timeslotValue, formContent);
                  return (
                    <Typography key={priority} variant="body2" sx={{ mb: 1 }}>
                      <strong>{`Priority ${index + 1}:`}</strong> {timeslotInfo.workshiftTitle} -{' '}
                      {timeslotInfo.timeslotTitle}
                      {timeslotInfo.timeslotStart && timeslotInfo.timeslotEnd
                        ? ` (${timeslotInfo.timeslotStart} - ${timeslotInfo.timeslotEnd})`
                        : ''}
                    </Typography>
                  );
                }
              )}
            </FormCard>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Number of Shifts"
              type="number"
              value={editedBooking.amount_shifts}
              onChange={(event) => onInputChange('amount_shifts', parseInt(event.target.value, 10))}
              disabled={!editMode}
              margin="normal"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Supporter Buddy"
              value={editedBooking.supporter_buddy}
              onChange={(event) => onInputChange('supporter_buddy', event.target.value)}
              disabled={!editMode}
              margin="normal"
            />
          </Grid>
        </>
      )}

      {editedBooking.bookingType === 'artist' && (
        <Grid size={12}>
          <FormCard title="Artist Information" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              InputProps={{ inputComponent: 'textarea' }}
              label="Equipment Details"
              value={editedBooking.equipment || ''}
              onChange={(event) => onInputChange('equipment', event.target.value)}
              disabled={!editMode}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              InputProps={{ inputComponent: 'textarea' }}
              label="Special Requests"
              value={editedBooking.special_requests || ''}
              onChange={(event) => onInputChange('special_requests', event.target.value)}
              disabled={!editMode}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              InputProps={{ inputComponent: 'textarea' }}
              label="Performance Details"
              value={editedBooking.performance_details || ''}
              onChange={(event) => onInputChange('performance_details', event.target.value)}
              disabled={!editMode}
              margin="normal"
            />
          </FormCard>
        </Grid>
      )}

      <Grid size={12}>
        <FormCard title="Payment Status" sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Paid</InputLabel>
              <Select
                value={editedBooking.is_paid ? 1 : 0}
                onChange={(event) => onInputChange('is_paid', event.target.value === 1)}
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
              onChange={(event) => onInputChange('paid_amount', parseFloat(event.target.value))}
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
              onChange={(event) => onInputChange('payment_date', event.target.value)}
              disabled={!editMode}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </FormCard>
      </Grid>
    </Grid>
  );
};

export default BookingDetailFormFields;
