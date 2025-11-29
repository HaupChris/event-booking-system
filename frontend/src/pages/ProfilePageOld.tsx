/**
 * Profile Page
 * ============
 * Main profile page component showing user's booking, shifts, and news
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useProfile } from '../hooks/useProfile';
import ProfileOverview from '../components/profile/ProfileOverview';
import BookingDetails from '../components/profile/BookingDetails';
import WorkShifts from '../components/profile/WorkShifts';
import NewsFeed from '../components/profile/NewsFeed';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const { profileUuid } = useParams<{ profileUuid: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);

  const {
    profile,
    shifts,
    news,
    unreadCount,
    isLoading,
    error,
    isOnline,
    refreshProfile,
    refreshShifts,
    refreshNews,
    acceptShift,
    declineShift,
    markNewsAsRead,
  } = useProfile({ profileUuid: profileUuid || '', enableOffline: true });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleRefresh = async () => {
    await Promise.all([refreshProfile(), refreshShifts(), refreshNews()]);
  };

  if (!profileUuid) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Ungültige Profil-URL</Alert>
      </Container>
    );
  }

  if (isLoading && !profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          <Typography variant="h6">Profil konnte nicht geladen werden</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {error.message}
          </Typography>
          {!isOnline && (
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              Du bist offline. Stelle eine Internetverbindung her, um dein Profil zu laden.
            </Typography>
          )}
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Profil nicht gefunden</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {profile.user.first_name} {profile.user.last_name}
        </Typography>
        <IconButton onClick={handleRefresh} disabled={isLoading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Offline indicator */}
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Du bist offline. Änderungen werden synchronisiert, sobald du wieder online bist.
        </Alert>
      )}

      {/* Error display */}
      {error && profile && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Daten: {error.message}
        </Alert>
      )}

      {/* Overview card */}
      <ProfileOverview profile={profile} isOnline={isOnline} />

      {/* Tabs */}
      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="profile tabs"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab label="Buchungsdetails" />
          <Tab label={`Schichten${shifts.length > 0 ? ` (${shifts.length})` : ''}`} />
          <Tab label={`News${unreadCount > 0 ? ` (${unreadCount})` : ''}`} />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <BookingDetails profile={profile} />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <WorkShifts
            shifts={shifts}
            isOnline={isOnline}
            onAccept={acceptShift}
            onDecline={declineShift}
            onRefresh={refreshShifts}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <NewsFeed
            news={news}
            isOnline={isOnline}
            onMarkAsRead={markNewsAsRead}
            onRefresh={refreshNews}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
