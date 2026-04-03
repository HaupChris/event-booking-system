import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Save, Visibility, VisibilityOff } from '@mui/icons-material';
import { TokenContext } from '../../contexts/AuthContext';
import {
  getBrandingPack,
  getPaymentLink,
  getRideShareEnabled,
  updatePassword,
  updateBrandingPack,
  updatePaymentLink,
  updateRideShareEnabled,
} from '../../services/adminSettingsService';
import { resolvePaymentLink } from '../../utils/paymentLink';
import { getBrandingPackOptions } from '../../branding/packs';
import { useThemeMode } from '../../components/styles/theme';
import SettingsPaymentsBrandingSection from './components/SettingsPaymentsBrandingSection';

interface RolePasswords {
  newPassword: string;
  confirmPassword: string;
}

interface RolePasswordVisibility {
  newPassword: boolean;
  confirmPassword: boolean;
}

type RoleKey = 'admin' | 'user' | 'artist';

const ROLES: { key: RoleKey; label: string }[] = [
  { key: 'admin', label: 'Admin' },
  { key: 'user', label: 'User' },
  { key: 'artist', label: 'Artist' },
];

const INITIAL_STATE: RolePasswords = { newPassword: '', confirmPassword: '' };
const INITIAL_VISIBILITY: RolePasswordVisibility = { newPassword: false, confirmPassword: false };

const SettingsPage: React.FC = () => {
  const { token } = useContext(TokenContext);
  const { setBrandingPackId } = useThemeMode();
  const brandingPackOptions = getBrandingPackOptions();

  const [passwords, setPasswords] = useState<Record<RoleKey, RolePasswords>>({
    admin: { ...INITIAL_STATE },
    user: { ...INITIAL_STATE },
    artist: { ...INITIAL_STATE },
  });
  const [paymentLink, setPaymentLink] = useState('');
  const [paymentLinkDraft, setPaymentLinkDraft] = useState('');
  const [activeRole, setActiveRole] = useState<RoleKey>('admin');
  const [saving, setSaving] = useState<RoleKey | null>(null);
  const [savingPaymentLink, setSavingPaymentLink] = useState(false);
  const [brandingPack, setBrandingPack] = useState('');
  const [brandingPackDraft, setBrandingPackDraft] = useState('');
  const [savingBrandingPack, setSavingBrandingPack] = useState(false);
  const [rideshareEnabled, setRideshareEnabled] = useState(true);
  const [rideshareEnabledDraft, setRideshareEnabledDraft] = useState(true);
  const [savingRideShareEnabled, setSavingRideShareEnabled] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState<
    Record<RoleKey, RolePasswordVisibility>
  >({
    admin: { ...INITIAL_VISIBILITY },
    user: { ...INITIAL_VISIBILITY },
    artist: { ...INITIAL_VISIBILITY },
  });
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

  const togglePasswordVisibility = (role: RoleKey, field: keyof RolePasswordVisibility) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: !prev[role][field],
      },
    }));
  };

  useEffect(() => {
    getPaymentLink(token)
      .then((response) => {
        const link = resolvePaymentLink(response.payment_link);
        setPaymentLink(link);
        setPaymentLinkDraft(link);
      })
      .catch(() => {
        const fallback = resolvePaymentLink(undefined);
        setPaymentLink(fallback);
        setPaymentLinkDraft(fallback);
        showSnackbar('Failed to load payment link.', 'error');
      });

    getBrandingPack(token)
      .then((response) => {
        const pack = response.branding_pack;
        setBrandingPack(pack);
        setBrandingPackDraft(pack);
      })
      .catch(() => {
        showSnackbar('Failed to load branding pack.', 'error');
      });

    getRideShareEnabled(token)
      .then((response) => {
        setRideshareEnabled(response.rideshare_enabled);
        setRideshareEnabledDraft(response.rideshare_enabled);
      })
      .catch(() => {
        showSnackbar('Failed to load rideshare toggle.', 'error');
      });
  }, [showSnackbar, token]);

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
      setPasswordVisibility((prev) => ({ ...prev, [role]: { ...INITIAL_VISIBILITY } }));
      showSnackbar(`${role.charAt(0).toUpperCase() + role.slice(1)} password updated.`, 'success');
    } catch {
      showSnackbar('Failed to update password.', 'error');
    } finally {
      setSaving(null);
    }
  };

  const handlePaymentLinkSave = async () => {
    const trimmedValue = paymentLinkDraft.trim();
    if (!trimmedValue) {
      showSnackbar('Payment link must not be empty.', 'error');
      return;
    }

    if (!trimmedValue.startsWith('http://') && !trimmedValue.startsWith('https://')) {
      showSnackbar('Payment link must start with http:// or https://', 'error');
      return;
    }

    try {
      setSavingPaymentLink(true);
      await updatePaymentLink(token, trimmedValue);
      setPaymentLink(trimmedValue);
      setPaymentLinkDraft(trimmedValue);
      showSnackbar('Payment link updated.', 'success');
    } catch {
      showSnackbar('Failed to update payment link.', 'error');
    } finally {
      setSavingPaymentLink(false);
    }
  };

  const handleBrandingPackSave = async () => {
    const trimmedPack = brandingPackDraft.trim();
    if (!trimmedPack) {
      showSnackbar('Branding pack must not be empty.', 'error');
      return;
    }

    try {
      setSavingBrandingPack(true);
      await updateBrandingPack(token, trimmedPack);
      setBrandingPack(trimmedPack);
      setBrandingPackDraft(trimmedPack);
      setBrandingPackId(trimmedPack);
      showSnackbar('Branding pack updated.', 'success');
    } catch {
      showSnackbar('Failed to update branding pack.', 'error');
    } finally {
      setSavingBrandingPack(false);
    }
  };

  const handleRideShareEnabledSave = async () => {
    try {
      setSavingRideShareEnabled(true);
      await updateRideShareEnabled(token, rideshareEnabledDraft);
      setRideshareEnabled(rideshareEnabledDraft);
      showSnackbar('Rideshare toggle updated.', 'success');
    } catch {
      showSnackbar('Failed to update rideshare toggle.', 'error');
    } finally {
      setSavingRideShareEnabled(false);
    }
  };

  const selectedRoleLabel = ROLES.find((role) => role.key === activeRole)?.label || 'Admin';
  const selectedPasswords = passwords[activeRole];
  const selectedVisibility = passwordVisibility[activeRole];
  const passwordMismatch =
    !!selectedPasswords.confirmPassword &&
    selectedPasswords.newPassword !== selectedPasswords.confirmPassword;
  const primaryButtonSx = {
    bgcolor: 'primary.main',
    boxShadow: 'none',
    '&:hover': {
      bgcolor: 'primary.dark',
      boxShadow: 'none',
    },
  };

  return (
    <Box sx={{ maxWidth: 860 }}>
      <Card variant="outlined">
        <CardHeader
          title="Settings"
          subheader="Manage payment link and access credentials"
          sx={{ pb: 1, px: 2.5, pt: 2.5 }}
        />
        <CardContent sx={{ pt: 0, px: 2.5, pb: 2.5 }}>
          <Stack spacing={2.5}>
            <Box>
              <SettingsPaymentsBrandingSection
                paymentLink={paymentLink}
                paymentLinkDraft={paymentLinkDraft}
                savingPaymentLink={savingPaymentLink}
                onPaymentLinkDraftChange={setPaymentLinkDraft}
                onPaymentLinkSave={handlePaymentLinkSave}
                brandingPack={brandingPack}
                brandingPackDraft={brandingPackDraft}
                brandingPackOptions={brandingPackOptions}
                savingBrandingPack={savingBrandingPack}
                onBrandingPackDraftChange={setBrandingPackDraft}
                onBrandingPackSave={handleBrandingPackSave}
                rideshareEnabled={rideshareEnabled}
                rideshareEnabledDraft={rideshareEnabledDraft}
                savingRideShareEnabled={savingRideShareEnabled}
                onToggleRideShareEnabledDraft={setRideshareEnabledDraft}
                onRideShareEnabledSave={handleRideShareEnabledSave}
                primaryButtonSx={primaryButtonSx}
              />
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                Passwords
              </Typography>
              <Tabs
                value={activeRole}
                onChange={(_, value: RoleKey) => setActiveRole(value)}
                variant="scrollable"
                allowScrollButtonsMobile
                sx={{ mb: 2, minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 0.5 } }}
              >
                {ROLES.map((role) => (
                  <Tab key={role.key} value={role.key} label={role.label} />
                ))}
              </Tabs>

              <Stack spacing={1.5} sx={{ maxWidth: 420 }}>
                <TextField
                  label={`${selectedRoleLabel} New Password`}
                  type={selectedVisibility.newPassword ? 'text' : 'password'}
                  size="small"
                  value={selectedPasswords.newPassword}
                  onChange={(event) => handleChange(activeRole, 'newPassword', event.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => togglePasswordVisibility(activeRole, 'newPassword')}
                          aria-label="Toggle new password visibility"
                        >
                          {selectedVisibility.newPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirm Password"
                  type={selectedVisibility.confirmPassword ? 'text' : 'password'}
                  size="small"
                  value={selectedPasswords.confirmPassword}
                  onChange={(event) =>
                    handleChange(activeRole, 'confirmPassword', event.target.value)
                  }
                  error={passwordMismatch}
                  helperText={passwordMismatch ? 'Passwords do not match' : ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => togglePasswordVisibility(activeRole, 'confirmPassword')}
                          aria-label="Toggle confirm password visibility"
                        >
                          {selectedVisibility.confirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Save />}
                  disabled={
                    saving === activeRole ||
                    !selectedPasswords.newPassword ||
                    selectedPasswords.newPassword !== selectedPasswords.confirmPassword
                  }
                  onClick={() => handleSubmit(activeRole)}
                  sx={{ ...primaryButtonSx, alignSelf: 'flex-start', minWidth: 190, height: 36 }}
                >
                  {saving === activeRole ? 'Saving...' : `Save ${selectedRoleLabel} Password`}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

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
