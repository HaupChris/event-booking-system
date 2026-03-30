/**
 * Data transformers for workshift-related views
 * Transforms raw data into display-ready formats
 */

import React from 'react';
import {
    Box, Typography, Paper, Chip, Grid, alpha
} from '@mui/material';
import {
    Work as WorkIcon,
    AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import type {ProgressItem} from '../components/ProgressList';
import type {Person} from '../components/PeopleList';
import {spacePalette} from '../../../components/styles/theme';
import {
    getTimeslotCount,
    getTimeslotsForUser,
    getWorkshiftForTimeslot,
    timeslotPriorityToString
} from '../utils/workshiftUtils';
import type { TimeSlot, WorkShift as WorkShiftType } from '../../userArea/interface';

interface BookingForWorkshift {
    id: number;
    first_name: string;
    last_name: string;
    supporter_buddy?: string;
    amount_shifts: number;
    timeslot_priority_1: number | null;
    timeslot_priority_2: number | null;
    timeslot_priority_3: number | null;
}

type TimeslotWithPriority = TimeSlot & { priority: number };

interface WorkshiftTransformConfig {
    workshifts: WorkShiftType[];
    bookings: BookingForWorkshift[];
    sortBy: 'progress' | 'name';
    sortOrder: 'asc' | 'desc';
    onTimeslotClick: (timeslot: TimeSlot) => void;
}

/**
 * Transforms workshifts data into progress items for display
 */
export const transformWorkshiftsToProgressItems = ({
    workshifts,
    bookings,
    sortBy,
    sortOrder,
    onTimeslotClick
}: WorkshiftTransformConfig): ProgressItem[] => {
    const items = workshifts.map(workshift => {
        const totalNeeded = workshift.time_slots.reduce((acc: number, ts: TimeSlot) => acc + ts.num_needed, 0);
        const totalBooked = workshift.time_slots.reduce((acc: number, ts: TimeSlot) => {
            const timeslotCount = getTimeslotCount(ts.id, bookings);
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
                        {workshift.time_slots.map((timeslot: TimeSlot) => {
                            const timeslotCount = getTimeslotCount(timeslot.id, bookings);
                            const progress = timeslot.num_needed > 0
                                ? (timeslotCount / timeslot.num_needed) * 100
                                : 0;

                            return (
                                <Grid
                                    key={timeslot.id}
                                    size={{
                                        xs: 12,
                                        sm: 6
                                    }}>
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
                                                    onTimeslotClick(timeslot);
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
        if (sortBy === 'name') {
            const compare = a.title.localeCompare(b.title);
            return sortOrder === 'asc' ? compare : -compare;
        } else {
            const progressA = a.totalNeeded > 0 ? (a.currentCount / a.totalNeeded) * 100 : 0;
            const progressB = b.totalNeeded > 0 ? (b.currentCount / b.totalNeeded) * 100 : 0;
            const compare = progressA - progressB;
            return sortOrder === 'asc' ? compare : -compare;
        }
    });
};

interface PeopleTransformConfig {
    bookings: BookingForWorkshift[];
    workshifts: WorkShiftType[];
    sortBy: 'name' | 'shifts';
    sortOrder: 'asc' | 'desc';
}

/**
 * Transforms bookings data into people items for display
 */
export const transformBookingsToPeopleItems = ({
    bookings,
    workshifts,
    sortBy,
    sortOrder
}: PeopleTransformConfig): Person[] => {
    const items = bookings.map(booking => {
        const timeslots = getTimeslotsForUser(booking, workshifts) as TimeslotWithPriority[];
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

                    {timeslots.map((timeslot) => {
                        const workshift = getWorkshiftForTimeslot(timeslot.id, workshifts);
                        return (
                            <Paper
                                key={timeslot.id}
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
        if (sortBy === 'shifts') {
            const compare = a.badgeContent - b.badgeContent;
            return sortOrder === 'asc' ? compare : -compare;
        } else {
            const compare = a.name.localeCompare(b.name);
            return sortOrder === 'asc' ? compare : -compare;
        }
    });
};
