// src/form/adminArea/TicketsPage.tsx

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, CardContent, Grid, Accordion, AccordionSummary, 
    AccordionDetails, Chip, Tabs, Tab
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useFetchData } from './useFetchData';

function TicketsPage() {
    const { regularBookings, artistBookings, formContent, artistFormContent } = useFetchData();
    const [viewType, setViewType] = useState('all'); // 'all', 'regular', 'artist'
    const [attendees, setAttendees] = useState<{ [key: string]: any[] }>({
        Donnerstag: [],
        Freitag: [],
        Samstag: []
    });

    // Handle tab change
    const handleViewChange = (event: React.SyntheticEvent, newValue: string) => {
        setViewType(newValue);
    };

    useEffect(() => {
        const newAttendees: { [key: string]: any[] } = {
            Donnerstag: [],
            Freitag: [],
            Samstag: []
        };

        // Process regular bookings
        if (viewType === 'all' || viewType === 'regular') {
            regularBookings.forEach(booking => {
                const ticket = formContent.ticket_options.find(t => t.id === booking.ticket_id);
                if (ticket) {
                    if (ticket.title.includes("Donnerstag")) 
                        newAttendees.Donnerstag.push({...booking, bookingType: 'regular'});
                    if (ticket.title.includes("Freitag")) 
                        newAttendees.Freitag.push({...booking, bookingType: 'regular'});
                    if (ticket.title.includes("Samstag")) 
                        newAttendees.Samstag.push({...booking, bookingType: 'regular'});
                }
            });
        }

        // Process artist bookings
        if (viewType === 'all' || viewType === 'artist') {
            artistBookings.forEach(booking => {
                const ticket = artistFormContent.ticket_options.find(t => t.id === booking.ticket_id);
                if (ticket) {
                    if (ticket.title.includes("Donnerstag")) 
                        newAttendees.Donnerstag.push({...booking, bookingType: 'artist'});
                    if (ticket.title.includes("Freitag")) 
                        newAttendees.Freitag.push({...booking, bookingType: 'artist'});
                    if (ticket.title.includes("Samstag")) 
                        newAttendees.Samstag.push({...booking, bookingType: 'artist'});
                }
            });
        }

        setAttendees(newAttendees);
    }, [regularBookings, artistBookings, formContent, artistFormContent, viewType]);

    return (
        <Box sx={{p: 2}}>
            <Typography variant="h4" gutterBottom>Tickets Übersicht</Typography>
            
            {/* View type tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                    value={viewType} 
                    onChange={handleViewChange}
                    centered
                >
                    <Tab label="All Participants" value="all" />
                    <Tab label="Regular Participants" value="regular" />
                    <Tab label="Artists" value="artist" />
                </Tabs>
            </Box>
            
            <Grid container spacing={2}>
                {Object.keys(attendees).map(day => (
                    <Grid item xs={12} key={day}>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${day}-content`} id={`${day}-header`}>
                                <Typography variant="h5">{day}</Typography>
                                <Typography variant="subtitle1" sx={{ml: 2}}>
                                    Anzahl der Teilnehmer: {attendees[day].length}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <CardContent>
                                    <Box mt={2}>
                                        {attendees[day].map((booking, index) => (
                                            <Box
                                                key={`${booking.bookingType}-${booking.id}`}
                                                mb={1}
                                                sx={{
                                                    backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                                                    padding: '8px',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                {booking.bookingType === 'artist' && (
                                                    <Chip 
                                                        label="Artist" 
                                                        color="primary" 
                                                        size="small" 
                                                        sx={{ mr: 2 }}
                                                    />
                                                )}
                                                <Box>
                                                    <Typography variant="body1">
                                                        {booking.first_name} {booking.last_name}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {booking.bookingType === 'artist' 
                                                            ? artistFormContent.ticket_options.find(t => t.id === booking.ticket_id)?.title
                                                            : formContent.ticket_options.find(t => t.id === booking.ticket_id)?.title}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default TicketsPage;