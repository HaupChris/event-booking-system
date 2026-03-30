import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import { Email, OpenInNew, Search } from '@mui/icons-material';
import { TokenContext } from '../../contexts/AuthContext';
import {
  getProfileStats,
  sendProfileLink,
  type ProfileStatsItem,
} from '../../services/adminProfilesService';

type ProfileFilter = 'all' | 'regular' | 'artist';

const formatDate = (dateValue: string | null): string => {
  if (!dateValue) {
    return 'Never';
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ProfileManagementPage: React.FC = () => {
  const { token } = useContext(TokenContext);

  const [profiles, setProfiles] = useState<ProfileStatsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingProfileUuid, setSendingProfileUuid] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProfileFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const profileStats = await getProfileStats(token);
      setProfiles(profileStats);
    } catch (error) {
      console.error('Failed to load profile stats', error);
      showSnackbar('Profile stats konnten nicht geladen werden.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar, token]);

  useEffect(() => {
    loadProfiles().then();
  }, [loadProfiles]);

  const filteredProfiles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return profiles.filter((profile) => {
      if (filter !== 'all' && profile.booking_type !== filter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const combinedSearch =
        `${profile.first_name} ${profile.last_name} ${profile.email}`.toLowerCase();
      return combinedSearch.includes(normalizedSearch);
    });
  }, [filter, profiles, searchTerm]);

  const handleSendLink = async (profile: ProfileStatsItem) => {
    try {
      setSendingProfileUuid(profile.profile_uuid);
      await sendProfileLink(token, {
        profile_uuid: profile.profile_uuid,
        email: profile.email,
        first_name: profile.first_name,
        resend: true,
      });
      showSnackbar(`Profil-Link an ${profile.email} gesendet.`, 'success');
    } catch (error) {
      console.error('Failed to send profile link', error);
      showSnackbar('Profil-Link konnte nicht gesendet werden.', 'error');
    } finally {
      setSendingProfileUuid(null);
    }
  };

  const handleOpenProfile = (profileUuid: string) => {
    window.open(`/profile/${profileUuid}`, '_blank', 'noopener,noreferrer');
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
      <Typography variant="h5" sx={{ mb: 3 }}>
        Profile Management ({filteredProfiles.length})
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '220px 1fr auto' },
          gap: 2,
          alignItems: 'center',
          mb: 3,
        }}
      >
        <FormControl size="small" fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            label="Type"
            value={filter}
            onChange={(event) => setFilter(event.target.value as ProfileFilter)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="regular">Regular</MenuItem>
            <MenuItem value="artist">Artist</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          fullWidth
          label="Search name or email"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Button variant="outlined" onClick={() => loadProfiles().then()}>
          Refresh
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Registriert</TableCell>
              <TableCell>Last Access</TableCell>
              <TableCell align="right">Access Count</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProfiles.map((profile) => (
              <TableRow key={`${profile.booking_type}-${profile.booking_id}`} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {profile.first_name} {profile.last_name}
                  </Typography>
                </TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={profile.booking_type === 'artist' ? 'Artist' : 'Regular'}
                    color={profile.booking_type === 'artist' ? 'secondary' : 'primary'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{formatDate(profile.registration_date)}</TableCell>
                <TableCell>{formatDate(profile.last_accessed)}</TableCell>
                <TableCell align="right">{profile.access_count}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<OpenInNew fontSize="small" />}
                      onClick={() => handleOpenProfile(profile.profile_uuid)}
                    >
                      Open
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Email fontSize="small" />}
                      disabled={sendingProfileUuid === profile.profile_uuid}
                      onClick={() => handleSendLink(profile)}
                    >
                      Send Link
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredProfiles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Keine Profile gefunden.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

export default ProfileManagementPage;
