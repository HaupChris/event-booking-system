import React, {useState} from 'react';
import {
    Box, Typography, Modal, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip
} from '@mui/material';
import {
    Person as PersonIcon,
    Handyman as HandymanIcon,
    Close as CloseIcon,
    People,
    Mic,
} from '@mui/icons-material';
import {useFetchData} from './useFetchData';
import TabSwitcher from './components/TabSwitcher';
import ProgressList from './components/ProgressList';
import PeopleList from './components/PeopleList';
import FilterSortBar from './components/FilterSortBar';
import FormCard from '../../components/core/display/FormCard';
import type {ViewFilterType} from './utils/optionsUtils';
import {useModal} from '../../hooks/useModal';
import {useSort} from '../../hooks/useSort';
import {transformMaterialsToProgressItems, transformBookingsToPeopleItems} from './transformers/materialTransformers';
import {getUsersForMaterial} from './utils/materialUtils';

interface MaterialModalData {
    material: any;
    materialType: 'regular' | 'artist';
}

const MaterialsPage: React.FC = () => {
    const {regularBookings, artistBookings, formContent, artistFormContent} = useFetchData();

    // Tab state
    const [activeTab, setActiveTab] = useState('materials');
    const [viewType, setViewType] = useState<ViewFilterType>('all');

    // Custom hooks for state management
    const {
        selectedItem: selectedMaterialData,
        isOpen: openMaterialModal,
        open: openModal,
        close: handleCloseMaterialModal
    } = useModal<MaterialModalData>();

    const {
        sortBy: materialSortBy,
        setSortBy: setMaterialSortBy,
        sortOrder: materialSortOrder,
        toggleOrder: handleToggleMaterialSort
    } = useSort<'progress' | 'name'>('name', 'asc');

    const {
        sortBy: peopleSortBy,
        setSortBy: setPeopleSortBy,
        sortOrder: peopleSortOrder,
        toggleOrder: handleTogglePeopleSort
    } = useSort<'name' | 'materials'>('name', 'asc');

    // Modal handler
    const handleOpenMaterialModal = (material: any, materialType: 'regular' | 'artist') => {
        openModal({material, materialType});
    };

    // Transform data using transformers
    const materialsToProgressItems = () => transformMaterialsToProgressItems({
        regularBookings,
        artistBookings,
        formContent,
        artistFormContent,
        viewType,
        sortBy: materialSortBy,
        sortOrder: materialSortOrder,
        onMaterialClick: handleOpenMaterialModal
    });

    const bookingsToPeopleItems = () => transformBookingsToPeopleItems({
        regularBookings,
        artistBookings,
        formContent,
        artistFormContent,
        viewType,
        sortBy: peopleSortBy,
        sortOrder: peopleSortOrder
    });

    // Sort handlers
    const handleMaterialSortByChange = (value: string) => {
        setMaterialSortBy(value as 'progress' | 'name');
    };

    const handlePeopleSortByChange = (value: string) => {
        setPeopleSortBy(value as 'name' | 'materials');
    };

    return (
        <Box sx={{p: 2}}>
            {/* Header with title */}
            <Typography variant="h5" gutterBottom>
                Materials Overview
            </Typography>

            {/* Main tabs (Materials vs People view) */}
            <TabSwitcher
                tabs={[
                    {value: 'materials', label: 'Material Overview', icon: <HandymanIcon/>},
                    {value: 'people', label: 'People Overview', icon: <People/>}
                ]}
                currentTab={activeTab}
                onChange={setActiveTab}
            />

            {/* View Type Controls */}
            <FormCard sx={{mb: 3}}>
                <Box sx={{p: 1}}>
                    <TabSwitcher
                        tabs={[
                            {value: 'all', label: 'All', icon: <People/>},
                            {value: 'regular', label: 'Regular', icon: <PersonIcon/>},
                            {value: 'artist', label: 'Artist', icon: <Mic/>}
                        ]}
                        currentTab={viewType}
                        onChange={setViewType as any}
                    />
                </Box>
            </FormCard>

            {/* Material Overview Tab */}
            {activeTab === 'materials' && (
                <>
                    <FilterSortBar
                        sortOptions={[
                            {value: 'progress', label: 'Progress'},
                            {value: 'name', label: 'Name'}
                        ]}
                        sortBy={materialSortBy}
                        sortOrder={materialSortOrder}
                        onSortByChange={handleMaterialSortByChange}
                        onSortOrderToggle={handleToggleMaterialSort}
                    >
                        <Typography variant="body2">
                            Showing {materialsToProgressItems().length} materials sorted by {materialSortBy}
                        </Typography>
                    </FilterSortBar>

                    <ProgressList
                        items={materialsToProgressItems()}
                    />
                </>
            )}

            {/* People Overview Tab */}
            {activeTab === 'people' && (
                <>
                    <FilterSortBar
                        sortOptions={[
                            {value: 'name', label: 'Name'},
                            {value: 'materials', label: 'Materials Count'}
                        ]}
                        sortBy={peopleSortBy}
                        sortOrder={peopleSortOrder}
                        onSortByChange={handlePeopleSortByChange}
                        onSortOrderToggle={handleTogglePeopleSort}
                    >
                        <Typography variant="body2">
                            Showing {bookingsToPeopleItems().length} people bringing materials sorted by {peopleSortBy}
                        </Typography>
                    </FilterSortBar>

                    <PeopleList
                        people={bookingsToPeopleItems()}
                    />
                </>
            )}

            {/* Material Details Modal */}
            <Modal open={openMaterialModal} onClose={handleCloseMaterialModal}>
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
                    <Box sx={{position: 'absolute', top: 8, right: 8}}>
                        <Chip
                            icon={<CloseIcon/>}
                            label="Close"
                            onClick={handleCloseMaterialModal}
                            variant="outlined"
                        />
                    </Box>

                    {selectedMaterialData && (
                        <Box>
                            <Box sx={{mb: 3, pr: 4}}>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                    <Typography variant="h6" color="text.primary">
                                        {selectedMaterialData.material.title}
                                    </Typography>
                                    {selectedMaterialData.materialType === 'artist' && (
                                        <Chip label="Artist Material" color="primary" size="small" sx={{ml: 1}}/>
                                    )}
                                </Box>

                                <Typography variant="body2" color="text.secondary">
                                    {getUsersForMaterial(
                                        selectedMaterialData.material.id,
                                        selectedMaterialData.materialType,
                                        regularBookings,
                                        artistBookings
                                    ).length} people are bringing this item (needed: {selectedMaterialData.material.num_needed})
                                </Typography>
                            </Box>

                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Type</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {getUsersForMaterial(
                                            selectedMaterialData.material.id,
                                            selectedMaterialData.materialType,
                                            regularBookings,
                                            artistBookings
                                        ).map((user, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {user.first_name} {user.last_name}
                                                </TableCell>
                                                <TableCell>
                                                    {user.is_artist ? (
                                                        <Chip label="Artist" color="primary" size="small"/>
                                                    ) : (
                                                        <Chip label="Regular" size="small"/>
                                                    )}
                                                </TableCell>
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