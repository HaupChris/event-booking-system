import React, {useState} from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Modal,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Collapse,
    Button,
    Tabs,
    Tab,
} from '@mui/material';
import {useFetchData} from './useFetchData'; // Adjust the path as needed
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ListItemButton from "@mui/material/ListItemButton";


import {CSVLink} from 'react-csv';

const WorkshiftsPage: React.FC = () => {
    const {bookings, formContent} = useFetchData();
    const [selectedTimeslot, setSelectedTimeslot] = useState<number | null>(null);
    const [openTimeslotModal, setOpenTimeslotModal] = useState(false);
    const [expandedWorkshift, setExpandedWorkshift] = useState<number | null>(null);
    const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [workshiftSortOrder, setWorkshiftSortOrder] = useState<'asc' | 'desc'>('asc');
    const [peopleSortOrder, setPeopleSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue);
    };

    const handleOpenTimeslotModal = (timeslotId: number) => {
        setSelectedTimeslot(timeslotId);
        setOpenTimeslotModal(true);
    };

    const handleCloseTimeslotModal = () => {
        setOpenTimeslotModal(false);
        setSelectedTimeslot(null);
    };

    const getOptionTitle = (id: number, options: { id: number; title: string }[]) => {
        const option = options.find(option => option.id === id);
        return option ? option.title : 'Unknown';
    };

    const getUsersForTimeslot = (timeslotId: number) => {
        return bookings.filter(booking => [booking.timeslot_priority_1, booking.timeslot_priority_2, booking.timeslot_priority_3].includes(timeslotId)).map(booking => ({
            first_name: booking.first_name,
            last_name: booking.last_name,
            priority: [booking.timeslot_priority_1, booking.timeslot_priority_2, booking.timeslot_priority_3].indexOf(timeslotId) + 1
        }));
    };

    const getTimeslotCount = (timeslotId: number) => {
        return bookings.reduce((count, booking) => {
            return count + ([booking.timeslot_priority_1].includes(timeslotId) ||
            (booking.amount_shifts == 2 && [booking.timeslot_priority_2].includes(timeslotId)) ||
            (booking.amount_shifts == 3 && [booking.timeslot_priority_3].includes(timeslotId))  ? 1 : 0);
        }, 0);
    };

    const getWorkshiftProgress = (workshiftId: number) => {
        const workshift = formContent.work_shifts.find(ws => ws.id === workshiftId);
        if (!workshift) return {progress: 0, totalNeeded: 0, totalBooked: 0};
        const totalNeeded = workshift.time_slots.reduce((acc, ts) => acc + ts.num_needed, 0);
        const totalBooked = workshift.time_slots.reduce((acc, ts) => acc + getTimeslotCount(ts.id), 0);
        return {progress: (totalBooked / totalNeeded) * 100, totalNeeded, totalBooked};
    };

    const getTimeslotsForUser = (user: { first_name: string, last_name: string }) => {
        const userBookings = bookings.filter(booking => booking.first_name === user.first_name && booking.last_name === user.last_name);
        const timeslotIds = userBookings.flatMap(booking => [booking.timeslot_priority_1, booking.timeslot_priority_2, booking.timeslot_priority_3]).filter(id => id !== null);
        return formContent.work_shifts.flatMap(ws => ws.time_slots.filter(ts => timeslotIds.includes(ts.id)));
    };

    const getWorkshiftAndTimeslotDetails = (timeslotId: number) => {
        for (const workshift of formContent.work_shifts) {
            for (const timeslot of workshift.time_slots) {
                if (timeslot.id === timeslotId) {
                    return {
                        workshiftTitle: workshift.title,
                        timeslotTitle: timeslot.title,
                        startTime: timeslot.start_time,
                        endTime: timeslot.end_time
                    };
                }
            }
        }
        return {
            workshiftTitle: 'Unknown',
            timeslotTitle: 'Unknown',
            startTime: 'Unknown',
            endTime: 'Unknown'
        };
    };

    const toggleWorkshiftExpanded = (workshiftId: number) => {
        setExpandedWorkshift(expandedWorkshift === workshiftId ? null : workshiftId);
    };

    const togglePersonExpanded = (personName: string) => {
        setExpandedPerson(expandedPerson === personName ? null : personName);
    };

    const sortedWorkshifts = [...formContent.work_shifts].sort((a, b) => {
        const progressA = getWorkshiftProgress(a.id).progress;
        const progressB = getWorkshiftProgress(b.id).progress;
        return workshiftSortOrder === 'asc' ? progressA - progressB : progressB - progressA;
    });

    const csvData = bookings.map(booking => {
        const priority1Details = getWorkshiftAndTimeslotDetails(booking.timeslot_priority_1);
        const priority2Details = getWorkshiftAndTimeslotDetails(booking.timeslot_priority_2);
        const priority3Details = getWorkshiftAndTimeslotDetails(booking.timeslot_priority_3);

        return {
            firstName: booking.first_name,
            lastName: booking.last_name,
            amountShifts: booking.amount_shifts,
            supporterBuddy: booking.supporter_buddy,
            workshiftPriority1: `${priority1Details.workshiftTitle} - ${priority1Details.timeslotTitle} (${priority1Details.startTime} - ${priority1Details.endTime})`,
            workshiftPriority2: `${priority2Details.workshiftTitle} - ${priority2Details.timeslotTitle} (${priority2Details.startTime} - ${priority2Details.endTime})`,
            workshiftPriority3: `${priority3Details.workshiftTitle} - ${priority3Details.timeslotTitle} (${priority3Details.startTime} - ${priority3Details.endTime})`
        };
    });

    return (
        <Box>
            <Tabs value={tabValue} onChange={handleTabChange} centered sx={{paddingBottom: "1em"}}>
                <Tab label="Workshift Overview"/>
                <Tab label="People Overview"/>
            </Tabs>
            {tabValue === 0 && (
                <>
                    <Box display="flex" justifyContent="space-between" mb={2} mx={"1em"}>
                        <CSVLink data={csvData} filename="bookings.csv" style={{textDecoration: 'none'}}>
                            <Button variant="contained" color="primary">Export CSV</Button>
                        </CSVLink>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setWorkshiftSortOrder(workshiftSortOrder === 'asc' ? 'desc' : 'asc')}
                            startIcon={workshiftSortOrder === 'asc' ? <ArrowUpwardIcon/> : <ArrowDownwardIcon/>}
                        >
                            {workshiftSortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </Button>
                    </Box>
                    <List sx={{backgroundColor: "rgba(255, 255, 255, 0.8)"}}>
                        {sortedWorkshifts.map((workshift) => {
                            const {progress, totalNeeded, totalBooked} = getWorkshiftProgress(workshift.id);
                            return (
                                <div key={workshift.id}>
                                    <ListItemButton onClick={() => toggleWorkshiftExpanded(workshift.id)}>
                                        <ListItemText primary={workshift.title}/>
                                        <Box width="50%" mr={1}>
                                            <LinearProgress variant="determinate" value={Math.min(progress, 100)}/>
                                        </Box>
                                        <Typography variant="body2"
                                                    color="textSecondary">{`${totalBooked}/${totalNeeded}`}</Typography>
                                        {expandedWorkshift === workshift.id ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                                    </ListItemButton>
                                    <Collapse in={expandedWorkshift === workshift.id} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {workshift.time_slots.map(timeslot => {
                                                const timeslotCount = getTimeslotCount(timeslot.id);
                                                const timeslotProgress = (timeslotCount / timeslot.num_needed) * 100;
                                                return (
                                                    <ListItem key={timeslot.id} sx={{pl: 4}}>
                                                        <ListItemText
                                                            primary={`${timeslot.title} (${timeslot.start_time} - ${timeslot.end_time})`}
                                                            secondary={
                                                                <Box display="flex" alignItems="center">
                                                                    <Box width="100%" mr={1}>
                                                                        <LinearProgress variant="determinate"
                                                                                        value={Math.min(timeslotProgress, 100)}/>
                                                                    </Box>
                                                                    <Box minWidth={35}>
                                                                        <Typography variant="body2"
                                                                                    color="textSecondary">{`${timeslotCount}/${timeslot.num_needed}`}</Typography>
                                                                    </Box>
                                                                </Box>
                                                            }
                                                        />
                                                        <IconButton
                                                            onClick={() => handleOpenTimeslotModal(timeslot.id)}>
                                                            <MoreHorizIcon/>
                                                        </IconButton>
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Collapse>
                                </div>
                            );
                        })}
                    </List>
                </>
            )}
            {tabValue === 1 && (
                <>
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                const newOrder = peopleSortOrder === 'asc' ? 'desc' : 'asc';
                                setPeopleSortOrder(newOrder);
                            }}
                            startIcon={peopleSortOrder === 'asc' ? <ArrowUpwardIcon/> : <ArrowDownwardIcon/>}
                        >
                            {peopleSortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </Button>
                    </Box>


                    <List key={peopleSortOrder} sx={{backgroundColor: "white"}}>
                        {bookings
                            .sort((a, b) => (peopleSortOrder === 'asc' ? a.first_name.localeCompare(b.first_name) : b.first_name.localeCompare(a.first_name)))
                            .map(booking => {
                                const personName = `${booking.first_name} ${booking.last_name}`;
                                return (
                                    <div key={personName}>
                                        <ListItemButton onClick={() => togglePersonExpanded(personName)}>
                                            <ListItemText
                                                primary={personName}
                                                secondary={`Shifts: ${booking.amount_shifts}, Supporter Buddy: ${booking.supporter_buddy}`}
                                            />
                                            {expandedPerson === personName ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                                        </ListItemButton>
                                        <Collapse in={expandedPerson === personName} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding>
                                                {getTimeslotsForUser(booking).map((timeslot, index) => {
                                                    const workshift = formContent.work_shifts.find(ws => ws.time_slots.some(ts => ts.id === timeslot.id));
                                                    return (
                                                        <ListItem key={timeslot.id} sx={{pl: 4}}>
                                                            <ListItemText
                                                                primary={`${timeslot.title} (${timeslot.start_time} - ${timeslot.end_time})`}
                                                                secondary={workshift?.title}
                                                            />
                                                            {index === 0 && "Prio 1"}
                                                            {index === 1 && "Prio 2"}
                                                            {index === 2 && "Prio 3"}
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        </Collapse>
                                    </div>
                                );
                            })}
                    </List>
                </>
            )}

            <Modal open={openTimeslotModal} onClose={handleCloseTimeslotModal}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '90vw', maxWidth: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 2
                }}>
                    <IconButton onClick={handleCloseTimeslotModal} sx={{position: 'absolute', top: 8, right: 8}}>
                        <CloseIcon/>
                    </IconButton>
                    {selectedTimeslot !== null && (
                        <Box>
                            <Typography sx={{width: "90%"}} variant="h6" gutterBottom>
                                People
                                for {getOptionTitle(selectedTimeslot, formContent.work_shifts.flatMap(ws => ws.time_slots))}
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>First Name</TableCell>
                                        <TableCell>Last Name</TableCell>
                                        <TableCell>Priority</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getUsersForTimeslot(selectedTimeslot).map((user, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{user.first_name}</TableCell>
                                            <TableCell>{user.last_name}</TableCell>
                                            <TableCell>{user.priority}</TableCell>
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
};

export default WorkshiftsPage;
