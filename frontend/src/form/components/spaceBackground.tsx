// SpaceBackground.tsx
import React, { useRef, useEffect, useState, FC } from 'react';

interface Star {
  x: number;     // -1..1
  y: number;     // -1..1
  z: number;     // near 0 = close, near 1 = far
  speed: number; // how quickly z decreases each frame
  size: number;  // radius of star
}

const NUM_STARS = 300;

const SpaceBackground: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // We'll keep an array for all the stars in state so we can re-init if needed
  const [stars, setStars] = useState<Star[]>([]);

  // For a bit of camera sway
  let time = 0;
  let animationId = 0;

  function createStar(): Star {
    return {
      x: (Math.random() * 2 - 1),       // random direction: -1..1
      y: (Math.random() * 2 - 1),       // random direction: -1..1
      z: Math.random() * 0.5 + 0.5,     // start at z in [0.5..1.0]
      speed: Math.random() * 0.01 + 0.005, // star falls inward at 0.005..0.015
      size: Math.random() * 1.5 + 0.5,  // star radius in [0.5..2]
    };
  }

  // Called when star z < 0 => star is behind camera => respawn
  function resetStar(star: Star) {
    star.x = Math.random() * 2 - 1;
    star.y = Math.random() * 2 - 1;
    star.z = 1; // far away again
    star.speed = Math.random() * 0.01 + 0.005;
    star.size = Math.random() * 1.5 + 0.5;
  }

  // Initialize once
  useEffect(() => {
    // Create our initial star set
    const initialStars: Star[] = [];
    for (let i = 0; i < NUM_STARS; i++) {
      initialStars.push(createStar());
    }
    setStars(initialStars);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle dynamic sizing
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    function animate() {
      if (!canvas || !ctx) return;
      // Clear each frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // A small camera sway: shift center slightly over time
      time += 0.01; // you can tweak speed
      const centerX = w / 2 + Math.sin(time * 0.5) * 50;
      const centerY = h / 2 + Math.cos(time * 0.3) * 30;

      // Draw & update each star
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Move star forward (z decreases)
        star.z -= star.speed;

        // If behind camera now, respawn far away
        if (star.z <= 0) {
          resetStar(star);
          continue;
        }

        // 2D projection from 3D coords
        // The smaller star.z is, the bigger (x,y) shift from center
        // We'll multiply by some factor for FOV (e.g. 800)
        const fov = 800;
        const projX = centerX + (star.x / star.z) * fov;
        const projY = centerY + (star.y / star.z) * fov;

        // Star grows slightly as it gets closer
        const starRadius = star.size / star.z;

        // Draw star
        ctx.beginPath();
        ctx.arc(projX, projY, starRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [stars]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,         // behind page content
        width: '100%',
        height: '100%',
        background: 'black' // or use transparent if you prefer
      }}
    />
  );
};

export default SpaceBackground;
