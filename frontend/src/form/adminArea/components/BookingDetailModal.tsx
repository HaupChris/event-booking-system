/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Delete,
} from '@mui/icons-material';
import axios from 'axios';
import type { CombinedBooking } from '../interface';
import type { FormContent } from '../../userArea/interface';
import { alpha } from '@mui/material/styles';
import { adminPalette } from '../theme/adminPalette';
import type { ArtistFormContent } from '../../artistArea/interface';
import BookingDetailFormFields from './BookingDetailFormFields';
import BookingEventHistory from './BookingEventHistory';

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
  onDelete: (bookingId: number, bookingType: 'regular' | 'artist') => void;
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
  isMobile,
  onDelete,
}) => {
  const [editedBooking, setEditedBooking] = useState<CombinedBooking | null>(selectedBooking);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setEditedBooking(selectedBooking);
    setEditMode(false);
  }, [selectedBooking]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (editedBooking) {
      onDelete(editedBooking.id, editedBooking.bookingType);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  const handleInputChange = (
    field: keyof CombinedBooking,
    value: CombinedBooking[keyof CombinedBooking]
  ) => {
    setEditedBooking((previous) => {
      if (!previous) {
        return previous;
      }

      return { ...previous, [field]: value };
    });
  };

  const handleSaveChanges = async () => {
    if (!editedBooking) return;

    try {
      // Determine endpoint based on booking type
      const endpoint =
        editedBooking.bookingType === 'artist'
          ? `/api/artist/booking/${editedBooking.id}`
          : `/api/booking/${editedBooking.id}`;

      await axios.put(endpoint, editedBooking, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSuccess();
      setEditMode(false);
    } catch (error) {
      onError('Failed to update booking');
    }
  };

  if (!editedBooking) return null;

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
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
            border: `2px solid ${alpha(adminPalette.primary.main, 0.3)}`,
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
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
                  color: editMode ? adminPalette.status.success : adminPalette.primary.main,
                }}
              >
                {editMode ? <SaveIcon onClick={handleSaveChanges} /> : <EditIcon />}
              </IconButton>
              <IconButton
                onClick={handleDeleteClick}
                sx={{
                  mr: 1,
                  color: adminPalette.status.error,
                }}
              >
                <Delete />
              </IconButton>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <BookingDetailFormFields
            editedBooking={editedBooking}
            editMode={editMode}
            isMobile={isMobile}
            formContent={formContent}
            artistFormContent={artistFormContent}
            onInputChange={handleInputChange}
          />

          {!editMode && (
            <BookingEventHistory
              bookingType={editedBooking.bookingType}
              bookingId={editedBooking.id}
              token={token}
            />
          )}
        </Box>
      </Modal>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this booking for {editedBooking?.first_name}{' '}
            {editedBooking?.last_name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookingDetailModal;
