"use client";

import { useEffect, useRef } from "react";

type Droplet = {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
};

export function RitualCanvas({ className }: { className?: string }) {
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
    let frameId = 0;
    let droplets: Droplet[] = [];

    function createDroplets() {
      const count = Math.min(140, Math.floor((width * height) / 9000));
      droplets = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 4 + Math.random() * 6,
        length: 14 + Math.random() * 22,
        opacity: 0.15 + Math.random() * 0.35,
      }));
    }

    function resize() {
      const parent = canvas!.parentElement;
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      createDroplets();
    }

    function drawRays() {
      const rayCount = 4;
      for (let i = 0; i < rayCount; i++) {
        const rx = width * (0.2 + i * 0.22);
        const gradient = ctx!.createLinearGradient(rx, 0, rx + 60, height);
        gradient.addColorStop(0, "rgba(122, 150, 168, 0.10)");
        gradient.addColorStop(1, "rgba(122, 150, 168, 0)");
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.moveTo(rx - 40, 0);
        ctx!.lineTo(rx + 100, 0);
        ctx!.lineTo(rx + 40, height);
        ctx!.lineTo(rx - 100, height);
        ctx!.closePath();
        ctx!.fill();
      }
    }

    function drawMist() {
      const mist = ctx!.createRadialGradient(
        width * 0.5,
        height * 0.85,
        0,
        width * 0.5,
        height * 0.85,
        height * 0.7,
      );
      mist.addColorStop(0, "rgba(30, 42, 51, 0.55)");
      mist.addColorStop(1, "rgba(10, 10, 10, 0)");
      ctx!.fillStyle = mist;
      ctx!.fillRect(0, 0, width, height);
    }

    function drawDroplets(advance: boolean) {
      for (const drop of droplets) {
        const gradient = ctx!.createLinearGradient(
          drop.x,
          drop.y - drop.length,
          drop.x,
          drop.y,
        );
        gradient.addColorStop(0, "rgba(211, 209, 206, 0)");
        gradient.addColorStop(1, `rgba(211, 209, 206, ${drop.opacity})`);
        ctx!.strokeStyle = gradient;
        ctx!.lineWidth = 1.2;
        ctx!.beginPath();
        ctx!.moveTo(drop.x, drop.y - drop.length);
        ctx!.lineTo(drop.x, drop.y);
        ctx!.stroke();

        if (advance) {
          drop.y += drop.speed;
          if (drop.y - drop.length > height) {
            drop.y = -Math.random() * height * 0.3;
            drop.x = Math.random() * width;
          }
        }
      }
    }

    function drawFrame(advance: boolean) {
      ctx!.fillStyle = "#050b10";
      ctx!.fillRect(0, 0, width, height);
      drawRays();
      drawMist();
      drawDroplets(advance);
    }

    function loop() {
      drawFrame(true);
      frameId = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);

    if (prefersReducedMotion) {
      drawFrame(false);
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
