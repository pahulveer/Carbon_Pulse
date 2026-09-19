import React, { useEffect, useRef } from 'react';

export const HeroParticleLayer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotionQuery.matches) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number | null = null;
    let isIntersecting = true;
    let isDocVisible = !document.hidden;

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 10 : 20;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    const resize = () => {
      if (!canvas) return;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * (width || 400),
      y: Math.random() * (height || 400),
      size: Math.random() * 2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.4 - 0.1,
      opacity: Math.random() * 0.45 + 0.2,
    }));

    const render = () => {
      if (!isIntersecting || !isDocVisible) {
        animationId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (animationId === null && isIntersecting && isDocVisible) {
        animationId = requestAnimationFrame(render);
      }
    };

    const stopLoop = () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    // IntersectionObserver to pause when hero is off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);

    // Page visibility listener
    const handleVisibilityChange = () => {
      isDocVisible = !document.hidden;
      if (isDocVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    startLoop();

    return () => {
      stopLoop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
};
