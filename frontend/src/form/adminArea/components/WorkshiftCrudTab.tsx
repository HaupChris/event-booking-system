import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TokenContext } from '../../../contexts/AuthContext';
import {
  createAdminTimeslot,
  createAdminWorkshift,
  deleteAdminTimeslot,
  deleteAdminWorkshift,
  getAdminWorkshifts,
  type AdminTimeSlot,
  type AdminWorkShift,
  updateAdminTimeslot,
  updateAdminWorkshift,
} from '../../../services/adminWorkshiftService';
import WorkshiftCrudDialogs from './WorkshiftCrudDialogs';
import WorkshiftCrudList from './WorkshiftCrudList';
import {
  DEFAULT_TIMESLOT_FORM,
  DEFAULT_WORKSHIFT_FORM,
  type TimeslotFormState,
  type WorkshiftFormState,
} from './workshiftCrudTypes';

interface WorkshiftCrudTabProps {
  onDataChanged: () => Promise<void>;
}

const WorkshiftCrudTab: React.FC<WorkshiftCrudTabProps> = ({ onDataChanged }) => {
  const { token } = useContext(TokenContext);
  const [workshifts, setWorkshifts] = useState<AdminWorkShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [workshiftDialogOpen, setWorkshiftDialogOpen] = useState(false);
  const [timeslotDialogOpen, setTimeslotDialogOpen] = useState(false);
  const [editingWorkshift, setEditingWorkshift] = useState<AdminWorkShift | null>(null);
  const [editingTimeslot, setEditingTimeslot] = useState<AdminTimeSlot | null>(null);
  const [timeslotParentWorkshiftId, setTimeslotParentWorkshiftId] = useState<number | null>(null);
  const [workshiftForm, setWorkshiftForm] = useState<WorkshiftFormState>(DEFAULT_WORKSHIFT_FORM);
  const [timeslotForm, setTimeslotForm] = useState<TimeslotFormState>(DEFAULT_TIMESLOT_FORM);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchWorkshifts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminWorkshifts(token);
      setWorkshifts(data);
    } catch {
      showSnackbar('Failed to load workshifts.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWorkshifts().then();
  }, [fetchWorkshifts]);

  const sortedWorkshifts = useMemo(() => [...workshifts].sort((a, b) => a.id - b.id), [workshifts]);

  const closeWorkshiftDialog = () => {
    setWorkshiftDialogOpen(false);
    setEditingWorkshift(null);
    setWorkshiftForm(DEFAULT_WORKSHIFT_FORM);
  };

  const closeTimeslotDialog = () => {
    setTimeslotDialogOpen(false);
    setEditingTimeslot(null);
    setTimeslotParentWorkshiftId(null);
    setTimeslotForm(DEFAULT_TIMESLOT_FORM);
  };

  const openCreateWorkshiftDialog = () => {
    setEditingWorkshift(null);
    setWorkshiftForm(DEFAULT_WORKSHIFT_FORM);
    setWorkshiftDialogOpen(true);
  };

  const openEditWorkshiftDialog = (workshift: AdminWorkShift) => {
    setEditingWorkshift(workshift);
    setWorkshiftForm({
      title: workshift.title,
      working_title: workshift.working_title,
      description: workshift.description,
      multiple_selection_possible: String(workshift.multiple_selection_possible),
    });
    setWorkshiftDialogOpen(true);
  };

  const openCreateTimeslotDialog = (workshiftId: number) => {
    setEditingTimeslot(null);
    setTimeslotParentWorkshiftId(workshiftId);
    setTimeslotForm(DEFAULT_TIMESLOT_FORM);
    setTimeslotDialogOpen(true);
  };

  const openEditTimeslotDialog = (timeslot: AdminTimeSlot) => {
    setEditingTimeslot(timeslot);
    setTimeslotParentWorkshiftId(timeslot.workshift_id);
    setTimeslotForm({
      title: timeslot.title,
      working_title: timeslot.working_title,
      start_time: timeslot.start_time,
      end_time: timeslot.end_time,
      num_needed: String(timeslot.num_needed),
    });
    setTimeslotDialogOpen(true);
  };

  const refreshAfterMutation = async () => {
    await fetchWorkshifts();
    await onDataChanged();
  };

  const handleSaveWorkshift = async () => {
    const title = workshiftForm.title.trim();
    const workingTitle = workshiftForm.working_title.trim() || title;
    const multipleSelection = Number(workshiftForm.multiple_selection_possible);
    if (!title) {
      showSnackbar('Display title is required.', 'error');
      return;
    }
    if (Number.isNaN(multipleSelection) || multipleSelection < 1) {
      showSnackbar('Mehrfach Auswahl moeglich must be at least 1.', 'error');
      return;
    }

    try {
      if (editingWorkshift) {
        await updateAdminWorkshift(token, editingWorkshift.id, {
          title,
          working_title: workingTitle,
          description: workshiftForm.description,
          multiple_selection_possible: multipleSelection,
        });
      } else {
        await createAdminWorkshift(token, {
          title,
          working_title: workingTitle,
          description: workshiftForm.description,
          multiple_selection_possible: multipleSelection,
        });
      }
      closeWorkshiftDialog();
      await refreshAfterMutation();
      showSnackbar('Workshift saved.', 'success');
    } catch {
      showSnackbar('Failed to save workshift.', 'error');
    }
  };

  const handleDeleteWorkshift = async (workshiftId: number) => {
    try {
      await deleteAdminWorkshift(token, workshiftId);
      await refreshAfterMutation();
      showSnackbar('Workshift deleted.', 'success');
    } catch {
      showSnackbar('Failed to delete workshift (possibly in use).', 'error');
    }
  };

  const handleSaveTimeslot = async () => {
    const title = timeslotForm.title.trim();
    const workingTitle = timeslotForm.working_title.trim() || title;
    const numNeeded = Number(timeslotForm.num_needed);
    if (!title) {
      showSnackbar('Timeslot display title is required.', 'error');
      return;
    }
    if (Number.isNaN(numNeeded) || numNeeded < 1) {
      showSnackbar('Num needed must be at least 1.', 'error');
      return;
    }

    try {
      if (editingTimeslot) {
        await updateAdminTimeslot(token, editingTimeslot.id, {
          title,
          working_title: workingTitle,
          start_time: timeslotForm.start_time,
          end_time: timeslotForm.end_time,
          num_needed: numNeeded,
        });
      } else if (timeslotParentWorkshiftId !== null) {
        await createAdminTimeslot(token, timeslotParentWorkshiftId, {
          title,
          working_title: workingTitle,
          start_time: timeslotForm.start_time,
          end_time: timeslotForm.end_time,
          num_needed: numNeeded,
        });
      }
      closeTimeslotDialog();
      await refreshAfterMutation();
      showSnackbar('Timeslot saved.', 'success');
    } catch {
      showSnackbar('Failed to save timeslot.', 'error');
    }
  };

  const handleDeleteTimeslot = async (timeslotId: number) => {
    try {
      await deleteAdminTimeslot(token, timeslotId);
      await refreshAfterMutation();
      showSnackbar('Timeslot deleted.', 'success');
    } catch {
      showSnackbar('Failed to delete timeslot (possibly in use).', 'error');
    }
  };

  return (
    <>
      <WorkshiftCrudList
        workshifts={sortedWorkshifts}
        loading={loading}
        onAddWorkshift={openCreateWorkshiftDialog}
        onEditWorkshift={openEditWorkshiftDialog}
        onDeleteWorkshift={handleDeleteWorkshift}
        onAddTimeslot={openCreateTimeslotDialog}
        onEditTimeslot={openEditTimeslotDialog}
        onDeleteTimeslot={handleDeleteTimeslot}
      />
      <WorkshiftCrudDialogs
        editingWorkshift={Boolean(editingWorkshift)}
        workshiftDialogOpen={workshiftDialogOpen}
        workshiftForm={workshiftForm}
        onCloseWorkshiftDialog={closeWorkshiftDialog}
        onWorkshiftChange={setWorkshiftForm}
        onSaveWorkshift={handleSaveWorkshift}
        editingTimeslot={Boolean(editingTimeslot)}
        timeslotDialogOpen={timeslotDialogOpen}
        timeslotForm={timeslotForm}
        onCloseTimeslotDialog={closeTimeslotDialog}
        onTimeslotChange={setTimeslotForm}
        onSaveTimeslot={handleSaveTimeslot}
        snackbar={snackbar}
        onCloseSnackbar={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default WorkshiftCrudTab;
