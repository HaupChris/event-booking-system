import type { ReactNode } from 'react';
import React from 'react';
import type { SelectProps, SelectChangeEvent } from '@mui/material';
import { Select, MenuItem, Typography, IconButton, alpha, useTheme } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useThemeMode } from '../../styles/theme';
import type { SxProps, Theme } from '@mui/material/styles';
import { useBrandingPack } from '../../../branding/useBrandingPack';

export interface SpaceSelectOption {
  value: string | number;
  label: string;
}

type ResponsiveWidth =
  | string
  | number
  | { xs?: string | number; sm?: string | number; md?: string | number };

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
  minWidth?: ResponsiveWidth;
  maxWidth?: ResponsiveWidth;
}

const getCircusSelectSx = (
  minWidth: WWSelectProps['minWidth'],
  maxWidth: WWSelectProps['maxWidth'],
  sx: SxProps<Theme> | undefined
): SxProps<Theme> => ({
  width: '100%',
  minWidth,
  maxWidth,
  borderRadius: '14px',
  bgcolor: 'rgba(26, 11, 18, 0.62)',
  position: 'relative',
  boxShadow: '0 10px 24px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(244,205,142,0.15)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 7,
    left: 7,
    width: 9,
    height: 9,
    borderRadius: '50%',
    backgroundColor: '#8c6539',
    border: '1px solid #d8b87a',
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 7,
    right: 28,
    width: 9,
    height: 9,
    borderRadius: '50%',
    backgroundColor: '#8c6539',
    border: '1px solid #d8b87a',
    zIndex: 1,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#cda163',
    borderWidth: 3,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#d8b87a',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#d8b87a',
    boxShadow: '0 0 12px rgba(216, 184, 122, 0.32)',
  },
  '& .MuiSelect-select': {
    color: '#f4ead6',
    py: 0.95,
    fontFamily: '"Merriweather", serif',
    fontSize: { xs: '0.98rem', sm: '1.08rem' },
    whiteSpace: 'normal',
    lineHeight: 1.3,
    textOverflow: 'clip',
  },
  '& .MuiSvgIcon-root': {
    color: '#caa266',
  },
  ...sx,
});

const getDefaultSelectSx = (
  minWidth: WWSelectProps['minWidth'],
  maxWidth: WWSelectProps['maxWidth'],
  theme: Theme,
  brandingPack: ReturnType<typeof useBrandingPack>,
  sx: SxProps<Theme> | undefined
): SxProps<Theme> => ({
  width: '100%',
  minWidth,
  maxWidth,
  borderRadius: brandingPack.decoration.cardRadius,
  bgcolor: alpha(theme.palette.background.paper, 0.42),
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.primary.main, 0.3),
    borderWidth: 1,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.primary.main, 0.5),
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '& .MuiSelect-select': {
    color: theme.palette.text.primary,
    py: 1.25,
    fontFamily: brandingPack.typography.body,
    whiteSpace: 'normal',
    lineHeight: 1.3,
    textOverflow: 'clip',
  },
  '& .MuiSvgIcon-root': {
    color: alpha(theme.palette.text.primary, 0.7),
  },
  ...sx,
});

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
  maxWidth = { xs: '100%', md: '760px' },
  ...selectProps
}) => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    onChange(event.target.value as string | number);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(null);
  };

  // Determine if the value is selected (not null/undefined/empty string)
  const hasValue = value !== null && value !== undefined && value !== '';

  const selectSx = isCircusMode
    ? getCircusSelectSx(minWidth, maxWidth, sx)
    : getDefaultSelectSx(minWidth, maxWidth, theme, brandingPack, sx);

  const menuPaperSx: SxProps<Theme> = isCircusMode
    ? {
        bgcolor: 'rgba(35, 17, 22, 0.98)',
        borderRadius: '14px',
        border: '2px solid',
        borderColor: '#cda163',
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5)`,
        '& .MuiMenuItem-root': {
          color: '#f4ead6',
          fontFamily: '"Merriweather", serif',
          fontSize: '0.98rem',
          whiteSpace: 'normal',
          lineHeight: 1.35,
          alignItems: 'flex-start',
          py: 1.1,
          '&:hover': {
            bgcolor: 'rgba(205, 161, 99, 0.18)',
          },
          '&:nth-of-type(odd)': {
            bgcolor: 'rgba(255, 255, 255, 0.02)',
          },
          '&:nth-of-type(even)': {
            bgcolor: 'rgba(255, 255, 255, 0.06)',
          },
          '&.Mui-selected': {
            bgcolor: 'rgba(205, 161, 99, 0.24)',
            '&:hover': {
              bgcolor: 'rgba(205, 161, 99, 0.3)',
            },
          },
        },
      }
    : {
        bgcolor: alpha(theme.palette.background.default, 0.95),
        borderRadius: brandingPack.decoration.cardRadius,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.3),
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5)`,
        '& .MuiMenuItem-root': {
          color: theme.palette.text.primary,
          fontFamily: brandingPack.typography.body,
          whiteSpace: 'normal',
          lineHeight: 1.35,
          alignItems: 'flex-start',
          py: 1.1,
          '&:nth-of-type(odd)': {
            bgcolor: alpha(theme.palette.action.hover, 0.16),
          },
          '&:nth-of-type(even)': {
            bgcolor: alpha(theme.palette.action.hover, 0.28),
          },
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
      };

  return (
    <Select
      value={value !== null && value !== undefined ? value : ''}
      onChange={handleChange}
      displayEmpty
      fullWidth={isFullWidth}
      disabled={disabled}
      renderValue={(selected) => {
        const isEmptySelected = selected === null || selected === undefined || selected === '';

        if (isEmptySelected) {
          const placeholderSx = isCircusMode
            ? { color: '#d8b87a', fontFamily: '"Merriweather", serif', fontSize: '0.95rem' }
            : {
                color: alpha(theme.palette.text.primary, 0.55),
                fontFamily: brandingPack.typography.body,
              };

          return (
            <Typography variant="body2" sx={placeholderSx}>
              {placeholder}
            </Typography>
          );
        }

        if (renderCustomValue) {
          return renderCustomValue(selected as string | number);
        }

        // Find the matching option to display its label
        const selectedOption = options.find((opt) => String(opt.value) === String(selected));

        return (
          <Typography
            variant="body2"
            sx={
              isCircusMode
                ? {
                    color: '#f4ead6',
                    fontFamily: '"Merriweather", serif',
                    fontSize: '1rem',
                    whiteSpace: 'normal',
                    lineHeight: 1.3,
                  }
                : {
                    color: theme.palette.text.primary,
                    fontFamily: brandingPack.typography.body,
                    whiteSpace: 'normal',
                    lineHeight: 1.3,
                  }
            }
          >
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
        ...selectSx,
      }}
      MenuProps={{
        PaperProps: {
          sx: menuPaperSx,
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
