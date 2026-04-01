import React, { useMemo, useState } from 'react';
import { Alert, Box, Grid, Typography } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import type { ShiftAssignment } from '../../services/profileService';
import type { ShiftMessage } from '../../services/profileService';
import ShiftMessageFeed from './ShiftMessageFeed';
import MissionHeading from '../core/display/MissionHeading';
import { useThemeMode } from '../styles/theme';
import { useBrandingPack } from '../../branding/useBrandingPack';
import ShiftDeclineDialog from './ShiftDeclineDialog';
import ShiftAssignmentCard from './ShiftAssignmentCard';

interface WorkShiftsProps {
  shifts: ShiftAssignment[];
  shiftMessages: ShiftMessage[];
  isOnline: boolean;
  onAccept: (assignmentId: number) => Promise<void>;
  onDecline: (assignmentId: number, reason?: string, alternatives?: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const WorkShifts: React.FC<WorkShiftsProps> = ({
  shifts,
  shiftMessages,
  isOnline,
  onAccept,
  onDecline,
  onRefresh,
}) => {
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftAssignment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [alternativePreferences, setAlternativePreferences] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pendingShifts = useMemo(
    () =>
      shifts
        .filter((shift) => shift.status === 'pending')
        .sort(
          (a, b) => new Date(b.assignment_date).getTime() - new Date(a.assignment_date).getTime()
        ),
    [shifts]
  );

  const acceptedShifts = useMemo(
    () =>
      shifts
        .filter((shift) => shift.status === 'accepted')
        .sort((a, b) => {
          const aDate = new Date(a.response_date ?? a.assignment_date).getTime();
          const bDate = new Date(b.response_date ?? b.assignment_date).getTime();
          return bDate - aDate;
        }),
    [shifts]
  );

  const handleAcceptClick = async (shift: ShiftAssignment) => {
    try {
      setErrorMessage(null);
      setProcessing(shift.assignment_id);
      await onAccept(shift.assignment_id);
      await onRefresh();
    } catch {
      setErrorMessage('Fehler beim Annehmen der Schicht. Bitte versuche es erneut.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeclineClick = (shift: ShiftAssignment) => {
    setSelectedShift(shift);
    setDeclineDialogOpen(true);
  };

  const handleDeclineConfirm = async () => {
    if (!selectedShift) {
      return;
    }

    const minReasonLength = 20;
    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason || trimmedReason.length < minReasonLength) {
      setErrorMessage(
        `Bitte gib einen Ablehnungsgrund von mindestens ${minReasonLength} Zeichen an. ` +
          `Das hilft uns bei der Planung. Noch ${minReasonLength - trimmedReason.length} Zeichen benötigt.`
      );
      return;
    }

    try {
      setErrorMessage(null);
      setProcessing(selectedShift.assignment_id);
      await onDecline(selectedShift.assignment_id, trimmedReason, alternativePreferences);
      setDeclineDialogOpen(false);
      setRejectionReason('');
      setAlternativePreferences('');
      setSelectedShift(null);
      await onRefresh();
    } catch {
      setErrorMessage('Fehler beim Ablehnen der Schicht. Bitte versuche es erneut.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeclineCancel = () => {
    setDeclineDialogOpen(false);
    setRejectionReason('');
    setAlternativePreferences('');
    setSelectedShift(null);
    setErrorMessage(null);
  };

  return (
    <Box>
      <MissionHeading
        title="Schichten"
        subtitle="Verwalte deine Zuweisungen und gib schnell Rueckmeldung"
        icon={<WorkIcon />}
      />

      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Du bist offline. Änderungen werden synchronisiert, sobald du wieder online bist.
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Typography
        variant="h6"
        color="text.primary"
        sx={{ mb: 1.5, fontFamily: isCircusMode ? brandingPack.typography.heading : undefined }}
      >
        Schichtangebote
      </Typography>

      {pendingShifts.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Aktuell gibt es keine offenen Schichtangebote.
        </Alert>
      )}

      {pendingShifts.length > 0 && (
        <Grid container spacing={3}>
          {pendingShifts.map((shift) => (
            <Grid key={shift.assignment_id} size={12}>
              <ShiftAssignmentCard
                shift={shift}
                isCircusMode={isCircusMode}
                headingFont={brandingPack.typography.heading}
                bodyFont={brandingPack.typography.body}
                processing={processing}
                showActions={true}
                onAccept={handleAcceptClick}
                onDecline={handleDeclineClick}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Typography
        variant="h6"
        color="text.primary"
        sx={{
          mt: 4,
          mb: 1.5,
          fontFamily: isCircusMode ? brandingPack.typography.heading : undefined,
        }}
      >
        Angenommene Angebote
      </Typography>

      {acceptedShifts.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Du hast bisher noch keine Schichtangebote angenommen.
        </Alert>
      )}

      {acceptedShifts.length > 0 && (
        <Grid container spacing={3}>
          {acceptedShifts.map((shift) => (
            <Grid key={shift.assignment_id} size={12}>
              <ShiftAssignmentCard
                shift={shift}
                isCircusMode={isCircusMode}
                headingFont={brandingPack.typography.heading}
                bodyFont={brandingPack.typography.body}
                processing={processing}
                showActions={false}
                onAccept={handleAcceptClick}
                onDecline={handleDeclineClick}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 4 }}>
        <ShiftMessageFeed shiftMessages={shiftMessages} />
      </Box>

      <ShiftDeclineDialog
        open={declineDialogOpen}
        rejectionReason={rejectionReason}
        alternativePreferences={alternativePreferences}
        processing={processing !== null}
        isCircusMode={isCircusMode}
        onCancel={handleDeclineCancel}
        onConfirm={handleDeclineConfirm}
        onChangeReason={setRejectionReason}
        onChangeAlternativePreferences={setAlternativePreferences}
      />
    </Box>
  );
};

export default WorkShifts;
