import React, { useRef, useEffect, useCallback } from 'react';

interface SignaturePadProps {
  onEnd?: (dataURL: string) => void;
  penColor?: string;
  clearOnResize?: boolean;
  existingSignature?: string;
}

function CustomSignaturePad(props: SignaturePadProps) {
  const { onEnd, penColor = 'black', clearOnResize = false, existingSignature } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);

  const handleStart = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (clientY - rect.top) * (canvasRef.current.height / rect.height);
    drawing.current = true;
    // onBegin?.();
    ctxRef.current?.moveTo(x, y);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!drawing.current) return;
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (clientY - rect.top) * (canvasRef.current.height / rect.height);
    ctxRef.current?.lineTo(x, y);
    ctxRef.current?.stroke();
  };

  const handleEnd = useCallback(() => {
    drawing.current = false;
    if (!ctxRef.current || !canvasRef.current || typeof onEnd !== 'function') return;
    const dataURL = canvasRef.current.toDataURL();
    onEnd(dataURL);
  }, [onEnd]);

  // Draw existing signature when the component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    ctxRef.current = canvas?.getContext('2d') ?? null;
    if (!ctxRef.current) return;

    // Clear the canvas
    const width = canvas ? canvas.width : 0;
    const height = canvas ? canvas.height : 0;
    ctxRef.current.clearRect(0, 0, width, height);

    // Start a new path
    ctxRef.current.beginPath();

    if (!existingSignature) return; // Don't try to draw if the signature is empty

    // Draw the image
    const img = new Image();
    img.onload = () => {
      ctxRef.current?.drawImage(img, 0, 0);
    };
    img.src = existingSignature;
  }, [existingSignature]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext('2d');
    if (!ctxRef.current) return;

    ctxRef.current.strokeStyle = penColor;
    ctxRef.current.lineJoin = 'round';
    ctxRef.current.lineWidth = 2;

    // Handle normal mouse events
    const handleMouseDown = (event: MouseEvent) => {
      drawing.current = true;
      handleStart(event.clientX, event.clientY);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!drawing.current) return;
      handleMove(event.clientX, event.clientY);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);

    // Handle touch events
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
  }, [clearOnResize, handleEnd, penColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        touchAction: 'none',
        width: '300px',
        height: '200px',
        border: '2px solid #eac764',
        borderRadius: '10px',
      }} // To ensure that page scrolling is not triggered by touch events on the canvas
      width={300}
      height={200}
    />
  );
}

export default CustomSignaturePad;
