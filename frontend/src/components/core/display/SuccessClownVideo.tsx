import React, { useCallback, useEffect, useState } from 'react';
import { Box, alpha, useTheme } from '@mui/material';
import clownSuccessVideo from '../../../assets/vids/Clown_Gif_Mit_Success_Animation.mp4';

interface SuccessClownVideoProps {
  width?: number;
}

const SuccessClownVideo: React.FC<SuccessClownVideoProps> = ({ width = 220 }) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const hideAfterFade = useCallback(() => {
    setIsFadingOut(true);
  }, []);

  useEffect(() => {
    if (!isFadingOut) {
      return;
    }

    const fadeTimeout = window.setTimeout(() => {
      setIsVisible(false);
    }, 500);

    return () => {
      window.clearTimeout(fadeTimeout);
    };
  }, [isFadingOut]);

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mb: 3,
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'translateY(-6px) scale(0.98)' : 'translateY(0) scale(1)',
        transition: 'opacity 500ms ease, transform 500ms ease',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width,
          maxWidth: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(ellipse at center, transparent 56%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
          },
        }}
      >
        <Box
          component="video"
          src={clownSuccessVideo}
          autoPlay
          muted
          playsInline
          controls={false}
          onEnded={hideAfterFade}
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
          sx={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            backgroundColor: 'transparent',
            display: 'block',
          }}
        />
      </Box>
    </Box>
  );
};

export default SuccessClownVideo;
