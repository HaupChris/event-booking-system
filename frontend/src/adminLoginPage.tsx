import axios from "axios";
import {useNavigate} from "react-router-dom";
import {AuthContext, TokenContext} from "./AuthContext";
import React, {useContext, useState} from "react";
import {Box, Button, Container, TextField, Typography} from "@mui/material";

const AdminLoginPage = () => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState('');
    const {setToken} = useContext(TokenContext);
    const {isAdmin, setIsAdmin} = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        // Post the plain-text password to the server
        event.preventDefault();
        setError("");

        axios.post('/api/auth/admin', {password})
            .then(response => {
                setToken(response.data.access_token);
                setIsAdmin(true);
                navigate('/admin/dashboard');
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    return <Container component="main" maxWidth="xs">
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
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
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
                        sx={{mt: 3, mb: 2}}
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
        </Container>;
};

export default AdminLoginPage;