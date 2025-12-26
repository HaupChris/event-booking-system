import React from 'react';
import { Grid } from '@mui/material';
import StatsCard from '../../components/StatsCard';
import {
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface StatisticsGridProps {
  totalUsers: number;
  fullyAssignedUsers: number;
  totalShiftsAssigned: number;
  totalShiftsWanted: number;
  totalTimeslots: number;
  totalCapacity: number;
}

const StatisticsGrid: React.FC<StatisticsGridProps> = ({
  totalUsers,
  fullyAssignedUsers,
  totalShiftsAssigned,
  totalShiftsWanted,
  totalTimeslots,
  totalCapacity,
}) => {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Total Users"
          value={totalUsers}
          icon={<PeopleIcon fontSize="large" />}
          color="primary"
          subtitle={`${fullyAssignedUsers} fully assigned`}
          progress={(fullyAssignedUsers / totalUsers) * 100}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Shifts Progress"
          value={`${totalShiftsAssigned}/${totalShiftsWanted}`}
          icon={<AssignmentIcon fontSize="large" />}
          color="info"
          subtitle="Assigned vs Requested"
          progress={(totalShiftsAssigned / totalShiftsWanted) * 100}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Timeslots"
          value={totalTimeslots}
          icon={<ScheduleIcon fontSize="large" />}
          color="primary"
          subtitle={`${totalCapacity} total capacity`}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Completion Rate"
          value={`${Math.round((fullyAssignedUsers / totalUsers) * 100)}%`}
          icon={<CheckCircleIcon fontSize="large" />}
          color="success"
          subtitle="Users fully assigned"
          progress={(fullyAssignedUsers / totalUsers) * 100}
        />
      </Grid>
    </Grid>
  );
};

export default StatisticsGrid;