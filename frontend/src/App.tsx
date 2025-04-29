import React, {useEffect, useState} from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {AuthContext, TokenContext} from "./AuthContext";
import {FormContainer} from "./form/userArea/formContainer";
import {Box, createTheme} from "@mui/material";
import {ThemeProvider} from '@mui/material/styles';
import AdminLoginPage from './adminLoginPage';

import './css/global.css';
import Dashboard from "./form/adminArea/Dashboard";
import UserLoginPage from "./userLoginPage";
import SpaceBackground from "./form/components/spaceBackground";


import {ArtistFormContainer} from './form/artistArea/artistFormContainer';
import ArtistLoginPage from "./artistLoginPage";



export const spaceTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#C0C0C0', // Silver for that metallic effect
        },
        secondary: {
            main: '#ffffff', // White or bright accent
        },
        background: {
            default: '#0d0d0d', // Very dark background
            paper: '#1a1a1a',   // Slightly lighter for surfaces/cards
        },
        text: {
            primary: '#ffffff',
            secondary: '#e0e0e0',
        },
    },
    typography: {
        // Switch to a true 7-segment display font (assuming it’s defined via @font-face)
        fontFamily: 'DSEG7Classic, monospace',
    },
    components: {
        // Example: style overrides for MUI <Button />
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 2,                // Slightly sharper corners
                    textTransform: 'none',          // Avoid all caps
                    padding: '8px 16px',
                    border: '1px solid #C0C0C0',    // Silver border
                    // A subtle metallic style using gradient or shadow
                    background: 'linear-gradient(145deg, #222222, #1a1a1a)',
                    boxShadow: 'inset 1px 1px 2px #111, inset -1px -1px 2px #333',
                    color: '#C0C0C0',
                    '&:hover': {
                        boxShadow: '0 0 6px #C0C0C0', // Glow effect on hover
                        background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
                    },
                },
            },
        },
        // Example: style overrides for MUI <TextField />
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
                    boxShadow: 'inset 1px 1px 2px #111, inset -1px -1px 2px #333',
                    '& fieldset': {
                        borderColor: '#C0C0C0',
                    },
                    '&:hover fieldset': {
                        borderColor: '#ffffff',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#C0C0C0',
                        boxShadow: '0 0 6px #C0C0C0', // Glow effect
                    },
                },
                input: {
                    color: '#C0C0C0',
                    fontFamily: 'DSEG7Classic, monospace',
                },
            },
        },
        // Example: style overrides for <Select> (dropdown)
        MuiSelect: {
            styleOverrides: {
                outlined: {
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
                    boxShadow: 'inset 1px 1px 2px #111, inset -1px -1px 2px #333',
                    '&:focus': {
                        background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
                    },
                },
                icon: {
                    color: '#C0C0C0',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    // fontFamily: 'Kavoon',
                    // backgroundColor: 'rgba(255,255,255,0.1)', // Slightly transparent for a spacey look
                    backgroundColor: "transparent",
                    // backgroundImage: "linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0))"
                    // backdropFilter: 'blur(10px)',
                },
            },
        },
    },

});


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
        <ThemeProvider theme={spaceTheme}>
            {/* Our new starfield background behind everything */}
            <SpaceBackground/>

            {/* Content container (on top) */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100vw',
                    height: '100vh',
                    overflow: 'auto'
                }}
            >
                <AuthContext.Provider value={{auth, setAuth, isAdmin, setIsAdmin}}>
                    <TokenContext.Provider value={{token, setToken}}>
                        <BrowserRouter>
                            <Routes>
                                {/* Regular user routes */}
                                <Route path="/" element={auth ? <Navigate replace to="/form"/> : <UserLoginPage/>}/>
                                <Route path="/form" element={auth ? <FormContainer/> : <Navigate replace to="/"/>}/>

                                {/* Artist routes */}
                                <Route path="/artist"
                                       element={auth ? <Navigate replace to="/artist-form"/> : <ArtistLoginPage/>}/>
                                <Route path="/artist-form"
                                       element={auth ? <ArtistFormContainer/> : <Navigate replace to="/artist"/>}/>

                                {/* Admin routes */}
                                <Route path="/admin"
                                       element={isAdmin ? <Navigate replace to="/admin/dashboard"/> : <AdminLoginPage/>}/>
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