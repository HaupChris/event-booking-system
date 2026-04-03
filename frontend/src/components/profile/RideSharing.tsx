import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import type { Dayjs } from 'dayjs';
import { Alert, Box, CircularProgress } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FormCard from '../core/display/FormCard';
import MissionHeading from '../core/display/MissionHeading';
import { useThemeMode } from '../styles/theme';
import { useBrandingPack } from '../../branding/useBrandingPack';
import {
  approveRideShareJoinRequest,
  cancelRideSharePost,
  completeRideSharePost,
  createRideSharePost,
  getRideShareBoard,
  rejectRideShareJoinRequest,
  requestRideShareJoin,
  type RideShareBoard,
  type RideSharePost,
  type RideSharePostType,
} from '../../services/profileService';
import { buildMutedCardSx } from './RideSharingCards';
import RideSharingBoard from './RideSharingBoard';
import RideSharingCreateForm from './RideSharingCreateForm';
import RideSharingReactionDialog from './RideSharingReactionDialog';

export type RideSharingViewMode = 'create' | 'my' | 'overview';

interface RideSharingProps {
  viewMode: RideSharingViewMode;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  return fallback;
};

const RideSharing: React.FC<RideSharingProps> = ({ viewMode }) => {
  const { profileUuid } = useParams<{ profileUuid: string }>();
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';
  const cardSx = buildMutedCardSx(isCircusMode);

  const [board, setBoard] = useState<RideShareBoard | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [postType, setPostType] = useState<RideSharePostType>('offer');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState<Dayjs | null>(null);
  const [departureTime, setDepartureTime] = useState<Dayjs | null>(null);
  const [seatsTotalInput, setSeatsTotalInput] = useState('3');
  const [notes, setNotes] = useState('');

  const [reactDialogOpen, setReactDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<RideSharePost | null>(null);

  const clearFeedback = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const loadBoard = useCallback(async () => {
    if (!profileUuid) {
      return;
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      setBoard(await getRideShareBoard(profileUuid));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Mitfahrboerse konnte nicht geladen werden.'));
    } finally {
      setLoading(false);
    }
  }, [profileUuid]);

  useEffect(() => {
    loadBoard().then();
  }, [loadBoard]);

  const parsedSeats = Number.parseInt(seatsTotalInput, 10);
  const seatsValid = Number.isInteger(parsedSeats) && parsedSeats >= 1 && parsedSeats <= 20;
  const isCreateDisabled =
    submitting ||
    !origin.trim() ||
    !destination.trim() ||
    !departureDate ||
    !departureTime ||
    (postType === 'offer' && !seatsValid);

  const runWithProfileUuid = async (task: (uuid: string) => Promise<void>) => {
    if (!profileUuid) {
      return;
    }
    await task(profileUuid);
  };

  const buildDepartureTime = () => {
    if (!departureDate || !departureTime) {
      return '';
    }
    return departureDate
      .hour(departureTime.hour())
      .minute(departureTime.minute())
      .second(0)
      .millisecond(0)
      .format('YYYY-MM-DDTHH:mm:ss');
  };

  const handleCreatePost = async () => {
    await runWithProfileUuid(async (uuid) => {
      try {
        setSubmitting(true);
        clearFeedback();
        await createRideSharePost(uuid, {
          post_type: postType,
          origin,
          destination,
          departure_time: buildDepartureTime(),
          seats_total: postType === 'offer' ? parsedSeats : undefined,
          notes,
        });
        setOrigin('');
        setDestination('');
        setDepartureDate(null);
        setDepartureTime(null);
        setSeatsTotalInput('3');
        setNotes('');
        setSuccessMessage(
          postType === 'offer'
            ? 'Fahrtangebot erfolgreich erstellt.'
            : 'Fahrtgesuch erfolgreich erstellt.'
        );
        await loadBoard();
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'Eintrag konnte nicht erstellt werden.'));
      } finally {
        setSubmitting(false);
      }
    });
  };

  const handleSendReaction = async () => {
    if (!selectedPost) {
      return;
    }
    await runWithProfileUuid(async (uuid) => {
      try {
        setSubmitting(true);
        await requestRideShareJoin(uuid, selectedPost.id);
        setReactDialogOpen(false);
        setSuccessMessage(
          selectedPost.post_type === 'offer'
            ? 'Beitrittsanfrage gesendet.'
            : 'Reaktion auf Gesuch gesendet.'
        );
        await loadBoard();
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'Reaktion konnte nicht gesendet werden.'));
      } finally {
        setSubmitting(false);
      }
    });
  };

  const handleApprove = async (requestId: number) => {
    await runWithProfileUuid(async (uuid) => {
      try {
        setSubmitting(true);
        clearFeedback();
        await approveRideShareJoinRequest(uuid, requestId);
        setSuccessMessage('Anfrage bestaetigt. Telefonnummern sind jetzt sichtbar.');
        await loadBoard();
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'Anfrage konnte nicht bestaetigt werden.'));
      } finally {
        setSubmitting(false);
      }
    });
  };

  const handleReject = async (requestId: number) => {
    await runWithProfileUuid(async (uuid) => {
      try {
        setSubmitting(true);
        clearFeedback();
        await rejectRideShareJoinRequest(uuid, requestId);
        setSuccessMessage('Anfrage wurde abgelehnt.');
        await loadBoard();
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'Anfrage konnte nicht abgelehnt werden.'));
      } finally {
        setSubmitting(false);
      }
    });
  };

  const handleCancelPost = async (postId: number) => {
    await runWithProfileUuid(async (uuid) => {
      try {
        setSubmitting(true);
        clearFeedback();
        await cancelRideSharePost(uuid, postId);
        setSuccessMessage('Dein Eintrag wurde storniert.');
        await loadBoard();
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'Eintrag konnte nicht storniert werden.'));
      } finally {
        setSubmitting(false);
      }
    });
  };

  const handleCompletePost = async (postId: number) => {
    await runWithProfileUuid(async (uuid) => {
      try {
        setSubmitting(true);
        clearFeedback();
        await completeRideSharePost(uuid, postId);
        setSuccessMessage('Eintrag als erledigt markiert. Neue Reaktionen sind jetzt geschlossen.');
        await loadBoard();
      } catch (error) {
        setErrorMessage(
          getErrorMessage(error, 'Eintrag konnte nicht als erledigt markiert werden.')
        );
      } finally {
        setSubmitting(false);
      }
    });
  };

  return (
    <FormCard selected={true} sx={{ mt: 0 }}>
      <MissionHeading
        title="Mitfahrboerse"
        subtitle="Anreise und Rueckfahrt gemeinsam organisieren"
        icon={<DirectionsCarIcon />}
      />

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        Ablauf: Eintrag erstellen {'->'} Kontakt anfragen {'->'} Freigabe bestaetigen {'->'}
        Telefonnummern sichtbar. Die Plattform speichert keine Chat-Unterhaltungen.
      </Alert>

      {viewMode === 'create' && (
        <RideSharingCreateForm
          cardSx={cardSx}
          headingFont={isCircusMode ? brandingPack.typography.heading : undefined}
          postType={postType}
          origin={origin}
          destination={destination}
          departureDate={departureDate}
          departureTime={departureTime}
          seatsTotalInput={seatsTotalInput}
          notes={notes}
          submitting={submitting}
          isCreateDisabled={isCreateDisabled}
          onSetPostType={setPostType}
          onSetOrigin={setOrigin}
          onSetDestination={setDestination}
          onSetDepartureDate={setDepartureDate}
          onSetDepartureTime={setDepartureTime}
          onSetSeatsTotalInput={setSeatsTotalInput}
          onSetNotes={setNotes}
          onCreate={handleCreatePost}
        />
      )}

      {loading && !board ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {board && viewMode !== 'create' && (
        <RideSharingBoard
          board={board}
          cardSx={cardSx}
          headingFont={isCircusMode ? brandingPack.typography.heading : undefined}
          submitting={submitting}
          viewMode={viewMode === 'overview' ? 'overview' : 'my'}
          onOpenJoinDialog={(post) => {
            clearFeedback();
            setSelectedPost(post);
            setReactDialogOpen(true);
          }}
          onCancelPost={handleCancelPost}
          onCompletePost={handleCompletePost}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      <RideSharingReactionDialog
        open={reactDialogOpen}
        selectedPost={selectedPost}
        submitting={submitting}
        onClose={() => setReactDialogOpen(false)}
        onSend={handleSendReaction}
      />
    </FormCard>
  );
};

export default RideSharing;
