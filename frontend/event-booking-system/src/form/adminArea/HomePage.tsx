import React, {useContext, useEffect, useState} from 'react';
import {Box, Card, CardContent, Typography, Grid} from '@mui/material';
import {TokenContext} from '../../AuthContext';
import axios from 'axios';
import {getDummyFormContent} from "../formContainer";

interface BookingOverview {
    ticketTypes: { [key: string]: number };
    beverageTypes: { [key: string]: number };
    foodTypes: { [key: string]: number };
}

const HomePage: React.FC = () => {
    const [bookingOverview, setBookingOverview] = useState<BookingOverview>({
        ticketTypes: {},
        beverageTypes: {},
        foodTypes: {},
    });
    const [bookings, setBookings] = useState([]);
    const [formContent, setFormContent] = useState(getDummyFormContent());
    const {token} = useContext(TokenContext);

    useEffect(() => {
        axios.get('/api/data', {
                headers: {Authorization: `Bearer ${token}`}
            })
            .then(response => setBookings(response.data))
            .catch(error => console.error('Error:', error));

        axios.get('/api/formcontent', {
                headers: {Authorization: `Bearer ${token}`}
            })
            .then(response => setFormContent(response.data))
            .catch(error => console.error('Error:', error));
    }, [token]);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Overview
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="div" gutterBottom>
                                Ticket Bookings
                            </Typography>
                            {formContent.ticket_options.map((option, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '8px 8px',
                                        backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                                    }}
                                >
                                    <Typography variant="body2">{option.title}</Typography>
                                    <Typography variant="body2">{option.num_booked}</Typography>
                                </Box>
                            ))}
                        </CardContent>

                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="div" gutterBottom>
                                Bierflat
                            </Typography>
                            {formContent.beverage_options.map((option, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '8px 8px',
                                        backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                                    }}
                                >
                                    <Typography variant="body2">{option.title}</Typography>
                                    <Typography variant="body2">{option.num_booked}</Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="div" gutterBottom>
                                Essen
                            </Typography>
                            {formContent.food_options.map((option, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '8px 8px',
                                        backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                                    }}
                                >
                                    <Typography variant="body2">{option.title}</Typography>
                                    <Typography variant="body2">{option.num_booked}</Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default HomePage;
