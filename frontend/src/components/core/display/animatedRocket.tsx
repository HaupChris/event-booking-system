import React, { useEffect} from 'react';
// Import your rocket image
import rocketImage from '../../../img/rocket_baak.png'; // Update this path to your actual rocket image

const AnimatedRocket: React.FC<{ onAnimationComplete: () => void }> = ({
  onAnimationComplete
}) => {
  useEffect(() => {
    // After rocket animation completes, signal to parent to remove component
    const animationTimer = setTimeout(() => {
      onAnimationComplete();
    }, 6000); // Adjust time based on animation duration

    return () => {
      clearTimeout(animationTimer);
    };
  }, [onAnimationComplete]);

  return (
    <div className="rocket-animation-container">
      {/* Rocket using custom image */}
      <div className="rocket custom-rocket">
        <img
          src={rocketImage}
          alt="Rocket"
          className="rocket-img"
        />

        {/* Flames */}
        <div className="rocket-flames">
          <div className="flame flame-main"></div>
          <div className="flame flame-inner"></div>
        </div>
      </div>

      {/* Smoke */}
      <div className="smoke-container">
        <div className="smoke smoke-1"></div>
        <div className="smoke smoke-2"></div>
        <div className="smoke smoke-3"></div>
      </div>

      {/* Launchpad */}
      <div className="launchpad"></div>
    </div>
  );
};

export default AnimatedRocket;