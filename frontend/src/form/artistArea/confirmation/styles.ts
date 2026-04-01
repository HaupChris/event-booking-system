import { alpha } from '@mui/material';

export const circusSectionCardSx = {
  border: '2px solid',
  borderColor: alpha('#d8b87a', 0.88),
  backgroundColor: alpha('#1a0b12', 0.58),
  backgroundImage: 'none !important',
  borderRadius: '14px',
};

export const circusButtonSx = {
  border: '1px solid',
  borderColor: alpha('#f3d79f', 0.75),
  background: 'linear-gradient(180deg, rgba(214,150,58,0.98) 0%, rgba(172,103,36,0.97) 100%)',
  color: '#2b140e',
  fontFamily: '"Rye", serif',
  '&:hover': {
    background: 'linear-gradient(180deg, rgba(229,166,72,0.98) 0%, rgba(182,113,40,0.98) 100%)',
  },
};
