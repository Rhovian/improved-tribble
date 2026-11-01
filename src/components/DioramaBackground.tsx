"use client";

import { useEffect, useRef } from "react";
import { createDiorama } from "@/lib/diorama";

/**
 * Animated pixel-art background ("The House at the End of the World").
 * Fills its positioned parent, keeps whole-number pixel scaling at any size,
 * pauses when off-screen or when the tab is hidden, and shows a still frame
 * for visitors who prefer reduced motion.
 */
export function DioramaBackground({ className = "" }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;

    const diorama = createDiorama(canvas);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const origin = performance.now();
    let raf = 0;
    let visible = true;

    const draw = (now: number) => {
      diorama.frame(reduced.matches ? 14 : (now - origin) / 1000);
      if (!reduced.matches && visible) raf = requestAnimationFrame(draw);
    };
    const play = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    const fit = () => {
      const r = box.getBoundingClientRect();
      diorama.resize(r.width, r.height, window.devicePixelRatio || 1);
      play();
    };

    const ro = new ResizeObserver(fit);
    ro.observe(box);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
    });
    io.observe(box);
    reduced.addEventListener("change", play);
    fit();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      reduced.removeEventListener("change", play);
    };
  }, []);

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden bg-[#03050c] ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block flex-none"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
