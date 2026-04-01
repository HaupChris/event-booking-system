import React, { useRef, useEffect } from 'react';
import { Box, Button, Typography, alpha, useTheme } from '@mui/material';
import { useThemeMode } from '../../styles/theme';
import { useBrandingPack } from '../../../branding/useBrandingPack';

interface SignaturePadProps {
  currentSignature: string;
  updateCurrentSignature: (signature: string) => void;
  penColor?: string;
  clearOnResize?: boolean;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  currentSignature,
  updateCurrentSignature,
  penColor,
  clearOnResize = false,
}) => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';
  const resolvedPenColor = penColor ?? (isCircusMode ? '#e6c586' : theme.palette.primary.main);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);

  // Draw existing signature when the component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext('2d');
    if (!ctxRef.current) return;

    // Clear the canvas
    const width = canvas.width;
    const height = canvas.height;
    ctxRef.current.clearRect(0, 0, width, height);

    // Start a new path
    ctxRef.current.beginPath();

    if (currentSignature) {
      // Draw the image if signature exists
      const img = new Image();
      img.onload = () => {
        ctxRef.current?.drawImage(img, 0, 0);
      };
      img.src = currentSignature;
    }
  }, [currentSignature]);

  // Handle touch and mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext('2d');
    if (!ctxRef.current) return;

    // Initialize context settings
    ctxRef.current.strokeStyle = resolvedPenColor;
    ctxRef.current.lineJoin = 'round';
    ctxRef.current.lineWidth = 2;

    // Handle coordinates for both mouse and touch events
    const getCoordinates = (clientX: number, clientY: number): { x: number; y: number } => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (clientX - rect.left) * (canvasRef.current.width / rect.width);
      const y = (clientY - rect.top) * (canvasRef.current.height / rect.height);
      return { x, y };
    };

    const handleStart = (clientX: number, clientY: number) => {
      drawing.current = true;
      const { x, y } = getCoordinates(clientX, clientY);
      ctxRef.current?.moveTo(x, y);
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!drawing.current) return;
      const { x, y } = getCoordinates(clientX, clientY);
      ctxRef.current?.lineTo(x, y);
      ctxRef.current?.stroke();
    };

    const handleEnd = () => {
      if (!drawing.current) return;
      drawing.current = false;
      if (!canvasRef.current) return;
      const dataURL = canvasRef.current.toDataURL();
      updateCurrentSignature(dataURL);
    };

    // Mouse event listeners
    const handleMouseDown = (event: MouseEvent) => {
      handleStart(event.clientX, event.clientY);
    };

    const handleMouseMove = (event: MouseEvent) => {
      handleMove(event.clientX, event.clientY);
    };

    // Touch event listeners
    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      handleStart(touch.clientX, touch.clientY);
      event.preventDefault();
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      handleMove(touch.clientX, touch.clientY);
      event.preventDefault();
    };

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd);

    let handleResize: (() => void) | undefined;

    // Handle window resize
    if (clearOnResize) {
      handleResize = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        ctxRef.current?.clearRect(0, 0, canvas.width, canvas.height);
      };
      window.addEventListener('resize', handleResize);
    }

    // Clean up on unmount
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('mouseleave', handleEnd);

      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleEnd);

      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [resolvedPenColor, clearOnResize, updateCurrentSignature]);

  const clearSignature = () => {
    updateCurrentSignature('');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Box
        sx={{
          p: isCircusMode ? 1.4 : 1,
          border: isCircusMode ? '2px solid' : '1px dashed',
          borderColor: isCircusMode
            ? alpha('#d8b87a', 0.9)
            : alpha(theme.palette.primary.main, 0.5),
          borderRadius: isCircusMode ? '14px' : '10px',
          background: isCircusMode ? 'rgba(26, 11, 18, 0.72)' : alpha('#000', 0.2),
          boxShadow: isCircusMode
            ? '0 8px 18px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(244,205,142,0.12)'
            : 'inset 0 0 20px rgba(0,0,0,0.3)',
          mb: 1,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          ...(isCircusMode && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 7,
              left: 7,
              width: 9,
              height: 9,
              borderRadius: '50%',
              backgroundColor: '#8c6539',
              border: '1px solid #d8b87a',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 7,
              right: 7,
              width: 9,
              height: 9,
              borderRadius: '50%',
              backgroundColor: '#8c6539',
              border: '1px solid #d8b87a',
            },
          }),
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            touchAction: 'none',
            width: '100%',
            maxWidth: '560px',
            height: '200px',
            border: isCircusMode
              ? `3px solid ${alpha('#cda163', 0.95)}`
              : `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
            borderRadius: isCircusMode ? '14px' : '10px',
            background: isCircusMode ? 'rgba(26, 11, 18, 0.62)' : 'transparent',
          }}
          width={560}
          height={200}
        />
      </Box>

      {isCircusMode && (
        <Typography
          variant="caption"
          sx={{
            color: alpha('#e5cf9f', 0.9),
            fontFamily: brandingPack.typography.body,
            mb: 0.5,
          }}
        >
          Bitte unterschreibe im Feld mit Maus oder Finger.
        </Typography>
      )}

      <Button
        color="primary"
        onClick={clearSignature}
        sx={{
          mt: 1.2,
          ...(isCircusMode && {
            borderRadius: '12px',
            border: '2px solid',
            borderColor: alpha('#d8b87a', 0.8),
            color: '#f4ead6',
            fontFamily: brandingPack.typography.accent,
            backgroundColor: 'rgba(74, 41, 24, 0.52)',
            '&:hover': {
              backgroundColor: 'rgba(74, 41, 24, 0.72)',
            },
          }),
        }}
      >
        Loeschen
      </Button>
    </Box>
  );
};

export default SignaturePad;
