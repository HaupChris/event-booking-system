import React from 'react';
import {
  alpha,
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { ShiftAssignment } from '../../services/profileService';

interface ShiftAssignmentCardProps {
  shift: ShiftAssignment;
  isCircusMode: boolean;
  headingFont: string;
  bodyFont: string;
  processing: number | null;
  showActions: boolean;
  onAccept: (shift: ShiftAssignment) => void;
  onDecline: (shift: ShiftAssignment) => void;
}

const getStatusChip = (status: ShiftAssignment['status']) => {
  switch (status) {
    case 'accepted':
      return <Chip icon={<CheckCircleIcon />} label="Angenommen" color="success" size="small" />;
    case 'declined':
      return <Chip icon={<CancelIcon />} label="Abgelehnt" color="error" size="small" />;
    default:
      return <Chip icon={<PendingIcon />} label="Ausstehend" color="warning" size="small" />;
  }
};

const ShiftAssignmentCard: React.FC<ShiftAssignmentCardProps> = ({
  shift,
  isCircusMode,
  headingFont,
  bodyFont,
  processing,
  showActions,
  onAccept,
  onDecline,
}) => {
  const cardContentSx = { p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } };
  const assignmentCardSx = isCircusMode
    ? {
        borderRadius: '12px',
        backgroundColor: 'rgba(28, 12, 12, 0.72)',
        borderColor: alpha('#cda163', 0.5),
        boxShadow: '0 8px 22px rgba(0,0,0,0.36)',
      }
    : { borderRadius: 2 };

  return (
    <Card variant="outlined" sx={assignmentCardSx}>
      <CardContent sx={cardContentSx}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1,
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            color="primary"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              overflowWrap: 'anywhere',
              fontFamily: isCircusMode ? headingFont : undefined,
            }}
          >
            {shift.workshift.title}
          </Typography>
          {getStatusChip(shift.status)}
        </Box>

        {shift.workshift.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, fontFamily: isCircusMode ? bodyFont : undefined }}
          >
            {shift.workshift.description}
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1, minWidth: 0 }}>
          <AccessTimeIcon
            sx={{ mr: 1, mt: 0.2, flexShrink: 0, color: isCircusMode ? '#d8b87a' : 'text.secondary' }}
            fontSize="small"
          />
          <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            <strong>{shift.timeslot.title}</strong>
          </Typography>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ml: 4, fontFamily: isCircusMode ? bodyFont : undefined }}
        >
          {shift.timeslot.start_time} - {shift.timeslot.end_time}
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          Zugewiesen am: {new Date(shift.assignment_date).toLocaleDateString('de-DE')}
        </Typography>

        {shift.response_date && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {shift.status === 'accepted' ? 'Angenommen am' : 'Beantwortet am'}:{' '}
            {new Date(shift.response_date).toLocaleDateString('de-DE')}
          </Typography>
        )}

        {shift.admin_notes && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Admin-Notizen:</strong> {shift.admin_notes}
            </Typography>
          </Alert>
        )}
      </CardContent>

      {showActions && shift.status === 'pending' && (
        <CardActions
          sx={{
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'flex-end',
            px: { xs: 2, sm: 2.5 },
            pb: { xs: 2, sm: 2.5 },
            pt: 0,
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            color="error"
            onClick={() => onDecline(shift)}
            disabled={processing === shift.assignment_id}
            sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none', fontFamily: bodyFont }}
          >
            Ablehnen
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => onAccept(shift)}
            disabled={processing === shift.assignment_id}
            startIcon={<CheckCircleIcon />}
            sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none', fontFamily: bodyFont }}
          >
            Annehmen
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ShiftAssignmentCard;
