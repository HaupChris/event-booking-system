import React, { useState } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Modal, IconButton, LinearProgress,
    List, ListItem, ListItemText, Collapse, Button, Tabs, Tab,
    Chip, Menu, MenuItem, Card, CardContent, Grid, useTheme,
    useMediaQuery, Badge
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import HandymanIcon from '@mui/icons-material/Handyman';
import PersonIcon from '@mui/icons-material/Person';
import ListItemButton from "@mui/material/ListItemButton";
import { useFetchData } from './useFetchData';

const MaterialsPage: React.FC = () => {
    const { regularBookings, artistBookings, formContent, artistFormContent } = useFetchData();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State
    const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null);
    const [selectedMaterialType, setSelectedMaterialType] = useState<'regular' | 'artist' | null>(null);
    const [openMaterialModal, setOpenMaterialModal] = useState(false);
    const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
    const [materialSortOrder, setMaterialSortOrder] = useState<'asc' | 'desc'>('asc');
    const [peopleSortOrder, setPeopleSortOrder] = useState<'asc' | 'desc'>('asc');
    const [tabValue, setTabValue] = useState(0);
    const [viewType, setViewType] = useState('all'); // 'all', 'regular', 'artist'
    const [viewTypeAnchorEl, setViewTypeAnchorEl] = useState<null | HTMLElement>(null);
    const viewTypeMenuOpen = Boolean(viewTypeAnchorEl);

    // Tab handling (Materials vs People view)
    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue);
    };

    // Material modal handling
    const handleOpenMaterialModal = (materialId: number, materialType: 'regular' | 'artist') => {
        setSelectedMaterial(materialId);
        setSelectedMaterialType(materialType);
        setOpenMaterialModal(true);
    };

    const handleCloseMaterialModal = () => {
        setOpenMaterialModal(false);
        setSelectedMaterial(null);
        setSelectedMaterialType(null);
    };

    // View type dropdown menu
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

    // View type tabs
    const handleViewChange = (event: React.SyntheticEvent, newValue: string) => {
        setViewType(newValue);
    };

    // Helper to get material title
    const getOptionTitle = (id: number, options: { id: number; title: string }[]) => {
        const option = options.find(option => option.id === id);
        return option ? option.title : 'Unknown';
    };

    // Get users for a specific material by type
    const getUsersForMaterial = (materialId: number, materialType: 'regular' | 'artist') => {
        if (materialType === 'regular') {
            return regularBookings
                .filter(booking => booking.material_ids?.includes(materialId))
                .map(booking => ({
                    first_name: booking.first_name,
                    last_name: booking.last_name,
                    is_artist: false
                }));
        } else {
            return artistBookings
                .filter(booking => booking.artist_material_ids?.includes(materialId))
                .map(booking => ({
                    first_name: booking.first_name,
                    last_name: booking.last_name,
                    is_artist: true
                }));
        }
    };

    // Count materials
    const getMaterialCount = (materialId: number, materialType: 'regular' | 'artist') => {
        if (materialType === 'regular') {
            return regularBookings.reduce((count, booking) => {
                return count + (booking.material_ids?.includes(materialId) ? 1 : 0);
            }, 0);
        } else {
            return artistBookings.reduce((count, booking) => {
                return count + (booking.artist_material_ids?.includes(materialId) ? 1 : 0);
            }, 0);
        }
    };

    // Get materials for a specific user
    const getMaterialsForUser = (user: { first_name: string, last_name: string, is_artist?: boolean }) => {
        if (user.is_artist) {
            const userBookings = artistBookings.filter(
                booking => booking.first_name === user.first_name && booking.last_name === user.last_name
            );
            const materialIds = userBookings.flatMap(booking => booking.artist_material_ids || []);
            return artistFormContent.artist_materials.filter(material => materialIds.includes(material.id))
                .map(material => ({ ...material, is_artist: true }));
        } else {
            const userBookings = regularBookings.filter(
                booking => booking.first_name === user.first_name && booking.last_name === user.last_name
            );
            const materialIds = userBookings.flatMap(booking => booking.material_ids || []);
            return formContent.materials.filter(material => materialIds.includes(material.id))
                .map(material => ({ ...material, is_artist: false }));
        }
    };

    // Toggle expanded state for person
    const togglePersonExpanded = (personName: string) => {
        setExpandedPerson(expandedPerson === personName ? null : personName);
    };

    // Get combined materials based on view type
    const getCombinedMaterials = () => {
        const regularMaterials = viewType === 'all' || viewType === 'regular'
            ? formContent.materials.map(material => ({
                ...material,
                bookingType: 'regular',
                bookedCount: getMaterialCount(material.id, 'regular')
            }))
            : [];

        const artistMaterials = viewType === 'all' || viewType === 'artist'
            ? artistFormContent.artist_materials.map(material => ({
                ...material,
                bookingType: 'artist',
                bookedCount: getMaterialCount(material.id, 'artist')
            }))
            : [];

        return [...regularMaterials, ...artistMaterials];
    };

    // Get combined people based on view type
    const getCombinedPeople = () => {
        const regularPeople = viewType === 'all' || viewType === 'regular'
            ? regularBookings.map(booking => ({
                first_name: booking.first_name,
                last_name: booking.last_name,
                is_artist: false,
                id: booking.id
            }))
            : [];

        const artistPeople = viewType === 'all' || viewType === 'artist'
            ? artistBookings.map(booking => ({
                first_name: booking.first_name,
                last_name: booking.last_name,
                is_artist: true,
                id: booking.id
            }))
            : [];

        return [...regularPeople, ...artistPeople];
    };

    // Sort materials
    const sortedMaterials = getCombinedMaterials().sort((a, b) => {
        const progressA = a.bookedCount / a.num_needed;
        const progressB = b.bookedCount / b.num_needed;
        return materialSortOrder === 'asc' ? progressA - progressB : progressB - progressA;
    });

    // Sort people
    const sortedPeople = getCombinedPeople().sort((a, b) => {
        if (peopleSortOrder === 'asc') {
            return a.first_name.localeCompare(b.first_name);
        } else {
            return b.first_name.localeCompare(a.first_name);
        }
    });

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
                    Materials Overview
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
                            {viewType === 'all' ? 'All Materials' :
                            viewType === 'regular' ? 'Regular Materials' : 'Artist Materials'}
                        </Button>
                        <Menu
                            anchorEl={viewTypeAnchorEl}
                            open={viewTypeMenuOpen}
                            onClose={handleViewTypeMenuClose}
                        >
                            <MenuItem onClick={() => handleViewTypeSelect('all')}>All Materials</MenuItem>
                            <MenuItem onClick={() => handleViewTypeSelect('regular')}>Regular Materials</MenuItem>
                            <MenuItem onClick={() => handleViewTypeSelect('artist')}>Artist Materials</MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Tabs
                        value={viewType}
                        onChange={handleViewChange}
                        sx={{ minWidth: '300px' }}
                    >
                        <Tab label="All Materials" value="all" />
                        <Tab label="Regular Materials" value="regular" />
                        <Tab label="Artist Materials" value="artist" />
                    </Tabs>
                )}
            </Box>

            {/* Main tabs (Material vs People view) */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    centered
                    variant={isMobile ? "fullWidth" : "standard"}
                >
                    <Tab
                        label={isMobile ? "Materials" : "Material Overview"}
                        icon={isMobile ? <HandymanIcon /> : undefined}
                        iconPosition="start"
                    />
                    <Tab
                        label={isMobile ? "People" : "People Overview"}
                        icon={isMobile ? <PersonIcon /> : undefined}
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            {/* Material Overview Tab */}
            {tabValue === 0 && (
                <>
                    <Box
                        display="flex"
                        justifyContent="flex-end"
                        mb={2}
                        sx={{ flexDirection: isMobile ? 'column' : 'row', gap: 1 }}
                    >
                        <Typography variant="body2" sx={{ flexGrow: 1, display: isMobile ? 'none' : 'block' }}>
                            Showing {sortedMaterials.length} materials sorted by progress
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            size={isMobile ? "small" : "medium"}
                            onClick={() => setMaterialSortOrder(materialSortOrder === 'asc' ? 'desc' : 'asc')}
                            startIcon={materialSortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                            fullWidth={isMobile}
                        >
                            {materialSortOrder === 'asc' ? 'Lowest First' : 'Highest First'}
                        </Button>
                    </Box>

                    {/* Materials grid for desktop */}
                    {!isMobile && (
                        <Grid container spacing={2}>
                            {sortedMaterials.map((material) => {
                                const progress = (material.bookedCount / material.num_needed) * 100;
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={`${material.bookingType}-${material.id}`}>
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                bgcolor: material.bookingType === 'artist' ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                                            }}
                                        >
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <Typography variant="h6">
                                                        {material.title}
                                                        {material.bookingType === 'artist' && (
                                                            <Chip label="Artist" color="primary" size="small" sx={{ ml: 1 }} />
                                                        )}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenMaterialModal(
                                                            material.id,
                                                            material.bookingType as 'regular' | 'artist'
                                                        )}
                                                    >
                                                        <MoreHorizIcon />
                                                    </IconButton>
                                                </Box>

                                                <Box sx={{ mt: 2 }}>
                                                    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                                        <Box width="100%" mr={1}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={progress}
                                                                color={progress >= 100 ? "success" : "primary"}
                                                            />
                                                        </Box>
                                                        <Box minWidth={45}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {`${material.bookedCount}/${material.num_needed}`}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Typography variant="body2" color="text.secondary">
                                                        {progress < 100 ?
                                                            `Need ${material.num_needed - material.bookedCount} more` :
                                                            'Complete!'}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}

                    {/* Materials table for mobile */}
                    {isMobile && (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Material</TableCell>
                                        <TableCell>Progress</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedMaterials.map((material) => {
                                        const progress = (material.bookedCount / material.num_needed) * 100;
                                        return (
                                            <TableRow
                                                key={`${material.bookingType}-${material.id}`}
                                                sx={{
                                                    bgcolor: material.bookingType === 'artist' ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                                                }}
                                            >
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        {material.bookingType === 'artist' && (
                                                            <Chip label="A" color="primary" size="small" />
                                                        )}
                                                        {material.title}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={progress}
                                                            sx={{ flexGrow: 1, minWidth: 40 }}
                                                        />
                                                        <Typography variant="caption">
                                                            {`${material.bookedCount}/${material.num_needed}`}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenMaterialModal(
                                                            material.id,
                                                            material.bookingType as 'regular' | 'artist'
                                                        )}
                                                    >
                                                        <MoreHorizIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </>
            )}

            {/* People Overview Tab */}
            {tabValue === 1 && (
                <>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                        sx={{ flexDirection: isMobile ? 'column' : 'row', gap: 1 }}
                    >
                        <Typography variant="body2" sx={{ display: isMobile ? 'none' : 'block' }}>
                            Showing {sortedPeople.length} people with materials
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            size={isMobile ? "small" : "medium"}
                            onClick={() => setPeopleSortOrder(peopleSortOrder === 'asc' ? 'desc' : 'asc')}
                            startIcon={peopleSortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                            fullWidth={isMobile}
                        >
                            {peopleSortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                        </Button>
                    </Box>

                    <Paper>
                        <List>
                            {sortedPeople.map((person, index) => {
                                const personName = `${person.first_name} ${person.last_name}`;
                                const materials = getMaterialsForUser(person);

                                // Only show people who are bringing materials
                                if (materials.length === 0) return null;

                                return (
                                    <React.Fragment key={`${person.is_artist ? 'artist' : 'regular'}-${person.id}`}>
                                        <ListItemButton
                                            sx={{
                                                backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                                                bgcolor: person.is_artist ? 'rgba(25, 118, 210, 0.08)' : undefined
                                            }}
                                            onClick={() => togglePersonExpanded(personName)}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {person.is_artist && (
                                                            <Chip label="Artist" color="primary" size="small" />
                                                        )}
                                                        {personName}
                                                    </Box>
                                                }
                                                secondary={`Bringing ${materials.length} item${materials.length !== 1 ? 's' : ''}`}
                                            />
                                            <Badge
                                                badgeContent={materials.length}
                                                color="primary"
                                                sx={{ mr: 1 }}
                                            >
                                                <HandymanIcon color="action" />
                                            </Badge>
                                            {expandedPerson === personName ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </ListItemButton>

                                        <Collapse in={expandedPerson === personName} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding>
                                                {materials.map(material => (
                                                    <ListItem
                                                        key={`${material.is_artist ? 'artist' : 'regular'}-${material.id}`}
                                                        sx={{ pl: 4 }}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    {material.is_artist && (
                                                                        <Chip
                                                                            label="A"
                                                                            color="primary"
                                                                            size="small"
                                                                            sx={{ mr: 1 }}
                                                                        />
                                                                    )}
                                                                    {material.title}
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Collapse>
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    </Paper>
                </>
            )}

            {/* Material Details Modal */}
            <Modal open={openMaterialModal} onClose={handleCloseMaterialModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '90vw', maxWidth: 500, bgcolor: 'background.paper',
                    borderRadius: 2, boxShadow: 24, p: 2
                }}>
                    <IconButton onClick={handleCloseMaterialModal} sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <CloseIcon />
                    </IconButton>

                    {selectedMaterial !== null && selectedMaterialType !== null && (
                        <Box>
                            <Typography color={"text.primary"} variant="h6" gutterBottom sx={{ pr: 4 }}>
                                {getOptionTitle(
                                    selectedMaterial,
                                    selectedMaterialType === 'artist' ?
                                        artistFormContent.artist_materials :
                                        formContent.materials
                                )}
                                {selectedMaterialType === 'artist' && (
                                    <Chip label="Artist Material" color="primary" size="small" sx={{ ml: 1 }} />
                                )}
                            </Typography>

                            {/* Show count of people */}
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {getUsersForMaterial(selectedMaterial, selectedMaterialType).length} people
                                are bringing this item
                            </Typography>

                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            {!isMobile && <TableCell>Type</TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {getUsersForMaterial(selectedMaterial, selectedMaterialType)
                                            .map((user, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {user.is_artist && isMobile && (
                                                                <Chip label="A" color="primary" size="small" />
                                                            )}
                                                            {user.first_name} {user.last_name}
                                                        </Box>
                                                    </TableCell>
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
                            </TableContainer>
                        </Box>
                    )}
                </Box>
            </Modal>
        </Box>
    );
};

export default MaterialsPage;