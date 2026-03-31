import React from 'react';
import { Box, Checkbox, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

export interface OrnateCheckboxOption {
  id: number;
  label: string;
}

interface OrnateCheckboxOptionListProps {
  options: OrnateCheckboxOption[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  sx?: SxProps<Theme>;
}

const OrnateCheckboxOptionList: React.FC<OrnateCheckboxOptionListProps> = ({
  options,
  selectedIds,
  onToggle,
  sx,
}) => {
  return (
    <Box sx={sx}>
      {options.map((option) => {
        const checked = selectedIds.includes(option.id);

        return (
          <Box
            key={option.id}
            onClick={() => onToggle(option.id)}
            sx={{
              mb: 1,
              px: 1.4,
              py: 0.75,
              border: '2px solid',
              borderColor: checked ? '#d8b87a' : 'rgba(205, 161, 99, 0.55)',
              borderRadius: '12px',
              backgroundColor: checked ? 'rgba(54, 23, 15, 0.82)' : 'rgba(32, 14, 11, 0.7)',
              boxShadow: checked ? '0 0 10px rgba(205, 161, 99, 0.28)' : 'none',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#d8b87a',
                backgroundColor: 'rgba(57, 24, 16, 0.88)',
              },
            }}
          >
            <Checkbox
              checked={checked}
              onChange={() => onToggle(option.id)}
              sx={{
                p: 0.5,
                mr: 0.8,
                color: 'rgba(205, 161, 99, 0.8)',
                '&.Mui-checked': {
                  color: '#d8b87a',
                },
              }}
            />
            <Typography
              sx={{
                color: '#f4ead6',
                fontFamily: "'Merriweather', serif",
                fontSize: '0.98rem',
                fontWeight: checked ? 700 : 500,
              }}
            >
              {option.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default OrnateCheckboxOptionList;
