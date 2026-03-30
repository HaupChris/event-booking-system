import React from 'react';
import { Box } from '@mui/material';
import StatsCard from '../../components/StatsCard';
import {
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import type { ShiftAssignment } from '../types';

interface StatisticsGridProps {
  totalUsers: number;
  fullyAssignedUsers: number;
  totalShiftsAssigned: number;
  totalShiftsWanted: number;
  totalTimeslots: number;
  totalCapacity: number;
  assignments: ShiftAssignment[];
}

const StatisticsGrid: React.FC<StatisticsGridProps> = ({
  totalUsers,
  fullyAssignedUsers,
  totalShiftsAssigned,
  totalShiftsWanted,
  totalTimeslots,
  totalCapacity,
  assignments,
}) => {
  // Calculate acceptance statistics
  const acceptedCount = assignments.filter((a) => a.status === 'accepted').length;
  const pendingCount = assignments.filter((a) => a.status === 'pending' || !a.status).length;
  const declinedCount = assignments.filter((a) => a.status === 'declined').length;
  const acceptanceRate =
    assignments.length > 0 ? Math.round((acceptedCount / assignments.length) * 100) : 0;

  return (
    <Box
      sx={{
        mb: 3,
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(5, minmax(0, 1fr))',
        },
      }}
    >
      <StatsCard
        title="Total Users"
        value={totalUsers}
        icon={<PeopleIcon fontSize="large" />}
        color="primary"
        subtitle={`${fullyAssignedUsers} fully assigned`}
        progress={(fullyAssignedUsers / totalUsers) * 100}
        fullHeight
      />
      <StatsCard
        title="Shifts Progress"
        value={`${totalShiftsAssigned}/${totalShiftsWanted}`}
        icon={<AssignmentIcon fontSize="large" />}
        color="info"
        subtitle="Assigned vs Requested"
        progress={(totalShiftsAssigned / totalShiftsWanted) * 100}
        fullHeight
      />
      <StatsCard
        title="Timeslots"
        value={totalTimeslots}
        icon={<ScheduleIcon fontSize="large" />}
        color="primary"
        subtitle={`${totalCapacity} total capacity`}
        fullHeight
      />
      <StatsCard
        title="Completion Rate"
        value={`${Math.round((fullyAssignedUsers / totalUsers) * 100)}%`}
        icon={<CheckCircleIcon fontSize="large" />}
        color="success"
        subtitle="Users fully assigned"
        progress={(fullyAssignedUsers / totalUsers) * 100}
        fullHeight
      />
      <StatsCard
        title="Acceptance Rate"
        value={`${acceptanceRate}%`}
        icon={<ThumbUpIcon fontSize="large" />}
        color="success"
        subtitle={`✓ ${acceptedCount} | ⏳ ${pendingCount} | ✗ ${declinedCount}`}
        progress={acceptanceRate}
        fullHeight
      />
    </Box>
  );
};

export default StatisticsGrid;
