import {Box, Card, CardContent, Typography, Grid} from '@mui/material';
import {useFetchData} from "./useFetchData";

function HomePage() {
    const {bookings, formContent, artistFormContent} = useFetchData();

    const artistCount = bookings.filter(b => b.bookingType === 'artist').length;
    const regularCount = bookings.filter(b => b.bookingType === 'regular').length;

    return <Box>
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" component="div" gutterBottom>
                            Ticket Buchungen (Normal / Künstler*innen)
                        </Typography>
                        {formContent.ticket_options.map((option, index) => {
                                const artistTicketOption = artistFormContent.ticket_options.find((to) => to.title === option.title)
                                return <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '8px 8px',
                                        backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <Typography maxWidth={"70%"} variant="body2">{option.title}</Typography>
                                    <Typography
                                        variant="body2">{option.num_booked} / {artistTicketOption?.num_booked || 0} </Typography>
                                </Box>;

                            }
                        )}
                    </CardContent>

                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" component="div" gutterBottom>
                            Bierflat (Normal / Künstler*innen)
                        </Typography>
                        {formContent.beverage_options.map((option, index) => {

                                const artistBeverageOption = artistFormContent.beverage_options.find((to) => to.title === option.title)
                                return <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '8px 8px',
                                        backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <Typography maxWidth={"70%"} variant="body2">{option.title}</Typography>
                                    <Typography
                                        variant="body2">{option.num_booked} / {artistBeverageOption?.num_booked || 0}</Typography>
                                </Box>;
                            }
                        )}
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" component="div" gutterBottom>
                            Essen (Normal / Künstler*innen)
                        </Typography>
                        {formContent.food_options.map((option, index) => {

                                const artistFoodOption = artistFormContent.food_options.find((to) => to.title === option.title)

                                return <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '8px 8px',
                                        backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <Typography maxWidth={"70%"} variant="body2">{option.title}</Typography>
                                    <Typography variant="body2">{option.num_booked} / {artistFoodOption?.num_booked || 0}</Typography>
                                </Box>
                            }
                        )}
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" component="div" gutterBottom>
                            Participants
                        </Typography>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                            <Typography variant="body1">Regular:</Typography>
                            <Typography variant="body1">{regularCount}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                            <Typography variant="body1">Artists:</Typography>
                            <Typography variant="body1">{artistCount}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1, fontWeight: 'bold'}}>
                            <Typography variant="body1">Total:</Typography>
                            <Typography variant="body1">{regularCount + artistCount}</Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </Box>
}

export default HomePage;
