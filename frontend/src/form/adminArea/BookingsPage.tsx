import React, {useState, useEffect, useContext} from 'react';
import {
    Box, Typography, FormControl, InputLabel, Select, MenuItem,
    Tooltip, IconButton, Button, TextField, Snackbar, Alert,
    useMediaQuery, useTheme, FormControlLabel, Checkbox, Menu,
    InputAdornment, Tab, Tabs
} from '@mui/material';
import {
    ViewColumn as ViewColumnIcon,
    FilterAlt as FilterAltIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import {TokenContext} from "../../contexts/AuthContext";
import {useFetchData} from "./useFetchData";
import {CombinedBooking} from "./interface";
import FormCard from "../../components/core/display/FormCard";
import BookingTable from "./components/BookingTable";
import BookingDetailModal from "./components/BookingDetailModal";
import {filterBookings, sortBookings} from './utils/bookingUtils';
import axios from "axios";

interface ColumnVisibility {
    type: boolean;
    name: boolean;
    email: boolean;
    ticket: boolean;
    price: boolean;
    actions: boolean;
}

const BookingsPage: React.FC = () => {
    const {bookings, formContent, artistFormContent, refetch} = useFetchData();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const {token} = useContext(TokenContext);

    // State for table columns
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
        type: true,
        name: true,
        email: !isMobile,
        ticket: !isMobile,
        price: !isMobile,
        actions: true,
    });
    const [columnFilterAnchorEl, setColumnFilterAnchorEl] = useState<null | HTMLElement>(null);

    // State for filtering and viewing
    const [viewType, setViewType] = useState<'all' | 'regular' | 'artist'>('all');
    const [viewTypeAnchorEl, setViewTypeAnchorEl] = useState<null | HTMLElement>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Sorting state
    const [sortCriterion, setSortCriterion] = useState<'first_name' | 'last_name' | 'timestamp'>('timestamp');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Modal state
    const [selectedBooking, setSelectedBooking] = useState<CombinedBooking | null>(null);
    const [openModal, setOpenModal] = useState(false);

    // Notification state
    const [snackbarState, setSnackbarState] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    // Update column visibility based on screen size
    useEffect(() => {
        setColumnVisibility(prev => ({
            ...prev,
            email: !isMobile,
            ticket: !isMobile,
            price: !isMobile,
        }));
    }, [isMobile]);

    // Process bookings
    const processedBookings = sortBookings(
        filterBookings(bookings, viewType, searchQuery),
        sortCriterion,
        sortOrder
    );

    // Handlers for column visibility
    const handleColumnFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
        setColumnFilterAnchorEl(event.currentTarget);
    };

    const handleColumnFilterClose = () => {
        setColumnFilterAnchorEl(null);
    };

    const handleColumnVisibilityChange = (column: keyof ColumnVisibility) => {
        setColumnVisibility(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    };

    // Handlers for view type
    const handleViewTypeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setViewTypeAnchorEl(event.currentTarget);
    };

    const handleViewTypeMenuClose = () => {
        setViewTypeAnchorEl(null);
    };

    const handleViewTypeSelect = (type: 'all' | 'regular' | 'artist') => {
        setViewType(type);
        handleViewTypeMenuClose();
    };

    const handleViewChange = (_: React.SyntheticEvent, newValue: 'all' | 'regular' | 'artist') => {
        setViewType(newValue);
    };

    // Handlers for sorting
    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    // Handlers for modal
    const handleOpenModal = (booking: CombinedBooking) => {
        setSelectedBooking(booking);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedBooking(null);
    };

    // Handlers for snackbar
    const handleCloseSnackbar = () => {
        setSnackbarState({...snackbarState, open: false});
    };

    const handleModalSuccess = () => {
        setSnackbarState({
            open: true,
            message: 'Booking updated successfully',
            severity: 'success'
        });
        refetch().then();
        handleCloseModal();
    };

    const handleModalError = (message: string) => {
        setSnackbarState({
            open: true,
            message,
            severity: 'error'
        });
    };

    const handleDeleteBooking = async (bookingId: number, bookingType: 'regular' | 'artist') => {
        try {
            // Determine endpoint based on booking type
            const endpoint = bookingType === 'artist'
                ? `/api/artist/booking/${bookingId}`
                : `/api/booking/${bookingId}`;

            await axios.delete(endpoint, {
                headers: {Authorization: `Bearer ${token}`}
            });

            // Show success notification
            setSnackbarState({
                open: true,
                message: 'Booking deleted successfully',
                severity: 'success'
            });

            // Refresh the data
            refetch().then();

            // Close the modal
            handleCloseModal();
        } catch (error) {
            console.error('Error deleting booking:', error);
            setSnackbarState({
                open: true,
                message: 'Failed to delete booking',
                severity: 'error'
            });
        }
    };


    return (
        <Box sx={{p: 2}}>
            {/* Control panel */}
            <FormCard
                title="Bookings Management"
                sx={{mb: 3}}
            >
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                    p: 1,
                }}>
                    {/* View Type Selection - Either Tabs or Dropdown based on screen size */}
                    {isMobile ? (
                        <Box>
                            <Button
                                variant="outlined"
                                onClick={handleViewTypeMenuOpen}
                                endIcon={<FilterAltIcon/>}
                                size="small"
                            >
                                {viewType === 'all' ? 'All Bookings' :
                                    viewType === 'regular' ? 'Regular' : 'Artists'}
                            </Button>
                            <Menu
                                anchorEl={viewTypeAnchorEl}
                                open={Boolean(viewTypeAnchorEl)}
                                onClose={handleViewTypeMenuClose}
                            >
                                <MenuItem onClick={() => handleViewTypeSelect('all')}>All Bookings</MenuItem>
                                <MenuItem onClick={() => handleViewTypeSelect('regular')}>Regular
                                    Participants</MenuItem>
                                <MenuItem onClick={() => handleViewTypeSelect('artist')}>Artists</MenuItem>
                            </Menu>
                        </Box>
                    ) : (
                        <Tabs
                            value={viewType}
                            onChange={handleViewChange}
                            sx={{minWidth: '300px'}}
                        >
                            <Tab label="All Bookings" value="all"/>
                            <Tab label="Regular Participants" value="regular"/>
                            <Tab label="Artists" value="artist"/>
                        </Tabs>
                    )}

                    {/* Column Visibility Button */}
                    <Box>
                        <Tooltip title="Select visible columns">
                            <IconButton
                                onClick={handleColumnFilterOpen}
                                color="primary"
                                size="small"
                            >
                                <ViewColumnIcon/>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={columnFilterAnchorEl}
                            open={Boolean(columnFilterAnchorEl)}
                            onClose={handleColumnFilterClose}
                        >
                            <MenuItem disabled>
                                <Typography variant="subtitle2">Show Columns</Typography>
                            </MenuItem>
                            {Object.keys(columnVisibility).map((column) => (
                                <MenuItem key={column}>
                                    <FormControlLabel
                                        control={
// src/form/adminArea/BookingsPage.tsx (continued)
                                            <Checkbox
                                                checked={columnVisibility[column as keyof ColumnVisibility]}
                                                onChange={() => handleColumnVisibilityChange(column as keyof ColumnVisibility)}
                                            />
                                        }
                                        label={column.charAt(0).toUpperCase() + column.slice(1)}
                                    />
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Box>
            </FormCard>

            {/* Search and Sort Controls */}
            <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                gap: 1,
            }}>
                {/* Search */}
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
                            </InputAdornment>
                        ),
                    }}
                    sx={{flexGrow: 1, maxWidth: isMobile ? '100%' : '60%'}}
                />

                {/* Sort Controls */}
                <Box sx={{
                    display: 'flex',
                    gap: 1,
                    mt: isMobile ? 1 : 0,
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'space-between' : 'flex-end'
                }}>
                    <FormControl variant="outlined" size="small" sx={{minWidth: 120}}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortCriterion}
                            onChange={(e) => setSortCriterion(e.target.value as 'first_name' | 'last_name' | 'timestamp')}
                            label="Sort By"
                        >
                            <MenuItem value="first_name">First Name</MenuItem>
                            <MenuItem value="last_name">Last Name</MenuItem>
                            <MenuItem value="timestamp">Registration Date</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={toggleSortOrder}
                        startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon/> : <ArrowDownwardIcon/>}
                        size="small"
                    >
                        {sortOrder === 'asc' ? 'Asc' : 'Desc'}
                    </Button>
                </Box>
            </Box>

            {/* Bookings Table */}
            <BookingTable
                bookings={processedBookings}
                columnVisibility={columnVisibility}
                formContent={formContent}
                artistFormContent={artistFormContent}
                onOpenDetails={handleOpenModal}
            />

            {/* Detail/Edit Modal */}
            <BookingDetailModal
                open={openModal}
                onClose={handleCloseModal}
                selectedBooking={selectedBooking}
                formContent={formContent}
                artistFormContent={artistFormContent}
                token={token}
                onSuccess={handleModalSuccess}
                onError={handleModalError}
                isMobile={isMobile}
                onDelete={handleDeleteBooking}
            />

            {/* Notification Snackbar */}
            <Snackbar
                open={snackbarState.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarState.severity}>
                    {snackbarState.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BookingsPage;// src/form/adminArea/BookingsPage.tsx (continued)
