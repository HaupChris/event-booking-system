// src/components/core/inputs/FormField.tsx
import React from 'react';
import type { TextFieldProps } from '@mui/material';
import { TextField, InputAdornment, alpha, useTheme } from '@mui/material';
import type { InputBaseComponentProps } from '@mui/material/InputBase';
import { useThemeMode } from '../../styles/theme';
import { useBrandingPack } from '../../../branding/useBrandingPack';

interface FormFieldProps extends Omit<TextFieldProps, 'variant'> {
  icon?: React.ReactNode;
}

function FormField(props: FormFieldProps) {
  const icon = props.icon;
  const theme = useTheme();
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();

  // Get theme-specific styles
  const getFieldStyles = () => {
    if (mode === 'circus') {
      return {
        backgroundColor: alpha(theme.palette.background.paper, 0.35),
        borderColor: alpha(brandingPack.colors.panelBorder, 0.8),
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
      backgroundColor: alpha(theme.palette.background.paper, 0.45),
      borderColor: alpha(theme.palette.primary.main, 0.3),
      borderColorHover: alpha(theme.palette.primary.main, 0.5),
      borderColorFocused: theme.palette.primary.main,
      labelColor: alpha(theme.palette.text.primary, 0.72),
      labelColorFocused: theme.palette.primary.main,
      inputColor: alpha(theme.palette.text.primary, 0.92),
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
        startAdornment:
          icon && React.isValidElement<{ sx?: object }>(icon) ? (
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
          borderRadius: brandingPack.decoration.cardRadius,
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
          fontFamily: brandingPack.typography.accent,
          '&.Mui-focused': {
            color: styles.labelColorFocused,
            fontWeight: 600,
          },
          '&.Mui-error': {
            color: theme.palette.error?.main || '#f44336',
          },
          // Improve floating label visibility
          '&.MuiInputLabel-shrink': {
            backgroundColor:
              mode === 'circus'
                ? alpha(theme.palette.background.paper, 0.95)
                : alpha(theme.palette.background.default, 0.96),
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
          fontFamily: brandingPack.typography.body,
        },
        ...props.sx,
      }}
    />
  );
}

export default FormField;
