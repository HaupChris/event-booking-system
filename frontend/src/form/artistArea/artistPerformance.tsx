// frontend/src/form/artistArea/artistPerformance.tsx

import React from 'react';
import { Box, TextField, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ArtistFormProps } from './artistFormContainer';

function ArtistPerformanceForm(props: ArtistFormProps) {
    // Extract performance details from JSON if available, or use empty object
    const performanceDetails = props.currentBooking.performance_details ?
        JSON.parse(props.currentBooking.performance_details) :
        { preferredDay: '', preferredTime: '', duration: '', genre: '', description: '', bandMembers: '' };

    // Update performance details
    const updatePerformanceDetail = (field: string, value: string) => {
        const updatedDetails = {
            ...performanceDetails,
            [field]: value
        };
        props.updateBooking('performance_details', JSON.stringify(updatedDetails));
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Auftrittsdetails
                </Typography>
                <Typography variant="body2" paragraph>
                    Bitte teile uns Details zu deinem Auftritt mit, damit wir einen optimalen Ablauf planen können.
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Bevorzugter Tag</InputLabel>
                            <Select
                                value={performanceDetails.preferredDay}
                                onChange={(e) => updatePerformanceDetail('preferredDay', e.target.value as string)}
                                label="Bevorzugter Tag"
                            >
                                <MenuItem value="Donnerstag">Donnerstag</MenuItem>
                                <MenuItem value="Freitag">Freitag</MenuItem>
                                <MenuItem value="Samstag">Samstag</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Bevorzugte Zeit</InputLabel>
                            <Select
                                value={performanceDetails.preferredTime}
                                onChange={(e) => updatePerformanceDetail('preferredTime', e.target.value as string)}
                                label="Bevorzugte Zeit"
                            >
                                <MenuItem value="Nachmittag">Nachmittag</MenuItem>
                                <MenuItem value="Früher Abend">Früher Abend</MenuItem>
                                <MenuItem value="Hauptprogramm">Hauptprogramm</MenuItem>
                                <MenuItem value="Nacht">Nacht</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Set-Dauer</InputLabel>
                            <Select
                                value={performanceDetails.duration}
                                onChange={(e) => updatePerformanceDetail('duration', e.target.value as string)}
                                label="Set-Dauer"
                            >
                                <MenuItem value="30">30 Minuten</MenuItem>
                                <MenuItem value="45">45 Minuten</MenuItem>
                                <MenuItem value="60">60 Minuten</MenuItem>
                                <MenuItem value="90">90 Minuten</MenuItem>
                                <MenuItem value="120">120 Minuten</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Genre/Musikstil"
                            value={performanceDetails.genre}
                            onChange={(e) => updatePerformanceDetail('genre', e.target.value)}
                            sx={{ mb: 2 }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Beschreibung deines Acts"
                            placeholder="Kurze Beschreibung für Programm und Ankündigungen"
                            value={performanceDetails.description}
                            onChange={(e) => updatePerformanceDetail('description', e.target.value)}
                            sx={{ mb: 2 }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Bandmitglieder/Mitwirkende"
                            placeholder="Namen und Rollen aller Beteiligten"
                            value={performanceDetails.bandMembers}
                            onChange={(e) => updatePerformanceDetail('bandMembers', e.target.value)}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Hinweise zum Programm
                </Typography>
                <Typography variant="body2" paragraph>
                    Bitte beachte:
                </Typography>
                <ul>
                    <li>Wir versuchen, deinem bevorzugten Zeitpunkt zu entsprechen, können dies aber nicht garantieren.</li>
                    <li>Die finale Programmplanung erfolgt ca. 2 Wochen vor der Veranstaltung.</li>
                    <li>Umbauzeiten zwischen den Acts betragen ca. 30 Minuten.</li>
                    <li>Wir werden dich rechtzeitig über deinen finalen Auftrittszeit informieren.</li>
                </ul>
            </Paper>
        </Box>
    );
}

export default ArtistPerformanceForm;