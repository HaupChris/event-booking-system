// src/components/core/inputs/FormField.tsx
import React from 'react';
import { TextField, TextFieldProps, InputAdornment, alpha } from '@mui/material';
import { spacePalette } from '../../styles/theme';

interface FormFieldProps extends Omit<TextFieldProps, 'variant'> {
  icon?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  icon,
  ...props
}) => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      margin="normal"
      {...props}
      InputProps={{
        ...props.InputProps,
        startAdornment: icon ? (
          <InputAdornment position="start">
            {React.cloneElement(icon as React.ReactElement, {
              sx: { color: spacePalette.primary.main }
            })}
          </InputAdornment>
        ) : props.InputProps?.startAdornment,
      }}
      sx={{
        mt: 0,
        mb: 2.5,
        '& .MuiOutlinedInput-root': {
          backgroundColor: alpha('#020c1b', 0.7),
          borderRadius: '8px',
          '& fieldset': {
            borderColor: alpha(spacePalette.primary.main, 0.3),
            borderWidth: 1,
            transition: 'all 0.2s ease-in-out',
          },
          '&:hover fieldset': {
            borderColor: alpha(spacePalette.primary.main, 0.5),
          },
          '&.Mui-focused fieldset': {
            borderColor: spacePalette.primary.main,
            borderWidth: 2,
          },
          '&.Mui-error fieldset': {
            borderColor: spacePalette.status.error,
          },
        },
        '& .MuiInputLabel-root': {
          color: alpha('#fff', 0.7),
          '&.Mui-focused': {
            color: spacePalette.primary.main,
          },
          '&.Mui-error': {
            color: spacePalette.status.error,
          },
        },
        '& .MuiInputBase-input': {
          color: alpha('#fff', 0.9),
          caretColor: spacePalette.primary.main,
        },
        ...props.sx
      }}
    />
  );
};

export default FormField;