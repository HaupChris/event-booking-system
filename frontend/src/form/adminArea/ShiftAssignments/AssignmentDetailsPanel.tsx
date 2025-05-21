// src/form/adminArea/ShiftAssignments/AssignmentDetailsPanel.tsx
import React from 'react';
import {
  Paper, Box, Typography, TableContainer, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, IconButton, Button
} from '@mui/material';
import { Close, Delete, Add } from '@mui/icons-material';
import { Assignment, TimeslotSummary, BookingSummary } from './types';

interface AssignmentDetailsPanelProps {
  type: 'timeslot' | 'booking';
  assignments: Assignment[];
  timeslotDetails?: TimeslotSummary;
  bookingDetails?: BookingSummary;
  onClose: () => void;
  onAssign: () => void;
  onDelete: (assignmentId: number) => Promise<void>;
  getPriorityLabel: (priority: number) => string;
  getPriorityColor: (priority: number) => "success" | "primary" | "warning" | "default";
}

const AssignmentDetailsPanel: React.FC<AssignmentDetailsPanelProps> = ({
  type,
  assignments,
  timeslotDetails,
  bookingDetails,
  onClose,
  onAssign,
  onDelete,
  getPriorityLabel,
  getPriorityColor
}) => {
  return (
    <Paper sx={{ mt: 3, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {type === 'timeslot' && timeslotDetails ?
            `Assignments for ${timeslotDetails.workshift_title}: ${timeslotDetails.timeslot_title}` :
            type === 'booking' && bookingDetails ?
              `Assignments for ${bookingDetails.first_name} ${bookingDetails.last_name}` :
              'Assignment Details'
          }
        </Typography>

        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {type === 'timeslot' ? (
                <>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Priority</TableCell>
                </>
              ) : (
                <>
                  <TableCell>Workshift</TableCell>
                  <TableCell>Timeslot</TableCell>
                  <TableCell align="center">Priority</TableCell>
                </>
              )}
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id} hover>
                {type === 'timeslot' ? (
                  <>
                    <TableCell>{assignment.first_name} {assignment.last_name}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getPriorityLabel(assignment.priority)}
                        color={getPriorityColor(assignment.priority)}
                        size="small"
                      />
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{assignment.workshift_title}</TableCell>
                    <TableCell>{assignment.timeslot_title}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getPriorityLabel(assignment.priority)}
                        color={getPriorityColor(assignment.priority)}
                        size="small"
                      />
                    </TableCell>
                  </>
                )}
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(assignment.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {assignments.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
          {type === 'timeslot' ?
            "No assignments for this timeslot yet" :
            "No assignments for this participant yet"
          }
        </Typography>
      )}

      <Button
        variant="contained"
        size="small"
        startIcon={<Add />}
        onClick={onAssign}
        disabled={type === 'timeslot' && timeslotDetails?.is_filled ||
                 type === 'booking' && bookingDetails?.is_fully_assigned}
        sx={{ mt: 2 }}
      >
        Add Assignment
      </Button>
    </Paper>
  );
};

export default AssignmentDetailsPanel;