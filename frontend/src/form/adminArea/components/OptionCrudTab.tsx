import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TokenContext } from '../../../contexts/AuthContext';
import {
  createAdminOption,
  deleteAdminOption,
  getAdminOptions,
  type AdminOptionItem,
  type AdminOptionScope,
  type AdminOptionType,
  updateAdminOption,
} from '../../../services/adminOptionService';
import { getAdminTitle } from '../utils/titleUtils';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import OptionCrudDialogs from './OptionCrudDialogs';
import OptionCrudList from './OptionCrudList';
import { DEFAULT_OPTION_FORM, type OptionFormState } from './optionCrudTypes';

interface OptionCrudTabProps {
  optionType: AdminOptionType;
  onDataChanged: () => Promise<void>;
}

const OptionCrudTab: React.FC<OptionCrudTabProps> = ({ optionType, onDataChanged }) => {
  const { token } = useContext(TokenContext);
  const [scope, setScope] = useState<AdminOptionScope>('regular');
  const [optionMap, setOptionMap] = useState<Record<AdminOptionScope, AdminOptionItem[]>>({
    regular: [],
    artist: [],
  });
  const [loading, setLoading] = useState(true);
  const [optionDialogOpen, setOptionDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<AdminOptionItem | null>(null);
  const [optionForm, setOptionForm] = useState<OptionFormState>(DEFAULT_OPTION_FORM);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [deleteTarget, setDeleteTarget] = useState<AdminOptionItem | null>(null);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      const [regularOptions, artistOptions] = await Promise.all([
        getAdminOptions(token, 'regular', optionType),
        getAdminOptions(token, 'artist', optionType),
      ]);
      setOptionMap({ regular: regularOptions, artist: artistOptions });
    } catch {
      showSnackbar('Failed to load options.', 'error');
    } finally {
      setLoading(false);
    }
  }, [optionType, token]);

  useEffect(() => {
    fetchOptions().then();
  }, [fetchOptions]);

  const sortedOptions = useMemo(
    () => [...optionMap[scope]].sort((a, b) => a.id - b.id),
    [optionMap, scope]
  );

  const closeOptionDialog = () => {
    setOptionDialogOpen(false);
    setEditingOption(null);
    setOptionForm(DEFAULT_OPTION_FORM);
  };

  const openCreateOptionDialog = () => {
    setEditingOption(null);
    setOptionForm(DEFAULT_OPTION_FORM);
    setOptionDialogOpen(true);
  };

  const openEditOptionDialog = (option: AdminOptionItem) => {
    setEditingOption(option);
    setOptionForm({
      title: option.title,
      working_title: option.working_title,
      price: String(option.price ?? 0),
      amount: String(option.amount ?? 0),
      requires_workshift: option.requires_workshift !== false,
      description: option.description || '',
    });
    setOptionDialogOpen(true);
  };

  const refreshAfterMutation = async () => {
    await fetchOptions();
    await onDataChanged();
  };

  const handleSaveOption = async () => {
    const title = optionForm.title.trim();
    const workingTitle = optionForm.working_title.trim() || title;
    const price = Number(optionForm.price);
    const amount = Number(optionForm.amount);

    if (!title) {
      showSnackbar('Display title is required.', 'error');
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      showSnackbar('Price must be a non-negative number.', 'error');
      return;
    }

    if (optionType === 'ticket' && (Number.isNaN(amount) || amount < 0)) {
      showSnackbar('Amount must be a non-negative integer.', 'error');
      return;
    }

    const payload = {
      title,
      working_title: workingTitle,
      price,
      amount: optionType === 'ticket' ? Math.floor(amount) : undefined,
      requires_workshift: optionType === 'ticket' ? optionForm.requires_workshift : undefined,
      description:
        optionType === 'beverage' || optionType === 'food' ? optionForm.description : undefined,
    };

    try {
      if (editingOption) {
        await updateAdminOption(token, scope, optionType, editingOption.id, payload);
      } else {
        await createAdminOption(token, scope, optionType, payload);
      }
      closeOptionDialog();
      await refreshAfterMutation();
      showSnackbar('Option saved.', 'success');
    } catch {
      showSnackbar('Failed to save option.', 'error');
    }
  };

  const requestDeleteOption = (optionId: number) => {
    const option = optionMap[scope].find((item) => item.id === optionId) || null;
    setDeleteTarget(option);
  };

  const handleConfirmDeleteOption = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteAdminOption(token, scope, optionType, deleteTarget.id);
      await refreshAfterMutation();
      showSnackbar('Option deleted.', 'success');
    } catch {
      showSnackbar('Failed to delete option (possibly in use).', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <OptionCrudList
        optionType={optionType}
        scope={scope}
        options={sortedOptions}
        loading={loading}
        onScopeChange={setScope}
        onAddOption={openCreateOptionDialog}
        onEditOption={openEditOptionDialog}
        onDeleteOption={requestDeleteOption}
      />

      <OptionCrudDialogs
        optionType={optionType}
        editingOption={Boolean(editingOption)}
        optionDialogOpen={optionDialogOpen}
        optionForm={optionForm}
        onCloseOptionDialog={closeOptionDialog}
        onOptionChange={setOptionForm}
        onSaveOption={handleSaveOption}
        snackbar={snackbar}
        onCloseSnackbar={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete option?"
        message="Are you sure you want to delete this option? This action cannot be undone."
        itemName={deleteTarget ? getAdminTitle(deleteTarget) : ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteOption}
      />
    </>
  );
};

export default OptionCrudTab;
