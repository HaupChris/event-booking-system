import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress, Container } from '@mui/material';
import {
  Newspaper as NewspaperIcon,
  AccountBox as AccountBoxIcon,
  Work as WorkIcon,
  DirectionsCar as DirectionsCarIcon,
  Help as HelpIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useProfile } from '../hooks/useProfile';
import OfflineIndicator from '../components/core/pwa/OfflineIndicator';
import { useThemeMode } from '../components/styles/theme';
import { useBrandingPack } from '../branding/useBrandingPack';
import ThemedFormLayout from '../components/core/layouts/ThemedFormLayout';
import ProfileTopNavigation, {
  type ProfileNavMenuItem,
} from '../components/profile/ProfileTopNavigation';
import NewsFeed from '../components/profile/NewsFeed';
import ProfileOverview from '../components/profile/ProfileOverview';
import WorkShifts from '../components/profile/WorkShifts';
import RideSharing from '../components/profile/RideSharing';
import FAQs from '../components/profile/FAQs';
import { getFrontendSettings } from '../services/frontendSettingsService';
import MissionHeading from '../components/core/display/MissionHeading';
import { withErrorCode } from '../utils/errorReporting';

const RideShareNotice: React.FC = () => (
  <Box sx={{ pb: 1 }}>
    <MissionHeading
      title="Mitfahrboerse"
      subtitle="Noch kurz Geduld bis zum Start"
      icon={<AccessTimeIcon />}
    />
    <Alert severity="info" sx={{ mt: 1.5 }}>
      Die Mitfahrboerse wird zeitnah zum Festival aktiviert. Danach kannst du direkt Angebote und
      Gesuche einstellen.
    </Alert>
  </Box>
);

const baseMenuItems: ProfileNavMenuItem[] = [
  { id: 'news', label: 'Neuigkeiten', icon: <NewspaperIcon /> },
  { id: 'profile', label: 'Mein Profil', icon: <AccountBoxIcon /> },
  { id: 'shifts', label: 'Schichten', icon: <WorkIcon /> },
  {
    id: 'rideshare',
    label: 'Mitfahrboerse',
    icon: <DirectionsCarIcon />,
    children: [
      { id: 'rideshare_create', label: 'Gesuch / Angebot erstellen' },
      { id: 'rideshare_my', label: 'Meine Eintraege' },
      { id: 'rideshare_overview', label: 'Uebersicht' },
    ],
  },
  { id: 'faqs', label: 'FAQs', icon: <HelpIcon /> },
];

const missionBriefings: Record<string, string> = {
  news: 'Neueste Nachrichten fuer deine Festival-Reise.',
  profile: 'Alle Buchungsdaten, Kontakte und Zahlungsinfos an einem Ort.',
  shifts: 'Schichtangebote bestaetigen, ablehnen oder neue Hinweise lesen.',
  rideshare_create: 'Stelle ein Fahrtangebot oder Gesuch fuer die Anreise ein.',
  rideshare_my: 'Verwalte deine Eintraege und bestaetige eingehende Reaktionen.',
  rideshare_overview: 'Sieh alle aktiven Angebote und Gesuche der Mitfahrboerse.',
  rideshare_notice: 'Die Mitfahrboerse wird kurz vor dem Festival freigeschaltet.',
  faqs: 'Antworten auf die wichtigsten Fragen zum Festival.',
};

const ProfilePage: React.FC = () => {
  const { profileUuid } = useParams<{ profileUuid: string }>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState('news');
  const [isRideShareEnabled, setIsRideShareEnabled] = useState(true);
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';
  const brandingPack = useBrandingPack();

  const {
    profile,
    shifts,
    shiftMessages,
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

  const isArtistProfile = Boolean(profile?.user?.is_artist);
  const previousActiveViewRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFrontendSettings = async () => {
      try {
        const settings = await getFrontendSettings();
        if (!isMounted) {
          return;
        }
        setIsRideShareEnabled(settings.rideshare_enabled ?? true);
      } catch {
        if (isMounted) {
          setIsRideShareEnabled(true);
        }
      }
    };

    void fetchFrontendSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const menuItems = useMemo(() => {
    const mappedItems = baseMenuItems.map((item) => {
      if (item.id !== 'rideshare') {
        return item;
      }

      if (isRideShareEnabled) {
        return item;
      }

      return {
        ...item,
        children: [{ id: 'rideshare_notice', label: 'Info' }],
      };
    });

    if (isArtistProfile) {
      return mappedItems.filter((item) => item.id !== 'shifts');
    }

    return mappedItems;
  }, [isArtistProfile, isRideShareEnabled]);

  useEffect(() => {
    const isRideShareView = activeView.startsWith('rideshare_');
    if (!isRideShareView) {
      return;
    }

    if (!isRideShareEnabled && activeView !== 'rideshare_notice') {
      setActiveView('rideshare_notice');
      return;
    }

    if (isRideShareEnabled && activeView === 'rideshare_notice') {
      setActiveView('rideshare_overview');
    }
  }, [activeView, isRideShareEnabled]);

  useEffect(() => {
    if (!isOnline) {
      previousActiveViewRef.current = activeView;
      return;
    }

    const hasViewChanged = previousActiveViewRef.current !== activeView;
    previousActiveViewRef.current = activeView;

    if (!hasViewChanged) {
      return;
    }

    if (activeView === 'news') {
      refreshNews().then();
      return;
    }

    if (activeView === 'profile') {
      refreshProfile().then();
      return;
    }

    if (activeView === 'shifts') {
      if (isArtistProfile) {
        refreshNews().then();
      } else {
        refreshShifts().then();
      }
    }
  }, [activeView, isArtistProfile, isOnline, refreshNews, refreshProfile, refreshShifts]);

  const pageTitle = useMemo(() => {
    for (const item of menuItems) {
      if (item.id === activeView) {
        return item.label;
      }
      const child = item.children?.find((subItem) => subItem.id === activeView);
      if (child) {
        return child.label;
      }
    }
    return 'Wiesenwahn Festival';
  }, [activeView, menuItems]);

  const profileName = profile?.user
    ? `${profile.user.first_name} ${profile.user.last_name}`
    : undefined;

  const newsView = <NewsFeed news={news} isOnline={isOnline} onMarkAsRead={markNewsAsRead} />;

  const profileView = profile ? (
    <ProfileOverview profile={profile} />
  ) : (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  );

  const shiftsView = isArtistProfile ? (
    newsView
  ) : (
    <WorkShifts
      shifts={shifts}
      shiftMessages={shiftMessages}
      isOnline={isOnline}
      onAccept={acceptShift}
      onDecline={declineShift}
      onRefresh={refreshShifts}
    />
  );

  const viewMap: Record<string, React.ReactNode> = {
    news: newsView,
    profile: profileView,
    shifts: shiftsView,
    rideshare_create: <RideSharing viewMode="create" />,
    rideshare_my: <RideSharing viewMode="my" />,
    rideshare_overview: <RideSharing viewMode="overview" />,
    rideshare_notice: <RideShareNotice />,
    faqs: <FAQs />,
  };

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          {withErrorCode(
            'Fehler beim Laden des Profils. Bitte ueberpruefe den Link oder versuche es spaeter erneut.',
            error
          )}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <ProfileTopNavigation
        drawerOpen={drawerOpen}
        activeView={activeView}
        pageTitle={pageTitle}
        unreadCount={unreadCount}
        menuItems={menuItems}
        profileName={profileName}
        isCircusMode={isCircusMode}
        brandingPack={brandingPack}
        onOpenDrawer={() => setDrawerOpen(true)}
        onCloseDrawer={() => setDrawerOpen(false)}
        onSelectView={(viewId) => {
          setActiveView(viewId);
          setDrawerOpen(false);
        }}
      />

      <OfflineIndicator />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '64px',
          overflowY: 'auto',
          backgroundColor: 'background.default',
          backgroundImage: isCircusMode
            ? 'radial-gradient(circle at 15% 20%, rgba(216,184,122,0.12), transparent 45%), radial-gradient(circle at 85% 10%, rgba(153,87,42,0.18), transparent 42%)'
            : 'none',
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 }, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <ThemedFormLayout
              title={pageTitle}
              missionBriefing={
                missionBriefings[activeView] ?? 'Willkommen im Festival-Profilbereich.'
              }
              footerId={isCircusMode ? 'PROFIL-ZENTRALE' : 'PROFILE-CENTER'}
              maxWidth={1160}
            >
              {viewMap[activeView] ?? newsView}
            </ThemedFormLayout>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ProfilePage;
