// frontend/src/form/artistArea/artistSummary.tsx

import React from 'react';
import { Typography, Box, List, ListItem, ListItemText, Divider, Paper } from '@mui/material';
import { Booking, FormContent, ArtistMaterial } from '../userArea/interface';

function findItemById<T extends { id: number }>(array: T[], id: number): T | undefined {
    return array.find(item => item.id === id);
}

interface ArtistSummaryProps {
    booking: Booking;
    formContent: FormContent;
}

function ArtistSummary(props: ArtistSummaryProps) {
    const {
        first_name,
        last_name,
        email,
        phone,
        ticket_id,
        beverage_id,
        food_id,
        artist_equipment,
        special_requests,
        performance_details,
        artist_material_ids,
        total_price
    } = props.booking;

    const ticket = findItemById(props.formContent.ticket_options, ticket_id);
    const beverage = findItemById(props.formContent.beverage_options, beverage_id);
    const food = findItemById(props.formContent.food_options, food_id);

    // Parse performance details if available
    let parsedPerformanceDetails: any = {};
    try {
        if (performance_details) {
            parsedPerformanceDetails = JSON.parse(performance_details);
        }
    } catch (e) {
        console.error("Failed to parse performance details:", e);
    }

    // Get artist materials
    const artistMaterials = artist_material_ids?.map(id =>
        findItemById(props.formContent.artist_materials || [], id)
    ).filter(Boolean) as ArtistMaterial[];

    return (
        <Box sx={{ width: '100%', maxWidth: 700, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                    Persönliche Informationen
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemText
                            primary={<Typography variant="subtitle1">Name</Typography>}
                            secondary={`${first_name} ${last_name}`}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={<Typography variant="subtitle1">E-Mail</Typography>}
                            secondary={email}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={<Typography variant="subtitle1">Telefon</Typography>}
                            secondary={phone}
                        />
                    </ListItem>
                </List>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                    Festival-Teilnahme
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemText
                            primary={<Typography variant="subtitle1">Anwesenheit</Typography>}
                            secondary={ticket ? ticket.title : 'Nicht ausgewählt'}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={<Typography variant="subtitle1">Getränkeoption</Typography>}
                            secondary={beverage ? `${beverage.title} (Kostenlos für Künstler)` : 'Keine'}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={<Typography variant="subtitle1">Essensoption</Typography>}
                            secondary={food ? food.title : 'Keine'}
                        />
                    </ListItem>
                </List>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                    Auftrittsdetails
                </Typography>
                <List dense>
                    {parsedPerformanceDetails.preferredDay && (
                        <ListItem>
                            <ListItemText
                                primary={<Typography variant="subtitle1">Bevorzugter Tag</Typography>}
                                secondary={parsedPerformanceDetails.preferredDay}
                            />
                        </ListItem>
                    )}
                    {parsedPerformanceDetails.preferredTime && (
                        <ListItem>
                            <ListItemText
                                primary={<Typography variant="subtitle1">Bevorzugte Zeit</Typography>}
                                secondary={parsedPerformanceDetails.preferredTime}
                            />
                        </ListItem>
                    )}
                    {parsedPerformanceDetails.duration && (
                        <ListItem>
                            <ListItemText
                                primary={<Typography variant="subtitle1">Set-Dauer</Typography>}
                                secondary={`${parsedPerformanceDetails.duration} Minuten`}
                            />
                        </ListItem>
                    )}
                    {parsedPerformanceDetails.genre && (
                        <ListItem>
                            <ListItemText
                                primary={<Typography variant="subtitle1">Genre/Musikstil</Typography>}
                                secondary={parsedPerformanceDetails.genre}
                            />
                        </ListItem>
                    )}
                    {parsedPerformanceDetails.description && (
                        <ListItem>
                            <ListItemText
                                primary={<Typography variant="subtitle1">Beschreibung</Typography>}
                                secondary={parsedPerformanceDetails.description}
                            />
                        </ListItem>
                    )}
                </List>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                    Technische Anforderungen
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemText
                            primary={<Typography variant="subtitle1">Benötigte Ausrüstung</Typography>}
                            secondary={artist_equipment || 'Keine speziellen Anforderungen'}
                        />
                    </ListItem>
                    {special_requests && (
                        <ListItem>
                            <ListItemText
                                primary={<Typography variant="subtitle1">Spezielle Anfragen</Typography>}
                                secondary={special_requests}
                            />
                        </ListItem>
                    )}
                </List>
            </Paper>

            {artistMaterials && artistMaterials.length > 0 && (
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Mitgebrachte Materialien
                    </Typography>
                    <List dense>
                        {artistMaterials.map((material, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={material.title} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" align="center">
                    Dein Beitrag: {total_price}€
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
                    (Kostenlose Eintritte und Getränke für Künstler sind bereits berücksichtigt)
                </Typography>
            </Paper>
        </Box>
    );
}

export default ArtistSummary;