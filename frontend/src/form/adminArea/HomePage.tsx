
import {Box, Card, CardContent, Typography, Grid} from '@mui/material';
import {useFetchData} from "./useFetchData";

function HomePage(){
    const {bookings, formContent} = useFetchData();

    return <Box>
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
}

export default HomePage;
