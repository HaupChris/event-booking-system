import React, {useState} from 'react';
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
import {useColumnVisibility} from "../../hooks/useColumnVisibility";
import {useSnackbar} from "../../hooks/useSnackbar";
import {useBookingActions} from "../../hooks/useBookingActions";
import {useModal} from "../../hooks/useModal";
import {useSort} from "../../hooks/useSort";
import {useAdminPageFilters} from "../../hooks/useAdminPageFilters";
import {useContext} from "react";

interface ColumnVisibility {
    [key: string]: boolean;
    type: boolean;
    name: boolean;
    email: boolean;
    ticket: boolean;
    price: boolean;
    profileLink: boolean;
    actions: boolean;
}

const BookingsPage: React.FC = () => {
    const {bookings, formContent, artistFormContent, refetch} = useFetchData();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const {token} = useContext(TokenContext);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // Custom hooks for state management
    const {
        columnVisibility,
        anchorEl: columnFilterAnchorEl,
        handleOpen: handleColumnFilterOpen,
        handleClose: handleColumnFilterClose,
        toggleColumn: handleColumnVisibilityChange
    } = useColumnVisibility<ColumnVisibility>({
        initialVisibility: {
            type: true,
            name: true,
            email: !isMobile,
            ticket: !isMobile,
            price: !isMobile,
            profileLink: !isMobile,
            actions: true,
        },
        mobileHiddenColumns: ['email', 'ticket', 'price', 'profileLink'],
        isMobile
    });

    const {viewType, setViewType, anchorEl: viewTypeAnchorEl, setAnchorEl: setViewTypeAnchorEl} = useAdminPageFilters();

    const {
        sortBy: sortCriterion,
        setSortBy: setSortCriterion,
        sortOrder,
        toggleOrder: toggleSortOrder
    } = useSort<'first_name' | 'last_name' | 'timestamp'>('timestamp', 'desc');

    const {
        selectedItem: selectedBooking,
        isOpen: openModal,
        open: handleOpenModal,
        close: handleCloseModal
    } = useModal<CombinedBooking>();

    const {
        snackbarState,
        showSuccess,
        showError,
        hideSnackbar
    } = useSnackbar();

    const {deleteBooking} = useBookingActions();

    // Process bookings
    const processedBookings = sortBookings(
        filterBookings(bookings, viewType, searchQuery),
        sortCriterion,
        sortOrder
    );

    // Handlers for view type menu
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

    // Handlers for modal actions
    const handleModalSuccess = () => {
        showSuccess('Booking updated successfully');
        refetch().then();
        handleCloseModal();
    };

    const handleModalError = (message: string) => {
        showError(message);
    };

    const handleDeleteBooking = async (bookingId: number, bookingType: 'regular' | 'artist') => {
        try {
            await deleteBooking(bookingId, bookingType);
            showSuccess('Booking deleted successfully');
            refetch().then();
            handleCloseModal();
        } catch (error) {
            showError('Failed to delete booking');
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
                onClose={hideSnackbar}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert onClose={hideSnackbar} severity={snackbarState.severity}>
                    {snackbarState.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BookingsPage;// src/form/adminArea/BookingsPage.tsx (continued)
