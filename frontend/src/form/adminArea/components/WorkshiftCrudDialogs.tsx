import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
} from '@mui/material';
import type { WorkshiftFormState, TimeslotFormState } from './workshiftCrudTypes';

interface WorkshiftCrudDialogsProps {
  editingWorkshift: boolean;
  workshiftDialogOpen: boolean;
  workshiftForm: WorkshiftFormState;
  onCloseWorkshiftDialog: () => void;
  onWorkshiftChange: (next: WorkshiftFormState) => void;
  onSaveWorkshift: () => void;
  editingTimeslot: boolean;
  timeslotDialogOpen: boolean;
  timeslotForm: TimeslotFormState;
  onCloseTimeslotDialog: () => void;
  onTimeslotChange: (next: TimeslotFormState) => void;
  onSaveTimeslot: () => void;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  };
  onCloseSnackbar: () => void;
}

const WorkshiftCrudDialogs: React.FC<WorkshiftCrudDialogsProps> = ({
  editingWorkshift,
  workshiftDialogOpen,
  workshiftForm,
  onCloseWorkshiftDialog,
  onWorkshiftChange,
  onSaveWorkshift,
  editingTimeslot,
  timeslotDialogOpen,
  timeslotForm,
  onCloseTimeslotDialog,
  onTimeslotChange,
  onSaveTimeslot,
  snackbar,
  onCloseSnackbar,
}) => {
  return (
    <>
      <Dialog open={workshiftDialogOpen} onClose={onCloseWorkshiftDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingWorkshift ? 'Edit Workshift' : 'Add Workshift'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Display title"
              value={workshiftForm.title}
              onChange={(event) =>
                onWorkshiftChange({ ...workshiftForm, title: event.target.value })
              }
              size="small"
              autoFocus
            />
            <TextField
              label="Working title"
              value={workshiftForm.working_title}
              onChange={(event) =>
                onWorkshiftChange({ ...workshiftForm, working_title: event.target.value })
              }
              size="small"
            />
            <TextField
              label="Description"
              value={workshiftForm.description}
              onChange={(event) =>
                onWorkshiftChange({ ...workshiftForm, description: event.target.value })
              }
              size="small"
              multiline
              minRows={2}
            />
            <TextField
              label="Mehrfach Auswahl moeglich"
              value={workshiftForm.multiple_selection_possible}
              onChange={(event) =>
                onWorkshiftChange({
                  ...workshiftForm,
                  multiple_selection_possible: event.target.value,
                })
              }
              size="small"
              type="number"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseWorkshiftDialog}>Cancel</Button>
          <Button onClick={onSaveWorkshift} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={timeslotDialogOpen} onClose={onCloseTimeslotDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTimeslot ? 'Edit Timeslot' : 'Add Timeslot'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Display title"
              value={timeslotForm.title}
              onChange={(event) => onTimeslotChange({ ...timeslotForm, title: event.target.value })}
              size="small"
              autoFocus
            />
            <TextField
              label="Working title"
              value={timeslotForm.working_title}
              onChange={(event) =>
                onTimeslotChange({ ...timeslotForm, working_title: event.target.value })
              }
              size="small"
            />
            <TextField
              label="Start time"
              value={timeslotForm.start_time}
              onChange={(event) =>
                onTimeslotChange({ ...timeslotForm, start_time: event.target.value })
              }
              size="small"
            />
            <TextField
              label="End time"
              value={timeslotForm.end_time}
              onChange={(event) =>
                onTimeslotChange({ ...timeslotForm, end_time: event.target.value })
              }
              size="small"
            />
            <TextField
              label="Num needed"
              value={timeslotForm.num_needed}
              onChange={(event) =>
                onTimeslotChange({ ...timeslotForm, num_needed: event.target.value })
              }
              size="small"
              type="number"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseTimeslotDialog}>Cancel</Button>
          <Button onClick={onSaveTimeslot} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={onCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={onCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WorkshiftCrudDialogs;
