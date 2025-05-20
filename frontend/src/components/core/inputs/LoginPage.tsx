import React, {useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext, TokenContext} from '../../../contexts/AuthContext';
import {Box, Button, TextField, Typography, Container, Alert} from '@mui/material';

interface LoginPageProps {
    title: string;
    endpoint: string;
    redirectPath: string;
    setIsAdmin?: (value: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
                                                 title,
                                                 endpoint,
                                                 redirectPath,
                                                 setIsAdmin
                                             }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const {setAuth} = useContext(AuthContext);
    const {setToken} = useContext(TokenContext);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({password}),
            });

            if (response.ok) {
                const data = await response.json();
                setToken(data.access_token);
                setAuth(true);

                // Set admin flag if needed
                if (setIsAdmin) {
                    setIsAdmin(true);
                }

                navigate(redirectPath);
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
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
                    <TextField
                        margin="normal"
                        autoFocus
                        required
                        fullWidth
                        name="password"
                        label="Passwort"
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
                        sx={{mt: 3, mb: 2}}
                    >
                        Startklar!
                    </Button>
                    {error && (
                        <Alert severity="error" sx={{mt: 2}}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default LoginPage;