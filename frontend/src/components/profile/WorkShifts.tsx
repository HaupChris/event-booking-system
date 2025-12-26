/**
 * Work Shifts
 * ===========
 * Component for managing work shift assignments with accept/decline functionality
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { ShiftAssignment } from '../../services/profileService';

interface WorkShiftsProps {
  shifts: ShiftAssignment[];
  isOnline: boolean;
  onAccept: (assignmentId: number) => Promise<void>;
  onDecline: (assignmentId: number, reason?: string, alternatives?: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const WorkShifts: React.FC<WorkShiftsProps> = ({
  shifts,
  isOnline,
  onAccept,
  onDecline,
  onRefresh,
}) => {
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftAssignment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [alternativePreferences, setAlternativePreferences] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);

  const handleAcceptClick = async (shift: ShiftAssignment) => {
    try {
      setProcessing(shift.assignment_id);
      await onAccept(shift.assignment_id);
      await onRefresh();
    } catch (error) {
      console.error('Error accepting shift:', error);
      alert('Fehler beim Annehmen der Schicht. Bitte versuche es erneut.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeclineClick = (shift: ShiftAssignment) => {
    setSelectedShift(shift);
    setDeclineDialogOpen(true);
  };

  const handleDeclineConfirm = async () => {
    if (!selectedShift) return;

    // Validate rejection reason (minimum 20 characters)
    const MIN_REASON_LENGTH = 20;
    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason || trimmedReason.length < MIN_REASON_LENGTH) {
      alert(
        `Bitte gib einen Ablehnungsgrund von mindestens ${MIN_REASON_LENGTH} Zeichen an. ` +
          `Das hilft uns bei der Planung. Noch ${MIN_REASON_LENGTH - trimmedReason.length} Zeichen benötigt.`
      );
      return;
    }

    try {
      setProcessing(selectedShift.assignment_id);
      await onDecline(selectedShift.assignment_id, trimmedReason, alternativePreferences);
      setDeclineDialogOpen(false);
      setRejectionReason('');
      setAlternativePreferences('');
      setSelectedShift(null);
      await onRefresh();
    } catch (error) {
      console.error('Error declining shift:', error);
      alert('Fehler beim Ablehnen der Schicht. Bitte versuche es erneut.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeclineCancel = () => {
    setDeclineDialogOpen(false);
    setRejectionReason('');
    setAlternativePreferences('');
    setSelectedShift(null);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Chip icon={<CheckCircleIcon />} label="Angenommen" color="success" size="small" />;
      case 'declined':
        return <Chip icon={<CancelIcon />} label="Abgelehnt" color="error" size="small" />;
      default:
        return <Chip icon={<PendingIcon />} label="Ausstehend" color="warning" size="small" />;
    }
  };

  if (shifts.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          Dir wurden noch keine Schichten zugewiesen. Schau später wieder vorbei!
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Du bist offline. Änderungen werden synchronisiert, sobald du wieder online bist.
        </Alert>
      )}

      <Grid container spacing={2}>
        {shifts.map((shift) => (
          <Grid item xs={12} key={shift.assignment_id}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" color="primary" sx={{ flexGrow: 1 }}>
                    {shift.workshift.title}
                  </Typography>
                  {getStatusChip(shift.status)}
                </Box>

                {shift.workshift.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {shift.workshift.description}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                  <Typography variant="body2">
                    <strong>{shift.timeslot.title}</strong>
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  {shift.timeslot.start_time} - {shift.timeslot.end_time}
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  Zugewiesen am: {new Date(shift.assignment_date).toLocaleDateString('de-DE')}
                </Typography>

                {shift.response_date && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Beantwortet am: {new Date(shift.response_date).toLocaleDateString('de-DE')}
                  </Typography>
                )}

                {shift.rejection_reason && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Ablehnungsgrund:</strong> {shift.rejection_reason}
                    </Typography>
                    {shift.alternative_preferences && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Alternative Präferenzen:</strong> {shift.alternative_preferences}
                      </Typography>
                    )}
                  </Alert>
                )}

                {shift.admin_notes && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Admin-Notizen:</strong> {shift.admin_notes}
                    </Typography>
                  </Alert>
                )}
              </CardContent>

              {shift.status === 'pending' && (
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeclineClick(shift)}
                    disabled={processing === shift.assignment_id}
                  >
                    Ablehnen
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleAcceptClick(shift)}
                    disabled={processing === shift.assignment_id}
                    startIcon={<CheckCircleIcon />}
                  >
                    Annehmen
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Decline Dialog */}
      <Dialog open={declineDialogOpen} onClose={handleDeclineCancel} maxWidth="sm" fullWidth>
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
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
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
            value={alternativePreferences}
            onChange={(e) => setAlternativePreferences(e.target.value)}
            placeholder="z.B. Würde lieber am Samstag helfen..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeclineCancel}>Abbrechen</Button>
          <Button
            onClick={handleDeclineConfirm}
            variant="contained"
            color="error"
            disabled={processing !== null}
          >
            Ablehnen bestätigen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkShifts;
