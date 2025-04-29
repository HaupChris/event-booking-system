import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Modal, IconButton, Chip,
  useMediaQuery, useTheme, Button, Menu, MenuItem, Tabs, Tab,
  Card, CardContent, Grid
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useFetchData } from "./useFetchData";

function FoodPage() {
  const { regularBookings, artistBookings, formContent, artistFormContent } = useFetchData();
  const [selectedFood, setSelectedFood] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [viewType, setViewType] = useState('all'); // 'all', 'regular', 'artist'
  const [viewTypeAnchorEl, setViewTypeAnchorEl] = useState<null | HTMLElement>(null);
  const viewTypeMenuOpen = Boolean(viewTypeAnchorEl);
  const [selectedBookingType, setSelectedBookingType] = useState<'regular' | 'artist' | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Handle opening the modal
  const handleOpenModal = (foodId: number, bookingType: 'regular' | 'artist') => {
    setSelectedFood(foodId);
    setSelectedBookingType(bookingType);
    setOpenModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedFood(null);
    setSelectedBookingType(null);
  };

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

  // Helper to get option title
  const getOptionTitle = (id: number, options: { id: number; title: string }[], isArtist: boolean = false) => {
    // If id is -1, return "No Food"
    if (id === -1) return 'No Food';

    const option = options.find(option => option.id === id);
    return option ? option.title : 'Unknown';
  };

  // Get users for a specific food option by type
  const getUsersForFood = (foodId: number, bookingType: 'regular' | 'artist') => {
    if (bookingType === 'regular') {
      return regularBookings
        .filter(booking => booking.food_id === foodId)
        .map(booking => ({
          first_name: booking.first_name,
          last_name: booking.last_name,
          is_artist: false
        }));
    } else {
      return artistBookings
        .filter(booking => booking.food_id === foodId)
        .map(booking => ({
          first_name: booking.first_name,
          last_name: booking.last_name,
          is_artist: true
        }));
    }
  };

  // Get food option stats
  const getFoodOptionStats = (foodOptions: any[], isArtist: boolean) => {
    return foodOptions.map(food => {
      const regularUsers = isArtist ? [] : getUsersForFood(food.id, 'regular');
      const artistUsers = isArtist ? getUsersForFood(food.id, 'artist') : [];
      return {
        ...food,
        regularCount: regularUsers.length,
        artistCount: artistUsers.length,
        totalCount: regularUsers.length + artistUsers.length,
        bookingType: isArtist ? 'artist' : 'regular'
      };
    });
  };

  // Combine food options based on selected view
  const getCombinedFoodOptions = () => {
    const regularOptions = viewType === 'all' || viewType === 'regular'
      ? getFoodOptionStats(formContent.food_options, false)
      : [];

    const artistOptions = viewType === 'all' || viewType === 'artist'
      ? getFoodOptionStats(artistFormContent.food_options, true)
      : [];

    return [...regularOptions, ...artistOptions];
  };

  const foodOptions = getCombinedFoodOptions();

  // Get the description of a food option
  const getFoodDescription = (foodId: number, isArtist: boolean) => {
    const options = isArtist ? artistFormContent.food_options : formContent.food_options;
    const option = options.find(o => o.id === foodId);
    return option?.description || '';
  };

  return (
    <Box sx={{ p: 2 }}>
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
          Food Options Overview
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
              {viewType === 'all' ? 'All Food Options' :
               viewType === 'regular' ? 'Regular Participants' : 'Artists'}
            </Button>
            <Menu
              anchorEl={viewTypeAnchorEl}
              open={viewTypeMenuOpen}
              onClose={handleViewTypeMenuClose}
            >
              <MenuItem onClick={() => handleViewTypeSelect('all')}>All Food Options</MenuItem>
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
            <Tab label="All Food Options" value="all" />
            <Tab label="Regular Participants" value="regular" />
            <Tab label="Artists" value="artist" />
          </Tabs>
        )}
      </Box>

      {/* Food options summary cards for non-mobile */}
      {!isMobile && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            {foodOptions.map((food) => (
              <Grid item xs={12} sm={6} md={4} key={`${food.bookingType}-${food.id}`}>
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: food.bookingType === 'artist' ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6">
                        {food.title}
                        {food.bookingType === 'artist' && (
                          <Chip label="Artist" color="primary" size="small" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenModal(food.id, food.bookingType)}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {getFoodDescription(food.id, food.bookingType === 'artist')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h5">{food.totalCount}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        bookings
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Food options table for mobile or as alternative view */}
      <TableContainer component={Paper} sx={{ display: isMobile ? 'block' : 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Food Option</TableCell>
              <TableCell>Bookings</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {foodOptions.map((food) => (
              <TableRow
                key={`${food.bookingType}-${food.id}`}
                sx={{
                  bgcolor: food.bookingType === 'artist' ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {food.bookingType === 'artist' && (
                      <Chip label="A" color="primary" size="small" sx={{ mr: 1 }} />
                    )}
                    {food.title}
                  </Box>
                </TableCell>
                <TableCell>{food.totalCount}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenModal(food.id, food.bookingType)}
                  >
                    <MoreHorizIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: 500,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 2
        }}>
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          {selectedFood !== null && selectedBookingType !== null && (
            <Box>
              <Typography color={"text.primary"} variant="h6" gutterBottom>
                {getOptionTitle(selectedFood,
                  selectedBookingType === 'artist' ? artistFormContent.food_options : formContent.food_options,
                  selectedBookingType === 'artist'
                )}
                {selectedBookingType === 'artist' && (
                  <Chip label="Artist Option" color="primary" size="small" sx={{ ml: 1 }} />
                )}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {getFoodDescription(selectedFood, selectedBookingType === 'artist')}
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    {!isMobile && <TableCell>Type</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getUsersForFood(selectedFood, selectedBookingType).map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>{user.first_name}</TableCell>
                      <TableCell>{user.last_name}</TableCell>
                      {!isMobile && (
                        <TableCell>
                          {user.is_artist ? (
                            <Chip label="Artist" color="primary" size="small" />
                          ) : (
                            <Chip label="Regular" size="small" />
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

export default FoodPage;