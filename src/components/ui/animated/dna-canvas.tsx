"use client";

import { useEffect, useRef } from "react";

export function DNACanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let time = 0;
    let frameId = 0;

    const spacing = 26;

    function resize() {
      const parent = canvas!.parentElement;
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawFrame() {
      ctx!.clearRect(0, 0, width, height);

      const amplitude = Math.min(width * 0.16, 90);
      const centerX = width * 0.72;
      const rungCount = Math.ceil(height / spacing) + 2;

      for (let i = 0; i < rungCount; i++) {
        const y = i * spacing - (time % spacing);
        const phase = y * 0.02 + time * 0.015;
        const x1 = centerX + Math.sin(phase) * amplitude;
        const x2 = centerX + Math.sin(phase + Math.PI) * amplitude;
        const depth = (Math.sin(phase) + 1) / 2;

        ctx!.strokeStyle = `rgba(122, 150, 168, ${0.12 + depth * 0.22})`;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(x1, y);
        ctx!.lineTo(x2, y);
        ctx!.stroke();

        ctx!.fillStyle = `rgba(211, 209, 206, ${0.35 + depth * 0.45})`;
        ctx!.beginPath();
        ctx!.arc(x1, y, 2.4, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = `rgba(83, 104, 120, ${0.45 + (1 - depth) * 0.4})`;
        ctx!.beginPath();
        ctx!.arc(x2, y, 2.4, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function loop() {
      time += 1;
      drawFrame();
      frameId = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);

    if (prefersReducedMotion) {
      drawFrame();
    } else {
      loop();
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
