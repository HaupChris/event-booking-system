import React, {useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext, TokenContext} from '../../../contexts/AuthContext';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Alert,
    InputAdornment,
    IconButton,
    FormControl, InputLabel, Input, OutlinedInput
} from '@mui/material';
import {Visibility, VisibilityOff} from "@mui/icons-material";

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
    const [showPassword, setShowPassword] = useState(false);
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

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
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
                    <FormControl sx={{width: "100%"}} variant="standard">
                        {/*<InputLabel htmlFor="standard-adornment-password">Passwort</InputLabel>*/}
                        <OutlinedInput
                            id="standard-adornment-password"
                            placeholder={"Passwort"}
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            autoFocus
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                    >
                                        {showPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </FormControl>
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
    )
        ;
};

export default LoginPage;