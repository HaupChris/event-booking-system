import React from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { Save, Visibility, VisibilityOff } from '@mui/icons-material';

interface RoleOption {
  key: string;
  label: string;
}

interface RolePasswords {
  newPassword: string;
  confirmPassword: string;
}

interface RolePasswordVisibility {
  newPassword: boolean;
  confirmPassword: boolean;
}

interface SettingsPasswordSectionProps {
  roles: RoleOption[];
  activeRole: string;
  selectedRoleLabel: string;
  selectedPasswords: RolePasswords;
  selectedVisibility: RolePasswordVisibility;
  passwordMismatch: boolean;
  saving: string | null;
  primaryButtonSx: SxProps<Theme>;
  onActiveRoleChange: (role: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleNewPasswordVisibility: () => void;
  onToggleConfirmPasswordVisibility: () => void;
  onSubmit: () => void;
}

const SettingsPasswordSection: React.FC<SettingsPasswordSectionProps> = ({
  roles,
  activeRole,
  selectedRoleLabel,
  selectedPasswords,
  selectedVisibility,
  passwordMismatch,
  saving,
  primaryButtonSx,
  onActiveRoleChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleNewPasswordVisibility,
  onToggleConfirmPasswordVisibility,
  onSubmit,
}) => {
  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        Passwords
      </Typography>
      <Tabs
        value={activeRole}
        onChange={(_, value: string) => onActiveRoleChange(value)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 2, minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 0.5 } }}
      >
        {roles.map((role) => (
          <Tab key={role.key} value={role.key} label={role.label} />
        ))}
      </Tabs>

      <Stack spacing={1.5} sx={{ maxWidth: 420 }}>
        <TextField
          label={`${selectedRoleLabel} New Password`}
          type={selectedVisibility.newPassword ? 'text' : 'password'}
          size="small"
          value={selectedPasswords.newPassword}
          onChange={(event) => onNewPasswordChange(event.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={onToggleNewPasswordVisibility}
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
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
          error={passwordMismatch}
          helperText={passwordMismatch ? 'Passwords do not match' : ''}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={onToggleConfirmPasswordVisibility}
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
          onClick={onSubmit}
          sx={{ ...primaryButtonSx, alignSelf: 'flex-start', minWidth: 190, height: 36 }}
        >
          {saving === activeRole ? 'Saving...' : `Save ${selectedRoleLabel} Password`}
        </Button>
      </Stack>
    </Box>
  );
};

export default SettingsPasswordSection;
