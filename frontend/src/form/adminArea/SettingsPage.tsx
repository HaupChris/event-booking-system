import React, { useCallback, useContext, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Snackbar,
  TextField,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { TokenContext } from '../../contexts/AuthContext';
import { updatePassword } from '../../services/adminSettingsService';

interface RolePasswords {
  newPassword: string;
  confirmPassword: string;
}

type RoleKey = 'admin' | 'user' | 'artist';

const ROLES: { key: RoleKey; label: string }[] = [
  { key: 'admin', label: 'Admin' },
  { key: 'user', label: 'User' },
  { key: 'artist', label: 'Artist' },
];

const INITIAL_STATE: RolePasswords = { newPassword: '', confirmPassword: '' };

const SettingsPage: React.FC = () => {
  const { token } = useContext(TokenContext);

  const [passwords, setPasswords] = useState<Record<RoleKey, RolePasswords>>({
    admin: { ...INITIAL_STATE },
    user: { ...INITIAL_STATE },
    artist: { ...INITIAL_STATE },
  });
  const [saving, setSaving] = useState<RoleKey | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleChange = (role: RoleKey, field: keyof RolePasswords, value: string) => {
    setPasswords((prev) => ({
      ...prev,
      [role]: { ...prev[role], [field]: value },
    }));
  };

  const handleSubmit = async (role: RoleKey) => {
    const { newPassword, confirmPassword } = passwords[role];

    if (!newPassword) {
      showSnackbar('Password must not be empty.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showSnackbar('Passwords do not match.', 'error');
      return;
    }

    try {
      setSaving(role);
      await updatePassword(token, role, newPassword);
      setPasswords((prev) => ({ ...prev, [role]: { ...INITIAL_STATE } }));
      showSnackbar(`${role.charAt(0).toUpperCase() + role.slice(1)} password updated.`, 'success');
    } catch {
      showSnackbar('Failed to update password.', 'error');
    } finally {
      setSaving(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {ROLES.map(({ key, label }) => (
          <Card key={key} variant="outlined">
            <CardHeader title={`${label} Password`} />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                <TextField
                  label="New Password"
                  type="password"
                  size="small"
                  value={passwords[key].newPassword}
                  onChange={(e) => handleChange(key, 'newPassword', e.target.value)}
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  size="small"
                  value={passwords[key].confirmPassword}
                  onChange={(e) => handleChange(key, 'confirmPassword', e.target.value)}
                  error={
                    !!passwords[key].confirmPassword &&
                    passwords[key].newPassword !== passwords[key].confirmPassword
                  }
                  helperText={
                    passwords[key].confirmPassword &&
                    passwords[key].newPassword !== passwords[key].confirmPassword
                      ? 'Passwords do not match'
                      : ''
                  }
                />
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  disabled={
                    saving === key ||
                    !passwords[key].newPassword ||
                    passwords[key].newPassword !== passwords[key].confirmPassword
                  }
                  onClick={() => handleSubmit(key)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {saving === key ? 'Saving...' : 'Change Password'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
