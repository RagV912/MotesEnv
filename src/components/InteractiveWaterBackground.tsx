import React, { useEffect, useRef } from 'react';

export const InteractiveWaterBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Use the parent section as the size tracking area
    const parentSection = container.parentElement;
    if (!parentSection) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      const rect = parentSection.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(parentSection);

    // Initialize slow, elegant water bubbles for aeration / water treatment effect
    const bubbleCount = 35;
    const bubbles: Array<{
      x: number;
      y: number;
      radius: number;
      speedY: number;
      swayRange: number;
      swaySpeed: number;
      swayOffset: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push({
        x: Math.random() * (width || 800),
        y: Math.random() * (height || 500),
        radius: 0.8 + Math.random() * 2.2, // Tiny elegant micro-bubbles
        speedY: 0.15 + Math.random() * 0.35, // Very slow, gentle drift
        swayRange: 4 + Math.random() * 8, // Light lateral sway
        swaySpeed: 0.008 + Math.random() * 0.012,
        swayOffset: Math.random() * Math.PI * 2,
        opacity: 0.06 + Math.random() * 0.18, // Extremely subtle, eye-safe transparency
      });
    }

    let time = 0;

    const animate = () => {
      time += 0.003; // Gentle slow ambient drift speed
      ctx.clearRect(0, 0, width, height);

      // --- 1. Experimental: Underwater Volumetric Light Rays (God Rays) ---
      // Adding realistic, dynamic shafts of light filtering down into the water body.
      const drawRay = (
        startX: number,
        startWidth: number,
        endX: number,
        endWidth: number,
        pulseOffset: number,
        opacityMultiplier: number
      ) => {
        // Light rays slowly drift/sway horizontally and pulse in intensity
        const drift = Math.sin(time * 1.2 + pulseOffset) * 25;
        const pulse = Math.sin(time * 0.8 + pulseOffset) * 0.2 + 0.8; // Oscillates slowly
        const baseOpacity = 0.05 * opacityMultiplier * pulse;

        const grad = ctx.createLinearGradient(startX + drift, 0, endX + drift, height);
        grad.addColorStop(0, `rgba(34, 211, 238, ${baseOpacity})`); // Cyan
        grad.addColorStop(0.4, `rgba(56, 189, 248, ${baseOpacity * 0.55})`); // Sky Blue
        grad.addColorStop(1, 'rgba(8, 51, 68, 0)'); // Fade completely into baseline dark bg

        ctx.beginPath();
        ctx.moveTo((startX + drift) - startWidth / 2, 0);
        ctx.lineTo((startX + drift) + startWidth / 2, 0);
        ctx.lineTo((endX + drift) + endWidth / 2, height);
        ctx.lineTo((endX + drift) - endWidth / 2, height);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      };

      // Ray 1: Left wide soft ray
      drawRay(width * 0.15, width * 0.18, width * 0.32, width * 0.28, 0, 1.0);
      // Ray 2: Center-left bright ray
      drawRay(width * 0.38, width * 0.10, width * 0.52, width * 0.20, Math.PI * 0.35, 1.1);
      // Ray 3: Right diagonal sweeping ray
      drawRay(width * 0.65, width * 0.14, width * 0.82, width * 0.24, Math.PI * 0.7, 0.75);


      // --- 2. Experimental: Slowly Rising Micro-Bubbles ---
      // Mimics physical aeration, adding dynamic depth behind text layers.
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];

        // Ensure bubble x wraps dynamically on window resizing
        if (b.x > width) b.x = Math.random() * width;

        // Apply constant slow upward draft
        b.y -= b.speedY;

        // Elegant sinusoidal sway matching genuine liquid drag
        const sway = Math.sin(time * 120 * b.swaySpeed + b.swayOffset) * b.swayRange * 0.15;
        const drawX = b.x + sway;

        // Reset bubble to the bottom of the section once it floats off the top boundary
        if (b.y < -15) {
          b.y = height + 15;
          b.x = Math.random() * width;
          b.radius = 0.8 + Math.random() * 2.2;
          b.speedY = 0.15 + Math.random() * 0.35;
          b.opacity = 0.06 + Math.random() * 0.18;
        }

        // Render soft translucent core
        ctx.beginPath();
        ctx.arc(drawX, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity})`;
        ctx.fill();

        // Render a subtle refracting outline ring for glassiness
        ctx.beginPath();
        ctx.arc(drawX, b.y, b.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 211, 238, ${b.opacity * 0.65})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }


      // --- 3. Ambient Water Waves (Flowing background currents) ---
      // Wave layer 1 (Slightly deeper current)
      ctx.beginPath();
      ctx.fillStyle = 'rgba(34, 211, 238, 0.08)'; // Nice visible soft cyan
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 15) {
        // Compound sine function for realistic water movement
        const waveY = height * 0.68 + 
          Math.sin(x * 0.003 + time * 1.8) * 20 + 
          Math.cos(x * 0.0015 + time * 0.9) * 12;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Wave layer 2 (Slightly lighter surface current)
      ctx.beginPath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.06)'; // Soft sky blue current
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 15) {
        const waveY = height * 0.74 + 
          Math.sin(x * 0.0045 - time * 1.4) * 24 + 
          Math.cos(x * 0.0025 + time * 0.7) * 15;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-100 pointer-events-none"
      />
    </div>
  );
};
