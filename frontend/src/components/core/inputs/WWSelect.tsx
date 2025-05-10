// src/components/core/inputs/SpaceSelect.tsx
import React, { ReactNode } from 'react';
import {
  Select,
  SelectProps,
  MenuItem,
  Typography,
  IconButton,
  alpha,
  SelectChangeEvent
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { spacePalette } from '../../styles/theme';
import { SxProps, Theme } from '@mui/material/styles';

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
  minWidth?: string | number | { xs?: string | number, sm?: string | number, md?: string | number };
}

const WWSelect: React.FC<WWSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Bitte wählen',
  allowClear = false,
  isFullWidth = false,
  disabled = false,
  label,
  renderCustomValue,
  sx,
  minWidth = { xs: '100%', sm: '200px' },
  ...selectProps
}) => {
  const handleChange = (event: SelectChangeEvent<unknown>) => {
    onChange(event.target.value as string | number);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(null);
  };

  // Determine if the value is selected (not null/undefined/empty string)
  const hasValue = value !== null && value !== undefined && value !== '';

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
            <Typography variant="body2" sx={{ color: alpha('#fff', 0.5) }}>
              {placeholder}
            </Typography>
          );
        }
        
        if (renderCustomValue) {
          return renderCustomValue(selected as string | number);
        }
        
        // Find the matching option to display its label
        const selectedOption = options.find(opt => opt.value === selected);
        return (
          <Typography variant="body2" sx={{ color: alpha('#fff', 0.9) }}>
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
            sx={{ marginRight: 2, color: alpha('#fff', 0.7) }}
          >
            <Close fontSize="small" />
          </IconButton>
        ) : null
      }
      sx={{
        minWidth: minWidth,
        borderRadius: "8px",
        bgcolor: alpha('#020c1b', 0.4),
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: alpha(spacePalette.primary.main, 0.3),
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: alpha(spacePalette.primary.main, 0.5),
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: spacePalette.primary.main,
        },
        '& .MuiSelect-select': {
          color: alpha('#fff', 0.9),
          py: 1.25,
        },
        '& .MuiSvgIcon-root': {
          color: alpha('#fff', 0.7),
        },
        ...sx
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            bgcolor: alpha('#020c1b', 0.95),
            borderRadius: '8px',
            border: '1px solid',
            borderColor: alpha(spacePalette.primary.main, 0.3),
            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5)`,
            '& .MuiMenuItem-root': {
              color: alpha('#fff', 0.9),
              '&:hover': {
                bgcolor: alpha(spacePalette.primary.main, 0.1),
              },
              '&.Mui-selected': {
                bgcolor: alpha(spacePalette.primary.main, 0.2),
                '&:hover': {
                  bgcolor: alpha(spacePalette.primary.main, 0.3),
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