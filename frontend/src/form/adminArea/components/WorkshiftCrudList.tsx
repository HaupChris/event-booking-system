import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import type { AdminTimeSlot, AdminWorkShift } from '../../../services/adminWorkshiftService';
import { getAdminTitle, getFrontendTitle } from '../utils/titleUtils';

interface WorkshiftCrudListProps {
  workshifts: AdminWorkShift[];
  loading: boolean;
  onAddWorkshift: () => void;
  onEditWorkshift: (workshift: AdminWorkShift) => void;
  onDeleteWorkshift: (workshiftId: number) => void;
  onAddTimeslot: (workshiftId: number) => void;
  onEditTimeslot: (timeslot: AdminTimeSlot) => void;
  onDeleteTimeslot: (timeslotId: number) => void;
}

const WorkshiftCrudList: React.FC<WorkshiftCrudListProps> = ({
  workshifts,
  loading,
  onAddWorkshift,
  onEditWorkshift,
  onDeleteWorkshift,
  onAddTimeslot,
  onEditTimeslot,
  onDeleteTimeslot,
}) => {
  return (
    <Box sx={{ mt: 1 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h6">Workshift and Timeslot Setup</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={onAddWorkshift}>
          Add Workshift
        </Button>
      </Box>

      {!loading && workshifts.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No workshifts configured yet.
        </Typography>
      )}

      {workshifts.map((workshift) => (
        <Card key={workshift.id} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
            >
              <Box>
                <Typography variant="h6">{getAdminTitle(workshift)}</Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.25 }}
                >
                  Frontend titel: {getFrontendTitle(workshift)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Mehrfach Auswahl moeglich: {workshift.multiple_selection_possible}
                </Typography>
              </Box>
              <Box>
                <IconButton size="small" onClick={() => onEditWorkshift(workshift)}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDeleteWorkshift(workshift.id)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {workshift.description || 'No description'}
            </Typography>

            <Button size="small" startIcon={<Add />} onClick={() => onAddTimeslot(workshift.id)}>
              Add Timeslot
            </Button>

            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ px: { xs: 1, sm: 1.5 } }}>Titel</TableCell>
                  <TableCell sx={{ px: { xs: 1, sm: 1.5 } }}>Time</TableCell>
                  <TableCell sx={{ px: { xs: 1, sm: 1.5 } }}>Needed</TableCell>
                  <TableCell align="right" sx={{ px: { xs: 1, sm: 1.5 } }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workshift.time_slots.map((timeslot) => (
                  <TableRow key={timeslot.id}>
                    <TableCell sx={{ px: { xs: 1, sm: 1.5 } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getAdminTitle(timeslot)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Frontend titel: {getFrontendTitle(timeslot)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ px: { xs: 1, sm: 1.5 } }}>
                      {timeslot.start_time || '-'} - {timeslot.end_time || '-'}
                    </TableCell>
                    <TableCell sx={{ px: { xs: 1, sm: 1.5 } }}>{timeslot.num_needed}</TableCell>
                    <TableCell align="right" sx={{ px: { xs: 1, sm: 1.5 } }}>
                      <IconButton size="small" onClick={() => onEditTimeslot(timeslot)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => onDeleteTimeslot(timeslot.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default WorkshiftCrudList;
