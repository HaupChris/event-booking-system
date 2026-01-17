import React, {useState, useContext} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {AuthContext, TokenContext} from '../../../contexts/AuthContext';
import {
    Box,
    Button,
    Container,
    Alert,
    InputAdornment,
    IconButton,
    FormControl,
    OutlinedInput,
    Typography
} from '@mui/material';
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useThemeMode} from '../../styles/theme';

interface LoginPageProps {
    title: string;
    endpoint: string;
    redirectPath: string;
    setIsAdmin?: (value: boolean) => void;
    showRecoveryLink?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({
                                                 endpoint,
                                                 redirectPath,
                                                 setIsAdmin,
                                                 showRecoveryLink = false
                                             }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const {setAuth} = useContext(AuthContext);
    const {setToken} = useContext(TokenContext);
    const navigate = useNavigate();
    const {mode} = useThemeMode();
    const isCircusTheme = mode === 'circus';

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
                {isCircusTheme && (
                    <Box
                        sx={{
                            width: '100%',
                            textAlign: 'center',
                            mb: 3,
                            position: 'relative',
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: '"Abril Fatface", "Playfair Display", serif',
                                fontSize: { xs: '2rem', sm: '2.5rem' },
                                color: '#D4AF37',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(212, 175, 55, 0.3)',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                '&::before': {
                                    content: '"★ "',
                                    color: '#6B46C1',
                                },
                                '&::after': {
                                    content: '" ★"',
                                    color: '#6B46C1',
                                }
                            }}
                        >
                            Zirkus Wiesenwahn
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: '"Playfair Display", serif',
                                fontSize: '1rem',
                                color: '#F5E6D3',
                                fontStyle: 'italic',
                                mt: 1,
                            }}
                        >
                            Hereinspaziert!
                        </Typography>
                    </Box>
                )}
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={isCircusTheme ? {
                        mt: 1,
                        width: '100%',
                        padding: '32px',
                        background: 'radial-gradient(circle at top center, #4a2410 0%, #2d1810 50%, #1a0a0a 100%)',
                        border: '6px double #704214',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 0 0 20px rgba(212, 175, 55, 0.1)',
                        position: 'relative',
                        '&::before': {
                            content: '"❖"',
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            fontSize: '1.5rem',
                            color: '#D4AF37',
                            opacity: 0.6,
                        },
                        '&::after': {
                            content: '"❖"',
                            position: 'absolute',
                            bottom: 10,
                            right: 10,
                            fontSize: '1.5rem',
                            color: '#D4AF37',
                            opacity: 0.6,
                            transform: 'rotate(180deg)',
                        }
                    } : { mt: 1 }}
                >
                    <FormControl sx={{width: "100%"}} variant="standard">
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
                    {showRecoveryLink && (
                        <Box sx={{textAlign: 'center', mt: 1}}>
                            <Link
                                to="/profile/recover"
                                style={{
                                    fontSize: '0.875rem',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                                Profil-Link vergessen?
                            </Link>
                        </Box>
                    )}
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
