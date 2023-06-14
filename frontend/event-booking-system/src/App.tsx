import React, {useEffect, useState} from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import PasswordPage from "./form/passwordPage";
import {AuthContext, TokenContext} from "./AuthContext";
import {FormContainer} from "./form/formContainer";
import {Box, createTheme} from "@mui/material";
import backgroundImage from './img/background_desktop.jpeg';

import { ThemeOptions, ThemeProvider } from '@mui/material/styles';


export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#fef43f',
    },
    secondary: {
      main: '#e65813',
    },
    background: {
      default: '#0f3233',
      paper: '#031a2a',
    },
    divider: '#f6500c',
    text: {
      primary: '#a29c0d',
      secondary: '#817c0e',
    },
  },
  typography: {
    fontFamily: 'Permanent Marker',
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
        },
      },
    },
  },
};
const theme = createTheme(themeOptions);


const App = () => {
  const [auth, setAuth] = useState(false);
  const [token, setToken] = useState("");

  // Restore token from local storage at startup
  useEffect(() => {
    const storedToken = window.localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setAuth(true);
    }
  }, []);

  // Save token to local storage whenever it changes
  useEffect(() => {
    if (token) {
      window.localStorage.setItem("token", token);
    }
  }, [token]);

  return <ThemeProvider theme={theme}>
	<Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Your other components */}

		<AuthContext.Provider value={{ auth, setAuth }}>
			<TokenContext.Provider value={{ token, setToken }}>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={auth ? <Navigate replace to="/form"/> : <PasswordPage/>}/>
						<Route path="/form" element={auth ? <FormContainer/> : <Navigate replace to="/"/>}/>
					</Routes>
				</BrowserRouter>
			</TokenContext.Provider>
		</AuthContext.Provider>
	  </Box>
  </ThemeProvider>
};

export default App;
