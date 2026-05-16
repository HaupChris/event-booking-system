import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import type { NewsItem } from '../../../../services/adminNewsService';

interface NewsActionDialogsProps {
  saving: boolean;
  statusDialogOpen: boolean;
  newsToToggleStatus: NewsItem | null;
  deleteDialogOpen: boolean;
  newsToDelete: NewsItem | null;
  onCloseStatus: () => void;
  onConfirmToggleActive: () => void;
  onCloseDelete: () => void;
  onConfirmDeletePermanent: () => void;
}

function NewsActionDialogs({
  saving,
  statusDialogOpen,
  newsToToggleStatus,
  deleteDialogOpen,
  newsToDelete,
  onCloseStatus,
  onConfirmToggleActive,
  onCloseDelete,
  onConfirmDeletePermanent,
}: NewsActionDialogsProps) {
  return (
    <>
      <Dialog open={statusDialogOpen} onClose={onCloseStatus}>
        <DialogTitle>
          {newsToToggleStatus?.is_active
            ? 'News-Eintrag deaktivieren?'
            : 'News-Eintrag aktivieren?'}
        </DialogTitle>
        <DialogContent>
          {newsToToggleStatus?.is_active
            ? `"${newsToToggleStatus?.title || ''}" wird danach nicht mehr im Newsfeed angezeigt.`
            : `"${newsToToggleStatus?.title || ''}" wird danach im Newsfeed veroeffentlicht.`}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseStatus} disabled={saving}>
            Abbrechen
          </Button>
          <Button
            color={newsToToggleStatus?.is_active ? 'error' : 'success'}
            variant="contained"
            onClick={onConfirmToggleActive}
            disabled={saving}
          >
            {newsToToggleStatus?.is_active ? 'Deaktivieren' : 'Aktivieren'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={onCloseDelete}>
        <DialogTitle>News-Eintrag endgueltig loeschen?</DialogTitle>
        <DialogContent>
          {`"${newsToDelete?.title || ''}" wird dauerhaft entfernt und kann nicht wiederhergestellt werden.`}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDelete} disabled={saving}>
            Abbrechen
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={onConfirmDeletePermanent}
            disabled={saving}
          >
            Endgueltig loeschen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default NewsActionDialogs;
