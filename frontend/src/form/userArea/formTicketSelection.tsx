import React from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Paper, Box, alpha } from "@mui/material";
import { FormProps } from './formContainer';
import { FormContent, TicketOption } from './interface';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SignalWifiStatusbarConnectedNoInternet4Icon from '@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4';

interface TicketFormProps extends FormProps {
    formContent: FormContent;
}

function TicketForm(props: TicketFormProps) {
    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.updateBooking('ticket_id', Number((event.target as HTMLInputElement).value));
    };

    const maxNumTicketsPerDay = 120;
    let visitorsThursday = 0;
    let visitorsFriday = 0;
    let visitorsSaturday = 0;

    props.formContent.ticket_options.forEach((option: TicketOption) => {
        if (option.title.includes('Donnerstag')) {
            visitorsThursday += option.num_booked;
        }
        if (option.title.includes('Freitag')) {
            visitorsFriday += option.num_booked;
        }
        if (option.title.includes('Samstag')) {
            visitorsSaturday += option.num_booked;
        }
    });

    function dayIsSoldOut(ticketTitle: string) {
        let isSoldOut = false;

        if (ticketTitle.includes('Donnerstag')) {
            isSoldOut = isSoldOut || visitorsThursday >= maxNumTicketsPerDay;
        }
        if (ticketTitle.includes('Freitag')) {
            isSoldOut = isSoldOut || visitorsFriday >= maxNumTicketsPerDay;
        }
        if (ticketTitle.includes('Samstag')) {
            isSoldOut = isSoldOut || visitorsSaturday >= maxNumTicketsPerDay;
        }

        return isSoldOut;
    }

    return (
        <Box sx={{ width: '98%', maxWidth: 600, mx: 'auto' }}>
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
                        <span style={{ color: '#64b5f6' }}>MISSION:</span> Wähle die Tage aus, an denen du am Festival teilnehmen möchtest. Sonntag ist Abbautag.
                    </Typography>
                </Box>

                {/* Ticket selection */}
                <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <FormControl component="fieldset" error={!!props.formValidation.ticket_id} required fullWidth>
                        <RadioGroup
                            name="ticketOptions"
                            value={props.currentBooking.ticket_id}
                            onChange={handleRadioChange}
                        >
                            {props.formContent.ticket_options.map((option: TicketOption) => {
                                const isSoldOut = dayIsSoldOut(option.title);

                                return (
                                    <Paper
                                        key={option.id}
                                        elevation={0}
                                        sx={{
                                            mb: 2,
                                            backgroundColor: alpha('#020c1b', 0.7),
                                            borderRadius: '8px',
                                            border: '1px solid',
                                            borderColor: props.currentBooking.ticket_id === option.id
                                                ? '#1e88e5'
                                                : alpha('#90caf9', 0.3),
                                            position: 'relative',
                                            overflow: 'hidden',
                                            width: '100%',
                                            // Glow effect for selected
                                            boxShadow: props.currentBooking.ticket_id === option.id
                                                ? `0 0 12px ${alpha('#1e88e5', 0.3)}`
                                                : 'none',
                                        }}
                                    >
                                        {/* Status indicator LED */}
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 10,
                                            right: 10,
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: isSoldOut ? '#f44336' : '#4caf50',
                                            boxShadow: `0 0 6px ${isSoldOut ? '#f44336' : '#4caf50'}`,
                                            zIndex: 10,
                                        }} />

                                        {/* Futuristic scanner line animation for selected ticket */}
                                        {props.currentBooking.ticket_id === option.id && (
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '100%',
                                                zIndex: 1,
                                                overflow: 'hidden',
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    width: '100%',
                                                    height: '2px',
                                                    background: 'linear-gradient(to right, transparent, #64b5f6, transparent)',
                                                    top: 0,
                                                    animation: 'scanDown 2s infinite',
                                                },
                                                '@keyframes scanDown': {
                                                    '0%': { transform: 'translateY(0)' },
                                                    '100%': { transform: 'translateY(100%)' }
                                                }
                                            }} />
                                        )}

                                        <FormControlLabel
                                            sx={{
                                                p: 0,
                                                m: 0,
                                                width: '100%',
                                                height: '100%',
                                                '& .MuiFormControlLabel-label': {
                                                    width: '100%',
                                                    opacity: isSoldOut ? 0.6 : 1,
                                                }
                                            }}
                                            disabled={isSoldOut}
                                            value={option.id}
                                            control={
                                                <Radio
                                                    sx={{
                                                        position: 'absolute',
                                                        top: { xs: 12, sm: 14 },
                                                        left: { xs: 8, sm: 12 },
                                                        color: alpha('#90caf9', 0.6),
                                                        '&.Mui-checked': {
                                                            color: '#64b5f6',
                                                        },
                                                        zIndex: 2,
                                                    }}
                                                />
                                            }
                                            label={
                                                <Box sx={{
                                                    pt: 2.5,
                                                    pb: 2,
                                                    px: { xs: 1.5, sm: 2 },
                                                    pl: { xs: 5, sm: 6 },
                                                    position: 'relative',
                                                    zIndex: 1,
                                                }}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                    }}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            flexWrap: { xs: 'wrap', sm: 'nowrap' },
                                                            gap: { xs: 1, sm: 0 }
                                                        }}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                width: { xs: '100%', sm: 'auto' }
                                                            }}>
                                                                <FlightTakeoffIcon sx={{
                                                                    color: '#64b5f6',
                                                                    fontSize: '1.1rem',
                                                                    mr: 1,
																	ml:1,
                                                                    flexShrink: 0
                                                                }} />
                                                                <Typography
                                                                    variant="body1"
                                                                    sx={{
                                                                        color: alpha('#fff', 0.9),
                                                                        fontWeight: 'medium',
                                                                        fontSize: { xs: '0.95rem', sm: '1rem' }
                                                                    }}
                                                                >
                                                                    {option.title}
                                                                </Typography>
                                                            </Box>

                                                            {isSoldOut ? (
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    bgcolor: alpha('#f44336', 0.1),
                                                                    p: 0.5,
                                                                    px: 1,
                                                                    borderRadius: '4px',
                                                                    border: '1px solid',
                                                                    borderColor: alpha('#f44336', 0.3),
                                                                    flexShrink: 0,
                                                                    ml: 'auto'
                                                                }}>
                                                                    <SignalWifiStatusbarConnectedNoInternet4Icon
                                                                        sx={{
                                                                            fontSize: '0.8rem',
                                                                            mr: 0.5,
                                                                            color: '#f44336'
                                                                        }}
                                                                    />
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: '#f44336',
                                                                            fontWeight: 'medium',
                                                                            textTransform: 'uppercase',
                                                                            letterSpacing: '0.5px',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    >
                                                                        Ausgebucht
                                                                    </Typography>
                                                                </Box>
                                                            ) : (
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    bgcolor: alpha('#1e88e5', 0.1),
                                                                    p: 0.5,
                                                                    px: 1.5,
                                                                    borderRadius: '4px',
                                                                    border: '1px solid',
                                                                    borderColor: alpha('#1e88e5', 0.3),
                                                                    flexShrink: 0,
                                                                    ml: 'auto'
                                                                }}>
                                                                    <Typography
                                                                        variant="h6"
                                                                        sx={{
                                                                            color: '#64b5f6',
                                                                            fontWeight: 'bold',
                                                                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                                                        }}
                                                                    >
                                                                        {option.price}€
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            }
                                        />
                                    </Paper>
                                );
                            })}
                        </RadioGroup>
                    </FormControl>
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
                        WWWW-MISSION-CONTROL // ID-2025
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default TicketForm;