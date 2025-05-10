// src/components/core/layouts/SpaceBackground.tsx
import React, { useRef, useEffect } from 'react';

interface SpaceBackgroundProps {
  starsCount?: number;
  flyByEnabled?: boolean;
}

const SpaceBackground: React.FC<SpaceBackgroundProps> = ({
  starsCount = 300,
  flyByEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize function
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Star class
    class Star {
      x: number;
      y: number;
      z: number;
      speed: number;
      size: number;

      constructor() {
        this.x = Math.random() * 2 - 1;
        this.y = Math.random() * 2 - 1;
        this.z = Math.random() * 0.8 + 0.8;
        this.speed = Math.random() * 0.015 + 0.005;
        this.size = Math.random() * 1.5 + 0.5;
      }

      reset() {
        this.x = Math.random() * 2 - 1;
        this.y = Math.random() * 2 - 1;
        this.z = Math.random() * 0.8 + 0.8;
        this.speed = Math.random() * 0.005 + 0.001;
        this.size = Math.random() * 1.5 + 0.5;
      }

      update() {
        this.z -= this.speed;
        if (this.z <= 0) {
          this.reset();
        }
      }

      draw(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, FOV: number) {
        const projX = centerX + (this.x / this.z) * FOV;
        const projY = centerY + (this.y / this.z) * FOV;
        const radius = this.size / this.z;

        ctx.beginPath();
        ctx.arc(projX, projY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }
    }

    // FlyByObject class
    class FlyByObject {
      x: number;
      y: number;
      z: number;
      speed: number;
      scale: number;
      spawned: boolean;

      constructor() {
        this.x = (Math.random() * 0.3) - 0.15;
        this.y = (Math.random() * 0.3) - 0.15;
        this.z = 8.0;
        this.speed = Math.random() * 0.01 + 0.01;
        this.scale = 0.15;
        this.spawned = true;
      }

      reset() {
        this.x = (Math.random() * 0.3) - 0.15;
        this.y = (Math.random() * 0.3) - 0.15;
        this.z = 8.0;
        this.speed = Math.random() * 0.01 + 0.01;
        this.scale = 0.15;
        this.spawned = true;
      }

      update() {
        this.z -= this.speed;
        if (this.z <= 0) {
          this.reset();
        }
      }

      draw(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, FOV: number) {
        const projX = centerX + (this.x / this.z) * FOV;
        const projY = centerY + (this.y / this.z) * FOV;
        const scaleFactor = this.scale / this.z;
        const baseSize = 500 * scaleFactor;

        // Draw simple circle for flyby object
        ctx.beginPath();
        ctx.arc(projX, projY, baseSize/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(100, 181, 246, 0.3)';
        ctx.fill();

        // Draw glow
        ctx.beginPath();
        ctx.arc(projX, projY, baseSize/1.5, 0, 2 * Math.PI);
        const gradient = ctx.createRadialGradient(projX, projY, baseSize/4, projX, projY, baseSize/1.5);
        gradient.addColorStop(0, 'rgba(100, 181, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(100, 181, 246, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Create stars
    const stars: Star[] = [];
    for (let i = 0; i < starsCount; i++) {
      stars.push(new Star());
    }

    // Create fly-by object if enabled
    let flyByObject: FlyByObject | null = null;
    if (flyByEnabled) {
      flyByObject = new FlyByObject();
    }

    let time = 0;
    const FOV = 600;

    // Animation function
    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Subtle camera sway
      time += 0.01;
      const centerX = w / 2 + Math.sin(time * 0.5) * 50;
      const centerY = h / 2 + Math.cos(time * 0.3) * 30;

      // Update & draw stars
      stars.forEach(star => {
        star.update();
        star.draw(ctx, centerX, centerY, FOV);
      });

      // Update & draw fly-by object if enabled
      if (flyByObject && flyByObject.spawned) {
        flyByObject.update();
        flyByObject.draw(ctx, centerX, centerY, FOV);
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [starsCount, flyByEnabled]);

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