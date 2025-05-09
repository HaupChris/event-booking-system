import React, { useRef, useState, useEffect } from "react";
import { LinearProgress } from "@mui/material";
import { styled } from '@mui/system';

// Common styles moved from CSS to styled components
const ProgressContainer = styled('div')({
  position: 'relative',
});

const ProgressImage = styled('img')({
  position: 'absolute',
  top: '50%',
  transition: 'left 1.5s ease-in-out, transform 1.5s ease-in-out',
  width: 50,
  animation: 'swimming 2s infinite alternate',
  '@keyframes swimming': {
    '0%': { transform: 'translateY(-50%) rotate(0deg)' },
    '25%': { transform: 'translateY(-52%) rotate(10deg)' },
    '50%': { transform: 'translateY(-50%) rotate(0deg)' },
    '75%': { transform: 'translateY(-48%) rotate(-10deg)' },
    '100%': { transform: 'translateY(-50%) rotate(0deg)' },
  }
});

interface LinearProgressWithImageProps {
  activeStep: number;
  maxSteps: number;
  variant: "determinate";
  image: string;
}

const LinearProgressWithImage: React.FC<LinearProgressWithImageProps> = ({
  activeStep,
  maxSteps,
  variant,
  image,
}) => {
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const [imageWidth, setImageWidth] = useState<number | null>(null);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget as HTMLImageElement;
    setImageWidth(target.offsetWidth);
  };

  useEffect(() => {
    let animationRequest: number;

    const updateImagePosition = () => {
      const percentage = ((activeStep + 1) / maxSteps) * 100;
      const containerWidth = progressContainerRef.current?.offsetWidth ?? 0;

      const imgElement = document.querySelector('.progress-image') as HTMLImageElement;

      if (imgElement && imageWidth && containerWidth) {
        const verticalOffset = imageWidth / 10;
        imgElement.style.left = `calc(${percentage}% - ${imageWidth / 2}px)`;
        imgElement.style.top = `calc(50% - ${imageWidth / 6}px + ${
          verticalOffset * Math.sin((percentage / 100) * 2 * Math.PI)
        }px)`;
      }
    };

    animationRequest = requestAnimationFrame(updateImagePosition);
    return () => cancelAnimationFrame(animationRequest);
  }, [activeStep, imageWidth, maxSteps]);

  return (
    <ProgressContainer ref={progressContainerRef}>
      <LinearProgress
        value={((activeStep + 1) / maxSteps) * 100}
        variant={variant}
        sx={{ height: 8, borderRadius: 4 }}
      />
      <ProgressImage
        src={image}
        alt="progress"
        className="progress-image"
        onLoad={handleImageLoad}
        style={{
          left: imageWidth
            ? `calc(${((activeStep + 1) / maxSteps) * 100}% - ${imageWidth / 2}px)`
            : '0%',
        }}
      />
    </ProgressContainer>
  );
};

export default LinearProgressWithImage;