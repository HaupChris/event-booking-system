import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  itemName?: string;
  onClose: () => void;
  onConfirm: () => void;
  disabled?: boolean;
  confirmLabel?: string;
  confirmColor?: 'error' | 'success' | 'warning' | 'primary';
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  title,
  message,
  itemName,
  onClose,
  onConfirm,
  disabled = false,
  confirmLabel = 'Delete',
  confirmColor = 'error',
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
        {itemName && (
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }}>
            {itemName}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} disabled={disabled}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
