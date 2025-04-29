import React, { useState } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableHead, TableRow,
    Modal, IconButton, LinearProgress, List, ListItem, ListItemText,
    Collapse, Button, Tabs, Tab, Chip, Badge, Paper,
    useTheme, useMediaQuery, TableContainer
} from '@mui/material';
import { useFetchData } from './useFetchData';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ListItemButton from "@mui/material/ListItemButton";

const WorkshiftsPage: React.FC = () => {
    const { regularBookings, formContent } = useFetchData();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State
    const [selectedTimeslot, setSelectedTimeslot] = useState<number | null>(null);
    const [openTimeslotModal, setOpenTimeslotModal] = useState(false);
    const [expandedWorkshift, setExpandedWorkshift] = useState<number | null>(null);
    const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [workshiftSortOrder, setWorkshiftSortOrder] = useState<'asc' | 'desc'>('asc');
    const [peopleSortOrder, setPeopleSortOrder] = useState<'asc' | 'desc'>('asc');


    const timeslotPriorityToString = (priority: number) => {
        if (priority === 1) {
            return "Erstwunsch"
        }
        if (priority === 2) {
            return "Zweitwunsch"
        }
        if (priority === 3) {
            return "Drittwunsch"
        }
    }

    // Handle tab change between workshifts and people views
    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue);
    };

    // Modal handlers
    const handleOpenTimeslotModal = (timeslotId: number) => {
        setSelectedTimeslot(timeslotId);
        setOpenTimeslotModal(true);
    };

    const handleCloseTimeslotModal = () => {
        setOpenTimeslotModal(false);
        setSelectedTimeslot(null);
    };

    // Helper functions
    const getOptionTitle = (id: number, options: { id: number; title: string }[]) => {
        const option = options.find(option => option.id === id);
        return option ? option.title : 'Unknown';
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

    // Calculate overall progress for a workshift
    const getWorkshiftProgress = (workshiftId: number) => {
        const workshift = formContent.work_shifts.find(ws => ws.id === workshiftId);
        if (!workshift) return { progress: 0, totalNeeded: 0, totalBooked: 0 };

        const totalNeeded = workshift.time_slots.reduce((acc, ts) => acc + ts.num_needed, 0);
        const totalBooked = workshift.time_slots.reduce((acc, ts) => acc + getTimeslotCount(ts.id), 0);
        const progress = totalNeeded > 0 ? (totalBooked / totalNeeded) * 100 : 0;

        return { progress, totalNeeded, totalBooked };
    };

    // Get timeslots assigned to a specific user
    const getTimeslotsForUser = (user: { first_name: string, last_name: string }) => {
        const userBookings = regularBookings.filter(
            booking => booking.first_name === user.first_name && booking.last_name === user.last_name
        );

        const timeslotIds = userBookings.flatMap(booking =>
            [booking.timeslot_priority_1, booking.timeslot_priority_2, booking.timeslot_priority_3]
        ).filter(id => id !== null && id !== -1);

        return formContent.work_shifts.flatMap(ws =>
            ws.time_slots.filter(ts => timeslotIds.includes(ts.id))
        ).map(ts => ({
            ...ts,
            priority: userBookings[0] ? [
                userBookings[0].timeslot_priority_1,
                userBookings[0].timeslot_priority_2,
                userBookings[0].timeslot_priority_3
            ].indexOf(ts.id) + 1 : 0
        }));
    };

    // Toggle expanded state for accordions
    const toggleWorkshiftExpanded = (workshiftId: number) => {
        setExpandedWorkshift(expandedWorkshift === workshiftId ? null : workshiftId);
    };

    const togglePersonExpanded = (personName: string) => {
        setExpandedPerson(expandedPerson === personName ? null : personName);
    };

    // Sort workshifts by progress
    const sortedWorkshifts = [...formContent.work_shifts].sort((a, b) => {
        const progressA = getWorkshiftProgress(a.id).progress;
        const progressB = getWorkshiftProgress(b.id).progress;
        return workshiftSortOrder === 'asc' ? progressA - progressB : progressB - progressA;
    });

    // Sort people
    const sortedPeople = regularBookings
        .sort((a, b) => peopleSortOrder === 'asc'
            ? a.first_name.localeCompare(b.first_name)
            : b.first_name.localeCompare(a.first_name)
        );

    return (
        <Box sx={{ p: 2 }}>
            {/* Header with title */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
            }}>
                <Typography variant="h5" gutterBottom={isMobile}>
                    Workshift Management
                </Typography>
            </Box>

            {/* Main tabs (Workshifts vs People view) */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    centered
                    variant={isMobile ? "fullWidth" : "standard"}
                >
                    <Tab
                        label={isMobile ? "Workshifts" : "Workshift Overview"}
                        icon={isMobile ? <WorkIcon /> : undefined}
                        iconPosition="start"
                    />
                    <Tab
                        label={isMobile ? "People" : "People Overview"}
                        icon={isMobile ? <PeopleIcon /> : undefined}
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            {/* Workshift Overview Tab */}
            {tabValue === 0 && (
                <>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                        sx={{ flexDirection: isMobile ? 'column' : 'row', gap: 1 }}
                    >
                        <Typography variant="body2" sx={{ display: isMobile ? 'none' : 'block' }}>
                            Showing {sortedWorkshifts.length} workshifts sorted by progress
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            size={isMobile ? "small" : "medium"}
                            onClick={() => setWorkshiftSortOrder(workshiftSortOrder === 'asc' ? 'desc' : 'asc')}
                            startIcon={workshiftSortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                            fullWidth={isMobile}
                        >
                            {workshiftSortOrder === 'asc' ? 'Lowest First' : 'Highest First'}
                        </Button>
                    </Box>

                    <Paper sx={{ mb: 3 }}>
                        <List>
                            {sortedWorkshifts.map((workshift) => {
                                const { progress, totalNeeded, totalBooked } = getWorkshiftProgress(workshift.id);
                                return (
                                    <Box key={workshift.id} sx={{ mb: 1 }}>
                                        <ListItemButton
                                            onClick={() => toggleWorkshiftExpanded(workshift.id)}
                                            sx={{
                                                borderLeft: 3,
                                                borderColor: progress >= 100 ? 'success.main' :
                                                            progress >= 75 ? 'info.main' :
                                                            progress >= 50 ? 'warning.main' : 'error.main',
                                                bgcolor: 'background.paper',
                                                ":hover": {
                                                    bgcolor: 'action.hover'
                                                }
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        {workshift.title}
                                                    </Typography>
                                                }
                                                secondary={
                                                    !isMobile &&
                                                    <Typography variant="body2" color="text.secondary" noWrap>
                                                        {workshift.description?.slice(0, 60)}
                                                        {workshift.description?.length > 60 ? '...' : ''}
                                                    </Typography>
                                                }
                                            />

                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    width: isMobile ? '60%' : '50%',
                                                    mr: 1
                                                }}
                                            >
                                                <Box sx={{ width: '100%', mr: 1 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={Math.min(progress, 100)}
                                                        color={
                                                            progress >= 100 ? "success" :
                                                            progress >= 75 ? "primary" :
                                                            progress >= 50 ? "warning" : "error"
                                                        }
                                                    />
                                                </Box>
                                                <Box minWidth={45}>
                                                    <Typography
                                                        variant={isMobile ? "caption" : "body2"}
                                                        color="text.secondary"
                                                    >
                                                        {`${totalBooked}/${totalNeeded}`}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {expandedWorkshift === workshift.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </ListItemButton>

                                        <Collapse in={expandedWorkshift === workshift.id} timeout="auto" unmountOnExit>
                                            {!isMobile && (
                                                <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                                                    <Typography variant="body2" paragraph>
                                                        {workshift.description}
                                                    </Typography>
                                                </Box>
                                            )}

                                            <List component="div" disablePadding>
                                                {workshift.time_slots.map(timeslot => {
                                                    const timeslotCount = getTimeslotCount(timeslot.id);
                                                    const timeslotProgress = timeslot.num_needed > 0 ?
                                                        (timeslotCount / timeslot.num_needed) * 100 : 0;
                                                    const peopleForTimeslot = getUsersForTimeslot(timeslot.id);

                                                    return (
                                                        <ListItem
                                                            key={timeslot.id}
                                                            sx={{
                                                                pl: 4,
                                                                borderLeft: 2,
                                                                borderColor: timeslotProgress >= 100 ? 'success.main' : 'primary.main',
                                                                ml: 2
                                                            }}
                                                        >
                                                            <ListItemText
                                                                primary={
                                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                        <AccessTimeIcon sx={{ mr: 1, fontSize: 'small', color: 'primary.main' }} />
                                                                        <Typography variant="body1">
                                                                            {timeslot.title}
                                                                            {timeslot.start_time && timeslot.end_time && (
                                                                                <Typography
                                                                                    component="span"
                                                                                    variant="body2"
                                                                                    color="text.secondary"
                                                                                    sx={{ ml: 1 }}
                                                                                >
                                                                                    ({timeslot.start_time} - {timeslot.end_time})
                                                                                </Typography>
                                                                            )}
                                                                        </Typography>
                                                                    </Box>
                                                                }
                                                                secondary={
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                                        <Box sx={{ width: '100%', mr: 1 }}>
                                                                            <LinearProgress
                                                                                variant="determinate"
                                                                                value={Math.min(timeslotProgress, 100)}
                                                                                color={timeslotProgress >= 100 ? "success" : "primary"}
                                                                            />
                                                                        </Box>
                                                                        <Box minWidth={45}>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                {`${timeslotCount}/${timeslot.num_needed}`}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>
                                                                }
                                                            />

                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Badge
                                                                    badgeContent={peopleForTimeslot.length}
                                                                    color="primary"
                                                                    sx={{ mr: 1 }}
                                                                >
                                                                    <PeopleIcon color="action" />
                                                                </Badge>
                                                                <IconButton
                                                                    onClick={() => handleOpenTimeslotModal(timeslot.id)}
                                                                    size={isMobile ? "small" : "medium"}
                                                                >
                                                                    <MoreHorizIcon />
                                                                </IconButton>
                                                            </Box>
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        </Collapse>
                                    </Box>
                                );
                            })}
                        </List>
                    </Paper>
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
                            Showing {sortedPeople.length} people with workshift assignments
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
                                const timeslots = getTimeslotsForUser(person);

                                // Skip people with no assigned timeslots
                                if (timeslots.length === 0) return null;

                                return (
                                    <React.Fragment key={person.id}>
                                        <ListItemButton
                                            sx={{
                                                backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                                            }}
                                            onClick={() => togglePersonExpanded(personName)}
                                        >
                                            <ListItemText
                                                primary={personName}
                                                secondary={
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Shifts: {person.amount_shifts || 0}
                                                        </Typography>
                                                        {!isMobile && person.supporter_buddy && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                Buddy: {person.supporter_buddy}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                            <Badge
                                                badgeContent={timeslots.length}
                                                color="primary"
                                                sx={{ mr: 1 }}
                                            >
                                                <WorkIcon color="action" />
                                            </Badge>
                                            {expandedPerson === personName ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </ListItemButton>

                                        <Collapse in={expandedPerson === personName} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding>
                                                {timeslots.map((timeslot, index) => {
                                                    const workshift = formContent.work_shifts.find(
                                                        ws => ws.time_slots.some(ts => ts.id === timeslot.id)
                                                    );

                                                    return (
                                                        <ListItem
                                                            key={timeslot.id}
                                                            sx={{
                                                                pl: 4,
                                                                borderLeft: 2,
                                                                borderColor:
                                                                    timeslot.priority === 1 ? 'success.main' :
                                                                    timeslot.priority === 2 ? 'info.main' : 'warning.main',
                                                                ml: 2
                                                            }}
                                                        >
                                                            <ListItemText
                                                                primary={
                                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                        <AccessTimeIcon sx={{ mr: 1, fontSize: 'small' }} />
                                                                        <Typography variant="body1">
                                                                            {timeslot.title}
                                                                            {timeslot.start_time && timeslot.end_time && (
                                                                                <Typography
                                                                                    component="span"
                                                                                    variant="body2"
                                                                                    color="text.secondary"
                                                                                    sx={{ ml: 1 }}
                                                                                >
                                                                                    ({timeslot.start_time} - {timeslot.end_time})
                                                                                </Typography>
                                                                            )}
                                                                        </Typography>
                                                                    </Box>
                                                                }
                                                                secondary={
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {workshift?.title}
                                                                    </Typography>
                                                                }
                                                            />
                                                            <Chip
                                                                label={timeslotPriorityToString(timeslot.priority)}
                                                                color={
                                                                    timeslot.priority === 1 ? "success" :
                                                                    timeslot.priority === 2 ? "primary" : "warning"
                                                                }
                                                                size="small"
                                                            />
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        </Collapse>
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    </Paper>
                </>
            )}

            {/* Timeslot Details Modal */}
            <Modal open={openTimeslotModal} onClose={handleCloseTimeslotModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '90vw', maxWidth: 500, bgcolor: 'background.paper',
                    borderRadius: 2, boxShadow: 24, p: 2
                }}>
                    <IconButton onClick={handleCloseTimeslotModal} sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <CloseIcon />
                    </IconButton>

                    {selectedTimeslot !== null && (
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ pr: 4 }}>
                                People Assigned to{' '}
                                {getOptionTitle(selectedTimeslot, formContent.work_shifts.flatMap(ws => ws.time_slots))}
                            </Typography>

                            {/* Find workshift that contains this timeslot */}
                            {(() => {
                                const workshift = formContent.work_shifts.find(
                                    ws => ws.time_slots.some(ts => ts.id === selectedTimeslot)
                                );
                                const timeslot = workshift?.time_slots.find(ts => ts.id === selectedTimeslot);

                                if (workshift && timeslot) {
                                    return (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="primary.main">
                                                {workshift.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                <AccessTimeIcon sx={{ mr: 0.5, fontSize: 'small' }} />
                                                {timeslot.start_time} - {timeslot.end_time}
                                            </Typography>
                                        </Box>
                                    );
                                }
                                return null;
                            })()}

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {getUsersForTimeslot(selectedTimeslot).length} people assigned out of {
                                        formContent.work_shifts.flatMap(ws => ws.time_slots)
                                            .find(ts => ts.id === selectedTimeslot)?.num_needed || 0
                                    } needed
                                </Typography>
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
                                        {getUsersForTimeslot(selectedTimeslot)
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
                                                                user.priority === 2 ? "primary" : "warning"
                                                            }
                                                            size="small"
                                                        />
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

export default WorkshiftsPage;