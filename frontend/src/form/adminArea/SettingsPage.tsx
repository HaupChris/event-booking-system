import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Box, Card, CardContent, CardHeader, Divider, Snackbar, Stack } from '@mui/material';
import { TokenContext } from '../../contexts/AuthContext';
import {
  getBrandingPack,
  getPaymentLink,
  getPublicAppUrl,
  getRideShareEnabled,
  updatePassword,
  updateBrandingPack,
  updatePaymentLink,
  updatePublicAppUrl,
  updateRideShareEnabled,
} from '../../services/adminSettingsService';
import { resolvePaymentLink } from '../../utils/paymentLink';
import { getBrandingPackOptions } from '../../branding/packs';
import { useThemeMode } from '../../components/styles/theme';
import SettingsPaymentsBrandingSection from './components/SettingsPaymentsBrandingSection';
import SettingsPasswordSection from './components/SettingsPasswordSection';

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
  const [publicAppUrl, setPublicAppUrl] = useState('');
  const [publicAppUrlDraft, setPublicAppUrlDraft] = useState('');
  const [activeRole, setActiveRole] = useState<RoleKey>('admin');
  const [saving, setSaving] = useState<RoleKey | null>(null);
  const [savingPaymentLink, setSavingPaymentLink] = useState(false);
  const [savingPublicAppUrl, setSavingPublicAppUrl] = useState(false);
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

    getPublicAppUrl(token)
      .then((response) => {
        setPublicAppUrl(response.public_app_url);
        setPublicAppUrlDraft(response.public_app_url);
      })
      .catch(() => {
        showSnackbar('Failed to load public app URL.', 'error');
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

  const handlePublicAppUrlSave = async () => {
    const trimmedValue = publicAppUrlDraft.trim().replace(/\/+$/, '');
    if (!trimmedValue) {
      showSnackbar('Public app URL must not be empty.', 'error');
      return;
    }

    if (!trimmedValue.startsWith('http://') && !trimmedValue.startsWith('https://')) {
      showSnackbar('Public app URL must start with http:// or https://', 'error');
      return;
    }

    try {
      setSavingPublicAppUrl(true);
      await updatePublicAppUrl(token, trimmedValue);
      setPublicAppUrl(trimmedValue);
      setPublicAppUrlDraft(trimmedValue);
      showSnackbar('Public app URL updated.', 'success');
    } catch {
      showSnackbar('Failed to update public app URL.', 'error');
    } finally {
      setSavingPublicAppUrl(false);
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
                publicAppUrl={publicAppUrl}
                publicAppUrlDraft={publicAppUrlDraft}
                savingPublicAppUrl={savingPublicAppUrl}
                onPublicAppUrlDraftChange={setPublicAppUrlDraft}
                onPublicAppUrlSave={handlePublicAppUrlSave}
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

            <SettingsPasswordSection
              roles={ROLES}
              activeRole={activeRole}
              selectedRoleLabel={selectedRoleLabel}
              selectedPasswords={selectedPasswords}
              selectedVisibility={selectedVisibility}
              passwordMismatch={passwordMismatch}
              saving={saving}
              primaryButtonSx={primaryButtonSx}
              onActiveRoleChange={(role) => setActiveRole(role as RoleKey)}
              onNewPasswordChange={(value) => handleChange(activeRole, 'newPassword', value)}
              onConfirmPasswordChange={(value) =>
                handleChange(activeRole, 'confirmPassword', value)
              }
              onToggleNewPasswordVisibility={() =>
                togglePasswordVisibility(activeRole, 'newPassword')
              }
              onToggleConfirmPasswordVisibility={() =>
                togglePasswordVisibility(activeRole, 'confirmPassword')
              }
              onSubmit={() => handleSubmit(activeRole)}
            />
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
