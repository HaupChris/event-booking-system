// src/form/adminArea/TicketsPage.tsx

import React, {useState, useEffect} from 'react';
import {
    Box, Typography, CardContent, Grid, Accordion, AccordionSummary,
    AccordionDetails, Chip, Tabs, Tab, useTheme, useMediaQuery,
    Button, Menu, MenuItem, Badge
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {useFetchData} from './useFetchData';

function TicketsPage() {
    const {regularBookings, artistBookings, formContent, artistFormContent} = useFetchData();
    const [viewType, setViewType] = useState('all'); // 'all', 'regular', 'artist'
    const [viewTypeAnchorEl, setViewTypeAnchorEl] = useState<null | HTMLElement>(null);
    const viewTypeMenuOpen = Boolean(viewTypeAnchorEl);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [attendees, setAttendees] = useState<{ [key: string]: any[] }>({
        Donnerstag: [],
        Freitag: [],
        Samstag: []
    });

    // Calculate total attendees
    const totalAttendees = Object.values(attendees).reduce(
        (sum, dayAttendees) => sum + dayAttendees.length, 0
    );

    // Handle tab change
    const handleViewChange = (event: React.SyntheticEvent, newValue: string) => {
        setViewType(newValue);
    };

    // Handle view type dropdown menu
    const handleViewTypeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setViewTypeAnchorEl(event.currentTarget);
    };

    const handleViewTypeMenuClose = () => {
        setViewTypeAnchorEl(null);
    };

    const handleViewTypeSelect = (type: string) => {
        setViewType(type);
        handleViewTypeMenuClose();
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
            {/* Header with responsive filter */}
            <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                mb: 2,
                gap: 1
            }}>
                <Typography variant="h5" gutterBottom={isMobile}>
                    Tickets Übersicht
                    <Badge
                        badgeContent={totalAttendees}
                        color="primary"
                        sx={{ml: 2}}
                    >
                        <PeopleIcon/>
                    </Badge>
                </Typography>

                {/* View Type Selection - Either Tabs or Dropdown based on screen size */}
                {isMobile ? (
                    <Box>
                        <Button
                            variant="outlined"
                            onClick={handleViewTypeMenuOpen}
                            endIcon={<FilterAltIcon/>}
                            size="small"
                            fullWidth
                        >
                            {viewType === 'all' ? 'All Participants' :
                                viewType === 'regular' ? 'Regular Participants' : 'Artists'}
                        </Button>
                        <Menu
                            anchorEl={viewTypeAnchorEl}
                            open={viewTypeMenuOpen}
                            onClose={handleViewTypeMenuClose}
                        >
                            <MenuItem onClick={() => handleViewTypeSelect('all')}>All Participants</MenuItem>
                            <MenuItem onClick={() => handleViewTypeSelect('regular')}>Regular Participants</MenuItem>
                            <MenuItem onClick={() => handleViewTypeSelect('artist')}>Artists</MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Tabs
                        value={viewType}
                        onChange={handleViewChange}
                        sx={{minWidth: '300px'}}
                    >
                        <Tab label="All Participants" value="all"/>
                        <Tab label="Regular Participants" value="regular"/>
                        <Tab label="Artists" value="artist"/>
                    </Tabs>
                )}
            </Box>

            {/* Stats summary - only on desktop */}
            {!isMobile && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    mb: 3,
                    p: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1
                }}>
                    {Object.entries(attendees).map(([day, people]) => (
                        <Box key={day} sx={{textAlign: 'center'}}>
                            <Typography variant="h6">{day}</Typography>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <PeopleIcon sx={{mr: 1, color: 'primary.main'}}/>
                                <Typography variant="h4">{people.length}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {people.filter(p => p.bookingType === 'regular').length} Regular, {people.filter(p => p.bookingType === 'artist').length} Artists
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Day accordions */}
            <Grid container spacing={2}>
                {Object.keys(attendees).map(day => (
                    <Grid item xs={12} key={day}>
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon/>}
                                aria-controls={`${day}-content`}
                                id={`${day}-header`}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    justifyContent: 'space-between'
                                }}>
                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                        <CalendarTodayIcon sx={{mr: 1}}/>
                                        <Typography variant={isMobile ? "subtitle1" : "h5"}>{day}</Typography>
                                    </Box>

                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        {/* On mobile, show compact format */}
                                        {isMobile ? (
                                            <Badge badgeContent={attendees[day].length} color="primary">
                                                <PeopleIcon/>
                                            </Badge>
                                        ) : (
                                            <>
                                                <Typography variant="body2" sx={{mr: 1}}>
                                                    Total: {attendees[day].length}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    label={`${attendees[day].filter(p => p.bookingType === 'regular').length} Regular`}
                                                />
                                                <Chip
                                                    size="small"
                                                    color="primary"
                                                    label={`${attendees[day].filter(p => p.bookingType === 'artist').length} Artists`}
                                                />
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <CardContent sx={{p: isMobile ? 0 : 2}}>
                                    <Box>
                                        {attendees[day].map((booking, index) => (
                                            <Box
                                                key={`${booking.bookingType}-${booking.id}`}
                                                mb={1}
                                                sx={{
                                                    backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)',
                                                    padding: isMobile ? '6px' : '8px',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                {/* Show artist chip for artist bookings */}
                                                {booking.bookingType === 'artist' ? (
                                                        <Chip
                                                            label="Artist"
                                                            color="primary"
                                                            size="small"
                                                            sx={{mr: 2}}
                                                        />
                                                    ) :
                                                    (<Chip
                                                        label="Regular"
                                                        color="default"
                                                        size="small"
                                                        sx={{mr: 2}}
                                                    />)
                                                }

                                                {/* Attendee info */}
                                                <Box sx={{flexGrow: 1}}>
                                                    <Typography variant={isMobile ? "body2" : "body1"}>
                                                        {booking.first_name} {booking.last_name}
                                                    </Typography>


                                                    <Typography variant="body2" color="text.secondary">
                                                        {booking.bookingType === 'artist'
                                                            ? artistFormContent.ticket_options.find(t => t.id === booking.ticket_id)?.title
                                                            : formContent.ticket_options.find(t => t.id === booking.ticket_id)?.title}
                                                    </Typography>

                                                </Box>

                                                {/* Show phone info on desktop only */}
                                                {!isMobile && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ml: 2}}>
                                                        {booking.phone}
                                                    </Typography>
                                                )}
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