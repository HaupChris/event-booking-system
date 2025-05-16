import React, { useState } from 'react';
import {
  Box, Typography, Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, alpha
} from '@mui/material';

import { useFetchData } from './useFetchData';
import FilterControls from './components/FilterControls';
import StatsCard from './components/StatsCard';
import { ViewFilterType } from './utils/optionsUtils';
import FormCard from '../../components/core/display/FormCard';
import { spacePalette } from '../../components/styles/theme';
import {ConfirmationNumber, LocalDining, MusicNote, Paid, People, Person, SportsBar} from '@mui/icons-material';

const FinancialsOverviewPage: React.FC = () => {
  const { bookings, formContent, artistFormContent } = useFetchData();
  const [viewType, setViewType] = useState<ViewFilterType>('all');
  const [viewTypeAnchorEl, setViewTypeAnchorEl] = useState<null | HTMLElement>(null);

  // Get relevant bookings based on filter
  const getFilteredBookings = () => {
    if (viewType === 'all') return bookings;
    return bookings.filter((booking) => booking.bookingType === viewType);
  };

  // Calculate total income by category
  const calculateTotalsByCategory = () => {
    const filteredBookings = getFilteredBookings();

    let ticketTotals: { [key: string]: { count: number, total: number, isArtist: boolean } } = {};
    let beverageTotals: { [key: string]: { count: number, total: number, isArtist: boolean } } = {};
    let foodTotals: { [key: string]: { count: number, total: number, isArtist: boolean } } = {};

    let grandTotal = 0;
    let artistCount = 0;
    let regularCount = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let paidAmount = 0;
    let expectedAmount = 0;

    filteredBookings.forEach(booking => {
      // Count booking types
      if (booking.bookingType === 'artist') {
        artistCount++;
      } else {
        regularCount++;
      }

      // Payment stats
      if (booking.is_paid) {
        paidCount++;
        paidAmount += booking.paid_amount || 0;
      } else {
        unpaidCount++;
      }
      expectedAmount += booking.total_price;

      // Get appropriate content based on booking type
      const content = booking.bookingType === 'artist' ? artistFormContent : formContent;

      // Tickets
      const ticket = content.ticket_options.find(t => t.id === booking.ticket_id);
      if (ticket) {
        const key = `${booking.bookingType}-${ticket.title}`;
        if (!ticketTotals[key]) {
          ticketTotals[key] = { count: 0, total: 0, isArtist: booking.bookingType === 'artist' };
        }
        ticketTotals[key].count += 1;
        ticketTotals[key].total += ticket.price;
      }

      // Beverages
      const beverage = content.beverage_options.find(b => b.id === booking.beverage_id);
      if (beverage && booking.beverage_id !== -1) {
        const key = `${booking.bookingType}-${beverage.title}`;
        if (!beverageTotals[key]) {
          beverageTotals[key] = { count: 0, total: 0, isArtist: booking.bookingType === 'artist' };
        }
        beverageTotals[key].count += 1;
        beverageTotals[key].total += beverage.price;
      }

      // Food
      const food = content.food_options.find(f => f.id === booking.food_id);
      if (food && booking.food_id !== -1) {
        const key = `${booking.bookingType}-${food.title}`;
        if (!foodTotals[key]) {
          foodTotals[key] = { count: 0, total: 0, isArtist: booking.bookingType === 'artist' };
        }
        foodTotals[key].count += 1;
        foodTotals[key].total += food.price;
      }
    });

    // Calculate grand total from actual bookings
    grandTotal = filteredBookings.reduce((sum, booking) => sum + booking.total_price, 0);

    return {
      ticketTotals,
      beverageTotals,
      foodTotals,
      grandTotal,
      artistCount,
      regularCount,
      paidCount,
      unpaidCount,
      paidAmount,
      expectedAmount,
      allCount: filteredBookings.length
    };
  };

  const {
    ticketTotals,
    beverageTotals,
    foodTotals,
    grandTotal,
    artistCount,
    regularCount,
    paidCount,
    paidAmount,
    expectedAmount,
    allCount
  } = calculateTotalsByCategory();

  // Calculate progress percentages
  const paymentProgress = expectedAmount > 0 ? (paidAmount / expectedAmount) * 100 : 0;
  const paidParticipantsProgress = allCount > 0 ? (paidCount / allCount) * 100 : 0;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Financial Overview
      </Typography>

      {/* View Type Controls */}
      <Box sx={{ mb: 3 }}>
        <FilterControls
          viewType={viewType}
          setViewType={setViewType}
          anchorEl={viewTypeAnchorEl}
          setAnchorEl={setViewTypeAnchorEl}
        />
      </Box>

      {/* Key Finance Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Revenue"
            value={`€${grandTotal.toFixed(2)}`}
            subtitle={`Expected: €${expectedAmount.toFixed(2)}`}
            color="primary"
            icon={<Paid fontSize="large" />}
            progress={paymentProgress}
            footer={
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.875rem'
              }}>
                <Typography variant="body2">Received:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  €{paidAmount.toFixed(2)}
                </Typography>
              </Box>
            }
            fullHeight
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Participants"
            value={allCount}
            color="success"
            icon={<People fontSize="large" />}
            progress={paidParticipantsProgress}
            footer={
              <Box>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 0.5, fontSize: '1rem' }} />
                    <Typography variant="body2">Regular</Typography>
                  </Box>
                  <Typography variant="body2">{regularCount}</Typography>
                </Box>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MusicNote sx={{ mr: 0.5, fontSize: '1rem' }} />
                    <Typography variant="body2">Artists</Typography>
                  </Box>
                  <Typography variant="body2">{artistCount}</Typography>
                 </Box>
              </Box>
            }
            fullHeight
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Tickets"
            value={Object.values(ticketTotals).reduce((sum, { count }) => sum + count, 0)}
            subtitle={`€${Object.values(ticketTotals).reduce((sum, { total }) => sum + total, 0).toFixed(2)}`}
            color="warning"
            icon={<ConfirmationNumber fontSize="large" />}
            footer={
              <Box>
                {Object.entries(ticketTotals)
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 2)
                  .map(([key, { count, isArtist }]) => (
                    <Box
                      key={key}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 0.5
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {isArtist && <MusicNote sx={{ mr: 0.5, fontSize: '0.875rem' }} />}
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {key.split('-')[1]}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{count}</Typography>
                    </Box>
                  ))}
                {Object.keys(ticketTotals).length > 2 && (
                  <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'center' }}>
                    +{Object.keys(ticketTotals).length - 2} more
                  </Typography>
                )}
              </Box>
            }
            fullHeight
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Food & Beverages"
            value={`€${(
              Object.values(beverageTotals).reduce((sum, { total }) => sum + total, 0) +
              Object.values(foodTotals).reduce((sum, { total }) => sum + total, 0)
            ).toFixed(2)}`}
            color="info"
            icon={
              <Box sx={{ display: 'flex' }}>
                <LocalDining fontSize="large" sx={{ mr: 1 }} />
                <SportsBar fontSize="large" />
              </Box>
            }
            footer={
              <Box>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1
                }}>
                  <Typography variant="body2">Beverages:</Typography>
                  <Typography variant="body2">
                    €{Object.values(beverageTotals).reduce((sum, { total }) => sum + total, 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="body2">Food:</Typography>
                  <Typography variant="body2">
                    €{Object.values(foodTotals).reduce((sum, { total }) => sum + total, 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            }
            fullHeight
          />
        </Grid>
      </Grid>

      {/* Detailed Tables */}
      <Grid container spacing={3}>
        {/* Tickets Summary */}
        <Grid item xs={12} md={4}>
          <FormCard
            title="Ticket Sales"
            icon={<ConfirmationNumber />}
          >
            <Box sx={{ p: 2 }}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(spacePalette.primary.main, 0.05) }}>
                      <TableCell>Ticket Type</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Total (€)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(ticketTotals).map(([key, { count, total, isArtist }]) => (
                      <TableRow
                        key={key}
                        sx={{
                          bgcolor: isArtist ? alpha(spacePalette.primary.main, 0.08) : 'transparent'
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {isArtist && (
                              <Chip label="A" color="primary" size="small" sx={{ mr: 1 }} />
                            )}
                            {key.split('-')[1]}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{count}</TableCell>
                        <TableCell align="right">{total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ '& td': { fontWeight: 'bold', bgcolor: alpha('#000', 0.04) } }}>
                      <TableCell>Total Tickets</TableCell>
                      <TableCell align="right">
                        {Object.values(ticketTotals).reduce((sum, { count }) => sum + count, 0)}
                      </TableCell>
                      <TableCell align="right">
                        {Object.values(ticketTotals).reduce((sum, { total }) => sum + total, 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </FormCard>
        </Grid>

        {/* Beverages Summary */}
        <Grid item xs={12} md={4}>
          <FormCard
            title="Beverage Sales"
            icon={<SportsBar />}
          >
            <Box sx={{ p: 2 }}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(spacePalette.primary.main, 0.05) }}>
                      <TableCell>Beverage Type</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Total (€)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(beverageTotals).map(([key, { count, total, isArtist }]) => (
                      <TableRow
                        key={key}
                        sx={{
                          bgcolor: isArtist ? alpha(spacePalette.primary.main, 0.08) : 'transparent'
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {isArtist && (
                              <Chip label="A" color="primary" size="small" sx={{ mr: 1 }} />
                            )}
                            {key.split('-')[1]}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{count}</TableCell>
                        <TableCell align="right">{total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ '& td': { fontWeight: 'bold', bgcolor: alpha('#000', 0.04) } }}>
                      <TableCell>Total Beverages</TableCell>
                      <TableCell align="right">
                        {Object.values(beverageTotals).reduce((sum, { count }) => sum + count, 0)}
                      </TableCell>
                      <TableCell align="right">
                        {Object.values(beverageTotals).reduce((sum, { total }) => sum + total, 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </FormCard>
        </Grid>

        {/* Food Summary */}
        <Grid item xs={12} md={4}>
          <FormCard
            title="Food Sales"
            icon={<LocalDining />}
          >
            <Box sx={{ p: 2 }}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(spacePalette.primary.main, 0.05) }}>
                      <TableCell>Food Type</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Total (€)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(foodTotals).map(([key, { count, total, isArtist }]) => (
                      <TableRow
                        key={key}
                        sx={{
                          bgcolor: isArtist ? alpha(spacePalette.primary.main, 0.08) : 'transparent'
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {isArtist && (
                              <Chip label="A" color="primary" size="small" sx={{ mr: 1 }} />
                            )}
                            {key.split('-')[1]}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{count}</TableCell>
                        <TableCell align="right">{total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ '& td': { fontWeight: 'bold', bgcolor: alpha('#000', 0.04) } }}>
                      <TableCell>Total Food</TableCell>
                      <TableCell align="right">
                        {Object.values(foodTotals).reduce((sum, { count }) => sum + count, 0)}
                      </TableCell>
                      <TableCell align="right">
                        {Object.values(foodTotals).reduce((sum, { total }) => sum + total, 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </FormCard>
        </Grid>

        {/* Grand Total */}
        <Grid item xs={12}>
          <Paper sx={{
            p: 3,
            bgcolor: alpha(spacePalette.primary.main, 0.1),
            borderRadius: 2,
            border: `1px solid ${alpha(spacePalette.primary.main, 0.2)}`
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2
            }}>
              <Typography variant="h5" color="primary.main" fontWeight="medium">
                Total Revenue: €{grandTotal.toFixed(2)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Paid />}
                >
                  {viewType === 'all' ? 'All' : viewType === 'regular' ? 'Regular' : 'Artist'} Payments
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialsOverviewPage;