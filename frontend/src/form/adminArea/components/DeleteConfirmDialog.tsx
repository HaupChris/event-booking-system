import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  itemName?: string;
  onClose: () => void;
  onConfirm: () => void;
  disabled?: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ open, title, message, itemName, onClose, onConfirm, disabled = false }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
        {itemName && <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }}>{itemName}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={disabled}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
