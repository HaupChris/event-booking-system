import React, {useEffect, useState} from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {AuthContext, TokenContext} from "./AuthContext";
import {FormContainer} from "./form/userArea/formContainer";
import {Box, createTheme} from "@mui/material";
// import backgroundImageDesktop from './img/background_desktop_water.png';
// import backgroundImageMobile from './img/background_mobile_water.png';


import {ThemeProvider} from '@mui/material/styles';
import AdminLogin from './form/userArea/adminLogin';

import './css/global.css';
import Dashboard from "./form/adminArea/Dashboard";
import UserLoginPage from "./userLoginPage";
import SpaceBackground from "./form/components/spaceBackground";


import { ThemeOptions } from '@mui/material/styles';

export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      // A cosmic purple
      main: '#C679FF',
    },
    secondary: {
      // A complementary accent (gold, pink, or any star-like color)
      main: '#FFD54F',
    },
    background: {
      // Fully black background
      default: '#000000',
      // Slightly lighter/darker gray for “paper” elements
      paper: '#1A1A1A',
    },
    divider: 'rgba(198, 121, 255, 0.3)', // Purple-tinted divider
    text: {
      // White primary text for good contrast on dark background
      primary: '#FFFFFF',
      // Softer secondary text
      secondary: '#AAAAAA',
    },
  },
  typography: {
    // Keep the festival’s friendly font family
    fontFamily: [
      'Kavoon',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    body1: {
      fontFamily: 'Kavoon',
    },
    h1: {
      fontFamily: 'Kavoon',
    },
    button: {
      fontFamily: 'Kavoon',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          fontFamily: 'Kavoon',
          backgroundColor: 'rgba(255,255,255,0.0)', // Slightly transparent for a spacey look
          // backdropFilter: 'blur(10px)',
        },
      },
    },
  },
};


const documentHeight = () => {
    const doc = document.documentElement
    doc.style.setProperty('--doc-height', `${window.innerHeight - 8}px`)
}

const theme = createTheme(themeOptions);

const App = () => {
    const [auth, setAuth] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [token, setToken] = useState("");

    useEffect(() => {
        const storedToken = window.localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
            setAuth(true);
        }
    }, []);

    useEffect(() => {
        if (token) {
            window.localStorage.setItem("token", token);
        } else {
            window.localStorage.removeItem("token");
        }
    }, [token]);

    return (
      <ThemeProvider theme={theme}>
        {/* Our new starfield background behind everything */}
        <SpaceBackground />

        {/* Content container (on top) */}
        <Box
          sx={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            overflow: 'auto'
          }}
        >
            <AuthContext.Provider value={{ auth, setAuth, isAdmin, setIsAdmin }}>
                <TokenContext.Provider value={{ token, setToken }}>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={auth ? <Navigate replace to="/form"/> : <UserLoginPage/>}/>
                            <Route path="/form" element={auth ? <FormContainer/> : <Navigate replace to="/"/>}/>
                            <Route path="/admin"
                                  element={isAdmin ? <Navigate replace to="/admin/dashboard"/> : <AdminLogin/>}/>
                            <Route path="/admin/dashboard"
                                  element={isAdmin ? <Dashboard/> : <Navigate replace to="/admin"/>}/>
                        </Routes>
                    </BrowserRouter>
                </TokenContext.Provider>
            </AuthContext.Provider>
        </Box>
      </ThemeProvider>
    );
};

export default App;