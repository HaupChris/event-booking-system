import React from 'react';
import {
  alpha,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';

interface ShiftDeclineDialogProps {
  open: boolean;
  rejectionReason: string;
  alternativePreferences: string;
  processing: boolean;
  isCircusMode: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onChangeReason: (value: string) => void;
  onChangeAlternativePreferences: (value: string) => void;
}

const ShiftDeclineDialog: React.FC<ShiftDeclineDialogProps> = ({
  open,
  rejectionReason,
  alternativePreferences,
  processing,
  isCircusMode,
  onCancel,
  onConfirm,
  onChangeReason,
  onChangeAlternativePreferences,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: isCircusMode
          ? {
              backgroundColor: 'rgba(35, 17, 22, 0.98)',
              border: '2px solid',
              borderColor: alpha('#d8b87a', 0.65),
            }
          : undefined,
      }}
    >
      <DialogTitle>Schicht ablehnen</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Möchtest du uns mitteilen, warum du diese Schicht ablehnst? Das hilft uns bei der Planung.
        </Typography>

        <TextField
          fullWidth
          required
          label="Ablehnungsgrund (erforderlich, mind. 20 Zeichen)"
          multiline
          rows={3}
          InputProps={{ inputComponent: 'textarea' }}
          value={rejectionReason}
          onChange={(e) => onChangeReason(e.target.value)}
          placeholder="z.B. Zu dem Zeitpunkt nicht verfügbar..."
          error={rejectionReason.trim().length > 0 && rejectionReason.trim().length < 20}
          helperText={
            rejectionReason.trim().length > 0 && rejectionReason.trim().length < 20
              ? `Noch ${20 - rejectionReason.trim().length} Zeichen benötigt`
              : `${rejectionReason.trim().length}/20 Zeichen`
          }
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Alternative Präferenzen (optional)"
          multiline
          rows={3}
          InputProps={{ inputComponent: 'textarea' }}
          value={alternativePreferences}
          onChange={(e) => onChangeAlternativePreferences(e.target.value)}
          placeholder="z.B. Würde lieber am Samstag helfen..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Abbrechen</Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={processing}>
          Ablehnen bestätigen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShiftDeclineDialog;
