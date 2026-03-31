import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import type { FormContent } from '../../userArea/interface';
import type { ShiftAssignment } from './types';
import { getAdminTitle } from '../utils/titleUtils';

interface CurrentShiftPlanTabProps {
  assignments: ShiftAssignment[];
  formContent: FormContent;
}

interface TimeslotPlanItem {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  required: number;
  confirmed: number;
  remaining: number;
  fillPercentage: number;
  isFilled: boolean;
  confirmedPeople: string[];
  offeredPeople: string[];
}

interface WorkshiftPlanItem {
  id: number;
  title: string;
  timeslots: TimeslotPlanItem[];
  requiredTotal: number;
  confirmedTotal: number;
  filledTimeslots: number;
  totalTimeslots: number;
  fillPercentage: number;
}

const formatTime = (timeValue: string): string => {
  if (!timeValue) return '-';
  return timeValue.slice(0, 5);
};

function CurrentShiftPlanTab({ assignments, formContent }: CurrentShiftPlanTabProps) {
  const workshiftPlan = useMemo<WorkshiftPlanItem[]>(() => {
    const assignmentsByTimeslot = new Map<number, ShiftAssignment[]>();

    assignments.forEach((assignment) => {
      const current = assignmentsByTimeslot.get(assignment.timeslot_id) || [];
      current.push(assignment);
      assignmentsByTimeslot.set(assignment.timeslot_id, current);
    });

    return formContent.work_shifts.map((workshift) => {
      const timeslots = workshift.time_slots.map((timeslot) => {
        const timeslotAssignments = assignmentsByTimeslot.get(timeslot.id) || [];
        const confirmedAssignments = timeslotAssignments.filter(
          (item) => item.status === 'accepted'
        );
        const pendingAssignments = timeslotAssignments.filter((item) => item.status === 'pending');
        const confirmed = confirmedAssignments.length;
        const required = timeslot.num_needed || 0;
        const remaining = Math.max(0, required - confirmed);
        const fillPercentage = required > 0 ? Math.min(100, (confirmed / required) * 100) : 0;

        return {
          id: timeslot.id,
          title: getAdminTitle(timeslot),
          startTime: timeslot.start_time || '',
          endTime: timeslot.end_time || '',
          required,
          confirmed,
          remaining,
          fillPercentage,
          isFilled: required > 0 && confirmed >= required,
          confirmedPeople: confirmedAssignments.map((item) =>
            `${item.first_name} ${item.last_name}`.trim()
          ),
          offeredPeople: pendingAssignments.map((item) =>
            `${item.first_name} ${item.last_name}`.trim()
          ),
        };
      });

      const requiredTotal = timeslots.reduce((sum, timeslot) => sum + timeslot.required, 0);
      const confirmedTotal = timeslots.reduce((sum, timeslot) => sum + timeslot.confirmed, 0);
      const filledTimeslots = timeslots.filter((timeslot) => timeslot.isFilled).length;
      const totalTimeslots = timeslots.length;

      return {
        id: workshift.id,
        title: getAdminTitle(workshift),
        timeslots,
        requiredTotal,
        confirmedTotal,
        filledTimeslots,
        totalTimeslots,
        fillPercentage:
          requiredTotal > 0 ? Math.min(100, (confirmedTotal / requiredTotal) * 100) : 0,
      };
    });
  }, [assignments, formContent.work_shifts]);

  const summary = useMemo(() => {
    const totalRequired = workshiftPlan.reduce((sum, shift) => sum + shift.requiredTotal, 0);
    const totalConfirmed = workshiftPlan.reduce((sum, shift) => sum + shift.confirmedTotal, 0);
    const totalTimeslots = workshiftPlan.reduce((sum, shift) => sum + shift.totalTimeslots, 0);
    const filledTimeslots = workshiftPlan.reduce((sum, shift) => sum + shift.filledTimeslots, 0);

    return {
      totalRequired,
      totalConfirmed,
      totalTimeslots,
      filledTimeslots,
      coveragePercentage:
        totalRequired > 0 ? Math.min(100, (totalConfirmed / totalRequired) * 100) : 0,
    };
  }, [workshiftPlan]);

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          mb: 2,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Confirmed Assignments
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.5 }}>
              {summary.totalConfirmed}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Needed in Total
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.5 }}>
              {summary.totalRequired}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Filled Timeslots
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.5 }}>
              {summary.filledTimeslots} / {summary.totalTimeslots}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Coverage
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.5 }}>
              {Math.round(summary.coveragePercentage)}%
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Stack spacing={2}>
        {workshiftPlan.map((workshift) => (
          <Card key={workshift.id} variant="outlined">
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Typography variant="h6">{workshift.title}</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    size="small"
                    label={`Timeslots ${workshift.filledTimeslots}/${workshift.totalTimeslots}`}
                    color={
                      workshift.filledTimeslots === workshift.totalTimeslots ? 'success' : 'default'
                    }
                  />
                  <Chip
                    size="small"
                    label={`${workshift.confirmedTotal}/${workshift.requiredTotal}`}
                  />
                </Stack>
              </Stack>

              <Stack spacing={1.5}>
                {workshift.timeslots.map((timeslot) => (
                  <Card key={timeslot.id} variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Box>
                          <Typography variant="subtitle1">{timeslot.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatTime(timeslot.startTime)} - {formatTime(timeslot.endTime)}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={`${timeslot.confirmed}/${timeslot.required}`}
                          color={
                            timeslot.isFilled
                              ? 'success'
                              : timeslot.confirmed > 0
                                ? 'warning'
                                : 'default'
                          }
                        />
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={timeslot.fillPercentage}
                        color={timeslot.isFilled ? 'success' : 'primary'}
                      />

                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Belegt: {timeslot.confirmed} | Benoetigt: {timeslot.required} | Offen:{' '}
                        {timeslot.remaining}
                      </Typography>

                      <Divider sx={{ my: 1.5 }} />

                      <Box
                        sx={{
                          display: 'grid',
                          gap: 2,
                          gridTemplateColumns: {
                            xs: '1fr',
                            md: 'repeat(2, minmax(0, 1fr))',
                          },
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: 'success.dark' }}>
                            Bestaetigt ({timeslot.confirmedPeople.length})
                          </Typography>
                          {timeslot.confirmedPeople.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              Keine bestaetigten Personen.
                            </Typography>
                          ) : (
                            <List dense disablePadding>
                              {timeslot.confirmedPeople.map((personName) => (
                                <ListItem
                                  key={`accepted-${timeslot.id}-${personName}`}
                                  disableGutters
                                  sx={{ py: 0.25 }}
                                >
                                  <ListItemText
                                    primaryTypographyProps={{
                                      variant: 'body2',
                                      color: 'success.dark',
                                    }}
                                    primary={personName}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          )}
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, color: 'warning.dark' }}>
                            Angeboten / Offen ({timeslot.offeredPeople.length})
                          </Typography>
                          {timeslot.offeredPeople.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              Keine offenen Angebote.
                            </Typography>
                          ) : (
                            <List dense disablePadding>
                              {timeslot.offeredPeople.map((personName) => (
                                <ListItem
                                  key={`pending-${timeslot.id}-${personName}`}
                                  disableGutters
                                  sx={{ py: 0.25 }}
                                >
                                  <ListItemText
                                    primaryTypographyProps={{
                                      variant: 'body2',
                                      color: 'warning.dark',
                                    }}
                                    primary={personName}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

export default CurrentShiftPlanTab;
