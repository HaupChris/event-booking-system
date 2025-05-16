import { alpha } from '@mui/material';
import { spacePalette } from './theme';

export const mixins = {
  spacePanel: {
    background: 'radial-gradient(circle at bottom left, #061429 0%, #071f3b 100%)',
    boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
    border: `1px solid ${alpha(spacePalette.primary.main, 0.2)}`,
    borderRadius: '14px',
    overflow: 'hidden',
    position: 'relative',
  },
  headerGradient: {
    width: '100%',
    height: '6px',
    background: `linear-gradient(90deg, ${spacePalette.primary.dark}, ${spacePalette.primary.main}, ${spacePalette.primary.light}, ${spacePalette.primary.dark})`,
    backgroundSize: '300% 100%',
    animation: 'gradientMove 12s linear infinite',
  },
  missionBriefing: {
    py: 1.5,
    px: 2,
    backgroundColor: alpha('#000', 0.3),
    borderLeft: '4px solid',
    borderColor: spacePalette.primary.dark,
    mx: { xs: 1, sm: 2 },
    my: 2,
    borderRadius: '0 8px 8px 0',
  },
  footerBar: {
    p: 1.5,
    backgroundColor: '#041327',
    borderTop: '1px solid',
    borderColor: alpha(spacePalette.primary.main, 0.2),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
};

export default mixins;