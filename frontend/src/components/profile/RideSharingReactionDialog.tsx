import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { RideSharePost } from '../../services/profileService';
import { formatDateTime } from './RideSharingCards';

interface RideSharingReactionDialogProps {
  open: boolean;
  selectedPost: RideSharePost | null;
  submitting: boolean;
  onClose: () => void;
  onSend: () => void;
}

const RideSharingReactionDialog: React.FC<RideSharingReactionDialogProps> = ({
  open,
  selectedPost,
  submitting,
  onClose,
  onSend,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {selectedPost?.post_type === 'offer' ? 'Beitritt anfragen' : 'Auf Gesuch reagieren'}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {selectedPost
            ? `${selectedPost.origin} -> ${selectedPost.destination} am ${formatDateTime(selectedPost.departure_time)}`
            : ''}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Mit dem Senden wird eine Kontaktanfrage erstellt. Die andere Person kann sie bestaetigen
          oder ablehnen.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Bei Bestaetigung werden beidseitig Telefonnummern freigegeben. Es werden keine
          Chat-Nachrichten gespeichert.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Abbrechen
        </Button>
        <Button variant="contained" onClick={onSend} disabled={submitting}>
          Kontakt anfragen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RideSharingReactionDialog;
