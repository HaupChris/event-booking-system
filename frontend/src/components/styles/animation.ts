// src/styles/animations.ts
import { keyframes } from '@mui/material';

export const animations = {
  gradientMove: keyframes`
    0% { background-position: 0% 0%; }
    100% { background-position: 300% 0%; }
  `,

  scanDown: keyframes`
    0% { transform: translateY(0); }
    100% { transform: translateY(100%); }
  `,

  rocketLaunch: keyframes`
    0% { transform: translateX(-50%) translateY(0); }
    20% { transform: translateX(-50%) translateY(-10px); }
    30% { transform: translateX(-50%) translateY(-5px); }
    40% { transform: translateX(-50%) translateY(-15px); }
    100% { transform: translateX(-50%) translateY(-800px) scale(0); }
  `,

  flameFlicker: keyframes`
    0% { opacity: 0.8; height: 90%; }
    100% { opacity: 1; height: 100%; }
  `,

  gelatine: keyframes`
    from, to { transform: scale(1, 1); }
    25% { transform: scale(0.8, 1.3); }
    50% { transform: scale(1.3, 0.8); }
    75% { transform: scale(0.8, 1.3); }
    100% { transform: scale(1, 1); }
  `,
};

export default animations;