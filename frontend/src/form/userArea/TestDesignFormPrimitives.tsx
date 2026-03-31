import React from 'react';
import { Box, InputBase } from '@mui/material';
import type { ChangeEvent } from 'react';

interface OrnateInputProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  size?: 'default' | 'compact';
}

export const confettiPieces = [
  { top: '10%', left: '14%', size: 10, color: '#78d2ff', rotate: '8deg' },
  { top: '12%', right: '22%', size: 8, color: '#ef6f61', rotate: '-9deg' },
  { top: '22%', left: '30%', size: 7, color: '#8dd36a', rotate: '20deg' },
  { top: '28%', right: '12%', size: 9, color: '#ffd04f', rotate: '-16deg' },
  { top: '35%', left: '8%', size: 8, color: '#9d7cff', rotate: '15deg' },
  { top: '42%', right: '35%', size: 7, color: '#5ec8ff', rotate: '-8deg' },
  { top: '48%', left: '40%', size: 8, color: '#ffd04f', rotate: '12deg' },
  { top: '56%', right: '8%', size: 10, color: '#ef6f61', rotate: '-20deg' },
];

const cornerDotSx = {
  content: '""',
  width: 9,
  height: 9,
  borderRadius: '50%',
  backgroundColor: '#8c6539',
  border: '1px solid #d8b87a',
};

export const OrnateInput: React.FC<OrnateInputProps> = ({
  label,
  icon,
  value,
  onChange,
  type = 'text',
  size = 'default',
}) => {
  const isCompact = size === 'compact';

  return (
    <Box sx={{ position: 'relative', mb: isCompact ? 1.8 : 3 }}>
      <Box
        sx={{
          position: 'absolute',
          top: isCompact ? -10 : -12,
          left: 24,
          zIndex: 2,
          backgroundColor: '#231116',
          px: isCompact ? 0.9 : 1.2,
          color: '#d8b87a',
          fontFamily: "'Merriweather', serif",
          fontSize: isCompact ? { xs: '0.85rem', sm: '1.05rem' } : { xs: '1.05rem', sm: '1.9rem' },
          lineHeight: 1,
          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
        }}
      >
        {label}
      </Box>
      <Box
        sx={{
          position: 'relative',
          border: '3px solid #cda163',
          borderRadius: isCompact ? '14px' : '18px',
          minHeight: isCompact ? { xs: 56, sm: 62 } : { xs: 72, sm: 86 },
          backgroundColor: 'rgba(26, 11, 18, 0.62)',
          backdropFilter: 'blur(1px)',
          display: 'flex',
          alignItems: 'center',
          px: isCompact ? { xs: 1.4, sm: 1.8 } : { xs: 2, sm: 3 },
          gap: isCompact ? 1.1 : 1.8,
          boxShadow: '0 10px 24px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(244,205,142,0.15)',
          '&::before': { ...cornerDotSx, position: 'absolute', top: 7, left: 7 },
          '&::after': { ...cornerDotSx, position: 'absolute', top: 7, right: 7 },
        }}
      >
        <Box
          sx={{
            color: '#caa266',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: isCompact ? 22 : 28,
            '& .MuiSvgIcon-root': {
              fontSize: isCompact ? '1.35rem' : undefined,
            },
          }}
        >
          {icon}
        </Box>
        <InputBase
          value={value}
          onChange={onChange}
          type={type}
          sx={{
            flex: 1,
            color: '#f4ead6',
            fontFamily: "'Merriweather', serif",
            fontSize: isCompact ? { xs: '0.98rem', sm: '1.1rem' } : { xs: '1.2rem', sm: '2rem' },
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            '& input': { py: isCompact ? 0.45 : 0.9 },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 7,
            left: 7,
            ...cornerDotSx,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 7,
            right: 7,
            ...cornerDotSx,
          }}
        />
      </Box>
    </Box>
  );
};
