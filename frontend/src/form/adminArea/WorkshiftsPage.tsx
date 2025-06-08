import React, {useState} from 'react';
import {
    Box, Typography, Modal, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip, alpha, Grid
} from '@mui/material';
import {
    Work as WorkIcon,
    Person as PersonIcon,
    AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import {useFetchData} from './useFetchData';
import TabSwitcher from './components/TabSwitcher';
import ProgressList, {ProgressItem} from './components/ProgressList';
import PeopleList, {Person} from './components/PeopleList';
import FilterSortBar from './components/FilterSortBar';
import {spacePalette} from '../../components/styles/theme';
import {TimeSlot} from "../userArea/interface";


const WorkshiftsPage: React.FC = () => {
    const {regularBookings, formContent} = useFetchData();

    // State
    const [activeTab, setActiveTab] = useState('workshifts');
    const [selectedTimeslot, setSelectedTimeslot] = useState<TimeSlot | null>(null);
    const [openTimeslotModal, setOpenTimeslotModal] = useState(false);
    const [workshiftSortOrder, setWorkshiftSortOrder] = useState<'asc' | 'desc'>('asc');
    const [peopleSortOrder, setPeopleSortOrder] = useState<'asc' | 'desc'>('asc');
    const [workshiftSortBy, setWorkshiftSortBy] = useState<'progress' | 'name'>('progress');
    const [peopleSortBy, setPeopleSortBy] = useState<'name' | 'shifts'>('name');

    // Modal handlers
    const handleOpenTimeslotModal = (timeslot: TimeSlot) => {
        setSelectedTimeslot(timeslot);
        setOpenTimeslotModal(true);
    };

    const handleCloseTimeslotModal = () => {
        setOpenTimeslotModal(false);
        setSelectedTimeslot(null);
    };

    const workshiftsToProgressItems = (): ProgressItem[] => {
        const items = formContent.work_shifts.map(workshift => {
            const totalNeeded = workshift.time_slots.reduce((acc, ts) => acc + ts.num_needed, 0);
            const totalBooked = workshift.time_slots.reduce((acc, ts) => {
                const timeslotCount = getTimeslotCount(ts.id);
                return acc + timeslotCount;
            }, 0);

            return {
                id: workshift.id,
                title: workshift.title,
                currentCount: totalBooked,
                totalNeeded,
                badgeContent: workshift.time_slots.length,
                badgeIcon: <AccessTimeIcon color="action"/>,
                children: (
                    <Box sx={{pl: 2}}>
                        <Grid container spacing={2}>
                            {workshift.time_slots.map(timeslot => {
                                const timeslotCount = getTimeslotCount(timeslot.id);
                                const progress = timeslot.num_needed > 0
                                    ? (timeslotCount / timeslot.num_needed) * 100
                                    : 0;

                                return (
                                    <Grid item xs={12} sm={6} key={timeslot.id}>
                                        <Paper
                                            elevation={1}
                                            sx={{
                                                p: 2,
                                                borderLeft: 2,
                                                borderColor: progress >= 100 ? 'success.main' : 'primary.main',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                bgcolor: alpha(progress >= 100 ? spacePalette.status.success : spacePalette.primary.main, 0.05)
                                            }}
                                        >
                                            <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                                <AccessTimeIcon sx={{mr: 1, fontSize: 'small', color: 'primary.main'}}/>
                                                <Typography variant="body1" sx={{fontWeight: 'medium'}}>
                                                    {timeslot.title}
                                                    {timeslot.start_time && timeslot.end_time && (
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{ml: 1}}
                                                        >
                                                            ({timeslot.start_time} - {timeslot.end_time})
                                                        </Typography>
                                                    )}
                                                </Typography>
                                            </Box>

                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <Chip
                                                    label={`${timeslotCount}/${timeslot.num_needed}`}
                                                    color={progress >= 100 ? "success" : "primary"}
                                                    size="small"
                                                />
                                                <Chip
                                                    label="View People"
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenTimeslotModal(timeslot);
                                                    }}
                                                    sx={{ml: 1}}
                                                />
                                            </Box>
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                )
            };
        });

        return items.sort((a, b) => {
            if (workshiftSortBy === 'name') {
                const compare = a.title.localeCompare(b.title);
                return workshiftSortOrder === 'asc' ? compare : -compare;
            } else {
                const progressA = a.totalNeeded > 0 ? (a.currentCount / a.totalNeeded) * 100 : 0;
                const progressB = b.totalNeeded > 0 ? (b.currentCount / b.totalNeeded) * 100 : 0;
                const compare = progressA - progressB;
                return workshiftSortOrder === 'asc' ? compare : -compare;
            }
        });
    };


    const bookingsToPeopleItems = (): Person[] => {
        const items = regularBookings.map(booking => {
            const timeslots = getTimeslotsForUser(booking);
            return {
                id: booking.id,
                name: `${booking.first_name} ${booking.last_name}`,
                subtitle: `Shifts: ${booking.amount_shifts || 0}`,
                badgeContent: booking.amount_shifts,
                badgeIcon: <WorkIcon color="action"/>,
                children: (
                    <Box>
                        {booking.supporter_buddy && (
                            <Typography variant="body2" sx={{mb: 2}}>
                                <strong>Supporter Buddy:</strong> {booking.supporter_buddy}
                            </Typography>
                        )}

                        <Typography variant="subtitle2" gutterBottom>
                            Assigned Timeslots:
                        </Typography>

                        {timeslots.map((timeslot, idx) => {
                            const workshift = getWorkshiftForTimeslot(timeslot.id);
                            return (
                                <Paper
                                    key={idx}
                                    sx={{
                                        p: 1.5,
                                        mb: 1,
                                        bgcolor: alpha(spacePalette.primary.main, 0.05),
                                        borderLeft: 2,
                                        borderColor:
                                            timeslot.priority === 1 ? spacePalette.status.success :
                                                timeslot.priority === 2 ? spacePalette.primary.main :
                                                    spacePalette.status.warning
                                    }}
                                >
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <Typography variant="body2" sx={{fontWeight: 'medium'}}>
                                            {workshift?.title} - {timeslot.title}
                                        </Typography>
                                        <Chip
                                            label={timeslotPriorityToString(timeslot.priority)}
                                            color={
                                                timeslot.priority === 1 ? "success" :
                                                    timeslot.priority === 2 ? "primary" :
                                                        "warning"
                                            }
                                            size="small"
                                        />
                                    </Box>

                                    {timeslot.start_time && timeslot.end_time && (
                                        <Typography variant="caption" color="text.secondary">
                                            {timeslot.start_time} - {timeslot.end_time}
                                        </Typography>
                                    )}
                                </Paper>
                            );
                        })}
                    </Box>
                )
            };
        });


        return items.sort((a, b) => {
            console.log(peopleSortBy);
            if (peopleSortBy === 'shifts') {

                const compare = a.badgeContent - b.badgeContent;
                return peopleSortOrder === 'asc' ? compare : -compare;
            } else {
                const compare = a.name.localeCompare(b.name);
                return peopleSortOrder === 'asc' ? compare : -compare;
            }
        });
    };

    // Helper functions
    const timeslotPriorityToString = (priority: number) => {
        if (priority === 1) return "Erstwunsch";
        if (priority === 2) return "Zweitwunsch";
        if (priority === 3) return "Drittwunsch";
        return "Unknown";
    };

    // Get workshift for a timeslot
    const getWorkshiftForTimeslot = (timeslotId: number) => {
        return formContent.work_shifts.find(shift =>
            shift.time_slots.some(slot => slot.id === timeslotId)
        );
    };

    // Calculate how many people are assigned to a timeslot
    const getTimeslotCount = (timeslotId: number) => {
        return regularBookings.reduce((count, booking) => {
            return count + (
                [booking.timeslot_priority_1].includes(timeslotId) ||
                (booking.amount_shifts >= 2 && [booking.timeslot_priority_2].includes(timeslotId)) ||
                (booking.amount_shifts >= 3 && [booking.timeslot_priority_3].includes(timeslotId))
                    ? 1 : 0
            );
        }, 0);
    };

    // Get timeslots assigned to a specific user
    const getTimeslotsForUser = (booking: any) => {
        const timeslotIds = [
            booking.timeslot_priority_1,
            booking.timeslot_priority_2,
            booking.timeslot_priority_3
        ].filter(id => id !== null && id !== -1);

        const result = [];

        for (const workshiftItem of formContent.work_shifts) {
            for (const timeslot of workshiftItem.time_slots) {
                if (timeslotIds.includes(timeslot.id)) {
                    // Determine priority
                    const priority = [
                        booking.timeslot_priority_1,
                        booking.timeslot_priority_2,
                        booking.timeslot_priority_3
                    ].indexOf(timeslot.id) + 1;

                    result.push({
                        ...timeslot,
                        priority
                    });
                }
            }
        }

        return result;
    };

    // Get users who selected a particular timeslot
    const getUsersForTimeslot = (timeslotId: number) => {
        return regularBookings
            .filter(booking =>
                [booking.timeslot_priority_1, booking.timeslot_priority_2, booking.timeslot_priority_3].includes(timeslotId)
            )
            .map(booking => ({
                first_name: booking.first_name,
                last_name: booking.last_name,
                priority: [booking.timeslot_priority_1, booking.timeslot_priority_2, booking.timeslot_priority_3]
                    .indexOf(timeslotId) + 1
            }));
    };

    // Toggle sort order for workshifts
    const handleToggleWorkshiftSort = () => {
        setWorkshiftSortOrder(workshiftSortOrder === 'asc' ? 'desc' : 'asc');
    };

    // Toggle sort order for people
    const handleTogglePeopleSort = () => {
        setPeopleSortOrder(peopleSortOrder === 'asc' ? 'desc' : 'asc');
    };

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
                                    const workshift = getWorkshiftForTimeslot(selectedTimeslot.id);

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
                                        {getUsersForTimeslot(selectedTimeslot.id).length} people assigned out
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
                                        {getUsersForTimeslot(selectedTimeslot.id)
                                            .sort((a, b) => a.priority - b.priority)
                                            .map((user, index) => (
                                                <TableRow key={index}>
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