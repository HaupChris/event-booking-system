import React, {useState, useMemo} from 'react';
import {
    Box, TextField, List,
    InputAdornment, FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import {Search as SearchIcon} from '@mui/icons-material';
import type {BookingWithTimestamp, FormContent} from '../../../userArea/interface';
import type {ShiftAssignment, UserWithAssignments, UserListFilters} from '../types';
import UserItem from './UserItem';

type SortOption = 'firstName' | 'lastName' | 'priority' | 'wantedShifts';

interface UserListProps {
    regularBookings: BookingWithTimestamp[];
    selectedTimeslot: number | null;
    onUserSelect: (userId: number) => void;
    selectedUsers: Set<number>;
    formContent: FormContent;
    assignments: ShiftAssignment[];
}

const UserList: React.FC<UserListProps> = ({
                                               regularBookings,
                                               selectedTimeslot,
                                               onUserSelect,
                                               selectedUsers,
                                               formContent,
                                               assignments
                                           }) => {
    const [filters, setFilters] = useState<UserListFilters>({
        searchTerm: '',
        assignmentFilter: 'all',
        acceptanceFilter: 'all',
        ticketDayFilter: 'all',
        shiftCountFilter: 'all',
        daysCountFilter: 'all'
    });
    const [sortBy, setSortBy] = useState<SortOption>('firstName');

    // Merge booking data with assignments
    const usersWithAssignments = useMemo((): UserWithAssignments[] => {
        return regularBookings.map(booking => {
            const userAssignments = assignments.filter(a => a.booking_id === booking.id);
            const ticketTitle = formContent.ticket_options.find((to) => to.id === booking.ticket_id)!.title;
            const ticket_days = ticketTitle.match(/\(([^)]+)\)/)?.[1] || '';
            const days_count = ticket_days.split(',').length; // Count days by splitting on comma
            return {
                booking_id: booking.id,
                first_name: booking.first_name,
                last_name: booking.last_name,
                email: booking.email,
                ticket_days: ticket_days,
                days_count: days_count,
                supporter_buddy: booking.supporter_buddy || '',
                amount_shifts: booking.amount_shifts,
                timeslot_priority_1: booking.timeslot_priority_1,
                timeslot_priority_2: booking.timeslot_priority_2,
                timeslot_priority_3: booking.timeslot_priority_3,
                assigned_shifts: userAssignments,
                assigned_count: userAssignments.length,
                is_fully_assigned: userAssignments.length >= booking.amount_shifts
            };
        });
    }, [regularBookings, assignments]);

    // Sort users
    const sortedUsers = useMemo(() => {
        return [...usersWithAssignments].sort((a, b) => {
            switch (sortBy) {
                case 'firstName':
                    return a.first_name.localeCompare(b.first_name);
                case 'lastName':
                    return a.last_name.localeCompare(b.last_name);
                case 'priority':
                    if (selectedTimeslot === null) {
                        return 0;
                    }

                    const getPriority = (user: UserWithAssignments) => {
                        if (user.timeslot_priority_1 === selectedTimeslot) return 1;
                        if (user.timeslot_priority_2 === selectedTimeslot) return 2;
                        if (user.timeslot_priority_3 === selectedTimeslot) return 3;
                        return 999; // No priority
                    };

                    return getPriority(a) - getPriority(b);
                case 'wantedShifts':
                    return b.amount_shifts - a.amount_shifts;
                default:
                    return 0;
            }
        });
    }, [usersWithAssignments, sortBy, selectedTimeslot]);

    // Filter users
    const filteredUsers = useMemo(() => {
        return sortedUsers.filter(user => {
            // Search filter
            const matchesSearch = filters.searchTerm === '' ||
                user.first_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                user.last_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                user.supporter_buddy.toLowerCase().includes(filters.searchTerm.toLowerCase());

            // Assignment filter
            const matchesAssignment = filters.assignmentFilter === 'all' ||
                (filters.assignmentFilter === 'completed' && user.is_fully_assigned) ||
                (filters.assignmentFilter === 'incomplete' && !user.is_fully_assigned) ||
                (filters.assignmentFilter === 'unassigned' && user.assigned_count === 0);

            // Ticket day filter
            const matchesTicketDay = filters.ticketDayFilter === 'all' ||
                user.ticket_days.includes(filters.ticketDayFilter);

            // Shift count filter
            const matchesShiftCount = filters.shiftCountFilter === 'all' ||
                user.amount_shifts.toString() === filters.shiftCountFilter;

            // Days count filter
            const matchesDaysCount = filters.daysCountFilter === 'all' ||
                user.days_count.toString() === filters.daysCountFilter;

            // Acceptance filter
            const matchesAcceptance = (() => {
                if (filters.acceptanceFilter === 'all') return true;

                const userAssignments = user.assigned_shifts;
                if (userAssignments.length === 0) return false;

                switch (filters.acceptanceFilter) {
                    case 'all_accepted':
                        return userAssignments.every(sa => sa.status === 'accepted');
                    case 'has_pending':
                        return userAssignments.some(sa => sa.status === 'pending' || !sa.status);
                    case 'has_declined':
                        return userAssignments.some(sa => sa.status === 'declined');
                    default:
                        return true;
                }
            })();

            return matchesSearch && matchesAssignment && matchesAcceptance && matchesTicketDay && matchesShiftCount && matchesDaysCount;
        });
    }, [sortedUsers, filters]);

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Fixed Controls - No Scrolling */}
            <Box sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                flexShrink: 0,
                bgcolor: 'background.paper'
            }}>
                {/* Search */}
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search users..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({...prev, searchTerm: e.target.value}))}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
                            </InputAdornment>
                        )
                    }}
                    sx={{mb: 1.5}}
                />

                {/* Compact Filter Grid */}
                <Grid container spacing={1} sx={{mb: 1.5}}>
                    <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Assignment</InputLabel>
                            <Select
                                value={filters.assignmentFilter}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    assignmentFilter: e.target.value as any
                                }))}
                                label="Assignment"
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="unassigned">Unassigned</MenuItem>
                                <MenuItem value="incomplete">Incomplete</MenuItem>
                                <MenuItem value="completed">Complete</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Acceptance</InputLabel>
                            <Select
                                value={filters.acceptanceFilter}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    acceptanceFilter: e.target.value as any
                                }))}
                                label="Acceptance"
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="all_accepted">All Accepted</MenuItem>
                                <MenuItem value="has_pending">Has Pending</MenuItem>
                                <MenuItem value="has_declined">Has Declined</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sort</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                label="Sort"
                            >
                                <MenuItem value="priority">Priority</MenuItem>
                                <MenuItem value="firstName">First Name</MenuItem>
                                <MenuItem value="lastName">Last Name</MenuItem>
                                <MenuItem value="wantedShifts">Shifts Wanted</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Day</InputLabel>
                            <Select
                                value={filters.ticketDayFilter}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    ticketDayFilter: e.target.value as any
                                }))}
                                label="Day"
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="Do">Thu</MenuItem>
                                <MenuItem value="Fr">Fri</MenuItem>
                                <MenuItem value="Sa">Sat</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Days #</InputLabel>
                            <Select
                                value={filters.daysCountFilter}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    daysCountFilter: e.target.value as any
                                }))}
                                label="Days #"
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="1">1</MenuItem>
                                <MenuItem value="2">2</MenuItem>
                                <MenuItem value="3">3</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Shifts</InputLabel>
                            <Select
                                value={filters.shiftCountFilter}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    shiftCountFilter: e.target.value as any
                                }))}
                                label="Shifts"
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="1">1</MenuItem>
                                <MenuItem value="2">2</MenuItem>
                                <MenuItem value="3">3</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {/* Scrollable User List */}
            <Box sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 1
            }}>
                <List sx={{py: 0}}>
                    {filteredUsers.map(user => (
                        <UserItem
                            key={user.booking_id}
                            user={user}
                            isSelected={selectedUsers.has(user.booking_id)}
                            onSelect={onUserSelect}
                            selectedTimeslot={selectedTimeslot}
                            formContent={formContent}
                            shiftAssignments={user.assigned_shifts}
                        />
                    ))}
                </List>
            </Box>
        </Box>
    );
};

export default UserList;