import React, {useEffect, useState} from 'react';
import {
    Box,
    Typography,
    CardContent,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useFetchData} from './useFetchData';
import {Booking} from './useFetchData';

function TicketsPage() {
    const {bookings, formContent} = useFetchData();
    const [attendees, setAttendees] = useState<{ [key: string]: Booking[] }>({
        Donnerstag: [],
        Freitag: [],
        Samstag: []
    });

    useEffect(() => {
        const newAttendees: { [key: string]: Booking[] } = {
            Donnerstag: [],
            Freitag: [],
            Samstag: []
        };

        bookings.forEach(booking => {
            const ticket = formContent.ticket_options.find(t => t.id === booking.ticket_id);
            if (ticket) {
                if (ticket.title.includes("Donnerstag")) newAttendees.Donnerstag.push(booking);
                if (ticket.title.includes("Freitag")) newAttendees.Freitag.push(booking);
                if (ticket.title.includes("Samstag")) newAttendees.Samstag.push(booking);
            }
        });

        setAttendees(newAttendees);
    }, [bookings, formContent]);

    return (
        <Box sx={{p: 2}}>
            <Typography variant="h4" gutterBottom>Tickets Übersicht</Typography>
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
                                                key={booking.id}
                                                mb={1}
                                                sx={{
                                                    backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                                                    padding: '8px',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                <Typography variant="body1">
                                                    {booking.first_name} {booking.last_name}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {formContent.ticket_options.find(t => t.id === booking.ticket_id)?.title}
                                                </Typography>
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
