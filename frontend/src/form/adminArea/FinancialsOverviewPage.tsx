import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Paper, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  useTheme, useMediaQuery, Chip, Divider, Button, Tabs, Tab,
  IconButton, Tooltip, Menu, MenuItem
} from '@mui/material';
import { useFetchData } from './useFetchData';
import PaidIcon from '@mui/icons-material/Paid';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DownloadIcon from '@mui/icons-material/Download';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const FinancialsOverviewPage: React.FC = () => {
  const {bookings, formContent, artistFormContent } = useFetchData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // View type state
  const [viewType, setViewType] = useState('all'); // 'all', 'regular', 'artist'
  const [viewTypeAnchorEl, setViewTypeAnchorEl] = useState<null | HTMLElement>(null);
  const viewTypeMenuOpen = Boolean(viewTypeAnchorEl);

  // View type tabs/dropdown
  const handleViewChange = (event: React.SyntheticEvent, newValue: string) => {
    setViewType(newValue);
  };

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

  // Get relevant bookings based on filter
  const getFilteredBookings = () => {
    if (viewType === 'all') return bookings;
    else {
        return bookings.filter((booking) => booking.bookingType === viewType);
    }
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
    unpaidCount,
    paidAmount,
    expectedAmount,
    allCount
  } = calculateTotalsByCategory();

  // Calculate progress percentages
  const paymentProgress = expectedAmount > 0 ? (paidAmount / expectedAmount) * 100 : 0;
  const paidParticipantsProgress = allCount > 0 ? (paidCount / allCount) * 100 : 0;

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with responsive filter */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        mb: 3,
        gap: 1
      }}>
        <Typography variant="h5" gutterBottom={isMobile}>
          Financial Overview
        </Typography>

        {/* View Type Selection - Either Tabs or Dropdown based on screen size */}
        {isMobile ? (
          <Box>
            <Button
              variant="outlined"
              onClick={handleViewTypeMenuOpen}
              endIcon={<FilterAltIcon />}
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
            sx={{ minWidth: '300px' }}
          >
            <Tab label="All Participants" value="all" />
            <Tab label="Regular Participants" value="regular" />
            <Tab label="Artists" value="artist" />
          </Tabs>
        )}
      </Box>

      {/* Key Finance Metrics */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Revenue</Typography>
                <PaidIcon fontSize="large" />
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>€{grandTotal.toFixed(2)}</Typography>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
                fontSize: '0.875rem'
              }}>
                <Typography variant="body2">Expected</Typography>
                <Typography variant="body2">€{expectedAmount.toFixed(2)}</Typography>
              </Box>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.875rem'
              }}>
                <Typography variant="body2">Received</Typography>
                <Typography variant="body2">€{paidAmount.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ mt: 1, position: 'relative', pt: 1 }}>
                <LinearProgressWithLabel value={paymentProgress} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Participants</Typography>
                <PeopleIcon fontSize="large" />
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>{allCount}</Typography>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
                fontSize: '0.875rem'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                  <Typography variant="body2">Regular</Typography>
                </Box>
                <Typography variant="body2">{regularCount}</Typography>
              </Box>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.875rem'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MusicNoteIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                  <Typography variant="body2">Artists</Typography>
                </Box>
                <Typography variant="body2">{artistCount}</Typography>
              </Box>
              <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.875rem'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                  <Typography variant="body2">Paid</Typography>
                </Box>
                <Typography variant="body2">{paidCount}</Typography>
              </Box>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.875rem'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CloseIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                  <Typography variant="body2">Unpaid</Typography>
                </Box>
                <Typography variant="body2">{unpaidCount}</Typography>
              </Box>
              <Box sx={{ mt: 1, position: 'relative', pt: 1 }}>
                <LinearProgressWithLabel value={paidParticipantsProgress} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Tickets</Typography>
                <ConfirmationNumberIcon fontSize="large" />
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {Object.values(ticketTotals).reduce((sum, { count }) => sum + count, 0)}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>
                €{Object.values(ticketTotals).reduce((sum, { total }) => sum + total, 0).toFixed(2)}
              </Typography>

              {!isMobile && (
                <Box sx={{ mt: 2 }}>
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
                          {isArtist && <MusicNoteIcon sx={{ mr: 0.5, fontSize: '0.875rem' }} />}
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
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Food & Beverages</Typography>
                <Box sx={{ display: 'flex' }}>
                  <LocalDiningIcon fontSize="large" sx={{ mr: 1 }} />
                  <SportsBarIcon fontSize="large" />
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">Beverages</Typography>
                  <Typography variant="h6">
                    €{Object.values(beverageTotals).reduce((sum, { total }) => sum + total, 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body1">Food</Typography>
                  <Typography variant="h6">
                    €{Object.values(foodTotals).reduce((sum, { total }) => sum + total, 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">Total</Typography>
                <Typography variant="h5">
                  €{(
                    Object.values(beverageTotals).reduce((sum, { total }) => sum + total, 0) +
                    Object.values(foodTotals).reduce((sum, { total }) => sum + total, 0)
                  ).toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Tables */}
      <Grid container spacing={3}>
        {/* Tickets Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Ticket Sales</Typography>
                <ConfirmationNumberIcon color="primary" />
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
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
                          bgcolor: isArtist ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
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
                    <TableRow sx={{ '& td': { fontWeight: 'bold', bgcolor: 'rgba(0, 0, 0, 0.04)' } }}>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Beverages Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Beverage Sales</Typography>
                <SportsBarIcon color="primary" />
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
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
                          bgcolor: isArtist ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
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
                    <TableRow sx={{ '& td': { fontWeight: 'bold', bgcolor: 'rgba(0, 0, 0, 0.04)' } }}>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Food Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Food Sales</Typography>
                <LocalDiningIcon color="primary" />
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
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
                          bgcolor: isArtist ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
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
                    <TableRow sx={{ '& td': { fontWeight: 'bold', bgcolor: 'rgba(0, 0, 0, 0.04)' } }}>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Grand Total */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'rgba(63, 81, 181, 0.1)' }}>
            <CardContent>
              <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'center' : 'center',
                gap: 2
              }}>
                <Typography variant="h5">
                  Total Revenue: €{grandTotal.toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PaidIcon />}
                  >
                    {viewType === 'all' ? 'All' : viewType === 'regular' ? 'Regular' : 'Artist'} Payments
                  </Button>
                  <Tooltip title="Export financial data">
                    <IconButton color="primary">
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Custom LinearProgress with label
const LinearProgressWithLabel = (props: { value: number }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(props.value, 100)}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }
          }}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="inherit">{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
};

const LinearProgress = ({ variant, value, sx, ...rest }: any) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: 10,
        width: '100%',
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        position: 'relative',
        ...sx
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${Math.min(value, 100)}%`,
          borderRadius: 5,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          transition: 'width 0.4s ease-in-out',
        }}
      />
    </Box>
  );
};

export default FinancialsOverviewPage;