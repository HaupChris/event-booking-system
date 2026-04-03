import React, { useMemo } from 'react';
import { Alert, Stack, Typography } from '@mui/material';
import RouteIcon from '@mui/icons-material/Route';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CallIcon from '@mui/icons-material/Call';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import type {
  RideShareBoard as RideShareBoardType,
  RideSharePost,
} from '../../services/profileService';
import {
  RideShareIncomingJoinRequestCard,
  RideShareMyJoinRequestCard,
  RideShareMyPostCard,
  RideShareOfferCard,
  RideShareRequestPostCard,
  RideShareVisibleContactCard,
} from './RideSharingCards';

interface RideSharingBoardProps {
  board: RideShareBoardType;
  cardSx: object;
  headingFont?: string;
  submitting: boolean;
  viewMode: 'overview' | 'my';
  onOpenJoinDialog: (post: RideSharePost) => void;
  onCompletePost: (postId: number) => void;
  onCancelPost: (postId: number) => void;
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
}

const RideSharingBoard: React.FC<RideSharingBoardProps> = ({
  board,
  cardSx,
  headingFont,
  submitting,
  viewMode,
  onOpenJoinDialog,
  onCompletePost,
  onCancelPost,
  onApprove,
  onReject,
}) => {
  const pendingIncomingCount = useMemo(
    () => board.incoming_join_requests.filter((item) => item.status === 'pending').length,
    [board.incoming_join_requests]
  );

  const headingSx = { fontFamily: headingFont };

  return (
    <Stack spacing={3}>
      {viewMode === 'overview' && (
        <>
          <Typography variant="h6" sx={headingSx}>
            <LocalOfferIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
            Fahrtangebote ({board.offers.length})
          </Typography>
          {board.offers.length === 0 ? (
            <Alert severity="info">Aktuell gibt es keine aktiven Angebote.</Alert>
          ) : (
            <Stack spacing={1.5}>
              {board.offers.map((offer) => (
                <RideShareOfferCard
                  key={offer.id}
                  offer={offer}
                  cardSx={cardSx}
                  submitting={submitting}
                  onOpenJoinDialog={onOpenJoinDialog}
                />
              ))}
            </Stack>
          )}

          <Typography variant="h6" sx={headingSx}>
            <PersonSearchIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
            Fahrtgesuche ({board.requests.length})
          </Typography>
          {board.requests.length === 0 ? (
            <Alert severity="info">Aktuell gibt es keine aktiven Gesuche.</Alert>
          ) : (
            <Stack spacing={1.5}>
              {board.requests.map((requestPost) => (
                <RideShareRequestPostCard
                  key={requestPost.id}
                  post={requestPost}
                  cardSx={cardSx}
                  submitting={submitting}
                  onOpenJoinDialog={onOpenJoinDialog}
                />
              ))}
            </Stack>
          )}
        </>
      )}

      {viewMode === 'my' && (
        <>
          <Typography variant="h6" sx={headingSx}>
            <RouteIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
            Meine Eintraege ({board.my_posts.length})
          </Typography>
          {board.my_posts.length === 0 ? (
            <Alert severity="info">Du hast noch keinen Eintrag erstellt.</Alert>
          ) : (
            <Stack spacing={1.5}>
              {board.my_posts.map((post) => (
                <RideShareMyPostCard
                  key={post.id}
                  post={post}
                  cardSx={cardSx}
                  submitting={submitting}
                  onComplete={onCompletePost}
                  onCancel={onCancelPost}
                />
              ))}
            </Stack>
          )}

          <Typography variant="h6" sx={headingSx}>
            <PeopleAltIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
            Reaktionen auf meine Eintraege
          </Typography>
          {board.incoming_join_requests.length === 0 ? (
            <Alert severity="info">Noch keine Reaktionen eingegangen.</Alert>
          ) : (
            <Stack spacing={1.5}>
              {board.incoming_join_requests.map((requestItem) => (
                <RideShareIncomingJoinRequestCard
                  key={requestItem.id}
                  requestItem={requestItem}
                  cardSx={cardSx}
                  submitting={submitting}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              ))}
            </Stack>
          )}

          <Typography variant="h6" sx={headingSx}>
            Meine gesendeten Reaktionen
          </Typography>
          {board.my_join_requests.length === 0 ? (
            <Alert severity="info">Du hast noch keine Reaktionen gesendet.</Alert>
          ) : (
            <Stack spacing={1.5}>
              {board.my_join_requests.map((requestItem) => (
                <RideShareMyJoinRequestCard
                  key={requestItem.id}
                  requestItem={requestItem}
                  cardSx={cardSx}
                />
              ))}
            </Stack>
          )}

          <Typography variant="h6" sx={headingSx}>
            <CallIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
            Freigegebene Kontakte
          </Typography>
          {board.visible_contacts.length === 0 ? (
            <Alert severity="info">
              Telefonnummern werden nach Bestaetigung einer Anfrage automatisch freigegeben.
            </Alert>
          ) : (
            <Stack spacing={1.5}>
              {board.visible_contacts.map((contact) => (
                <RideShareVisibleContactCard
                  key={`${contact.relation}-${contact.post_id}-${contact.profile_uuid}`}
                  contact={contact}
                  cardSx={cardSx}
                />
              ))}
            </Stack>
          )}

          {pendingIncomingCount > 0 && (
            <Alert severity="info">
              Du hast {pendingIncomingCount} offene Anfrage(n), die bestaetigt oder abgelehnt werden
              koennen.
            </Alert>
          )}
        </>
      )}
    </Stack>
  );
};

export default RideSharingBoard;
