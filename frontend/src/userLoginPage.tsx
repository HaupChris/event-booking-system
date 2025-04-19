import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, TokenContext } from './AuthContext';
import { Box, Button, TextField, Typography, Container } from '@mui/material';

function UserLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setAuth } = useContext(AuthContext);
    const { setToken } = useContext(TokenContext);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({password}),
            });

            if (response.ok) {
                const data = await response.json();
                setToken(data.access_token);
                console.log("Auth successfull. Token: ", data.access_token);
                setAuth(true);
                navigate('/form');
            } else {
                setError('Falsches Passwort');
            }
        } catch (error) {
            setError('Ein Fehler ist aufgetreten, bitte versuche es erneut.');
        }
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
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                    {error && (
                        <Typography color="error" align="center">
                            {error}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Container>
    );
}

export default UserLoginPage;