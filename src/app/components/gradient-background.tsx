'use client';

import { useEffect, useRef, useState } from 'react';

export default function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const [isLowPerfDevice, setIsLowPerfDevice] = useState(false);

  useEffect(() => {
    // Check if device is likely to have performance issues
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasLowRefreshRate = window.screen.availWidth <= 768;
    setIsLowPerfDevice(isMobile || hasLowRefreshRate);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Debounce resize handler
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    handleResize();

    // Create gradient
    let gradientAngle = 0;
    let lastFrameTime = 0;
    const targetFPS = isLowPerfDevice ? 15 : 30; // Lower FPS for low-performance devices

    // Animation loop with frame rate control
    function animate(currentTime: number) {
      // Skip frames to maintain target FPS
      if (currentTime - lastFrameTime < 1000 / targetFPS) {
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTime = currentTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Slower rotation for better performance
      gradientAngle += isLowPerfDevice ? 0.0005 : 0.001;
      if (gradientAngle > Math.PI * 2) gradientAngle = 0;

      const x1 = canvas.width / 2 + Math.cos(gradientAngle) * canvas.width;
      const y1 = canvas.height / 2 + Math.sin(gradientAngle) * canvas.height;
      const x2 =
        canvas.width / 2 + Math.cos(gradientAngle + Math.PI) * canvas.width;
      const y2 =
        canvas.height / 2 + Math.sin(gradientAngle + Math.PI) * canvas.height;

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.05)');
      gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)');
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0.05)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId.current = requestAnimationFrame(animate);
    }

    animate(0);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
  );
}
