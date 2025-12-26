/**
 * Profile Management Page
 * =======================
 * Admin page for managing user profiles and sending profile links
 */

import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { TokenContext } from '../../contexts/AuthContext';
import type { ProfileStats } from '../../services/adminProfileService';
import { getProfileStats, sendProfileLink, bulkSendProfileLinks } from '../../services/adminProfileService';

const ProfileManagementPage: React.FC = () => {
  const { token } = useContext(TokenContext);
  const [profiles, setProfiles] = useState<ProfileStats[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());
  const [bulkSendDialogOpen, setBulkSendDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Fetch profile stats on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  // Filter profiles when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProfiles(profiles);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredProfiles(
        profiles.filter(
          (p) =>
            p.first_name.toLowerCase().includes(query) ||
            p.last_name.toLowerCase().includes(query) ||
            p.email.toLowerCase().includes(query) ||
            p.profile_uuid.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, profiles]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await getProfileStats(token);
      setProfiles(data);
      setFilteredProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
      showSnackbar('Failed to load profiles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCopyLink = (profileUuid: string) => {
    const url = `${window.location.origin}/profile/${profileUuid}`;
    navigator.clipboard.writeText(url);
    showSnackbar('Profile link copied to clipboard', 'success');
  };

  const handleViewProfile = (profileUuid: string) => {
    window.open(`/profile/${profileUuid}`, '_blank');
  };

  const handleSendLink = async (profile: ProfileStats) => {
    try {
      await sendProfileLink(token, {
        profile_uuid: profile.profile_uuid,
        email: profile.email,
        first_name: profile.first_name,
      });
      showSnackbar(`Profile link sent to ${profile.email}`, 'success');
    } catch (error) {
      console.error('Error sending profile link:', error);
      showSnackbar('Failed to send profile link', 'error');
    }
  };

  const handleToggleSelection = (profileUuid: string) => {
    const newSelection = new Set(selectedProfiles);
    if (newSelection.has(profileUuid)) {
      newSelection.delete(profileUuid);
    } else {
      newSelection.add(profileUuid);
    }
    setSelectedProfiles(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedProfiles.size === filteredProfiles.length) {
      setSelectedProfiles(new Set());
    } else {
      setSelectedProfiles(new Set(filteredProfiles.map((p) => p.profile_uuid)));
    }
  };

  const handleBulkSend = async () => {
    try {
      const result = await bulkSendProfileLinks(token, {
        profile_uuids: Array.from(selectedProfiles),
      });
      showSnackbar(
        `Sent ${result.sent} profile links successfully. ${result.failed} failed.`,
        result.failed > 0 ? 'info' : 'success'
      );
      setSelectedProfiles(new Set());
      setBulkSendDialogOpen(false);
    } catch (error) {
      console.error('Error sending bulk profile links:', error);
      showSnackbar('Failed to send bulk profile links', 'error');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          Profile Management ({filteredProfiles.length} users)
        </Typography>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          disabled={selectedProfiles.size === 0}
          onClick={() => setBulkSendDialogOpen(true)}
        >
          Send Links to Selected ({selectedProfiles.size})
        </Button>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Search by name, email, or UUID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Profiles Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedProfiles.size === filteredProfiles.length && filteredProfiles.length > 0}
                  indeterminate={selectedProfiles.size > 0 && selectedProfiles.size < filteredProfiles.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Last Accessed</TableCell>
              <TableCell align="center">Access Count</TableCell>
              <TableCell>Profile UUID</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProfiles.map((profile) => (
              <TableRow key={profile.profile_uuid} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedProfiles.has(profile.profile_uuid)}
                    onChange={() => handleToggleSelection(profile.profile_uuid)}
                  />
                </TableCell>
                <TableCell>
                  {profile.first_name} {profile.last_name}
                </TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>
                  <Chip
                    label={profile.booking_type === 'artist' ? 'Artist' : 'Regular'}
                    size="small"
                    color={profile.booking_type === 'artist' ? 'secondary' : 'primary'}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {profile.last_accessed && <CheckCircleIcon fontSize="small" color="success" />}
                    {formatDate(profile.last_accessed)}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip label={profile.access_count} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    {profile.profile_uuid.substring(0, 8)}...
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    <Tooltip title="Copy profile link">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyLink(profile.profile_uuid)}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View profile">
                      <IconButton
                        size="small"
                        onClick={() => handleViewProfile(profile.profile_uuid)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send profile link via email">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleSendLink(profile)}
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bulk Send Dialog */}
      <Dialog open={bulkSendDialogOpen} onClose={() => setBulkSendDialogOpen(false)}>
        <DialogTitle>Send Profile Links</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to send profile links to {selectedProfiles.size} selected user(s)?
            They will receive an email with their personalized profile link.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkSendDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkSend} variant="contained" color="primary">
            Send Links
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileManagementPage;
