import {
    Button,
    Box,
    Typography,
    TextField,
    Snackbar, Alert, CircularProgress,
    Modal,
} from '@mui/material';
import {Booking, FormContent} from "./interface";
import React, {useEffect, useState} from "react";
import {
    Check,
    ErrorOutline,
    FileCopy,
    OpenInNew,
    SignalCellularNodata,
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

    }, [])

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
        <Box sx={{p: 2, borderRadius: '5px'}}>
            {props.bookingState.isSubmitted ? (props.bookingState.isSuccessful ? (
                        <div>
                            <div className="icon-container">
                                <img src={jellyfishImage} alt="jellyfish"
                                     style={{width: '115px', height: '115px', marginRight: '1em'}}/>
                            </div>
                            <Typography variant="body2" component="div" sx={{mb: 2}}>
                                Deine Buchung war erfolgreich. Du erhältst in Kürze eine Bestätigungsmail (bitte auch im
                                Spam-Ordner nachsehen).
                            </Typography>
                            <div>
                                <div className={"checkout"}>
                                    <Typography variant="h5" component="div" sx={{mb: '1em'}}>
                                        Dein Beitrag: <strong>{props.booking.total_price}€</strong>
                                    </Typography>

                                    <Typography variant="body2" sx={{mb: '1em'}} component="div">
                                        <TextField
                                            sx={{width: {xs: '100%', md: '70%'}}}
                                            variant={"standard"}
                                            value={betreff}
                                            helperText="Betreff für die Überweisung"
                                        />
                                        <Snackbar
                                            sx={{backgroundColor: 'black', color: 'white'}}
                                            open={copied}
                                            autoHideDuration={4000}
                                            onClose={handleClose}
                                            message="Betreff kopiert"
                                            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                                        />
                                    </Typography>
                                    <Button variant={"outlined"} color={"secondary"} fullWidth sx={{mb: {xs: '1em'}}}
                                            onClick={() => {
                                                handleCopy();
                                                setCopied(true);
                                            }}>
                                        Betreff kopieren <FileCopy/>
                                    </Button>
                                    <Button fullWidth variant={"contained"} onClick={handlePaypalClick}>
                                        Zu unserem Paypal <OpenInNew/>
                                    </Button>

                                </div>

                                <Typography sx={{"pt": 2}} variant={"subtitle2"}>
                                    Solltest du kein Paypal haben, schreibe dir deinen Beitrag auf und kontaktiere <u>Stephan
                                    Hauptmann</u>.
                                </Typography>
                            </div>
                        </div>)

                    :

                    (
                        <div className="icon-container">
                            <ErrorOutline color="error" style={{fontSize: 60}}/>
                            <Typography variant="h6">Buchung fehlgeschlagen, bitte Christian Hauptmann
                                kontaktieren.</Typography>
                        </div>)
            ) : (<Box sx={{
                    display: 'flex',
                    'flexDirection': 'column',
                    'alignItems': 'center',
                    'justifyContent': 'center'
                }}>
                    <Typography variant="body1" component="div" sx={{mb: 2}}>
                        Wir freuen uns, dass du dabei bist und mit uns zusammen feierst!
                        <br/>

                    </Typography>

                    <Button
                        disabled={!isOnline || props.bookingState.isSubmitting}
                        variant="contained"
                        color="secondary"
                        onClick={submitBooking}
                    >
                        {props.bookingState.isSubmitting ? <CircularProgress size={24}/> : <><Check/> Buchung
                            absenden</>}
                    </Button>
                    <Snackbar
                        open={open}
                        autoHideDuration={6000}
                        onClose={handleSnackbarClose}
                        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    >
                        <Alert onClose={handleSnackbarClose} severity="error" sx={{width: '100%'}}
                               icon={<SignalCellularNodata/>}>
                            Du bist gerade offline. Bitte stelle sicher, dass du mit dem Internet verbunden bist und
                            versuche es erneut.
                            Sollte das Problem weiterhin bestehen, kontaktiere Christian Hauptmann
                        </Alert>
                    </Snackbar>
                </Box>
            )}

            <Modal
                open={redirecting}
                onClose={() => setRedirecting(false)}
                aria-labelledby="redirect-modal-title"
                aria-describedby="redirect-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 300,
                    bgcolor: 'white',
                    border: '2px solid #000',
                    borderRadius: '20px',
                    boxShadow: 24,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <Typography id="redirect-modal-title" variant="h6" component="h2">
                        Betreff wurde kopiert
                    </Typography>
                    <Typography id="redirect-modal-description" sx={{mt: 2}}>
                        Vergiss nicht, ihn in die Überweisung einzufügen.
                    </Typography>
                    {countdown > 0 ?
                        <Box>
                            <Box sx={{position: 'relative', display: 'inline-flex', mt: 2}}>
                                <CircularProgress variant="determinate" value={((7 - countdown) / 7) * 100}/>
                                <Box
                                    sx={{
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        right: 0,
                                        position: 'absolute',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Typography variant="caption" component="div" color="textSecondary">
                                        {countdown}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography sx={{mt: 2}}>
                                Weiterleitung zu Paypal ...
                            </Typography>
                        </Box>
                        :
                        <Box>

                            <Typography sx={{mt: 2}}>
                                <strong>Du wurdest nicht weiter geleitet?</strong>
                            </Typography>
                            <a
                                href="https://www.paypal.me/StephanHau" target="_blank"
                                rel="noreferrer">
                                <Button
                                    sx={countdown > 0 ? {display: 'none'} : {mt: 2}}
                                    fullWidth variant={"contained"}>
                                    Manuell zu Paypal <OpenInNew/>
                                </Button>
                            </a>
                        </Box>
                    }

                </Box>

            </Modal>
        </Box>
    );
}

export default FormConfirmation;
