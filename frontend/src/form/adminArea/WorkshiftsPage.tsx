import React, {useState} from 'react';
import {
    Box, Typography, Modal, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip
} from '@mui/material';
import {
    Work as WorkIcon,
    Person as PersonIcon,
    AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import {useFetchData} from './useFetchData';
import TabSwitcher from './components/TabSwitcher';
import ProgressList from './components/ProgressList';
import PeopleList from './components/PeopleList';
import FilterSortBar from './components/FilterSortBar';
import type {TimeSlot} from "../userArea/interface";
import {useModal} from "../../hooks/useModal";
import {useSort} from "../../hooks/useSort";
import {transformWorkshiftsToProgressItems, transformBookingsToPeopleItems} from './transformers/workshiftTransformers';
import {getUsersForTimeslot, getWorkshiftForTimeslot, timeslotPriorityToString} from './utils/workshiftUtils';


const WorkshiftsPage: React.FC = () => {
    const {regularBookings, formContent} = useFetchData();

    // Tab state
    const [activeTab, setActiveTab] = useState('workshifts');

    // Custom hooks for state management
    const {
        selectedItem: selectedTimeslot,
        isOpen: openTimeslotModal,
        open: handleOpenTimeslotModal,
        close: handleCloseTimeslotModal
    } = useModal<TimeSlot>();

    const {
        sortBy: workshiftSortBy,
        setSortBy: setWorkshiftSortBy,
        sortOrder: workshiftSortOrder,
        toggleOrder: handleToggleWorkshiftSort
    } = useSort<'progress' | 'name'>('progress', 'asc');

    const {
        sortBy: peopleSortBy,
        setSortBy: setPeopleSortBy,
        sortOrder: peopleSortOrder,
        toggleOrder: handleTogglePeopleSort
    } = useSort<'name' | 'shifts'>('name', 'asc');

    // Transform data using transformers
    const workshiftsToProgressItems = () => transformWorkshiftsToProgressItems({
        workshifts: formContent.work_shifts,
        bookings: regularBookings,
        sortBy: workshiftSortBy,
        sortOrder: workshiftSortOrder,
        onTimeslotClick: handleOpenTimeslotModal
    });

    const bookingsToPeopleItems = () => transformBookingsToPeopleItems({
        bookings: regularBookings,
        workshifts: formContent.work_shifts,
        sortBy: peopleSortBy,
        sortOrder: peopleSortOrder
    });

    // Sort handlers
    const handleWorkshiftSortByChange = (value: string) => {
        setWorkshiftSortBy(value as 'progress' | 'name');
    };

    const handlePeopleSortByChange = (value: string) => {
        setPeopleSortBy(value as 'name' | 'shifts');
    };

    return (
        <Box sx={{p: 2}}>
            {/* Header with title */}
            <Typography variant="h5" gutterBottom>
                Workshift Management
            </Typography>

            {/* Main tabs (Workshifts vs People view) */}
            <TabSwitcher
                tabs={[
                    {value: 'workshifts', label: 'Workshift Overview', icon: <WorkIcon/>},
                    {value: 'people', label: 'People Overview', icon: <PersonIcon/>}
                ]}
                currentTab={activeTab}
                onChange={setActiveTab}
            />

            {/* Workshift Overview Tab */}
            {activeTab === 'workshifts' && (
                <>
                    <FilterSortBar
                        sortOptions={[
                            {value: 'progress', label: 'Progress'},
                            {value: 'name', label: 'Name'}
                        ]}
                        sortBy={workshiftSortBy}
                        sortOrder={workshiftSortOrder}
                        onSortByChange={handleWorkshiftSortByChange}
                        onSortOrderToggle={handleToggleWorkshiftSort}
                    >
                        <Typography variant="body2">
                            Showing {formContent.work_shifts.length} workshifts sorted by {workshiftSortBy}
                        </Typography>
                    </FilterSortBar>

                    <ProgressList
                        items={workshiftsToProgressItems()}
                        sortOrder={workshiftSortOrder}
                    />
                </>
            )}

            {/* People Overview Tab */}
            {activeTab === 'people' && (
                <>
                    <FilterSortBar
                        sortOptions={[
                            {value: 'name', label: 'Name'},
                            {value: 'shifts', label: 'Amount Shifts'}
                        ]}
                        sortBy={peopleSortBy}
                        sortOrder={peopleSortOrder}
                        onSortByChange={handlePeopleSortByChange}
                        onSortOrderToggle={handleTogglePeopleSort}
                    >
                        <Typography variant="body2">
                            Showing {regularBookings.length} people sorted by {peopleSortBy}
                        </Typography>
                    </FilterSortBar>

                    <PeopleList
                        people={bookingsToPeopleItems()}
                    />
                </>
            )}

            {/* Timeslot Details Modal */}
            <Modal open={openTimeslotModal} onClose={handleCloseTimeslotModal}>
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
                    {selectedTimeslot && (
                        <>
                            <Box sx={{mb: 3, pr: 4}}>
                                <Typography variant="h6">
                                    People Assigned to {selectedTimeslot.title}
                                </Typography>

                                {/* Find workshift that contains this timeslot */}
                                {(() => {
                                    const workshift = getWorkshiftForTimeslot(selectedTimeslot.id, formContent.work_shifts);

                                    if (workshift) {
                                        return (
                                            <Box sx={{mt: 1}}>
                                                <Typography variant="subtitle2" color="primary.main">
                                                    {workshift.title}
                                                </Typography>
                                                <Typography variant="body2"
                                                            sx={{display: 'flex', alignItems: 'center', mt: 0.5}}>
                                                    <AccessTimeIcon sx={{mr: 0.5, fontSize: 'small'}}/>
                                                    {selectedTimeslot.start_time} - {selectedTimeslot.end_time}
                                                </Typography>
                                            </Box>
                                        );
                                    }
                                    return null;
                                })()}

                                <Box sx={{mt: 2, mb: 2}}>
                                    <Typography variant="body2" color="text.secondary">
                                        {getUsersForTimeslot(selectedTimeslot.id, regularBookings).length} people assigned out
                                        of {selectedTimeslot.num_needed} needed
                                    </Typography>
                                </Box>
                            </Box>

                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Priority</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {getUsersForTimeslot(selectedTimeslot.id, regularBookings)
                                            .sort((a, b) => a.priority - b.priority)
                                            .map((user) => (
                                                <TableRow key={`${user.first_name}-${user.last_name}-${user.priority}`}>
                                                    <TableCell>
                                                        {user.first_name} {user.last_name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={timeslotPriorityToString(user.priority)}
                                                            color={
                                                                user.priority === 1 ? "success" :
                                                                    user.priority === 2 ? "primary" :
                                                                        "warning"
                                                            }
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Box>
            </Modal>
        </Box>
    );
};

export default WorkshiftsPage;
