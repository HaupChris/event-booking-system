// src/components/core/inputs/FormField.tsx
import React from 'react';
import type { TextFieldProps } from '@mui/material';
import { TextField, InputAdornment, alpha, useTheme } from '@mui/material';
import type { InputBaseComponentProps } from '@mui/material/InputBase';
import { useThemeMode } from '../../styles/theme';

interface FormFieldProps extends Omit<TextFieldProps, 'variant'> {
  icon?: React.ReactNode;
}

function FormField(props: FormFieldProps) {
  const icon = props.icon;
  const theme = useTheme();
  const { mode } = useThemeMode();

  // Get theme-specific styles
  const getFieldStyles = () => {
    if (mode === 'circus') {
      return {
        backgroundColor: alpha('#4a2410', 0.4),
        borderColor: alpha('#704214', 0.6),
        borderColorHover: alpha(theme.palette.primary.main, 0.8),
        borderColorFocused: theme.palette.primary.main,
        labelColor: alpha(theme.palette.text.primary, 0.8),
        labelColorFocused: theme.palette.primary.main,
        inputColor: theme.palette.text.primary,
        caretColor: theme.palette.primary.main,
      };
    }

    // Space theme (default)
    return {
      backgroundColor: alpha('#020c1b', 0.7),
      borderColor: alpha(theme.palette.primary.main, 0.3),
      borderColorHover: alpha(theme.palette.primary.main, 0.5),
      borderColorFocused: theme.palette.primary.main,
      labelColor: alpha('#fff', 0.7),
      labelColorFocused: theme.palette.primary.main,
      inputColor: alpha('#fff', 0.9),
      caretColor: theme.palette.primary.main,
    };
  };

  const styles = getFieldStyles();

  return (
    <TextField
      variant="outlined"
      fullWidth
      margin="normal"
      {...props}
      InputProps={{
        ...props.InputProps,
        ...(props.multiline && !props.InputProps?.inputComponent
          ? { inputComponent: 'textarea' as React.ElementType<InputBaseComponentProps> }
          : {}),
        startAdornment: icon && React.isValidElement<{ sx?: object }>(icon) ? (
          <InputAdornment position="start">
            {React.cloneElement(icon, {
              sx: {
                ...(icon.props.sx ?? {}),
                color: theme.palette.primary.main,
              },
            })}
          </InputAdornment>
        ) : (
          props.InputProps?.startAdornment
        ),
      }}
      sx={{
        mt: 0,
        mb: 2.5,
        '& .MuiOutlinedInput-root': {
          backgroundColor: styles.backgroundColor,
          borderRadius: '8px',
          '& fieldset': {
            borderColor: styles.borderColor,
            borderWidth: mode === 'circus' ? 2 : 1,
            transition: 'all 0.2s ease-in-out',
          },
          '&:hover fieldset': {
            borderColor: styles.borderColorHover,
          },
          '&.Mui-focused fieldset': {
            borderColor: styles.borderColorFocused,
            borderWidth: 2,
            ...(mode === 'circus' && {
              boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            }),
          },
          '&.Mui-error fieldset': {
            borderColor: theme.palette.error?.main || '#f44336',
          },
        },
        '& .MuiInputLabel-root': {
          color: styles.labelColor,
          fontWeight: 500,
          '&.Mui-focused': {
            color: styles.labelColorFocused,
            fontWeight: 600,
          },
          '&.Mui-error': {
            color: theme.palette.error?.main || '#f44336',
          },
          // Improve floating label visibility
          '&.MuiInputLabel-shrink': {
            backgroundColor: mode === 'circus' ? '#2d1810' : '#020c1b',
            paddingLeft: '6px',
            paddingRight: '6px',
            marginLeft: '-3px',
            fontWeight: 600,
            color: styles.labelColorFocused,
          },
        },
        '& .MuiInputBase-input': {
          color: styles.inputColor,
          caretColor: styles.caretColor,
        },
        ...props.sx,
      }}
    />
  );
}

export default FormField;
