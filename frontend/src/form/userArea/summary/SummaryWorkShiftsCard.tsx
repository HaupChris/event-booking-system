import React from 'react';
import { Box, Typography, Grid, alpha, useTheme } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import GroupIcon from '@mui/icons-material/Group';
import FormCard from '../../../components/core/display/FormCard';
import PriorityTimeSlot from '../../../components/core/display/PriorityTimeSlot';
import InfoPair from '../../../components/core/display/InfoPair';
import { userAreaTexts } from '../../constants/texts';
import { PRIORITIES } from '../constants';
import type { TimeSlot, WorkShift } from '../interface';

interface ShiftSlot {
  shift: WorkShift | undefined;
  timeslot: TimeSlot | undefined;
}

interface SummaryWorkShiftsCardProps {
  shiftSlot1: ShiftSlot;
  shiftSlot2: ShiftSlot;
  shiftSlot3: ShiftSlot;
  supporterBuddy: string;
  amountShifts: number;
}

function SummaryWorkShiftsCard({
  shiftSlot1,
  shiftSlot2,
  shiftSlot3,
  supporterBuddy,
  amountShifts,
}: SummaryWorkShiftsCardProps) {
  const theme = useTheme();

  return (
    <FormCard title={userAreaTexts.summaryForm.deploymentPlan} icon={<WorkIcon />}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 'medium', mb: 2, color: alpha(theme.palette.text.primary, 0.8) }}
      >
        {userAreaTexts.summaryForm.supportPriorities}
      </Typography>
      {shiftSlot1?.shift && shiftSlot1?.timeslot && (
        <PriorityTimeSlot
          priority={PRIORITIES.FIRST}
          status="success"
          shiftTitle={shiftSlot1.shift.title}
          timeSlotTitle={shiftSlot1.timeslot.title}
          startTime={shiftSlot1.timeslot.start_time}
          endTime={shiftSlot1.timeslot.end_time}
        />
      )}
      {shiftSlot2?.shift && shiftSlot2?.timeslot && (
        <PriorityTimeSlot
          priority={PRIORITIES.SECOND}
          status="info"
          shiftTitle={shiftSlot2.shift.title}
          timeSlotTitle={shiftSlot2.timeslot.title}
          startTime={shiftSlot2.timeslot.start_time}
          endTime={shiftSlot2.timeslot.end_time}
        />
      )}
      {shiftSlot3?.shift && shiftSlot3?.timeslot && (
        <PriorityTimeSlot
          priority={PRIORITIES.THIRD}
          status="warning"
          shiftTitle={shiftSlot3.shift.title}
          timeSlotTitle={shiftSlot3.timeslot.title}
          startTime={shiftSlot3.timeslot.start_time}
          endTime={shiftSlot3.timeslot.end_time}
        />
      )}
      {/* Support info */}
      <Box
        sx={{
          mt: 3,
          bgcolor: alpha(theme.palette.background.default, 0.2),
          borderRadius: '8px',
          p: 2,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <GroupIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: '1.2rem' }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'medium', color: alpha(theme.palette.text.primary, 0.8) }}
          >
            {userAreaTexts.summaryForm.supportInfo}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <InfoPair
              label="Supporter Buddy"
              value={supporterBuddy || userAreaTexts.summaryForm.noSupportBuddy}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <InfoPair
              label={userAreaTexts.summaryForm.shiftsCount}
              value={
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}
                >
                  {amountShifts}
                </Typography>
              }
            />
          </Grid>
        </Grid>
      </Box>
    </FormCard>
  );
}

export default SummaryWorkShiftsCard;
