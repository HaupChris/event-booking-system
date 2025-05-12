import React, { useState, useEffect } from 'react';
import {
    Button,
    Box,
    Typography,
    TextField,
    Snackbar, Alert, CircularProgress,
    Modal, Paper
} from '@mui/material';
import { Check, ErrorOutline, FileCopy, OpenInNew, SignalCellularNodata } from "@mui/icons-material";
import jellyfishImage from '../../img/jellyfish.png';
import {ArtistBooking, ArtistFormContent} from "./interface";
import {ArtistBookingState} from "./ArtistRegistrationFormContainer";


interface ArtistConfirmationProps {
    booking: ArtistBooking;
    submitBooking: () => void;
    formContent: ArtistFormContent;
    bookingState: ArtistBookingState;
}

function findItemById<T extends { id: number }>(array: T[], id: number): T | undefined {
    return array.find(item => item.id === id);
}

function ArtistConfirmationForm(props: ArtistConfirmationProps) {
    const ticket = findItemById(props.formContent.ticket_options, props.booking.ticket_id);
    const beverage_or_undefined = findItemById(props.formContent.beverage_options, props.booking.beverage_id);
    const beverage = beverage_or_undefined ? beverage_or_undefined : {title: "Keine Bierflat"};
    const food_or_undefined = findItemById(props.formContent.food_options, props.booking.food_id);
    const food = food_or_undefined ? food_or_undefined : {title: "Kein Essen"};

    // For artists, use a different email subject that identifies them as artists
    const betreff = `WWWW ARTIST: ${props.booking.last_name}, ${props.booking.first_name} - ${ticket?.title} - ${beverage?.title} - ${food?.title} - ${props.booking.total_price}€`;

    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [redirecting, setRedirecting] = useState(false);
    const [countdown, setCountdown] = useState(5);

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
        }
    }, [redirecting]);

    const handleCopy = () => {
        navigator.clipboard.writeText(betreff).then();
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

    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                {props.bookingState.isSubmitted ? (
                    props.bookingState.isSuccessful ? (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                <img src={jellyfishImage} alt="jellyfish" style={{ width: '115px', height: '115px' }} />
                            </Box>

                            <Typography variant="body1" paragraph>
                                Deine Künstler-Anmeldung war erfolgreich! Du erhältst in Kürze eine Bestätigungsmail
                                (bitte auch im Spam-Ordner nachsehen).
                            </Typography>

                            {props.booking.total_price > 0 ? (
                                <Box sx={{ mt: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: '5px', p: 3 }}>
                                    <Typography variant="h5" gutterBottom>
                                        Dein Beitrag: <strong>{props.booking.total_price}€</strong>
                                    </Typography>

                                    <Typography variant="body2" paragraph>
                                        <TextField
                                            sx={{ width: { xs: '100%', md: '100%' } }}
                                            variant="standard"
                                            value={betreff}
                                            helperText="Betreff für die Überweisung"
                                            fullWidth
                                        />
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        fullWidth
                                        sx={{ mb: 2 }}
                                        onClick={() => {
                                            handleCopy();
                                            setCopied(true);
                                        }}
                                    >
                                        Betreff kopieren <FileCopy />
                                    </Button>

                                    <Button fullWidth variant="contained" onClick={handlePaypalClick}>
                                        Zu unserem Paypal <OpenInNew />
                                    </Button>
                                </Box>
                            ) : (
                                <Typography variant="h6" sx={{ mt: 2, textAlign: 'center', color: 'primary.main' }}>
                                    Für dich als Künstler fallen keine Kosten an. Wir freuen uns auf deinen Auftritt!
                                </Typography>
                            )}

                            <Typography sx={{ pt: 3 }} variant="body2">
                                Weitere Informationen erhalten Künstler*innen rechtzeitig vor dem Festival.
                                Bei Fragen wende dich bitte an unser Künstler-Team.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center' }}>
                            <ErrorOutline color="error" style={{ fontSize: 60, marginBottom: '1rem' }} />
                            <Typography variant="h6">
                                Die Anmeldung ist fehlgeschlagen, bitte kontaktiere uns per Email.
                            </Typography>
                        </Box>
                    )
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="body1" paragraph>
                            Wir freuen uns, dich als Künstler*in beim Weiher Wald und Wiesenwahn begrüßen zu dürfen!
                        </Typography>

                        <Button
                            disabled={!isOnline || props.bookingState.isSubmitting}
                            variant="contained"
                            color="secondary"
                            onClick={submitBooking}
                            sx={{ mt: 2 }}
                        >
                            {props.bookingState.isSubmitting ?
                                <CircularProgress size={24} /> :
                                <><Check /> Anmeldung absenden</>
                            }
                        </Button>
                    </Box>
                )}
            </Paper>

            <Snackbar
                open={copied}
                autoHideDuration={4000}
                onClose={handleClose}
                message="Betreff kopiert"
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            />

            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity="error" icon={<SignalCellularNodata />}>
                    Du bist gerade offline. Bitte stelle sicher, dass du mit dem Internet verbunden bist und
                    versuche es erneut.
                </Alert>
            </Snackbar>

            <Modal
                open={redirecting}
                onClose={() => setRedirecting(false)}
                aria-labelledby="redirect-modal-title"
                aria-describedby="redirect-modal-description"
            >
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 300, bgcolor: 'background.paper', border: '2px solid #000', borderRadius: '20px',
                    boxShadow: 24, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                    <Typography id="redirect-modal-title" variant="h6" component="h2">
                        Betreff wurde kopiert
                    </Typography>
                    <Typography id="redirect-modal-description" sx={{ mt: 2 }}>
                        Vergiss nicht, ihn in die Überweisung einzufügen.
                    </Typography>
                    {countdown > 0 ? (
                        <Box>
                            <Box sx={{ position: 'relative', display: 'inline-flex', mt: 2 }}>
                                <CircularProgress variant="determinate" value={((7 - countdown) / 7) * 100} />
                                <Box sx={{
                                    top: 0, left: 0, bottom: 0, right: 0, position: 'absolute',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Typography variant="caption" component="div" color="textSecondary">
                                        {countdown}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography sx={{ mt: 2 }}>
                                Weiterleitung zu Paypal ...
                            </Typography>
                        </Box>
                    ) : (
                        <Box>
                            <Typography sx={{ mt: 2 }}>
                                <strong>Du wurdest nicht weiter geleitet?</strong>
                            </Typography>
                            <a href="https://www.paypal.me/StephanHau" target="_blank" rel="noreferrer">
                                <Button
                                    sx={countdown > 0 ? { display: 'none' } : { mt: 2 }}
                                    fullWidth variant="contained"
                                >
                                    Manuell zu Paypal <OpenInNew />
                                </Button>
                            </a>
                        </Box>
                    )}
                </Box>
            </Modal>
        </Box>
    );
}

export default ArtistConfirmationForm;