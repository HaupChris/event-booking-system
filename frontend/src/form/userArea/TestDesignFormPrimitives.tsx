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
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  readOnly?: boolean;
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

const getLabelFontSize = (isCompact: boolean) => {
  if (isCompact) {
    return { xs: '0.85rem', sm: '1.05rem' };
  }
  return { xs: '1.05rem', sm: '1.9rem' };
};

const getInputFontSize = (isCompact: boolean) => {
  if (isCompact) {
    return { xs: '0.98rem', sm: '1.1rem' };
  }
  return { xs: '1.2rem', sm: '2rem' };
};

const getContainerMinHeight = (multiline: boolean, isCompact: boolean) => {
  if (multiline) {
    if (isCompact) {
      return { xs: 92, sm: 104 };
    }
    return { xs: 108, sm: 132 };
  }

  if (isCompact) {
    return { xs: 56, sm: 62 };
  }

  return { xs: 72, sm: 86 };
};

const getContainerPaddingY = (multiline: boolean, isCompact: boolean) => {
  if (!multiline) {
    return 0;
  }
  return isCompact ? 0.95 : 1.2;
};

const getInputPaddingY = (isCompact: boolean) => {
  return isCompact ? 0.45 : 0.9;
};

const getTextareaPaddingTop = (isCompact: boolean) => {
  return isCompact ? 2 : 4;
};

const getTextareaPaddingBottom = (isCompact: boolean) => {
  return isCompact ? 4 : 6;
};

const getRows = (multiline: boolean, rows: number | undefined) => {
  if (!multiline) {
    return undefined;
  }
  return rows;
};

export const OrnateInput: React.FC<OrnateInputProps> = ({
  label,
  icon,
  value,
  onChange,
  type = 'text',
  size = 'default',
  placeholder,
  multiline = false,
  rows,
  readOnly = false,
}) => {
  const isCompact = size === 'compact';
  const labelFontSize = getLabelFontSize(isCompact);
  const inputFontSize = getInputFontSize(isCompact);
  const minHeight = getContainerMinHeight(multiline, isCompact);
  const containerPaddingY = getContainerPaddingY(multiline, isCompact);
  const inputPaddingY = getInputPaddingY(isCompact);
  const textareaPaddingTop = getTextareaPaddingTop(isCompact);
  const textareaPaddingBottom = getTextareaPaddingBottom(isCompact);
  const inputRows = getRows(multiline, rows);

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
          fontSize: labelFontSize,
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
          minHeight,
          backgroundColor: 'rgba(26, 11, 18, 0.62)',
          backdropFilter: 'blur(1px)',
          display: 'flex',
          alignItems: multiline ? 'flex-start' : 'center',
          px: isCompact ? { xs: 1.4, sm: 1.8 } : { xs: 2, sm: 3 },
          py: containerPaddingY,
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
          multiline={multiline}
          rows={inputRows}
          placeholder={placeholder}
          readOnly={readOnly}
          sx={{
            flex: 1,
            color: '#f4ead6',
            fontFamily: "'Merriweather', serif",
            fontSize: inputFontSize,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            '& input': { py: inputPaddingY },
            '& textarea': {
              paddingTop: textareaPaddingTop,
              paddingBottom: textareaPaddingBottom,
              resize: 'vertical',
            },
            '& input::placeholder, & textarea::placeholder': {
              color: 'rgba(229,207,159,0.72)',
              opacity: 1,
            },
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
