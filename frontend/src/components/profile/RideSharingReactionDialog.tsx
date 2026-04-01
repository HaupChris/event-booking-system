import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import NotesIcon from '@mui/icons-material/Notes';
import { OrnateInput } from '../../form/userArea/TestDesignFormPrimitives';
import type { RideSharePost } from '../../services/profileService';
import { formatDateTime } from './RideSharingCards';

interface RideSharingReactionDialogProps {
  open: boolean;
  selectedPost: RideSharePost | null;
  message: string;
  submitting: boolean;
  onClose: () => void;
  onChangeMessage: (value: string) => void;
  onSend: () => void;
}

const RideSharingReactionDialog: React.FC<RideSharingReactionDialogProps> = ({
  open,
  selectedPost,
  message,
  submitting,
  onClose,
  onChangeMessage,
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
        <OrnateInput
          size="compact"
          label="Nachricht (optional)"
          icon={<NotesIcon />}
          value={message}
          onChange={(event) => onChangeMessage(event.target.value)}
          multiline={true}
          rows={3}
          placeholder="Kurze Nachricht zur Abstimmung"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Abbrechen
        </Button>
        <Button variant="contained" onClick={onSend} disabled={submitting}>
          Senden
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RideSharingReactionDialog;
