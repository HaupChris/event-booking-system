import React from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { Save } from '@mui/icons-material';

interface BrandingPackOption {
  id: string;
  label: string;
}

interface SettingsPaymentsBrandingSectionProps {
  paymentLink: string;
  paymentLinkDraft: string;
  savingPaymentLink: boolean;
  onPaymentLinkDraftChange: (value: string) => void;
  onPaymentLinkSave: () => void;
  brandingPack: string;
  brandingPackDraft: string;
  brandingPackOptions: BrandingPackOption[];
  savingBrandingPack: boolean;
  onBrandingPackDraftChange: (value: string) => void;
  onBrandingPackSave: () => void;
  rideshareEnabled: boolean;
  rideshareEnabledDraft: boolean;
  savingRideShareEnabled: boolean;
  onToggleRideShareEnabledDraft: (value: boolean) => void;
  onRideShareEnabledSave: () => void;
  primaryButtonSx: SxProps<Theme>;
}

const SettingsPaymentsBrandingSection: React.FC<SettingsPaymentsBrandingSectionProps> = ({
  paymentLink,
  paymentLinkDraft,
  savingPaymentLink,
  onPaymentLinkDraftChange,
  onPaymentLinkSave,
  brandingPack,
  brandingPackDraft,
  brandingPackOptions,
  savingBrandingPack,
  onBrandingPackDraftChange,
  onBrandingPackSave,
  rideshareEnabled,
  rideshareEnabledDraft,
  savingRideShareEnabled,
  onToggleRideShareEnabledDraft,
  onRideShareEnabledSave,
  primaryButtonSx,
}) => {
  return (
    <>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Payments
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-start">
          <TextField
            label="PayPal Link"
            size="small"
            fullWidth
            value={paymentLinkDraft}
            onChange={(event) => onPaymentLinkDraftChange(event.target.value)}
            helperText="Used in user/artist confirmation, profile page and email templates."
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<Save />}
            disabled={savingPaymentLink || paymentLinkDraft.trim() === paymentLink}
            onClick={onPaymentLinkSave}
            sx={{
              ...primaryButtonSx,
              minWidth: { xs: '100%', md: 150 },
              height: 40,
              mt: { xs: 0, md: 0.5 },
            }}
          >
            {savingPaymentLink ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Festival Branding
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-start">
          <TextField
            label="Active Branding Pack"
            size="small"
            fullWidth
            select
            value={brandingPackDraft}
            onChange={(event) => onBrandingPackDraftChange(event.target.value)}
            helperText="Used by login, registration, and profile pages."
          >
            {brandingPackOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            size="small"
            startIcon={<Save />}
            disabled={savingBrandingPack || brandingPackDraft.trim() === brandingPack}
            onClick={onBrandingPackSave}
            sx={{
              ...primaryButtonSx,
              minWidth: { xs: '100%', md: 150 },
              height: 40,
              mt: { xs: 0, md: 0.5 },
            }}
          >
            {savingBrandingPack ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Mitfahrboerse
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={rideshareEnabledDraft}
                onChange={(event) => onToggleRideShareEnabledDraft(event.target.checked)}
              />
            }
            label={rideshareEnabledDraft ? 'Aktiviert' : 'Deaktiviert'}
            sx={{ mr: 'auto', ml: 0 }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<Save />}
            disabled={savingRideShareEnabled || rideshareEnabledDraft === rideshareEnabled}
            onClick={onRideShareEnabledSave}
            sx={{
              ...primaryButtonSx,
              minWidth: { xs: '100%', md: 150 },
              height: 40,
            }}
          >
            {savingRideShareEnabled ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Box>
    </>
  );
};

export default SettingsPaymentsBrandingSection;
