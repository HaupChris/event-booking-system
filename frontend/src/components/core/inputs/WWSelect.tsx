import type { ReactNode } from 'react';
import React from 'react';
import type { SelectProps, SelectChangeEvent } from '@mui/material';
import { Select, MenuItem, Typography, IconButton, alpha, useTheme } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useThemeMode } from '../../styles/theme';
import type { SxProps, Theme } from '@mui/material/styles';

export interface SpaceSelectOption {
  value: string | number;
  label: string;
}

interface WWSelectProps extends Omit<SelectProps, 'onChange'> {
  options: SpaceSelectOption[];
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  placeholder?: string;
  allowClear?: boolean;
  isFullWidth?: boolean;
  disabled?: boolean;
  label?: string;
  renderCustomValue?: (value: string | number) => ReactNode;
  sx?: SxProps<Theme>;
  minWidth?: string | number | { xs?: string | number; sm?: string | number; md?: string | number };
}

const WWSelect: React.FC<WWSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Bitte wählen',
  allowClear = false,
  isFullWidth = false,
  disabled = false,
  renderCustomValue,
  sx,
  minWidth = { xs: '100%', sm: '200px' },
  ...selectProps
}) => {
  const theme = useTheme();
  const { mode } = useThemeMode();

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    onChange(event.target.value as string | number);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(null);
  };

  // Determine if the value is selected (not null/undefined/empty string)
  const hasValue = value !== null && value !== undefined && value !== '';

  // Theme-aware styling
  const getBackgroundColor = () => {
    if (mode === 'circus') {
      return alpha('#4a2410', 0.4);
    }
    return alpha('#020c1b', 0.4);
  };

  const getMenuBackgroundColor = () => {
    if (mode === 'circus') {
      return alpha('#2d1810', 0.98);
    }
    return alpha('#020c1b', 0.95);
  };

  return (
    <Select
      value={value !== null && value !== undefined ? value : ''}
      onChange={handleChange}
      displayEmpty
      fullWidth={isFullWidth}
      disabled={disabled}
      renderValue={(selected) => {
        if (!selected) {
          return (
            <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.5) }}>
              {placeholder}
            </Typography>
          );
        }

        if (renderCustomValue) {
          return renderCustomValue(selected as string | number);
        }

        // Find the matching option to display its label
        const selectedOption = options.find((opt) => opt.value === selected);
        return (
          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
            {selectedOption ? selectedOption.label : String(selected)}
          </Typography>
        );
      }}
      endAdornment={
        allowClear && hasValue ? (
          <IconButton
            onClick={handleClear}
            size="small"
            edge="end"
            sx={{ marginRight: 2, color: alpha(theme.palette.text.primary, 0.7) }}
          >
            <Close fontSize="small" />
          </IconButton>
        ) : null
      }
      sx={{
        minWidth: minWidth,
        borderRadius: '8px',
        bgcolor: getBackgroundColor(),
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: alpha(theme.palette.primary.main, 0.3),
          borderWidth: mode === 'circus' ? 2 : 1,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: alpha(theme.palette.primary.main, 0.5),
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
          ...(mode === 'circus' && {
            boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.3)}`,
          }),
        },
        '& .MuiSelect-select': {
          color: theme.palette.text.primary,
          py: 1.25,
        },
        '& .MuiSvgIcon-root': {
          color: alpha(theme.palette.text.primary, 0.7),
        },
        ...sx,
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            bgcolor: getMenuBackgroundColor(),
            borderRadius: '8px',
            border: mode === 'circus' ? '2px solid' : '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.3),
            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5)`,
            '& .MuiMenuItem-root': {
              color: theme.palette.text.primary,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.3),
                },
              },
            },
          },
        },
      }}
      {...selectProps}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export default WWSelect;
