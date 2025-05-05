import React from 'react';
import { Box, TextField, Typography, Paper } from '@mui/material';
import { ArtistFormProps } from './artistFormContainer';


function ArtistEquipmentForm(props: ArtistFormProps) {
    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Technische Anforderungen
                </Typography>
                <Typography variant="body2" paragraph>
                    Bitte teile uns mit, welche technischen Anforderungen du für deinen Auftritt hast.
                    Dies hilft uns bei der Planung und Vorbereitung.
                </Typography>

                <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Technische Anforderungen"
                    placeholder="z.B. Mikrofonbedarf, Verstärker, Monitore, Licht, etc."
                    value={props.currentBooking.equipment}
                    onChange={(e) => props.updateBooking('equipment', e.target.value)}
                    error={!!props.formValidation.equipment}
                    helperText={props.formValidation.equipment || ""}
                    required
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Spezielle Anfragen"
                    placeholder="Hast du spezielle Anfragen oder Fragen an uns?"
                    value={props.currentBooking.special_requests}
                    onChange={(e) => props.updateBooking('special_requests', e.target.value)}
                    sx={{ mb: 2 }}
                />
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Verfügbare Ausrüstung am Veranstaltungsort
                </Typography>
                <Typography variant="body2" paragraph>
                    Folgendes Equipment steht grundsätzlich zur Verfügung (Details können variieren):
                </Typography>
                Hauptbühne:

                <ul>
                    <li>XDJ-XZ </li>
                    <li> + 1x XDJ 1000</li>
                    <li> + 1x Reloop rp7000 </li>
                </ul>
                Bandbühne
                <ul>
                    <li>Yamaha Stagepas 1K Stereo Bundle</li>
                    <li>Behringer XR18 Wirless Mixer</li>
                </ul>


                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Bitte beachte: Spezielle Ausrüstung muss selbst mitgebracht werden oder im Vorfeld mit uns abgestimmt werden.
                </Typography>
            </Paper>
        </Box>
    );
}

export default ArtistEquipmentForm;