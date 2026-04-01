import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthContext, TokenContext } from './contexts/AuthContext';
import { Box } from '@mui/material';
import { UserRegistrationFormContainer } from './form/userArea/UserRegistrationFormContainer';
import Dashboard from './form/adminArea/Dashboard';
import { ArtistRegistrationFormContainer } from './form/artistArea/ArtistRegistrationFormContainer';
import ThemeProvider from './contexts/ThemeProvider';
import SpaceBackground from './components/core/layouts/SpaceBackground';
import CircusBackground from './components/core/layouts/CircusBackground';
import { useThemeMode } from './components/styles/theme';
import LoginPage from './components/core/inputs/LoginPage';
import PWAInstallPrompt from './components/core/pwa/PWAInstallPrompt';
import PWAUpdatePrompt from './components/core/pwa/PWAUpdatePrompt';
import OfflineIndicator from './components/core/pwa/OfflineIndicator';
import SyncQueueManager from './components/core/pwa/SyncQueueManager';
import ProfilePage from './pages/ProfilePage';
import ProfileRecovery from './components/profile/ProfileRecovery';

// Background wrapper component that uses theme context
const BackgroundWrapper: React.FC = () => {
  const { mode } = useThemeMode();

  if (mode === 'circus') {
    return <CircusBackground confettiCount={50} balloonCount={6} sparkleCount={40} />;
  }

  return <SpaceBackground />;
};

interface AppRoutesProps {
  auth: boolean;
  isAdmin: boolean;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ auth, isAdmin, setIsAdmin }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'auto',
        backgroundColor: isAdminRoute ? '#f8fafc' : 'transparent',
      }}
    >
      {!isAdminRoute && <BackgroundWrapper />}

      {/* PWA Components */}
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      <OfflineIndicator />
      <SyncQueueManager />

      {/* Theme toggle button */}
      {/*<ThemeToggle />*/}

      <Routes>
        {/* Regular user routes */}
        <Route
          path="/"
          element={
            auth ? (
              <Navigate replace to="/form" />
            ) : (
              <LoginPage
                title="User Login"
                endpoint="/api/auth"
                redirectPath="/form"
                showRecoveryLink={true}
              />
            )
          }
        />
        <Route
          path="/form"
          element={auth ? <UserRegistrationFormContainer /> : <Navigate replace to="/" />}
        />

        {/* Artist routes */}
        <Route
          path="/artist"
          element={
            auth ? (
              <Navigate replace to="/artist-form" />
            ) : (
              <LoginPage
                title="Künstler Login"
                endpoint="/api/auth/artist"
                redirectPath="/artist-form"
                showRecoveryLink={true}
              />
            )
          }
        />
        <Route
          path="/artist-form"
          element={auth ? <ArtistRegistrationFormContainer /> : <Navigate replace to="/artist" />}
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <Navigate replace to="/admin/dashboard" />
            ) : (
              <LoginPage
                title="Admin Login"
                endpoint="/api/auth/admin"
                redirectPath="/admin/dashboard"
                setIsAdmin={setIsAdmin}
              />
            )
          }
        />
        <Route
          path="/admin/dashboard"
          element={isAdmin ? <Dashboard /> : <Navigate replace to="/admin" />}
        />

        {/* Profile routes (public - no auth required, UUID is the auth) */}
        <Route path="/profile/:profileUuid" element={<ProfilePage />} />
        <Route path="/profile/recover" element={<ProfileRecovery />} />
      </Routes>
    </Box>
  );
};

const App = () => {
  const [auth, setAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState('');

  React.useEffect(() => {
    const storedToken = window.localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setAuth(true);
    }
  }, []);

  React.useEffect(() => {
    if (token) {
      window.localStorage.setItem('token', token);
    } else {
      window.localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <ThemeProvider>
      <AuthContext.Provider value={{ auth, setAuth, isAdmin, setIsAdmin }}>
        <TokenContext.Provider value={{ token, setToken }}>
          <BrowserRouter>
            <AppRoutes auth={auth} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
          </BrowserRouter>
        </TokenContext.Provider>
      </AuthContext.Provider>
    </ThemeProvider>
  );
};

export default App;
