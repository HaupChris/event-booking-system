import React, { useContext, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  InputAdornment,
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { TokenContext } from '../../contexts/AuthContext';
import { useFetchData } from './useFetchData';
import type { CombinedBooking } from './interface';
import BookingTable from './components/BookingTable';
import BookingDetailModal from './components/BookingDetailModal';
import BookingCustomMailDialog from './components/BookingCustomMailDialog';
import BookingBulkActionsBar from './components/BookingBulkActionsBar';
import BookingsDisplayControls from './components/BookingsDisplayControls';
import { filterBookings, getInviterFilterData, sortBookings } from './utils/bookingUtils';
import { useColumnVisibility } from '../../hooks/useColumnVisibility';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useBookingActions } from '../../hooks/useBookingActions';
import { useModal } from '../../hooks/useModal';
import { useSort } from '../../hooks/useSort';
import { useAdminPageFilters } from '../../hooks/useAdminPageFilters';
import type { AdminBookingMailSendResponse } from '../../services/adminBookingMailService';
import { useBookingSelection } from './hooks/useBookingSelection';

interface ColumnVisibility {
  [key: string]: boolean;
  type: boolean;
  name: boolean;
  email: boolean;
  invitedBy: boolean;
  ticket: boolean;
  price: boolean;
  profileLink: boolean;
  actions: boolean;
}

const BookingsPage: React.FC = () => {
  const { bookings, formContent, artistFormContent, refetch } = useFetchData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { token } = useContext(TokenContext);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedByFilter, setInvitedByFilter] = useState('all');
  const [customMailDialogOpen, setCustomMailDialogOpen] = useState(false);

  // Custom hooks for state management
  const {
    columnVisibility,
    anchorEl: columnFilterAnchorEl,
    handleOpen: handleColumnFilterOpen,
    handleClose: handleColumnFilterClose,
    toggleColumn: handleColumnVisibilityChange,
  } = useColumnVisibility<ColumnVisibility>({
    initialVisibility: {
      type: true,
      name: true,
      email: !isMobile,
      invitedBy: !isMobile,
      ticket: !isMobile,
      price: !isMobile,
      profileLink: !isMobile,
      actions: true,
    },
    mobileHiddenColumns: ['email', 'invitedBy', 'ticket', 'price', 'profileLink'],
    isMobile,
  });

  const {
    viewType,
    setViewType,
    anchorEl: viewTypeAnchorEl,
    setAnchorEl: setViewTypeAnchorEl,
  } = useAdminPageFilters();

  const {
    sortBy: sortCriterion,
    setSortBy: setSortCriterion,
    sortOrder,
    toggleOrder: toggleSortOrder,
  } = useSort<'first_name' | 'last_name' | 'timestamp'>('timestamp', 'desc');

  const {
    selectedItem: selectedBooking,
    isOpen: openModal,
    open: handleOpenModal,
    close: handleCloseModal,
  } = useModal<CombinedBooking>();

  const { snackbarState, showSuccess, showError, hideSnackbar } = useSnackbar();

  const { deleteBooking } = useBookingActions();
  const { inviterFilterOptions, hasUnassignedBookings } = getInviterFilterData(bookings);

  // Process bookings
  const processedBookings = sortBookings(
    filterBookings(bookings, viewType, searchQuery, invitedByFilter),
    sortCriterion,
    sortOrder
  );
  const {
    selectedBookingKeys,
    selectedRecipients,
    allVisibleSelected,
    someVisibleSelected,
    toggleSelectBooking,
    toggleSelectAllVisible,
    clearSelection,
    setSelectedBookingKeys,
  } = useBookingSelection(bookings, processedBookings);

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

  const handleCustomMailSent = (result: AdminBookingMailSendResponse) => {
    if (result.failed > 0) {
      showError(`Sent ${result.sent} emails, ${result.failed} failed.`);
    } else {
      showSuccess(`Sent ${result.sent} email${result.sent === 1 ? '' : 's'}.`);
    }

    setCustomMailDialogOpen(false);
    setSelectedBookingKeys(new Set());
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
    <Box sx={{ p: 2 }}>
      <BookingsDisplayControls
        isMobile={isMobile}
        viewType={viewType}
        viewTypeAnchorEl={viewTypeAnchorEl}
        columnFilterAnchorEl={columnFilterAnchorEl}
        columnVisibility={columnVisibility}
        onViewTypeMenuOpen={handleViewTypeMenuOpen}
        onViewTypeMenuClose={handleViewTypeMenuClose}
        onViewTypeSelect={handleViewTypeSelect}
        onViewChange={handleViewChange}
        onColumnFilterOpen={handleColumnFilterOpen}
        onColumnFilterClose={handleColumnFilterClose}
        onColumnVisibilityChange={(column) =>
          handleColumnVisibilityChange(column as keyof ColumnVisibility)
        }
      />

      {/* Search and Sort Controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          gap: 1,
        }}
      >
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
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: isMobile ? '100%' : '60%' }}
        />

        <FormControl variant="outlined" size="small" sx={{ minWidth: isMobile ? '100%' : 210 }}>
          <InputLabel>Invited By</InputLabel>
          <Select
            value={invitedByFilter}
            onChange={(event) => setInvitedByFilter(String(event.target.value))}
            label="Invited By"
          >
            <MenuItem value="all">All inviters</MenuItem>
            {hasUnassignedBookings && <MenuItem value="unassigned">Not selected</MenuItem>}
            {inviterFilterOptions.map((inviter) => (
              <MenuItem key={inviter.value} value={inviter.value}>
                {inviter.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort Controls */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: isMobile ? 1 : 0,
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
          }}
        >
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortCriterion}
              onChange={(e) =>
                setSortCriterion(e.target.value as 'first_name' | 'last_name' | 'timestamp')
              }
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
            startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            size="small"
          >
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </Button>
        </Box>
      </Box>

      <BookingBulkActionsBar
        isMobile={isMobile}
        selectedCount={selectedRecipients.length}
        onClearSelection={clearSelection}
        onOpenCustomMail={() => setCustomMailDialogOpen(true)}
      />

      {/* Bookings Table */}
      <BookingTable
        bookings={processedBookings}
        columnVisibility={columnVisibility}
        formContent={formContent}
        artistFormContent={artistFormContent}
        onOpenDetails={handleOpenModal}
        selectedBookingKeys={selectedBookingKeys}
        allVisibleSelected={allVisibleSelected}
        someVisibleSelected={someVisibleSelected}
        onToggleSelectAllVisible={toggleSelectAllVisible}
        onToggleSelectBooking={toggleSelectBooking}
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

      <BookingCustomMailDialog
        open={customMailDialogOpen}
        token={token}
        selectedRecipients={selectedRecipients}
        onClose={() => setCustomMailDialogOpen(false)}
        onSent={handleCustomMailSent}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={hideSnackbar} severity={snackbarState.severity}>
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookingsPage; // src/form/adminArea/BookingsPage.tsx (continued)
