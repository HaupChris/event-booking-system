import React, { useRef, useEffect, useState, FC } from 'react';
import wwwwLogo from '../../img/space_w_transparent.png';

interface Star {
  x: number;
  y: number;
  z: number;
  speed: number;
  size: number;
}

interface FlyByObject {
  x: number;      // small offset from center
  y: number;      // small offset from center
  z: number;      // distance away; large means far
  speed: number;  // how fast it moves “forward”
  scale: number;  // overall size
  spawned: boolean;
}

const NUM_STARS = 300;
const FOV = 600;

const SpaceBackground: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stars, setStars] = useState<Star[]>([]);

  // Keep a single fly-by object
  const [flyByObject, setFlyByObject] = useState<FlyByObject | null>(null);

  let time = 0;
  let animationId = 0;

  function createStar(): Star {
    return {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 0.8 + 0.8,
      speed: Math.random() * 0.015 + 0.005,
      size: Math.random() * 1.5 + 0.5,
    };
  }

  function resetStar(star: Star) {
    star.x = Math.random() * 2 - 1;
    star.y = Math.random() * 2 - 1;
    star.z = Math.random() * 0.8 + 0.8;
    star.speed = Math.random() * 0.005 + 0.001;
    star.size = Math.random() * 1.5 + 0.5;
  }

  /**
   * Spawn exactly one flyByObject near the center, but with a slight random offset
   * so it drifts toward a random side as it moves forward (z decreasing).
   */
  function createFlyByObject(): FlyByObject {
    return {
      // Small random offsets so it appears near center but not exactly
      x: (Math.random() * 0.3) - 0.15,  // -0.15..0.15
      y: (Math.random() * 0.3) - 0.15,  // -0.15..0.15
      // Farther away so it starts small
      z: 8.0,
      // Speed somewhat bigger than stars so it comes forward more noticeably
      speed: Math.random() * 0.01 + 0.01,
      // Overall smaller scale
      scale: 0.15,
      spawned: true,
    };
  }

  function resetFlyBy(obj: FlyByObject) {
    // If you prefer a single flyBy to reappear again, re-randomize it:
    const newObj = createFlyByObject();
    // Or if you only want it once, you can return null instead:
    // return null;
    Object.assign(obj, newObj);
  }

  useEffect(() => {
    // Initialize stars
    const initStars: Star[] = [];
    for (let i = 0; i < NUM_STARS; i++) {
      initStars.push(createStar());
    }
    setStars(initStars);

    // Initialize single flyBy object
    setFlyByObject(createFlyByObject());
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Preload the logo
    const logoImage = new Image();
    logoImage.src = wwwwLogo;

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Subtle camera sway
      time += 0.01;
      const centerX = w / 2 + Math.sin(time * 0.5) * 50;
      const centerY = h / 2 + Math.cos(time * 0.3) * 30;

      // 1) Update & draw stars
      stars.forEach((star) => {
        star.z -= star.speed;
        if (star.z <= 0) {
          resetStar(star);
        }
        const projX = centerX + (star.x / star.z) * FOV;
        const projY = centerY + (star.y / star.z) * FOV;
        const radius = star.size / star.z;

        ctx.beginPath();
        ctx.arc(projX, projY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      });

      // 2) Update & draw the single flyBy object (if present)
      if (flyByObject && flyByObject.spawned) {
        // Move it closer
        flyByObject.z -= flyByObject.speed;
        if (flyByObject.z <= 0) {
          // Once it passes z=0, reset or remove it
          resetFlyBy(flyByObject);
        }

        // Project to 2D
        const projX = centerX + (flyByObject.x / flyByObject.z) * FOV;
        const projY = centerY + (flyByObject.y / flyByObject.z) * FOV;
        const scaleFactor = flyByObject.scale / flyByObject.z;
        const baseSize = 500 * scaleFactor;

        if (logoImage.complete) {
          const half = baseSize / 2;
          ctx.drawImage(logoImage, projX - half, projY - half, baseSize, baseSize);
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [stars, flyByObject]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        width: '100%',
        height: '100%',
        background: 'black',
      }}
    />
  );
};

export default SpaceBackground;
