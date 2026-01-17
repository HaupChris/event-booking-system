import React, { useRef, useEffect } from 'react';

interface CircusBackgroundProps {
  confettiCount?: number;
  balloonCount?: number;
  sparkleCount?: number;
  showTentStripes?: boolean;
}

const CircusBackground: React.FC<CircusBackgroundProps> = ({
  confettiCount = 50,
  balloonCount = 6,
  sparkleCount = 40,
  showTentStripes = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Resize function
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Colors (gold, purple, blue)
    const colors = ['#D4AF37', '#6B46C1', '#4A90E2'];

    // Confetti class
    class Confetti {
      x: number;
      y: number;
      size: number;
      color: string;
      shape: 'diamond' | 'circle' | 'star';
      rotation: number;
      rotationSpeed: number;
      fallSpeed: number;
      driftAngle: number;
      driftSpeed: number;

      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = Math.random() * -(canvas?.height || window.innerHeight);
        this.size = Math.random() * 5 + 3;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.shape = ['diamond', 'circle', 'star'][Math.floor(Math.random() * 3)] as 'diamond' | 'circle' | 'star';
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 + 1;
        this.fallSpeed = Math.random() * 0.5 + 0.3;
        this.driftAngle = Math.random() * Math.PI * 2;
        this.driftSpeed = 0.02;
      }

      update() {
        this.y += this.fallSpeed;
        this.rotation += this.rotationSpeed;
        this.driftAngle += this.driftSpeed;
        this.x += Math.sin(this.driftAngle) * 0.5;

        // Reset when off screen
        if (this.y > (canvas?.height || window.innerHeight) + this.size) {
          this.y = -this.size;
          this.x = Math.random() * (canvas?.width || window.innerWidth);
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;

        if (this.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.shape === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(0, -this.size);
          ctx.lineTo(this.size, 0);
          ctx.lineTo(0, this.size);
          ctx.lineTo(-this.size, 0);
          ctx.closePath();
          ctx.fill();
        } else if (this.shape === 'star') {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Balloon class
    class Balloon {
      x: number;
      y: number;
      size: number;
      color: string;
      riseSpeed: number;
      swayPhase: number;
      swayAmplitude: number;

      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = (canvas?.height || window.innerHeight) + Math.random() * 200;
        this.size = Math.random() * 15 + 20;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.riseSpeed = Math.random() * 0.3 + 0.2;
        this.swayPhase = Math.random() * Math.PI * 2;
        this.swayAmplitude = Math.random() * 20 + 20;
      }

      update() {
        this.y -= this.riseSpeed;
        this.swayPhase += 0.02;

        // Reset when off screen
        if (this.y < -this.size * 2) {
          this.y = (canvas?.height || window.innerHeight) + this.size;
          this.x = Math.random() * (canvas?.width || window.innerWidth);
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        const swayX = this.x + Math.sin(this.swayPhase) * this.swayAmplitude;

        // Draw balloon
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(swayX, this.y, this.size, this.size * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(swayX - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.3, this.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw string
        ctx.strokeStyle = 'rgba(245, 230, 211, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(swayX, this.y + this.size * 1.2);
        // Curved string
        for (let i = 0; i < 10; i++) {
          const t = i / 10;
          const stringX = swayX + Math.sin(this.swayPhase + t * Math.PI) * 5;
          const stringY = this.y + this.size * 1.2 + t * 40;
          ctx.lineTo(stringX, stringY);
        }
        ctx.stroke();

        ctx.restore();
      }
    }

    // Sparkle class
    class Sparkle {
      x: number;
      y: number;
      opacity: number;
      fadeDirection: number;
      fadeSpeed: number;

      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = Math.random() * (canvas?.height || window.innerHeight);
        this.opacity = Math.random();
        this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
        this.fadeSpeed = Math.random() * 0.01 + 0.005;
      }

      update() {
        this.opacity += this.fadeDirection * this.fadeSpeed;
        if (this.opacity >= 1) {
          this.fadeDirection = -1;
        } else if (this.opacity <= 0) {
          this.fadeDirection = 1;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
        ctx.font = '12px serif';
        ctx.fillText('✦', this.x, this.y);
        ctx.restore();
      }
    }

    // Create particles
    const confettiPieces: Confetti[] = [];
    for (let i = 0; i < confettiCount; i++) {
      confettiPieces.push(new Confetti());
    }

    const balloons: Balloon[] = [];
    for (let i = 0; i < balloonCount; i++) {
      balloons.push(new Balloon());
    }

    const sparkles: Sparkle[] = [];
    for (let i = 0; i < sparkleCount; i++) {
      sparkles.push(new Sparkle());
    }

    // Animation function
    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw all particles
      sparkles.forEach(sparkle => {
        sparkle.update();
        sparkle.draw(ctx);
      });

      balloons.forEach(balloon => {
        balloon.update();
        balloon.draw(ctx);
      });

      confettiPieces.forEach(confetti => {
        confetti.update();
        confetti.draw(ctx);
      });

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [confettiCount, balloonCount, sparkleCount]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: -1,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, #2d1810 0%, #1a0a0a 100%)',
        }}
      />
      {showTentStripes && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            background: `repeating-conic-gradient(
              from 0deg at 50% 0%,
              transparent 0deg,
              transparent 10deg,
              rgba(212, 175, 55, 0.05) 10deg,
              rgba(212, 175, 55, 0.05) 11deg,
              transparent 11deg,
              transparent 21deg,
              rgba(107, 70, 193, 0.05) 21deg,
              rgba(107, 70, 193, 0.05) 22deg
            )`,
            pointerEvents: 'none',
            animation: 'tentRotate 300s linear infinite',
          }}
        />
      )}
      <style>
        {`
          @keyframes tentRotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </>
  );
};

export default CircusBackground;
