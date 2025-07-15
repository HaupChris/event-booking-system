import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails, List
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { FormContent, WorkShift, TimeSlot } from '../../../userArea/interface';
import { ShiftAssignment } from '../types';
import { ShiftAssignmentAPI } from '../api';
import TimeslotItem from './TimeslotItem';

interface TimeslotWithAssignments extends TimeSlot {
  assigned_count: number;
  fill_percentage: number;
  is_filled: boolean;
  assignments: ShiftAssignment[];
}

interface WorkshiftWithTimeslots extends WorkShift {
  time_slots: TimeslotWithAssignments[];
}

interface WorkshiftListProps {
  formContent: FormContent;
  selectedTimeslot: number | null;
  onTimeslotSelect: (timeslotId: number) => void;
  token: string;
}

const WorkshiftList: React.FC<WorkshiftListProps> = ({
  formContent,
  selectedTimeslot,
  onTimeslotSelect,
  token
}) => {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch assignments on component mount
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const data = await ShiftAssignmentAPI.getAllAssignments(token);
        setAssignments(data);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [token]);

  // Merge workshifts with assignment data
  const workshiftsWithAssignments = useMemo((): WorkshiftWithTimeslots[] => {
    return formContent.work_shifts.map(workshift => ({
      ...workshift,
      time_slots: workshift.time_slots.map(timeslot => {
        const timeslotAssignments = assignments.filter(a => a.timeslot_id === timeslot.id);
        const assigned_count = timeslotAssignments.length;
        const fill_percentage = timeslot.num_needed > 0 ? (assigned_count / timeslot.num_needed) * 100 : 0;

        return {
          ...timeslot,
          assigned_count,
          fill_percentage,
          is_filled: assigned_count >= timeslot.num_needed,
          assignments: timeslotAssignments
        };
      })
    }));
  }, [formContent.work_shifts, assignments]);

return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Fixed Header - No Scrolling */}
      <Box sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        flexShrink: 0,
        bgcolor: 'background.paper'
      }}>
        <Typography variant="body2" color="text.secondary">
          {selectedTimeslot ? 'Selected timeslot highlighted' : 'Select a timeslot to view user priorities'}
        </Typography>
      </Box>

      {/* Scrollable Workshifts List */}
      <Box sx={{
        flexGrow: 1,
        overflow: 'auto'
      }}>
        {workshiftsWithAssignments.map(workshift => (
          <Accordion key={workshift.id} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {workshift.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {workshift.time_slots.length} timeslots
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <List>
                {workshift.time_slots.map(timeslot => (
                  <TimeslotItem
                    key={timeslot.id}
                    timeslot={timeslot}
                    isSelected={selectedTimeslot === timeslot.id}
                    onSelect={onTimeslotSelect}
                  />
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};


export default WorkshiftList;