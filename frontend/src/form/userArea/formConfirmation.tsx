import React, {useEffect, useState} from "react";
import {
    Button,
    Box,
    Typography,
    TextField,
    Snackbar, Alert, CircularProgress,
    Modal, Paper, Divider, IconButton
} from '@mui/material';
import {Booking, FormContent} from "./interface";
import {
    Check,
    ErrorOutline,
    ContentCopy,
    OpenInNew,
    SignalCellularNodata,
    Celebration,
    EventAvailable,
    EuroSymbol,
    CheckCircleOutline,
    Refresh
} from "@mui/icons-material";

import '../../css/formConfirmation.css';
import {BookingState} from "./formContainer";
import jellyfishImage from '../../img/jellyfish.png';

interface FinalBookingProps {
    booking: Booking;
    submitBooking: () => void;
    formContent: FormContent;
    bookingState: BookingState;
}

function findItemById<T extends { id: number }>(array: T[], id: number): T | undefined {
    return array.find(item => item.id === id);
}

function FormConfirmation(props: FinalBookingProps) {
    const ticket = findItemById(props.formContent.ticket_options, props.booking.ticket_id);
    const beverage_or_undefined = findItemById(props.formContent.beverage_options, props.booking.beverage_id);
    const beverage = beverage_or_undefined ? beverage_or_undefined : {title: "Keine Bierflat"};
    const food_or_undefined = findItemById(props.formContent.food_options, props.booking.food_id);
    const food = food_or_undefined ? food_or_undefined : {title: "Kein Essen"};

    const betreff = `WWWW: ${props.booking.last_name}, ${props.booking.first_name} - ${ticket?.title} - ${beverage?.title} - ${food?.title} - ${props.booking.total_price}€`;

    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [redirecting, setRedirecting] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

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
            <Box sx={{width: '100%', maxWidth: 600, mx: 'auto'}}>
                <Paper elevation={3} sx={{p: 4, borderRadius: 3}}>
                    {/* Success Header */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 3,
                        py: 2,
                        backgroundColor: 'success.light',
                        borderRadius: 2
                    }}>
                        <CheckCircleOutline sx={{color: 'success.main', fontSize: 60, mb: 1}}/>
                        <Typography variant="h5" fontWeight="bold" align="center" sx={{color: 'success.dark'}}>
                            Deine Buchung war erfolgreich!
                        </Typography>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 3,
                        position: 'relative',
                        '&:hover .jellyfish': {
                            transform: 'scale(1.1)',
                            opacity: 0.8,
                        }
                    }}>
                        <img
                            src={jellyfishImage}
                            alt="jellyfish"
                            className="jellyfish"
                            style={{
                                width: '150px',
                                height: '150px',
                                transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out'
                            }}
                        />
                    </Box>

                    <Typography variant="body1" paragraph sx={{mb: 3, fontSize: '1.1rem'}}>
                        Du erhältst in Kürze eine Bestätigungsmail mit allen Details zu deiner Buchung. Bitte
                        prüfe auch deinen Spam-Ordner, falls die Mail nicht sofort ankommt.
                    </Typography>

                    {/* Payment Box */}
                    <Paper
                        elevation={2}
                        sx={{
                            mt: 4,
                            border: '2px solid',
                            borderColor: 'primary.main',
                            borderRadius: '12px',
                            p: 3,
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '8px',
                                backgroundColor: 'primary.main'
                            }
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
                            <EuroSymbol sx={{mr: 1, color: 'primary.main'}}/>
                            Zahlungsinformationen
                        </Typography>

                        <Divider sx={{my: 2}}/>

                        <Box sx={{display: 'flex', justifyContent: 'center', mb: 2}}>
                            <Typography variant="h4" fontWeight="bold" color="primary.main">
                                {props.booking.total_price}€
                            </Typography>
                        </Box>

                        <Box sx={{mt: 3, mb: 3}}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Bitte verwende diesen Betreff für deine Überweisung:
                            </Typography>

                            <TextField
                                sx={{
                                    width: '100%',
                                    mb: 2,
                                    bgcolor: 'background.paper',
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'primary.light',
                                            borderWidth: 2
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    }
                                }}
                                variant="outlined"
                                InputProps={{
                                    endAdornment: (
                                        <IconButton onClick={handleCopy} size="small">
                                            <ContentCopy fontSize="small"/>
                                        </IconButton>
                                    ),
                                    readOnly: true
                                }}
                                value={betreff}
                                fullWidth
                            />

                            <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
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
                                    textTransform: 'none'
                                }}
                            >
                                Jetzt mit PayPal bezahlen
                            </Button>
                        </Box>

                        <Divider sx={{my: 2}}/>

                        <Typography variant="body2" sx={{textAlign: 'center', color: 'text.secondary'}}>
                            Kein PayPal? Kontaktiere bitte direkt <strong>Stephan Hauptmann</strong> für alternative
                            Zahlungsmöglichkeiten.
                        </Typography>
                    </Paper>

                    <Box sx={{mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <Celebration sx={{mr: 1, color: 'secondary.main'}}/>
                        <Typography variant="subtitle1" fontWeight="medium" color="secondary.main">
                            Wir freuen uns auf dich beim Weiher Wald und Weltall-Wahn!
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
                        borderColor: 'primary.main',
                        borderRadius: '24px',
                        boxShadow: 24,
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <CheckCircleOutline color="success" sx={{fontSize: 60, mb: 2}}/>

                        <Typography variant="h6" component="h2" align="center" fontWeight="bold">
                            Betreff wurde kopiert
                        </Typography>

                        <Typography sx={{mt: 2, mb: 3, textAlign: 'center'}}>
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
                                        color="primary"
                                    />
                                    <Box sx={{
                                        top: 0, left: 0, bottom: 0, right: 0,
                                        position: 'absolute',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Typography variant="h6" component="div" fontWeight="bold">
                                            {countdown}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="subtitle1" fontWeight="medium" color="primary">
                                    Weiterleitung zu PayPal in {countdown} Sekunden...
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{mt: 2, width: '100%'}}>
                                <Typography sx={{mb: 2, fontWeight: 'medium', textAlign: 'center'}}>
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
                                        sx={{py: 1.5}}
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
            <Box sx={{width: '100%', maxWidth: 600, mx: 'auto'}}>
                <Paper elevation={3} sx={{p: 4, borderRadius: 3}}>
                    <Box sx={{
                        textAlign: 'center',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: 'error.light',
                        borderRadius: 2,
                        mb: 3
                    }}>
                        <ErrorOutline color="error" style={{fontSize: 70, marginBottom: 16}}/>
                        <Typography variant="h5" fontWeight="bold" color="error.dark">
                            Buchung fehlgeschlagen
                        </Typography>
                    </Box>

                    <Box sx={{p: 2}}>
                        <Typography variant="body1" paragraph align="center">
                            Leider konnte deine Buchung nicht abgeschlossen werden. Das kann verschiedene Gründe haben:
                        </Typography>

                        <Box sx={{
                            mb: 3,
                            p: 2,
                            borderLeft: '4px solid',
                            borderColor: 'grey.400',
                            backgroundColor: 'grey.100',
                            borderRadius: '0 8px 8px 0'
                        }}>
                            <Typography component="div" variant="body1" sx={{mb: 1}}>
                                • Netzwerkprobleme oder Serverüberlastung
                            </Typography>
                            <Typography component="div" variant="body1" sx={{mb: 1}}>
                                • Probleme bei der Datenverarbeitung
                            </Typography>
                            <Typography component="div" variant="body1">
                                • Technische Schwierigkeiten im System
                            </Typography>
                        </Box>

                        <Typography variant="body1" paragraph fontWeight="medium" sx={{textAlign: 'center', mb: 3}}>
                            Bitte kontaktiere <strong>Christian Hauptmann</strong> per E-Mail oder Telefon, um deine
                            Buchung manuell abzuschließen.
                        </Typography>

                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={handleRetry}
                            startIcon={<Refresh/>}
                            sx={{mt: 2}}
                        >
                            Erneut versuchen
                        </Button>
                    </Box>
                </Paper>
            </Box>
        );
    }

    // Initial Submit State
    else {
        return (
            <Box sx={{width: '100%', maxWidth: 600, mx: 'auto'}}>
                <Paper elevation={3} sx={{p: 4, borderRadius: 3}}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 4
                    }}>
                        <EventAvailable sx={{fontSize: 70, color: 'primary.main', mb: 2}}/>
                        <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
                            Bereit zum Abheben!
                        </Typography>

                        <Typography variant="body1" paragraph align="center" sx={{mt: 2, fontSize: '1.1rem'}}>
                            Wir freuen uns, dass du beim Weiher Wald und Weltall-Wahn dabei sein möchtest!
                            Mit dem Absenden der Buchung reservierst du deinen Platz beim Festival.
                        </Typography>

                        <Box sx={{
                            mt: 3,
                            p: 3,
                            width: '100%',
                            borderRadius: 2,
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText'
                        }}>
                            <Typography variant="h6" align="center" gutterBottom>
                                Dein Gesamtbeitrag:
                            </Typography>
                            <Typography variant="h4" align="center" fontWeight="bold">
                                {props.booking.total_price}€
                            </Typography>
                        </Box>

                        {!isOnline && (
                            <Alert
                                severity="warning"
                                icon={<SignalCellularNodata/>}
                                sx={{mt: 3, width: '100%'}}
                            >
                                Du bist momentan offline. Bitte stelle eine Internetverbindung her, bevor du deine
                                Buchung absendest.
                            </Alert>
                        )}

                        {submissionAttempted && !props.bookingState.isSubmitting && (
                            <Alert
                                severity="error"
                                sx={{mt: 3, width: '100%'}}
                            >
                                Es gab ein Problem beim Absenden der Buchung. Bitte versuche es erneut oder kontaktiere
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
                                minWidth: '60%'
                            }}
                            startIcon={props.bookingState.isSubmitting ? null : <Check/>}
                        >
                            {props.bookingState.isSubmitting ?
                                <CircularProgress size={24} color="inherit"/> :
                                "Buchung absenden"
                            }
                        </Button>

                        <Typography variant="body2" sx={{mt: 2, color: 'text.secondary', textAlign: 'center'}}>
                            Du kannst deine Buchung später noch bezahlen.
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