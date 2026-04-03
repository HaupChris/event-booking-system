/* eslint-disable max-lines */
import React from 'react';
import { alpha, Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';
import type {
  RideShareContact,
  RideShareJoinRequest,
  RideSharePost,
} from '../../services/profileService';

const compactCardContentSx = { p: 1.5, '&:last-child': { pb: 1.5 } };

const getReactionDisabledReason = (post: RideSharePost): string | null => {
  if (post.is_own_post) {
    return 'Dein eigener Eintrag';
  }
  if (post.status === 'completed') {
    return 'Bereits als erledigt markiert';
  }
  if (post.status === 'cancelled') {
    return 'Eintrag wurde entfernt';
  }
  if (post.my_request_status === 'pending') {
    return 'Du hast bereits eine offene Anfrage';
  }
  if (post.my_request_status === 'approved') {
    return 'Kontakt wurde bereits freigegeben';
  }
  if (post.post_type === 'offer' && post.seats_available <= 0) {
    return 'Keine freien Plaetze';
  }
  return null;
};

export const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const buildMutedCardSx = (isCircusMode: boolean) =>
  isCircusMode
    ? {
        borderRadius: '12px',
        backgroundColor: 'rgba(28, 12, 12, 0.72)',
        borderColor: alpha('#cda163', 0.5),
      }
    : { borderRadius: 2 };

export const getJoinStatusChip = (status: RideShareJoinRequest['status']) => {
  if (status === 'approved') {
    return <Chip size="small" color="success" label="Bestaetigt" />;
  }
  if (status === 'rejected') {
    return <Chip size="small" color="error" label="Abgelehnt" />;
  }
  if (status === 'cancelled') {
    return <Chip size="small" color="default" label="Storniert" />;
  }
  return <Chip size="small" color="warning" label="Ausstehend" />;
};

interface OfferCardProps {
  offer: RideSharePost;
  cardSx: object;
  submitting: boolean;
  onOpenJoinDialog: (offer: RideSharePost) => void;
}

export function RideShareOfferCard({
  offer,
  cardSx,
  submitting,
  onOpenJoinDialog,
}: OfferCardProps) {
  return (
    <Card variant="outlined" sx={cardSx}>
      <CardContent sx={compactCardContentSx}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {offer.origin}
              {' -> '}
              {offer.destination}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(offer.departure_time)} | von {offer.owner_display_name}
            </Typography>
          </Box>
          <Chip
            size="small"
            color={offer.seats_available > 0 ? 'success' : 'default'}
            label={`${offer.seats_available} frei`}
          />
        </Box>

        {offer.notes && (
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {offer.notes}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          {offer.is_own_post ? (
            <Chip size="small" color="info" label="Dein Angebot" />
          ) : (
            <Button
              size="small"
              variant="outlined"
              disabled={!offer.can_join || submitting}
              onClick={() => onOpenJoinDialog(offer)}
            >
              Kontakt anfragen
            </Button>
          )}
        </Box>
        {!offer.can_join && !offer.is_own_post && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {getReactionDisabledReason(offer)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

interface RequestPostCardProps {
  post: RideSharePost;
  cardSx: object;
  submitting: boolean;
  onOpenJoinDialog: (post: RideSharePost) => void;
}

export function RideShareRequestPostCard({
  post,
  cardSx,
  submitting,
  onOpenJoinDialog,
}: RequestPostCardProps) {
  return (
    <Card variant="outlined" sx={cardSx}>
      <CardContent sx={compactCardContentSx}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {post.origin}
          {' -> '}
          {post.destination}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDateTime(post.departure_time)} | von {post.owner_display_name}
        </Typography>
        {post.notes && (
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.notes}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          {post.is_own_post ? (
            <Chip size="small" color="info" label="Dein Gesuch" />
          ) : (
            <Button
              size="small"
              variant="outlined"
              disabled={!post.can_join || submitting}
              onClick={() => onOpenJoinDialog(post)}
            >
              Kontakt anfragen
            </Button>
          )}
        </Box>
        {!post.can_join && !post.is_own_post && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {getReactionDisabledReason(post)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

interface MyPostCardProps {
  post: RideSharePost;
  cardSx: object;
  submitting: boolean;
  onComplete: (postId: number) => void;
  onCancel: (postId: number) => void;
}

export function RideShareMyPostCard({
  post,
  cardSx,
  submitting,
  onComplete,
  onCancel,
}: MyPostCardProps) {
  return (
    <Card variant="outlined" sx={cardSx}>
      <CardContent sx={compactCardContentSx}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {post.origin}
              {' -> '}
              {post.destination}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(post.departure_time)}
            </Typography>
          </Box>
          <Chip
            size="small"
            color={post.post_type === 'offer' ? 'primary' : 'secondary'}
            label={post.post_type === 'offer' ? 'Angebot' : 'Gesuch'}
          />
        </Box>

        {post.post_type === 'offer' && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Freie Plaetze: {post.seats_available} / {post.seats_total ?? 0}
          </Typography>
        )}

        {post.notes && (
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.notes}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          {post.status === 'active' ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                color="success"
                disabled={submitting}
                onClick={() => onComplete(post.id)}
              >
                Erledigt
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={submitting}
                onClick={() => onCancel(post.id)}
              >
                Entfernen
              </Button>
            </Box>
          ) : post.status === 'completed' ? (
            <Chip size="small" color="success" label="Erledigt" />
          ) : (
            <Chip size="small" label="Entfernt" />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

interface IncomingJoinRequestCardProps {
  requestItem: RideShareJoinRequest;
  cardSx: object;
  submitting: boolean;
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
}

export function RideShareIncomingJoinRequestCard({
  requestItem,
  cardSx,
  submitting,
  onApprove,
  onReject,
}: IncomingJoinRequestCardProps) {
  const isRemoved = requestItem.post_status === 'cancelled';
  const isCompleted = requestItem.post_status === 'completed';
  const isClosed = isRemoved || isCompleted;

  return (
    <Card variant="outlined" sx={cardSx}>
      <CardContent sx={compactCardContentSx}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {requestItem.requester_display_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {requestItem.post_type === 'offer' ? 'Angebot' : 'Gesuch'}
              {' | '}
              {requestItem.post_origin}
              {' -> '}
              {requestItem.post_destination} | {formatDateTime(requestItem.post_departure_time)}
            </Typography>
          </Box>
          {isClosed ? (
            <Chip size="small" label={isRemoved ? 'Entfernt' : 'Erledigt'} />
          ) : (
            getJoinStatusChip(requestItem.status)
          )}
        </Box>

        {requestItem.phone_number && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Handy: {requestItem.phone_number}
          </Typography>
        )}

        {isRemoved && (
          <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
            Dieser Eintrag wurde entfernt.
          </Typography>
        )}

        {isCompleted && (
          <Typography variant="caption" color="info.main" sx={{ display: 'block', mt: 1 }}>
            Dieser Eintrag wurde als erledigt markiert.
          </Typography>
        )}

        {requestItem.status === 'pending' && !isClosed && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={submitting}
              onClick={() => onReject(requestItem.id)}
            >
              Ablehnen
            </Button>
            <Button
              size="small"
              variant="contained"
              color="success"
              disabled={submitting}
              onClick={() => onApprove(requestItem.id)}
            >
              Bestaetigen
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

interface MyJoinRequestCardProps {
  requestItem: RideShareJoinRequest;
  cardSx: object;
}

export function RideShareMyJoinRequestCard({ requestItem, cardSx }: MyJoinRequestCardProps) {
  const isRemoved = requestItem.post_status === 'cancelled';
  const isCompleted = requestItem.post_status === 'completed';
  const isClosed = isRemoved || isCompleted;

  return (
    <Card variant="outlined" sx={cardSx}>
      <CardContent sx={compactCardContentSx}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Bei {requestItem.post_owner_display_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {requestItem.post_type === 'offer' ? 'Angebot' : 'Gesuch'}
              {' | '}
              {requestItem.post_origin}
              {' -> '}
              {requestItem.post_destination} | {formatDateTime(requestItem.post_departure_time)}
            </Typography>
          </Box>
          {isClosed ? (
            <Chip size="small" label={isRemoved ? 'Entfernt' : 'Erledigt'} />
          ) : (
            getJoinStatusChip(requestItem.status)
          )}
        </Box>

        {isRemoved && (
          <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
            Dieses Angebot/Gesuch wurde entfernt.
          </Typography>
        )}

        {isCompleted && (
          <Typography variant="caption" color="info.main" sx={{ display: 'block', mt: 1 }}>
            Dieses Angebot/Gesuch wurde als erledigt markiert.
          </Typography>
        )}

        {requestItem.phone_number && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Handy: {requestItem.phone_number}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

interface VisibleContactCardProps {
  contact: RideShareContact;
  cardSx: object;
}

export function RideShareVisibleContactCard({ contact, cardSx }: VisibleContactCardProps) {
  return (
    <Card
      key={`${contact.relation}-${contact.post_id}-${contact.profile_uuid}`}
      variant="outlined"
      sx={cardSx}
    >
      <CardContent sx={compactCardContentSx}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {contact.display_name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Rolle: {contact.relation === 'driver' ? 'Fahrer:in' : 'Mitfahrer:in'}
        </Typography>
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          Handy: {contact.phone_number}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {contact.origin}
          {' -> '}
          {contact.destination} | {formatDateTime(contact.departure_time)}
        </Typography>
      </CardContent>
    </Card>
  );
}
