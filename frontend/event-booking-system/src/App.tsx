import React, {useEffect, useState} from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {AuthContext, TokenContext} from "./AuthContext";
import {FormContainer} from "./form/userArea/formContainer";
import {Box, createTheme} from "@mui/material";
import backgroundImageDesktop from './img/background_desktop_water.png';
import backgroundImageMobile from './img/background_mobile_water.png';


import {ThemeOptions, ThemeProvider} from '@mui/material/styles';
import AdminLogin from './form/userArea/adminLogin';

import './css/global.css';
import AdminDashboard from "./form/adminArea/AdminDashboard";
import UserLoginPage from "./userLoginPage";


export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#00AEFF', // Ocean blue
    },
    secondary: {
      // main: '#F7D100', // A vibrant yellow
        main: '#2A00F7'
    },
    background: {
      default: 'rgba(255, 255, 255, 0.2)', // Slightly more transparent
      paper: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(0, 174, 255, 0.8)', // Brighter ocean blue
    text: {
      primary: '#2A00F7', // A darker blue for better contrast
      secondary: 'rgba(0, 0, 0, 0.8)',
    },
  },
  typography: {
    // Keep your friendly font family
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
          backgroundColor: 'rgba(255,255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
};


const theme = createTheme(themeOptions);
const documentHeight = () => {
    const doc = document.documentElement
    doc.style.setProperty('--doc-height', `${window.innerHeight - 8}px`)
}

const App = () => {
    const [auth, setAuth] = useState(false);
    const [role, setRole] = useState("NormalGuest");
    const [isAdmin, setIsAdmin] = useState(false);
    const [token, setToken] = useState("");
    const [adminPermissions, setAdminPermissions] = useState(["readOnly"])

    // Restore token from local storage at startup
    useEffect(() => {
        const storedToken = window.localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
            setAuth(true);
            // You might want to verify the token here and set isAdmin if applicable
        }

        window.addEventListener('resize', documentHeight);
        documentHeight()
    }, []);

    // Save token to local storage whenever it changes
    useEffect(() => {
        if (token) {
            window.localStorage.setItem("token", token);
        } else {
            window.localStorage.removeItem("token");
        }
    }, [token]);

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundImage: `url(${window.innerWidth < 600 ? backgroundImageMobile : backgroundImageDesktop})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <AuthContext.Provider value={{auth, setAuth, role, setRole, isAdmin, setIsAdmin, adminPermissions, setAdminPermissions}}>
                    <TokenContext.Provider value={{ token, setToken }}>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/" element={auth ? <Navigate replace to="/form"/> : <UserLoginPage/>}/>
                                <Route path="/form" element={auth ? <FormContainer/> : <Navigate replace to="/"/>}/>
                                <Route path="/admin"
                                       element={isAdmin ? <Navigate replace to="/admin/dashboard"/> : <AdminLogin/>}/>
                                <Route path="/admin/dashboard"
                                       element={isAdmin ? <AdminDashboard/> : <Navigate replace to="/admin"/>}/>
                            </Routes>
                        </BrowserRouter>
                    </TokenContext.Provider>
                </AuthContext.Provider>
            </Box>
        </ThemeProvider>
    );
};

export default App;
