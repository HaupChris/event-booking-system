import { LinearProgress } from "@mui/material";
import React, { useRef, useState, useEffect, FC } from "react";
import '../../css/linearProgressWithImage.css'; // Assuming your CSS is external

interface IProps {
  activeStep: number;
  maxSteps: number;
  variant: "determinate";
  image: string;
}

const LinearProgressWithImage: FC<IProps> = (props) => {
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const [imageWidth, setImageWidth] = useState<number | null>(null);

  const handleImageLoad = (event: React.ChangeEvent<HTMLImageElement>) => {
    setImageWidth(event.target.offsetWidth);
  };

  useEffect(() => {
    let animationRequest: number; // TypeScript type for animation request ID

    const updateFishPosition = () => {
      const percentage = (props.activeStep + 1) / props.maxSteps * 100;
      const containerWidth = progressContainerRef.current?.offsetWidth ?? 0;

      const fishElement = document.querySelector('.progress-fish') as HTMLImageElement; // Type assertion

      if (fishElement && imageWidth && containerWidth) {
        const verticalOffset = imageWidth / 10; // Adjust based on image size & desired movement
        fishElement.style.left = `calc(${percentage}% - ${imageWidth / 2}px)`;
        fishElement.style.top = `calc(50% - ${imageWidth / 2}px + ${verticalOffset * Math.sin(percentage / 100 * 2 * Math.PI)})`; // Add vertical offset with sine wave
      }
    };

    animationRequest = requestAnimationFrame(updateFishPosition);
    return () => cancelAnimationFrame(animationRequest);
  }, [props.activeStep, imageWidth]);

  return (
    <div className="progress-container" ref={progressContainerRef}>
      <LinearProgress value={(props.activeStep + 1) / props.maxSteps * 100} variant="determinate" />
      <img
        src={props.image}
        alt="progress-fish"
        className="progress-fish"
        onLoad={handleImageLoad}
        style={{
          left: imageWidth ? `calc(${(props.activeStep + 1) / props.maxSteps * 100}% - ${imageWidth / 2}px)` : '0%'
        }}
      />
    </div>
  );
};

export default LinearProgressWithImage;
