// Path: frontend/src/form/adminArea/FinancialsOverviewPage.tsx

import React from 'react';
import {
    Box, Typography, Card, CardContent, Grid, Paper, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {useFetchData} from './useFetchData';

const FinancialsOverviewPage: React.FC = () => {
    const {bookings, formContent} = useFetchData();

    // Calculate total income by category
    const calculateTotalsByCategory = () => {
        let ticketTotals: { [key: string]: { count: number, total: number } } = {};
        let beverageTotals: { [key: string]: { count: number, total: number } } = {};
        let foodTotals: { [key: string]: { count: number, total: number } } = {};
        let grandTotal = 0;
        let artistCount = 0;
        let regularCount = 0;

        bookings.forEach(booking => {
            // Count booking types
            if (booking.bookingType === 'artist') {
                artistCount++;
            } else {
                regularCount++;
            }
            // Tickets
            const ticket = formContent.ticket_options.find(t => t.id === booking.ticket_id);
            if (ticket) {
                if (!ticketTotals[ticket.title]) {
                    ticketTotals[ticket.title] = {count: 0, total: 0};
                }
                ticketTotals[ticket.title].count += 1;
                ticketTotals[ticket.title].total += ticket.price;
            }

            // Beverages
            const beverage = formContent.beverage_options.find(b => b.id === booking.beverage_id);
            if (beverage) {
                if (!beverageTotals[beverage.title]) {
                    beverageTotals[beverage.title] = {count: 0, total: 0};
                }
                beverageTotals[beverage.title].count += 1;
                beverageTotals[beverage.title].total += beverage.price;
            }

            // Food
            const food = formContent.food_options.find(f => f.id === booking.food_id);
            if (food) {
                if (!foodTotals[food.title]) {
                    foodTotals[food.title] = {count: 0, total: 0};
                }
                foodTotals[food.title].count += 1;
                foodTotals[food.title].total += food.price;
            }

            // Add to grand total
            grandTotal += booking.total_price;
        });

        return {ticketTotals, beverageTotals, foodTotals, grandTotal, artistCount, regularCount};
    };

    const {
        ticketTotals,
        beverageTotals,
        foodTotals,
        grandTotal,
        artistCount,
        regularCount
    } = calculateTotalsByCategory();

    return (
        <Box sx={{p: 2}}>
            <Typography variant="h4" gutterBottom>Financial Overview</Typography>

            <Grid container spacing={3}>
                {/* Tickets Summary */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Ticket Sales</Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Ticket Type</TableCell>
                                            <TableCell align="right">Count</TableCell>
                                            <TableCell align="right">Total (€)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(ticketTotals).map(([title, {count, total}]) => (
                                            <TableRow key={title}>
                                                <TableCell>{title}</TableCell>
                                                <TableCell align="right">{count}</TableCell>
                                                <TableCell align="right">{total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow sx={{'& td': {fontWeight: 'bold'}}}>
                                            <TableCell>Total Tickets</TableCell>
                                            <TableCell
                                                align="right">{Object.values(ticketTotals).reduce((sum, {count}) => sum + count, 0)}</TableCell>
                                            <TableCell
                                                align="right">{Object.values(ticketTotals).reduce((sum, {total}) => sum + total, 0).toFixed(2)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Beverages Summary */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Beverage Sales</Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Beverage Type</TableCell>
                                            <TableCell align="right">Count</TableCell>
                                            <TableCell align="right">Total (€)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(beverageTotals).map(([title, {count, total}]) => (
                                            <TableRow key={title}>
                                                <TableCell>{title}</TableCell>
                                                <TableCell align="right">{count}</TableCell>
                                                <TableCell align="right">{total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow sx={{'& td': {fontWeight: 'bold'}}}>
                                            <TableCell>Total Beverages</TableCell>
                                            <TableCell
                                                align="right">{Object.values(beverageTotals).reduce((sum, {count}) => sum + count, 0)}</TableCell>
                                            <TableCell
                                                align="right">{Object.values(beverageTotals).reduce((sum, {total}) => sum + total, 0).toFixed(2)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Food Summary */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Food Sales</Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Food Type</TableCell>
                                            <TableCell align="right">Count</TableCell>
                                            <TableCell align="right">Total (€)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(foodTotals).map(([title, {count, total}]) => (
                                            <TableRow key={title}>
                                                <TableCell>{title}</TableCell>
                                                <TableCell align="right">{count}</TableCell>
                                                <TableCell align="right">{total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow sx={{'& td': {fontWeight: 'bold'}}}>
                                            <TableCell>Total Food</TableCell>
                                            <TableCell
                                                align="right">{Object.values(foodTotals).reduce((sum, {count}) => sum + count, 0)}</TableCell>
                                            <TableCell
                                                align="right">{Object.values(foodTotals).reduce((sum, {total}) => sum + total, 0).toFixed(2)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/*Participant summary*/}
                <Grid item xs={12} md={4}>
                    <Card sx={{bgcolor: 'primary.light', color: 'white'}}>
                        <CardContent>
                            <Typography variant="h6">Participant Statistics</Typography>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2}}>
                                <Typography variant="body1">Regular Participants:</Typography>
                                <Typography variant="body1">{regularCount}</Typography>
                            </Box>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 1}}>
                                <Typography variant="body1">Artists:</Typography>
                                <Typography variant="body1">{artistCount}</Typography>
                            </Box>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 1}}>
                                <Typography variant="body1">Total:</Typography>
                                <Typography variant="body1">{regularCount + artistCount}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Grand Total */}
                <Grid item xs={12}>
                    <Card sx={{bgcolor: 'rgba(63, 81, 181, 0.1)'}}>
                        <CardContent>
                            <Typography variant="h5" align="center">
                                Total Revenue: €{grandTotal.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default FinancialsOverviewPage;