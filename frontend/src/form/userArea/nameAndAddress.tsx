import React, { useContext } from "react";
import { AuthContext } from "../../AuthContext";
import { TextField, Typography, Paper, Box, alpha, InputAdornment } from "@mui/material";
import { FormProps } from "./formContainer";
import PersonIcon from '@mui/icons-material/Person';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import BadgeIcon from '@mui/icons-material/Badge';

function NameAndAddressForm(props: FormProps) {
    const { auth } = useContext(AuthContext);

    return auth ? (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    p: 0,
                    borderRadius: '14px',
                    background: 'radial-gradient(circle at bottom left, #061429 0%, #071f3b 100%)',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid',
                    borderColor: alpha('#64b5f6', 0.2),
                }}
            >
                {/* Decorative top pattern */}
                <Box sx={{
                    width: '100%',
                    height: '6px',
                    background: 'linear-gradient(90deg, #1e88e5, #64b5f6, #bbdefb, #1e88e5)',
                    backgroundSize: '300% 100%',
                    animation: 'gradientMove 12s linear infinite',
                    '@keyframes gradientMove': {
                        '0%': { backgroundPosition: '0% 0%' },
                        '100%': { backgroundPosition: '300% 0%' },
                    }
                }} />

                {/* Mission Briefing */}
                <Box sx={{
                    py: 1.5,
                    px: 2,
                    backgroundColor: alpha('#000', 0.3),
                    borderLeft: '4px solid',
                    borderColor: '#1e88e5',
                    mx: { xs: 1, sm: 2 },
                    my: 2,
                    borderRadius: '0 8px 8px 0',
                }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: alpha('#fff', 0.9),
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                        }}
                    >
                        <span style={{ color: '#64b5f6' }}>MISSION:</span> Bitte gib deine Kontaktinformationen für die Festival-Registrierung ein.
                    </Typography>
                </Box>

                {/* Subheader with event date */}
                <Box sx={{
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                }}>
                    <Typography
                        variant="subtitle1"
                        align="center"
                        sx={{
                            color: alpha('#fff', 0.8),
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            px: 2,
                            py: 0.75,
                            bgcolor: alpha('#1e88e5', 0.1),
                            border: '1px solid',
                            borderColor: alpha('#1e88e5', 0.2),
                            borderRadius: '4px',
                            letterSpacing: '1px',
                        }}
                    >
                        Do, 28.08. - So, 31.08.2025
                    </Typography>
                </Box>

                {/* Form fields */}
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                        component="form"
                        sx={{
                            '& .MuiTextField-root': {
                                mb: 2.5,
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: alpha('#020c1b', 0.7),
                                    borderRadius: '8px',
                                    '& fieldset': {
                                        borderColor: alpha('#90caf9', 0.3),
                                        borderWidth: 1,
                                        transition: 'all 0.2s ease-in-out',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: alpha('#64b5f6', 0.5),
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#1e88e5',
                                        borderWidth: 2,
                                    },
                                    '&.Mui-error fieldset': {
                                        borderColor: '#f44336',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: alpha('#fff', 0.7),
                                    '&.Mui-focused': {
                                        color: '#64b5f6',
                                    },
                                    '&.Mui-error': {
                                        color: '#f44336',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    color: alpha('#fff', 0.9),
                                    caretColor: '#64b5f6',
                                },
                            },
                        }}
                    >
                        <TextField
                            error={!!props.formValidation.first_name}
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="first_name"
                            label="Vorname"
                            name="first_name"
                            value={props.currentBooking.first_name}
                            onChange={e => props.updateBooking("first_name", e.target.value)}
                            autoFocus
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon sx={{ color: '#64b5f6' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mt: 0 }}
                        />

                        <TextField
                            error={!!props.formValidation.last_name}
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="last_name"
                            label="Nachname"
                            id="last_name"
                            value={props.currentBooking.last_name}
                            onChange={e => props.updateBooking("last_name", e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <BadgeIcon sx={{ color: '#64b5f6' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mt: 0 }}
                        />

                        <TextField
                            error={!!props.formValidation.email}
                            type="email"
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="email"
                            label="E-Mail (für deine Ticketbestätigung)"
                            id="email"
                            value={props.currentBooking.email}
                            onChange={e => props.updateBooking("email", e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AlternateEmailIcon sx={{ color: '#64b5f6' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mt: 0 }}
                        />

                        <TextField
                            error={!!props.formValidation.phone}
                            type="tel"
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="phone"
                            label="Telefon"
                            id="phone"
                            value={props.currentBooking.phone}
                            onChange={e => props.updateBooking("phone", e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SmartphoneIcon sx={{ color: '#64b5f6' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mt: 0 }}
                        />
                    </Box>

                    {/* Decorative circuit pattern in background */}
                    <Box sx={{
                        position: 'absolute',
                        bottom: -40,
                        right: -40,
                        width: '200px',
                        height: '200px',
                        opacity: 0.05,
                        zIndex: 0,
                        backgroundImage: `
                            radial-gradient(circle, #64b5f6 1px, transparent 1px),
                            linear-gradient(to right, transparent 4px, #64b5f6 1px, transparent 1px),
                            linear-gradient(to bottom, transparent 4px, #64b5f6 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px, 10px 10px, 10px 10px',
                        backgroundPosition: '0 0, 10px 0, 0 10px',
                        transform: 'rotate(15deg)',
                    }} />
                </Box>

                {/* Footer with space station ID */}
                <Box sx={{
                    p: 1.5,
                    backgroundColor: '#041327',
                    borderTop: '1px solid',
                    borderColor: alpha('#64b5f6', 0.2),
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontFamily: 'monospace',
                            color: alpha('#fff', 0.7),
                            letterSpacing: '1px',
                            fontSize: '0.7rem'
                        }}
                    >
                        WWWW-CREW-REGISTRATION // ID-2025
                    </Typography>
                </Box>
            </Paper>
        </Box>
    ) : null;
}

export default NameAndAddressForm;