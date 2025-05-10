import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, TokenContext } from "../../AuthContext";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    Snackbar,
    TextField,
    Typography,
    Container,
    Paper
} from "@mui/material";

function UserLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setAuth } = useContext(AuthContext);
    const { setToken } = useContext(TokenContext);
    const navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        // Post the plain-text password to the server
        axios.post('/api/auth', { password })
            .then(response => {
                setToken(response.data.access_token);
                setAuth(true);
                navigate('/form');
            })
            .catch(error => {
                setError('Falsches Passwort');
            });
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 3, width: '100%', borderRadius: 2 }}>
                    <Typography component="h1" variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
                        Weiher Wald & Weltall-Wahn
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Passwort"
                            type="password"
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Einloggen
                        </Button>
                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}

export default UserLoginPage;