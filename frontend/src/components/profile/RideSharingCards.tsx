import React from 'react';
import { alpha, Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';
import type {
  RideShareContact,
  RideShareJoinRequest,
  RideSharePost,
} from '../../services/profileService';

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
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {offer.origin}
              {' -> '}
              {offer.destination}
            </Typography>
            <Typography variant="body2" color="text.secondary">
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
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            {offer.notes}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          {offer.is_own_post ? (
            <Chip size="small" color="info" label="Dein Angebot" />
          ) : (
            <Button
              variant="outlined"
              disabled={!offer.can_join || submitting}
              onClick={() => onOpenJoinDialog(offer)}
            >
              Beitritt anfragen
            </Button>
          )}
        </Box>
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
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {post.origin}
          {' -> '}
          {post.destination}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDateTime(post.departure_time)} | von {post.owner_display_name}
        </Typography>
        {post.notes && (
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            {post.notes}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          {post.is_own_post ? (
            <Chip size="small" color="info" label="Dein Gesuch" />
          ) : (
            <Button
              variant="outlined"
              disabled={!post.can_join || submitting}
              onClick={() => onOpenJoinDialog(post)}
            >
              Auf Gesuch reagieren
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

interface MyPostCardProps {
  post: RideSharePost;
  cardSx: object;
  submitting: boolean;
  onCancel: (postId: number) => void;
}

export function RideShareMyPostCard({ post, cardSx, submitting, onCancel }: MyPostCardProps) {
  return (
    <Card variant="outlined" sx={cardSx}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {post.origin}
              {' -> '}
              {post.destination}
            </Typography>
            <Typography variant="body2" color="text.secondary">
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
          <Typography variant="body2" sx={{ mt: 1 }}>
            Freie Plaetze: {post.seats_available} / {post.seats_total ?? 0}
          </Typography>
        )}

        {post.notes && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {post.notes}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          {post.status === 'active' ? (
            <Button
              variant="outlined"
              color="error"
              disabled={submitting}
              onClick={() => onCancel(post.id)}
            >
              Stornieren
            </Button>
          ) : (
            <Chip size="small" label="Storniert" />
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
  return (
    <Card variant="outlined" sx={cardSx}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {requestItem.requester_display_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {requestItem.post_type === 'offer' ? 'Angebot' : 'Gesuch'}
              {' | '}
              {requestItem.post_origin}
              {' -> '}
              {requestItem.post_destination} | {formatDateTime(requestItem.post_departure_time)}
            </Typography>
          </Box>
          {getJoinStatusChip(requestItem.status)}
        </Box>

        {requestItem.message && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Nachricht: {requestItem.message}
          </Typography>
        )}

        {requestItem.phone_number && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Handy: {requestItem.phone_number}
          </Typography>
        )}

        {requestItem.status === 'pending' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              disabled={submitting}
              onClick={() => onReject(requestItem.id)}
            >
              Ablehnen
            </Button>
            <Button
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
  return (
    <Card variant="outlined" sx={cardSx}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Bei {requestItem.post_owner_display_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {requestItem.post_type === 'offer' ? 'Angebot' : 'Gesuch'}
              {' | '}
              {requestItem.post_origin}
              {' -> '}
              {requestItem.post_destination} | {formatDateTime(requestItem.post_departure_time)}
            </Typography>
          </Box>
          {getJoinStatusChip(requestItem.status)}
        </Box>

        {requestItem.phone_number && (
          <Typography variant="body2" sx={{ mt: 1 }}>
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
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {contact.display_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rolle: {contact.relation === 'driver' ? 'Fahrer:in' : 'Mitfahrer:in'}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Handy: {contact.phone_number}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {contact.origin}
          {' -> '}
          {contact.destination} | {formatDateTime(contact.departure_time)}
        </Typography>
      </CardContent>
    </Card>
  );
}
