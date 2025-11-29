/**
 * Profile Page - Main Entry Point
 * ================================
 * User profile with drawer navigation and news feed as default view
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Newspaper as NewspaperIcon,
  AccountBox as AccountBoxIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  DirectionsCar as DirectionsCarIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useProfile } from '../hooks/useProfile';
import OfflineIndicator from '../components/core/pwa/OfflineIndicator';

// Import page components
import NewsFeed from '../components/profile/NewsFeed';
import ProfileOverview from '../components/profile/ProfileOverview';
import BookingDetails from '../components/profile/BookingDetails';
import WorkShifts from '../components/profile/WorkShifts';
import RideSharing from '../components/profile/RideSharing';
import FAQs from '../components/profile/FAQs';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { id: 'news', label: 'Neuigkeiten', icon: <NewspaperIcon /> },
  { id: 'profile', label: 'Mein Profil', icon: <AccountBoxIcon /> },
  { id: 'booking', label: 'Buchungsdetails', icon: <AssignmentIcon /> },
  { id: 'shifts', label: 'Schichten', icon: <WorkIcon /> },
  { id: 'rideshare', label: 'Mitfahrbörse', icon: <DirectionsCarIcon /> },
  { id: 'faqs', label: 'FAQs', icon: <HelpIcon /> },
];

const ProfilePage: React.FC = () => {
  const { profileUuid } = useParams<{ profileUuid: string }>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState('news'); // Default to news feed

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

  const handleMenuClick = (viewId: string) => {
    setActiveView(viewId);
    setDrawerOpen(false);
  };

  const getPageTitle = () => {
    const item = menuItems.find((m) => m.id === activeView);
    return item ? item.label : 'Wiesenwahn Festival';
  };

  const renderView = () => {
    // Show loading if profile is still loading for profile/booking views
    if (!profile && (activeView === 'profile' || activeView === 'booking')) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    switch (activeView) {
      case 'news':
        return (
          <NewsFeed
            news={news}
            isOnline={isOnline}
            onMarkAsRead={markNewsAsRead}
            onRefresh={refreshNews}
          />
        );
      case 'profile':
        return profile ? <ProfileOverview profile={profile} isOnline={isOnline} /> : null;
      case 'booking':
        return profile ? <BookingDetails profile={profile} /> : null;
      case 'shifts':
        return (
          <WorkShifts
            shifts={shifts}
            isOnline={isOnline}
            onAccept={acceptShift}
            onDecline={declineShift}
            onRefresh={refreshShifts}
          />
        );
      case 'rideshare':
        return <RideSharing profileUuid={profileUuid || ''} />;
      case 'faqs':
        return <FAQs />;
      default:
        return (
          <NewsFeed
            news={news}
            isOnline={isOnline}
            onMarkAsRead={markNewsAsRead}
            onRefresh={refreshNews}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Fehler beim Laden des Profils. Bitte überprüfe den Link oder versuche es später erneut.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* App Bar */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          {unreadCount > 0 && activeView !== 'news' && (
            <Typography
              variant="caption"
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 'bold',
              }}
            >
              {unreadCount} neue
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer Navigation */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, mb: 2, fontWeight: 'bold' }}>
            Wiesenwahn Festival
          </Typography>
          {profile && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', mb: 2 }}>
              {profile.user.first_name} {profile.user.last_name}
            </Typography>
          )}
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={activeView === item.id}
                onClick={() => handleMenuClick(item.id)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
                {item.id === 'news' && unreadCount > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: 'error.main',
                      color: 'white',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: '0.7rem',
                    }}
                  >
                    {unreadCount}
                  </Typography>
                )}
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '64px', // AppBar height
          overflowY: 'auto',
          backgroundColor: 'background.default',
        }}
      >
        {renderView()}
      </Box>
    </Box>
  );
};

export default ProfilePage;
