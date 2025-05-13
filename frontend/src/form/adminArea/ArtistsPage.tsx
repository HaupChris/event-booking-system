// src/form/adminArea/ArtistsPage.tsx
import React, {useState} from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Modal, IconButton, Collapse,
    List, ListItem, ListItemText, Grid, Chip,
    Button, TextField, FormControl, InputLabel, Select, MenuItem,
    Divider, Alert, Snackbar, InputAdornment
} from '@mui/material';
import {
    MoreHoriz, Close, ExpandMore, ExpandLess, Edit, Save,
    MusicNote, ArrowUpward, ArrowDownward, FilterList
} from '@mui/icons-material';
import {useFetchData} from './useFetchData';
import axios from 'axios';
import {TokenContext} from "../../contexts/AuthContext";

const ArtistsPage: React.FC = () => {
    const {artistBookings, artistFormContent, refetch} = useFetchData();
    const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
    const [editedArtist, setEditedArtist] = useState<any | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [expandedArtist, setExpandedArtist] = useState<number | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [sortCriterion, setSortCriterion] = useState('last_name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const {token} = React.useContext(TokenContext);

    // Handler for opening artist details modal
    const handleOpenModal = (artist: any) => {
        setSelectedArtist(artist);
        setEditedArtist({...artist}); // Create a copy for editing
        setOpenModal(true);
        setEditMode(false);
    };

    // Close modal
    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedArtist(null);
        setEditedArtist(null);
        setEditMode(false);
    };

    // Toggle edit mode in modal
    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    // Toggle artist details expansion
    const toggleArtistExpanded = (artistId: number) => {
        setExpandedArtist(expandedArtist === artistId ? null : artistId);
    };

    // Handle input changes in edit form
    const handleInputChange = (field: string, value: any) => {
        if (editedArtist) {
            setEditedArtist({
                ...editedArtist,
                [field]: value
            });
        }
    };

    // Save changes to artist
    const handleSaveChanges = async () => {
        if (!editedArtist) return;

        try {
            await axios.put(`/api/artist/booking/${editedArtist.id}`, editedArtist, {
                headers: {Authorization: `Bearer ${token}`}
            });

            setSnackbarMessage('Artist information updated successfully');
            setSnackbarSeverity('success');
            setShowSnackbar(true);
            refetch(); // Refresh data
            setEditMode(false);
        } catch (error) {
            console.error('Error updating artist:', error);
            setSnackbarMessage('Failed to update artist information');
            setSnackbarSeverity('error');
            setShowSnackbar(true);
        }
    };

    // Close snackbar
    const handleCloseSnackbar = () => {
        setShowSnackbar(false);
    };

    // Helper function to get option title
    const getOptionTitle = (id: number, options: any[]) => {
        const option = options.find(opt => opt.id === id);
        return option ? option.title : 'Unknown';
    };

    // Format performance details for display
    const formatPerformanceDetails = (detailsJson: string) => {
        try {
            const details = JSON.parse(detailsJson);
            return (
                <Box>
                    {details.preferredDay && (
                        <Box sx={{mb: 1}}>
                            <Typography variant="subtitle2" component="span">Preferred Day: </Typography>
                            <Typography variant="body2" component="span">{details.preferredDay}</Typography>
                        </Box>
                    )}
                    {details.preferredTime && (
                        <Box sx={{mb: 1}}>
                            <Typography variant="subtitle2" component="span">Preferred Time: </Typography>
                            <Typography variant="body2" component="span">{details.preferredTime}</Typography>
                        </Box>
                    )}
                    {details.duration && (
                        <Box sx={{mb: 1}}>
                            <Typography variant="subtitle2" component="span">Duration: </Typography>
                            <Typography variant="body2" component="span">{details.duration} minutes</Typography>
                        </Box>
                    )}
                    {details.genre && (
                        <Box sx={{mb: 1}}>
                            <Typography variant="subtitle2" component="span">Genre: </Typography>
                            <Typography variant="body2" component="span">{details.genre}</Typography>
                        </Box>
                    )}
                    {details.description && (
                        <Box sx={{mb: 1}}>
                            <Typography variant="subtitle2">Description: </Typography>
                            <Typography variant="body2">{details.description}</Typography>
                        </Box>
                    )}
                    {details.bandMembers && (
                        <Box sx={{mb: 1}}>
                            <Typography variant="subtitle2">Band Members: </Typography>
                            <Typography variant="body2">{details.bandMembers}</Typography>
                        </Box>
                    )}
                </Box>
            );
        } catch (e) {
            return detailsJson || 'No details available';
        }
    };

    // Sort artists based on criteria
    const sortArtists = (a: any, b: any) => {
        const compare = (aValue: string | number, bValue: string | number) => {
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        };

        switch (sortCriterion) {
            case 'first_name':
                return compare(a.first_name, b.first_name);
            case 'last_name':
                return compare(a.last_name, b.last_name);
            case 'timestamp':
                return compare(a.timestamp, b.timestamp);
            default:
                return compare(a.last_name, b.last_name);
        }
    };

    // Filter artists based on search query
    const filteredArtists = artistBookings.filter(artist =>
        artist.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{p: 2}}>
            <Typography variant="h4" gutterBottom>Artists</Typography>

            {/* Search and filter */}
            <Box mx={2} mb={2}>
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
                                <FilterList/>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Sorting controls */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mx={2} mb={2}>
                <FormControl variant="outlined" size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={sortCriterion}
                        onChange={(e) => setSortCriterion(e.target.value as string)}
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
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    startIcon={sortOrder === 'asc' ? <ArrowUpward/> : <ArrowDownward/>}
                >
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
            </Box>

            {/* Artists table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Attendance</TableCell>
                            <TableCell>Genre</TableCell>
                            <TableCell>Payment Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredArtists.sort(sortArtists).map((artist) => {
                            // Try to extract genre from performance details
                            let genre = 'Not specified';
                            try {
                                if (artist.performance_details) {
                                    const details = JSON.parse(artist.performance_details);
                                    genre = details.genre || 'Not specified';
                                }
                            } catch (e) {
                            }

                            return (
                                <React.Fragment key={artist.id}>
                                    <TableRow
                                        sx={{
                                            '& > *': {borderBottom: 'unset'},
                                            bgcolor: artist.is_paid ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)'
                                        }}
                                    >
                                        <TableCell onClick={() => toggleArtistExpanded(artist.id)}
                                                   style={{cursor: 'pointer'}}>
                                            <Box display="flex" alignItems="center">
                                                {expandedArtist === artist.id ?
                                                    <ExpandLess sx={{mr: 1}}/> :
                                                    <ExpandMore sx={{mr: 1}}/>}
                                                {artist.first_name} {artist.last_name}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{artist.email}</TableCell>
                                        <TableCell>
                                            {getOptionTitle(artist.ticket_id, artistFormContent.ticket_options)}
                                        </TableCell>
                                        <TableCell>{genre}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={artist.is_paid ? 'Paid' : 'Unpaid'}
                                                color={artist.is_paid ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleOpenModal(artist)}>
                                                <MoreHoriz/>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>

                                    {/* Expandable row for quick details */}
                                    <TableRow>
                                        <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                                            <Collapse in={expandedArtist === artist.id} timeout="auto" unmountOnExit>
                                                <Box sx={{margin: 1, padding: 2, bgcolor: 'background.paper'}}>
                                                    <Typography variant="h6" gutterBottom>
                                                        <MusicNote sx={{verticalAlign: 'middle', mr: 1}}/>
                                                        Performance Details
                                                    </Typography>

                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} md={6}>
                                                            <Typography variant="subtitle1">Equipment
                                                                Needs:</Typography>
                                                            <Typography
                                                                variant="body2">{artist.equipment || 'None specified'}</Typography>
                                                        </Grid>

                                                        <Grid item xs={12} md={6}>
                                                            <Typography variant="subtitle1">Special
                                                                Requests:</Typography>
                                                            <Typography
                                                                variant="body2">{artist.special_requests || 'None specified'}</Typography>
                                                        </Grid>

                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle1">Performance
                                                                Details:</Typography>
                                                            <Box sx={{mt: 1}}>
                                                                {formatPerformanceDetails(artist.performance_details || '{}')}
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Artist detail/edit modal */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '90vw', maxWidth: 700, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 2,
                    maxHeight: '90vh', overflow: 'auto'
                }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                            {editMode ? 'Edit Artist' : 'Artist Details'}
                            <Chip label="Artist" color="primary" size="small" sx={{ml: 1}}/>
                        </Typography>
                        <Box>
                            <IconButton onClick={toggleEditMode} sx={{mr: 1}}>
                                {editMode ? <Save onClick={handleSaveChanges}/> : <Edit/>}
                            </IconButton>
                            <IconButton onClick={handleCloseModal}>
                                <Close/>
                            </IconButton>
                        </Box>
                    </Box>

                    {editedArtist && (
                        <Box>
                            <Grid container spacing={2}>
                                {/* Personal Information */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="primary" gutterBottom>
                                        Personal Information
                                    </Typography>
                                    <Divider sx={{mb: 2}}/>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        value={editedArtist.first_name}
                                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        value={editedArtist.last_name}
                                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        value={editedArtist.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        value={editedArtist.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>

                                {/* Festival Attendance */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="primary" gutterBottom sx={{mt: 2}}>
                                        Festival Attendance
                                    </Typography>
                                    <Divider sx={{mb: 2}}/>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Ticket</InputLabel>
                                        <Select
                                            value={editedArtist.ticket_id}
                                            onChange={(e) => handleInputChange('ticket_id', e.target.value)}
                                            disabled={!editMode}
                                            label="Ticket"
                                        >
                                            {artistFormContent.ticket_options.map((ticket) => (
                                                <MenuItem key={ticket.id} value={ticket.id}>
                                                    {ticket.title} - €{ticket.price}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Beverage</InputLabel>
                                        <Select
                                            value={editedArtist.beverage_id}
                                            onChange={(e) => handleInputChange('beverage_id', e.target.value)}
                                            disabled={!editMode}
                                            label="Beverage"
                                        >
                                            <MenuItem value={-1}>No Beverage</MenuItem>
                                            {artistFormContent.beverage_options.map((beverage) => (
                                                <MenuItem key={beverage.id} value={beverage.id}>
                                                    {beverage.title} - €{beverage.price}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Food</InputLabel>
                                        <Select
                                            value={editedArtist.food_id}
                                            onChange={(e) => handleInputChange('food_id', e.target.value)}
                                            disabled={!editMode}
                                            label="Food"
                                        >
                                            <MenuItem value={-1}>No Food</MenuItem>
                                            {artistFormContent.food_options.map((food) => (
                                                <MenuItem key={food.id} value={food.id}>
                                                    {food.title} - €{food.price}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Performance Details */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="primary" gutterBottom sx={{mt: 2}}>
                                        Performance Details
                                    </Typography>
                                    <Divider sx={{mb: 2}}/>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Equipment Details"
                                        value={editedArtist.equipment || ''}
                                        onChange={(e) => handleInputChange('equipment', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                        placeholder="Technical requirements, instruments, equipment needs"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Special Requests"
                                        value={editedArtist.special_requests || ''}
                                        onChange={(e) => handleInputChange('special_requests', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                        placeholder="Any special accommodations or requests"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Performance Details"
                                        value={editedArtist.performance_details || ''}
                                        onChange={(e) => handleInputChange('performance_details', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                        placeholder="JSON format with performance preferences"
                                        helperText={!editMode && "Contains structured data about preferred day, time, genre, etc."}
                                    />
                                </Grid>

                                {/* Materials */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="primary" gutterBottom sx={{mt: 2}}>
                                        Materials
                                    </Typography>
                                    <Divider sx={{mb: 2}}/>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body2" gutterBottom>
                                        Materials the artist is bringing:
                                    </Typography>
                                    <Box sx={{pl: 2}}>
                                        {(editedArtist.artist_material_ids || []).length > 0 ? (
                                            <List dense>
                                                {(editedArtist.artist_material_ids || []).map((materialId: number) => {
                                                    const material = artistFormContent.artist_materials.find(m => m.id === materialId);
                                                    return (
                                                        <ListItem key={materialId}>
                                                            <ListItemText
                                                                primary={material ? material.title : `Material ID: ${materialId}`}/>
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                No materials selected
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                                {/* Payment Information */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="primary" gutterBottom sx={{mt: 2}}>
                                        Payment Information
                                    </Typography>
                                    <Divider sx={{mb: 2}}/>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Total Price"
                                        type="number"
                                        value={editedArtist.total_price}
                                        onChange={(e) => handleInputChange('total_price', parseFloat(e.target.value))}
                                        disabled={!editMode}
                                        margin="normal"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Payment Status</InputLabel>
                                        <Select
                                            value={editedArtist.is_paid ? 1 : 0}
                                            onChange={(e) => handleInputChange('is_paid', e.target.value === 1)}
                                            disabled={!editMode}
                                            label="Payment Status"
                                        >
                                            <MenuItem value={1}>Paid</MenuItem>
                                            <MenuItem value={0}>Unpaid</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Paid Amount"
                                        type="number"
                                        value={editedArtist.paid_amount || 0}
                                        onChange={(e) => handleInputChange('paid_amount', parseFloat(e.target.value))}
                                        disabled={!editMode}
                                        margin="normal"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Payment Date"
                                        type="date"
                                        value={editedArtist.payment_date || ''}
                                        onChange={(e) => handleInputChange('payment_date', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                        InputLabelProps={{shrink: true}}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label="Payment Notes"
                                        value={editedArtist.payment_notes || ''}
                                        onChange={(e) => handleInputChange('payment_notes', e.target.value)}
                                        disabled={!editMode}
                                        margin="normal"
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Box>
            </Modal>

            <Snackbar
                open={showSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ArtistsPage;