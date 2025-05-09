import React, {useEffect, useState} from "react";
import {
    Button,
    Box,
    Typography,
    TextField,
    Snackbar, Alert, CircularProgress,
    Modal, Paper, Divider, IconButton,
    alpha
} from '@mui/material';
import {Booking, FormContent} from "./interface";
import {
    Check,
    ErrorOutline,
    ContentCopy,
    OpenInNew,
    SignalCellularNodata,
    Celebration,
    EuroSymbol,
    CheckCircleOutline,
    Refresh,
    RocketLaunch
} from "@mui/icons-material";

import '../../css/formConfirmation.css';
import {BookingState} from "./formContainer";
import AnimatedRocket from "../components/animatedRocket";

interface FinalBookingProps {
    currentBooking: Booking;
    submitBooking: () => void;
    formContent: FormContent;
    bookingState: BookingState;
}

function findItemById<T extends { id: number }>(array: T[], id: number): T | undefined {
    return array.find(item => item.id === id);
}

function FormConfirmation(props: FinalBookingProps) {
    const ticket = findItemById(props.formContent.ticket_options, props.currentBooking.ticket_id);
    const beverage_or_undefined = findItemById(props.formContent.beverage_options, props.currentBooking.beverage_id);
    const beverage = beverage_or_undefined ? beverage_or_undefined : {title: "Keine Bierflat"};
    const food_or_undefined = findItemById(props.formContent.food_options, props.currentBooking.food_id);
    const food = food_or_undefined ? food_or_undefined : {title: "Kein Essen"};

    const betreff = `WWWW: ${props.currentBooking.last_name}, ${props.currentBooking.first_name} - ${ticket?.title} - ${beverage?.title} - ${food?.title} - ${props.currentBooking.total_price}€`;

    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [redirecting, setRedirecting] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    const [showRocket, setShowRocket] = useState(true);

    useEffect(() => {
        function updateOnlineStatus() {
            setIsOnline(navigator.onLine);
        }

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        }
    }, []);

    useEffect(() => {
        if (redirecting) {
            const timer = setInterval(() => {
                setCountdown((prevCountdown) => {
                    if (prevCountdown === 1) {
                        clearInterval(timer);
                        window.open("https://www.paypal.me/StephanHau", "_blank");
                    }
                    return prevCountdown - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [redirecting]);

    const handleCopy = () => {
        navigator.clipboard.writeText(betreff).then();
        setCopied(true);
    }

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setCopied(false);
    };

    const handleSnackbarClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const submitBooking = () => {
        setSubmissionAttempted(true);
        if (navigator.onLine) {
            props.submitBooking();
        } else {
            setOpen(true);
        }
    }

    const handlePaypalClick = () => {
        handleCopy();
        setRedirecting(true);
    }

    // Function to properly retry submission instead of just reloading
    const handleRetry = () => {
        // Reset submission state
        setSubmissionAttempted(false);

        // Attempt to submit again
        setTimeout(() => {
            submitBooking();
        }, 500);
    }

    // Success State
    if (props.bookingState.isSubmitted && props.bookingState.isSuccessful) {
        return (
            <Box sx={{width: '98%', maxWidth: 600, mx: 'auto'}}>
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
                            '0%': {backgroundPosition: '0% 0%'},
                            '100%': {backgroundPosition: '300% 0%'},
                        }
                    }}/>

                    {/* Mission Briefing */}
                    <Box sx={{
                        py: 1.5,
                        px: 2,
                        backgroundColor: alpha('#000', 0.3),
                        borderLeft: '4px solid',
                        borderColor: '#1e88e5',
                        mx: {xs: 1, sm: 2},
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
                            <span style={{color: '#64b5f6'}}>MISSION:</span> Deine Registrierung für das Weiher Wald &
                            Weltall-Wahn war erfolgreich! Bitte bestätige jetzt deine Teilnahme durch Zahlung.
                        </Typography>
                    </Box>

                    <Box sx={{p: {xs: 2, sm: 3}}}>
                        {/* Success Header */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            mb: 3,
                        }}>
                            <Paper
                                elevation={2}
                                sx={{
                                    width: '100%',
                                    py: 2,
                                    px: 1,
                                    mb: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    bgcolor: alpha('#4caf50', 0.1),
                                    borderRadius: '10px',
                                    border: '1px solid',
                                    borderColor: alpha('#4caf50', 0.3),
                                }}
                            >
                                <CheckCircleOutline sx={{color: '#4caf50', fontSize: 60, mb: 1}}/>
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    align="center"
                                    sx={{
                                        color: alpha('#fff', 0.9),
                                    }}
                                >
                                    Deine Buchung war erfolgreich!
                                </Typography>
                            </Paper>

                            {showRocket && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        mb: 3,
                                        position: 'relative',
                                    }}
                                >
                                    <AnimatedRocket onAnimationComplete={() => setShowRocket(false)}/>
                                </Box>
                            )}

                            <Typography
                                variant="body1"
                                paragraph
                                sx={{
                                    mb: 3,
                                    fontSize: '1.1rem',
                                    color: alpha('#fff', 0.8),
                                    textAlign: 'center',
                                }}
                            >
                                Du erhältst in Kürze eine Bestätigungsmail mit allen Details zu deiner Buchung. Bitte
                                prüfe auch deinen Spam-Ordner, falls die Mail nicht sofort ankommt.
                            </Typography>
                        </Box>

                        {/* Payment Box */}
                        <Paper
                            elevation={2}
                            sx={{
                                mt: 4,
                                p: 0,
                                backgroundColor: alpha('#020c1b', 0.7),
                                borderRadius: '10px',
                                border: '1px solid',
                                borderColor: alpha('#90caf9', 0.3),
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Circuit background decoration */}
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '200px',
                                height: '200px',
                                opacity: 0.03,
                                zIndex: 0,
                                backgroundImage: `
                                    radial-gradient(circle, #64b5f6 1px, transparent 1px),
                                    linear-gradient(to right, transparent 4px, #64b5f6 1px, transparent 1px),
                                    linear-gradient(to bottom, transparent 4px, #64b5f6 1px, transparent 1px)
                                `,
                                backgroundSize: '20px 20px, 10px 10px, 10px 10px',
                                backgroundPosition: '0 0, 10px 0, 0 10px',
                                transform: 'rotate(15deg)',
                            }}/>

                            <Box sx={{
                                width: '100%',
                                height: '6px',
                                background: 'linear-gradient(90deg, #1e88e5, #64b5f6, #bbdefb, #1e88e5)',
                                backgroundSize: '300% 100%',
                                animation: 'gradientMove 12s linear infinite',
                            }}/>

                            <Box sx={{p: 3, position: 'relative', zIndex: 1}}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 2
                                }}>
                                    <EuroSymbol sx={{mr: 1, color: '#64b5f6'}}/>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: alpha('#fff', 0.9),
                                            fontWeight: 'medium',
                                        }}
                                    >
                                        Zahlungsinformationen
                                    </Typography>
                                </Box>

                                <Divider sx={{
                                    my: 2,
                                    borderColor: alpha('#64b5f6', 0.2)
                                }}/>

                                <Box sx={{display: 'flex', justifyContent: 'center', mb: 2}}>
                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                        sx={{
                                            color: '#64b5f6',
                                        }}
                                    >
                                        {props.currentBooking.total_price}€
                                    </Typography>
                                </Box>

                                <Box sx={{mt: 3, mb: 3}}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: alpha('#fff', 0.7),
                                            mb: 1,
                                        }}
                                    >
                                        Bitte verwende diesen Betreff für deine Überweisung:
                                    </Typography>

                                    <TextField
                                        sx={{
                                            width: '100%',
                                            mb: 2,
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: alpha('#020c1b', 0.4),
                                                '& fieldset': {
                                                    borderColor: alpha('#64b5f6', 0.3),
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: alpha('#64b5f6', 0.5),
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#1e88e5',
                                                },
                                            },
                                            '& .MuiInputBase-input': {
                                                color: alpha('#fff', 0.9),
                                            },
                                        }}
                                        variant="outlined"
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton onClick={handleCopy} size="small">
                                                    <ContentCopy sx={{color: alpha('#fff', 0.7)}}/>
                                                </IconButton>
                                            ),
                                            readOnly: true
                                        }}
                                        value={betreff}
                                        fullWidth
                                    />

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mb: 3,
                                            color: alpha('#fff', 0.6),
                                        }}
                                    >
                                        Der Betreff hilft uns, deine Zahlung korrekt zuzuordnen.
                                    </Typography>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={handlePaypalClick}
                                        startIcon={<OpenInNew/>}
                                        sx={{
                                            py: 1.5,
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            boxShadow: 3,
                                            textTransform: 'none',
                                            background: 'linear-gradient(45deg, #1e88e5, #64b5f6)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                            }
                                        }}
                                    >
                                        Jetzt mit PayPal bezahlen
                                    </Button>
                                </Box>

                                <Divider sx={{
                                    my: 2,
                                    borderColor: alpha('#64b5f6', 0.2)
                                }}/>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        textAlign: 'center',
                                        color: alpha('#fff', 0.6)
                                    }}
                                >
                                    Kein PayPal? Kontaktiere bitte direkt <strong>Stephan Hauptmann</strong> für
                                    alternative
                                    Zahlungsmöglichkeiten.
                                </Typography>
                            </Box>
                        </Paper>

                        <Box sx={{
                            mt: 4,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Celebration sx={{mr: 1, color: '#64b5f6'}}/>
                            <Typography
                                variant="subtitle1"
                                fontWeight="medium"
                                sx={{
                                    color: alpha('#fff', 0.8),
                                }}
                            >
                                Wir freuen uns auf dich beim Weiher Wald und Weltall-Wahn!
                            </Typography>
                        </Box>
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
                            WWWW-BOOKING-CONFIRMATION // ID-2025
                        </Typography>
                    </Box>
                </Paper>

                {/* Snackbar for copy confirmation */}
                <Snackbar
                    open={copied}
                    autoHideDuration={4000}
                    onClose={handleClose}
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                >
                    <Alert onClose={handleClose} severity="success" variant="filled">
                        Betreff wurde in die Zwischenablage kopiert
                    </Alert>
                </Snackbar>

                {/* PayPal Redirect Modal */}
                <Modal
                    open={redirecting}
                    onClose={() => setRedirecting(false)}
                >
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 350,
                        bgcolor: 'background.paper',
                        border: '2px solid',
                        borderColor: '#1e88e5',
                        borderRadius: '16px',
                        boxShadow: 24,
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'radial-gradient(circle at bottom left, #061429 0%, #071f3b 100%)',
                    }}>
                        <CheckCircleOutline sx={{fontSize: 60, mb: 2, color: '#4caf50'}}/>

                        <Typography
                            variant="h6"
                            component="h2"
                            align="center"
                            fontWeight="bold"
                            sx={{color: alpha('#fff', 0.9)}}
                        >
                            Betreff wurde kopiert
                        </Typography>

                        <Typography sx={{
                            mt: 2,
                            mb: 3,
                            textAlign: 'center',
                            color: alpha('#fff', 0.8)
                        }}>
                            Bitte füge den Betreff in deine PayPal-Überweisung ein, damit wir deine Zahlung zuordnen
                            können.
                        </Typography>

                        {countdown > 0 ? (
                            <Box sx={{
                                textAlign: 'center',
                                mt: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                                <Box sx={{position: 'relative', display: 'inline-flex', mb: 2}}>
                                    <CircularProgress
                                        variant="determinate"
                                        value={((5 - countdown) / 5) * 100}
                                        size={50}
                                        thickness={5}
                                        sx={{color: '#64b5f6'}}
                                    />
                                    <Box sx={{
                                        top: 0, left: 0, bottom: 0, right: 0,
                                        position: 'absolute',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Typography
                                            variant="h6"
                                            component="div"
                                            fontWeight="bold"
                                            sx={{color: alpha('#fff', 0.9)}}
                                        >
                                            {countdown}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="medium"
                                    sx={{color: '#64b5f6'}}
                                >
                                    Weiterleitung zu PayPal in {countdown} Sekunden...
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{mt: 2, width: '100%'}}>
                                <Typography
                                    sx={{
                                        mb: 2,
                                        fontWeight: 'medium',
                                        textAlign: 'center',
                                        color: alpha('#fff', 0.8)
                                    }}
                                >
                                    Du wurdest nicht weitergeleitet?
                                </Typography>
                                <a
                                    href="https://www.paypal.me/StephanHau"
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{textDecoration: 'none', width: '100%', display: 'block'}}
                                >
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            py: 1.5,
                                            background: 'linear-gradient(45deg, #1e88e5, #64b5f6)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                            }
                                        }}
                                    >
                                        Manuell zu PayPal <OpenInNew sx={{ml: 1}}/>
                                    </Button>
                                </a>
                            </Box>
                        )}
                    </Box>
                </Modal>
            </Box>
        );
    }

    // Error State
    else if (props.bookingState.isSubmitted && !props.bookingState.isSuccessful) {
        return (
            <Box sx={{width: '98%', maxWidth: 600, mx: 'auto'}}>
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
                            '0%': {backgroundPosition: '0% 0%'},
                            '100%': {backgroundPosition: '300% 0%'},
                        }
                    }}/>

                    {/* Mission Briefing */}
                    <Box sx={{
                        py: 1.5,
                        px: 2,
                        backgroundColor: alpha('#000', 0.3),
                        borderLeft: '4px solid',
                        borderColor: '#1e88e5',
                        mx: {xs: 1, sm: 2},
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
                            <span style={{color: '#64b5f6'}}>MISSION ALERT:</span> Wir haben ein Problem mit deiner
                            Registrierung. Bitte versuche es erneut oder kontaktiere uns.
                        </Typography>
                    </Box>

                    <Box sx={{p: {xs: 2, sm: 3}}}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            mb: 3,
                        }}>
                            <Paper
                                elevation={2}
                                sx={{
                                    width: '100%',
                                    py: 2,
                                    px: 1,
                                    mb: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    bgcolor: alpha('#f44336', 0.1),
                                    borderRadius: '10px',
                                    border: '1px solid',
                                    borderColor: alpha('#f44336', 0.3),
                                }}
                            >
                                <ErrorOutline sx={{color: '#f44336', fontSize: 60, mb: 1}}/>
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    sx={{
                                        color: alpha('#fff', 0.9),
                                    }}
                                >
                                    Buchung fehlgeschlagen
                                </Typography>
                            </Paper>

                            <Typography
                                variant="body1"
                                paragraph
                                align="center"
                                sx={{
                                    color: alpha('#fff', 0.8),
                                }}
                            >
                                Leider konnte deine Buchung nicht abgeschlossen werden. Das kann verschiedene Gründe
                                haben:
                            </Typography>

                            <Paper
                                elevation={2}
                                sx={{
                                    mb: 3,
                                    p: 2.5,
                                    width: '100%',
                                    backgroundColor: alpha('#020c1b', 0.7),
                                    borderRadius: '10px',
                                    border: '1px solid',
                                    borderColor: alpha('#90caf9', 0.3),
                                    position: 'relative',
                                }}
                            >
                                <Box component="ul" sx={{
                                    pl: 2,
                                    mb: 0,
                                    '& > li': {
                                        color: alpha('#fff', 0.8),
                                        mb: 1,
                                    }
                                }}>
                                    <li>Netzwerkprobleme oder Serverüberlastung</li>
                                    <li>Probleme bei der Datenverarbeitung</li>
                                    <li>Technische Schwierigkeiten im System</li>
                                </Box>
                            </Paper>

                            <Typography
                                variant="body1"
                                paragraph
                                fontWeight="medium"
                                sx={{
                                    textAlign: 'center',
                                    mb: 3,
                                    color: alpha('#fff', 0.8),
                                }}
                            >
                                Bitte kontaktiere <strong>Christian Hauptmann</strong> per E-Mail oder Telefon, um deine
                                Buchung manuell abzuschließen.
                            </Typography>

                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={handleRetry}
                                startIcon={<Refresh/>}
                                sx={{
                                    mt: 2,
                                    py: 1.5,
                                    background: 'linear-gradient(45deg, #1e88e5, #64b5f6)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                    }
                                }}
                            >
                                Erneut versuchen
                            </Button>
                        </Box>
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
                            WWWW-ERROR-RECOVERY // ID-2025
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        );
    }

    // Initial Submit State
    else {
        return (
            <Box sx={{width: '98%', maxWidth: 600, mx: 'auto'}}>
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
                            '0%': {backgroundPosition: '0% 0%'},
                            '100%': {backgroundPosition: '300% 0%'},
                        }
                    }}/>

                    {/* Mission Briefing */}
                    <Box sx={{
                        py: 1.5,
                        px: 2,
                        backgroundColor: alpha('#000', 0.3),
                        borderLeft: '4px solid',
                        borderColor: '#1e88e5',
                        mx: {xs: 1, sm: 2},
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
                            <span style={{color: '#64b5f6'}}>MISSION:</span> Bereit für den Start! Bitte bestätige deine
                            Teilnahme durch Absenden der Buchung.
                        </Typography>
                    </Box>

                    <Box sx={{p: {xs: 2, sm: 3}}}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            mb: 4
                        }}>
                            <Paper
                                elevation={2}
                                sx={{
                                    width: '100%',
                                    py: 2,
                                    px: 1,
                                    mb: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    bgcolor: alpha('#020c1b', 0.7),
                                    borderRadius: '10px',
                                    border: '1px solid',
                                    borderColor: alpha('#90caf9', 0.3),
                                }}
                            >
                                <RocketLaunch sx={{color: '#64b5f6', fontSize: 60, mb: 1}}/>
                                <Typography
                                    variant="h5"
                                    align="center"
                                    fontWeight="bold"
                                    sx={{
                                        color: alpha('#fff', 0.9),
                                    }}
                                >
                                    Bereit zum Abheben!
                                </Typography>
                            </Paper>

                            <Typography
                                variant="body1"
                                paragraph
                                align="center"
                                sx={{
                                    mt: 2,
                                    fontSize: '1.1rem',
                                    color: alpha('#fff', 0.8),
                                }}
                            >
                                Wir freuen uns, dass du beim Weiher Wald und Weltall-Wahn dabei sein möchtest!
                                Mit dem Absenden der Buchung reservierst du deinen Platz beim Festival.
                            </Typography>

                            <Box sx={{
                                mt: 3,
                                p: 3,
                                width: '100%',
                                borderRadius: '10px',
                                bgcolor: alpha('#1e88e5', 0.1),
                                border: '1px solid',
                                borderColor: alpha('#1e88e5', 0.3),
                            }}>
                                <Typography
                                    variant="h6"
                                    align="center"
                                    gutterBottom
                                    sx={{
                                        color: alpha('#fff', 0.9),
                                    }}
                                >
                                    Dein Gesamtbeitrag:
                                </Typography>
                                <Typography
                                    variant="h4"
                                    align="center"
                                    fontWeight="bold"
                                    sx={{
                                        color: '#64b5f6',
                                    }}
                                >
                                    {props.currentBooking.total_price}€
                                </Typography>
                            </Box>

                            {!isOnline && (
                                <Alert
                                    severity="warning"
                                    icon={<SignalCellularNodata/>}
                                    sx={{
                                        mt: 3,
                                        width: '100%',
                                        bgcolor: alpha('#ff9800', 0.1),
                                        color: alpha('#fff', 0.9),
                                        border: '1px solid',
                                        borderColor: alpha('#ff9800', 0.3),
                                        '& .MuiAlert-icon': {
                                            color: '#ff9800',
                                        },
                                    }}
                                >
                                    Du bist momentan offline. Bitte stelle eine Internetverbindung her, bevor du deine
                                    Buchung absendest.
                                </Alert>
                            )}

                            {submissionAttempted && !props.bookingState.isSubmitting && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mt: 3,
                                        width: '100%',
                                        bgcolor: alpha('#f44336', 0.1),
                                        color: alpha('#fff', 0.9),
                                        border: '1px solid',
                                        borderColor: alpha('#f44336', 0.3),
                                        '& .MuiAlert-icon': {
                                            color: '#f44336',
                                        },
                                    }}
                                >
                                    Es gab ein Problem beim Absenden der Buchung. Bitte versuche es erneut oder
                                    kontaktiere
                                    den Support.
                                </Alert>
                            )}

                            <Button
                                disabled={!isOnline || props.bookingState.isSubmitting}
                                variant="contained"
                                color="primary"
                                onClick={submitBooking}
                                size="large"
                                sx={{
                                    mt: 4,
                                    py: 1.5,
                                    px: 4,
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    boxShadow: 3,
                                    minWidth: '60%',
                                    background: 'linear-gradient(45deg, #1e88e5, #64b5f6)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                    },
                                    '&.Mui-disabled': {
                                        background: alpha('#90caf9', 0.2),
                                        color: alpha('#fff', 0.4),
                                    }
                                }}
                                startIcon={props.bookingState.isSubmitting ? null : <Check/>}
                            >
                                {props.bookingState.isSubmitting ?
                                    <CircularProgress size={24} color="inherit"/> :
                                    "Buchung absenden"
                                }
                            </Button>

                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 2,
                                    color: alpha('#fff', 0.6),
                                    textAlign: 'center'
                                }}
                            >
                                Du kannst deine Buchung später noch bezahlen.
                            </Typography>
                        </Box>
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
                            WWWW-LAUNCH-SEQUENCE // ID-2025
                        </Typography>
                    </Box>
                </Paper>

                {/* Offline Snackbar */}
                <Snackbar
                    open={open}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity="error"
                        icon={<SignalCellularNodata/>}
                        variant="filled"
                    >
                        Du bist gerade offline. Bitte stelle sicher, dass du mit dem Internet verbunden bist und
                        versuche es erneut.
                    </Alert>
                </Snackbar>
            </Box>
        );
    }
}

export default FormConfirmation;