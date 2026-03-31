import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { TokenContext } from '../../contexts/AuthContext';
import {
  createOrgaTeamInviter,
  deactivateOrgaTeamInviter,
  getOrgaTeamInviters,
  type OrgaTeamInviter,
  updateOrgaTeamInviter,
} from '../../services/adminOrgaTeamService';

interface InviterFormState {
  name: string;
  display_order: string;
  is_active: boolean;
}

const INITIAL_FORM: InviterFormState = {
  name: '',
  display_order: '',
  is_active: true,
};

const OrgaTeamPage: React.FC = () => {
  const { token } = useContext(TokenContext);
  const [inviters, setInviters] = useState<OrgaTeamInviter[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInviter, setEditingInviter] = useState<OrgaTeamInviter | null>(null);
  const [formState, setFormState] = useState<InviterFormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const sortedInviters = useMemo(
    () =>
      [...inviters].sort(
        (a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name)
      ),
    [inviters]
  );

  const fetchInviters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrgaTeamInviters(token, includeInactive);
      setInviters(data);
    } catch {
      showSnackbar('Failed to load Orga team.', 'error');
    } finally {
      setLoading(false);
    }
  }, [includeInactive, token]);

  useEffect(() => {
    fetchInviters().then();
  }, [fetchInviters]);

  const openCreateDialog = () => {
    setEditingInviter(null);
    setFormState(INITIAL_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (inviter: OrgaTeamInviter) => {
    setEditingInviter(inviter);
    setFormState({
      name: inviter.name,
      display_order: String(inviter.display_order),
      is_active: inviter.is_active,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingInviter(null);
    setFormState(INITIAL_FORM);
  };

  const handleSave = async () => {
    const trimmedName = formState.name.trim();
    if (!trimmedName) {
      showSnackbar('Name is required.', 'error');
      return;
    }

    const parsedDisplayOrder =
      formState.display_order.trim() === '' ? undefined : Number(formState.display_order);
    if (parsedDisplayOrder !== undefined && Number.isNaN(parsedDisplayOrder)) {
      showSnackbar('Display order must be a number.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingInviter) {
        await updateOrgaTeamInviter(token, editingInviter.id, {
          name: trimmedName,
          is_active: formState.is_active,
          display_order: parsedDisplayOrder,
        });
        showSnackbar('Orga member updated.', 'success');
      } else {
        await createOrgaTeamInviter(token, {
          name: trimmedName,
          display_order: parsedDisplayOrder,
        });
        showSnackbar('Orga member created.', 'success');
      }

      closeDialog();
      await fetchInviters();
    } catch {
      showSnackbar('Failed to save Orga member.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (inviter: OrgaTeamInviter) => {
    try {
      if (inviter.is_active) {
        await deactivateOrgaTeamInviter(token, inviter.id);
      } else {
        await updateOrgaTeamInviter(token, inviter.id, { is_active: true });
      }
      await fetchInviters();
      showSnackbar('Status updated.', 'success');
    } catch {
      showSnackbar('Failed to update status.', 'error');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h5">Orga Team</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage inviter names shown during registration.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Show inactive</Typography>
            <Switch
              checked={includeInactive}
              onChange={(event) => setIncludeInactive(event.target.checked)}
              size="small"
            />
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>
            Add Name
          </Button>
        </Box>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && sortedInviters.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    No Orga members configured yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {sortedInviters.map((inviter) => (
              <TableRow key={inviter.id} hover>
                <TableCell>{inviter.name}</TableCell>
                <TableCell>{inviter.display_order}</TableCell>
                <TableCell>
                  <Chip
                    label={inviter.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    color={inviter.is_active ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEditDialog(inviter)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <Button size="small" onClick={() => handleToggleActive(inviter)}>
                    {inviter.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editingInviter ? 'Edit Orga Member' : 'Add Orga Member'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              size="small"
              autoFocus
            />
            <TextField
              label="Display Order"
              value={formState.display_order}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, display_order: event.target.value }))
              }
              size="small"
              type="number"
            />
            {editingInviter && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">Active</Typography>
                <Switch
                  checked={formState.is_active}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, is_active: event.target.checked }))
                  }
                  size="small"
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrgaTeamPage;
