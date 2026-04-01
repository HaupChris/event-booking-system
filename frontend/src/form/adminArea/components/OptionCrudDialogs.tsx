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
import type { AdminOptionType } from '../../../services/adminOptionService';
import type { OptionFormState } from './optionCrudTypes';

interface OptionCrudDialogsProps {
  optionType: AdminOptionType;
  editingOption: boolean;
  optionDialogOpen: boolean;
  optionForm: OptionFormState;
  onCloseOptionDialog: () => void;
  onOptionChange: (next: OptionFormState) => void;
  onSaveOption: () => void;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  };
  onCloseSnackbar: () => void;
}

const OptionCrudDialogs: React.FC<OptionCrudDialogsProps> = ({
  optionType,
  editingOption,
  optionDialogOpen,
  optionForm,
  onCloseOptionDialog,
  onOptionChange,
  onSaveOption,
  snackbar,
  onCloseSnackbar,
}) => {
  const showDescription = optionType === 'beverage' || optionType === 'food';
  const showAmount = optionType === 'ticket';

  return (
    <>
      <Dialog open={optionDialogOpen} onClose={onCloseOptionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingOption ? 'Edit Option' : 'Add Option'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Display title"
              value={optionForm.title}
              onChange={(event) => onOptionChange({ ...optionForm, title: event.target.value })}
              size="small"
              autoFocus
            />
            <TextField
              label="Working title"
              value={optionForm.working_title}
              onChange={(event) =>
                onOptionChange({ ...optionForm, working_title: event.target.value })
              }
              size="small"
            />
            {showDescription && (
              <TextField
                label="Description"
                value={optionForm.description}
                onChange={(event) =>
                  onOptionChange({ ...optionForm, description: event.target.value })
                }
                size="small"
                multiline
                minRows={2}
              />
            )}
            <TextField
              label="Price"
              value={optionForm.price}
              onChange={(event) => onOptionChange({ ...optionForm, price: event.target.value })}
              size="small"
              type="number"
            />
            {showAmount && (
              <TextField
                label="Amount"
                value={optionForm.amount}
                onChange={(event) => onOptionChange({ ...optionForm, amount: event.target.value })}
                size="small"
                type="number"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseOptionDialog}>Cancel</Button>
          <Button onClick={onSaveOption} variant="contained">
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

export default OptionCrudDialogs;
