// src/components/auth/GalaxyCanvas.jsx
// NEW: Animated starfield / particle effect for auth pages
import React, { useEffect, useRef } from "react";

export default function GalaxyCanvas() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const starsRef  = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Generate stars
    const COUNT = 180;
    starsRef.current = Array.from({ length: COUNT }, () => ({
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,
      r:      Math.random() * 1.4 + 0.2,
      speed:  Math.random() * 0.25 + 0.05,
      opacity: Math.random() * 0.6 + 0.2,
      pulse:  Math.random() * Math.PI * 2, // phase offset
      color:  Math.random() > 0.85
        ? `rgba(167,139,250,`   // purple tint
        : Math.random() > 0.7
        ? `rgba(196,181,253,`   // lavender
        : `rgba(255,255,255,`,  // white
    }));

    // Generate nebula blobs
    const blobs = Array.from({ length: 6 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 200 + 80,
      opacity: Math.random() * 0.04 + 0.01,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
    }));

    let frame = 0;

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      frame++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw nebula blobs
      blobs.forEach((blob) => {
        blob.x += blob.dx;
        blob.y += blob.dy;
        if (blob.x < -blob.r) blob.x = canvas.width + blob.r;
        if (blob.x > canvas.width + blob.r) blob.x = -blob.r;
        if (blob.y < -blob.r) blob.y = canvas.height + blob.r;
        if (blob.y > canvas.height + blob.r) blob.y = -blob.r;

        const grad = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.r
        );
        grad.addColorStop(0, `rgba(124,106,247,${blob.opacity})`);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Draw stars
      starsRef.current.forEach((star) => {
        // Twinkle using sine wave
        const twinkle = Math.sin(frame * 0.02 + star.pulse) * 0.3 + 0.7;
        const opacity = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${opacity})`;
        ctx.fill();

        // Drift upward slowly
        star.y -= star.speed;
        if (star.y < -star.r) {
          star.y = canvas.height + star.r;
          star.x = Math.random() * canvas.width;
        }
      });

      // Shooting star every ~4s
      if (frame % 240 === 0) {
        const sx = Math.random() * canvas.width;
        const sy = Math.random() * canvas.height * 0.5;
        const len = Math.random() * 120 + 60;
        const grad = ctx.createLinearGradient(sx, sy, sx + len, sy + len * 0.4);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.3, "rgba(255,255,255,0.7)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + len, sy + len * 0.4);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="galaxy-canvas"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

// i think the project is almost completed, but in settings it says you will see a toggle button to change visibility but its not present also in post near uploading image option there are two more option which is feeling and location they dont do anything so maybe complete them as well and see if there are any other issues in the project.