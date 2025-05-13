import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthContext, TokenContext } from "./contexts/AuthContext";
import { Box } from "@mui/material";
import { UserRegistrationFormContainer } from "./form/userArea/UserRegistrationFormContainer";
import Dashboard from "./form/adminArea/Dashboard";
import AdminLoginPage from "./adminLoginPage";
import ArtistLoginPage from "./artistLoginPage";
import { ArtistRegistrationFormContainer } from './form/artistArea/ArtistRegistrationFormContainer';
import ThemeProvider from './contexts/ThemeProvider';
import SpaceBackground from './components/core/layouts/SpaceBackground';
import UserLoginPage from "./form/userArea/UserLoginPage";

const App = () => {
  const [auth, setAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState("");

  React.useEffect(() => {
    const storedToken = window.localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setAuth(true);
    }
  }, []);

  React.useEffect(() => {
    if (token) {
      window.localStorage.setItem("token", token);
    } else {
      window.localStorage.removeItem("token");
    }
  }, [token]);

  return (
    <ThemeProvider>
      <Box
        sx={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'auto'
        }}
      >
        {/* Space background behind everything */}
        <SpaceBackground />

        {/* Theme toggle button */}
        {/*<ThemeToggle />*/}

        <AuthContext.Provider value={{ auth, setAuth, isAdmin, setIsAdmin }}>
          <TokenContext.Provider value={{ token, setToken }}>
            <BrowserRouter>
              <Routes>
                {/* Regular user routes */}
                <Route path="/" element={auth ? <Navigate replace to="/form" /> : <UserLoginPage />} />
                <Route path="/form" element={auth ? <UserRegistrationFormContainer /> : <Navigate replace to="/" />} />

                {/* Artist routes */}
                <Route path="/artist" element={auth ? <Navigate replace to="/artist-form" /> : <ArtistLoginPage />} />
                <Route path="/artist-form" element={auth ? <ArtistRegistrationFormContainer/> : <Navigate replace to="/artist" />} />

                {/* Admin routes */}
                <Route path="/admin" element={isAdmin ? <Navigate replace to="/admin/dashboard" /> : <AdminLoginPage />} />
                <Route path="/admin/dashboard" element={isAdmin ? <Dashboard /> : <Navigate replace to="/admin" />} />
              </Routes>
            </BrowserRouter>
          </TokenContext.Provider>
        </AuthContext.Provider>
      </Box>
    </ThemeProvider>
  );
};

export default App;