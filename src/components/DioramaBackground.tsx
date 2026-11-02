"use client";

import { useEffect, useRef } from "react";
import { createDiorama, type Diorama } from "@/lib/diorama";

/** Maps a scene point (world coords) to CSS px inside the background's box. */
export type ScenePoint = (wx: number, wy: number) => { x: number; y: number };

interface Props {
  className?: string;
  /**
   * Frame the scene this many art pixels higher, to leave room for page
   * content below the snow. A function gets whether the box is landscape.
   */
  shiftY?: number | ((landscape: boolean) => number);
  /** Called after every resize with a way to find scene points on screen. */
  onLayout?: (project: ScenePoint, box: { width: number; height: number }) => void;
}

/**
 * Animated pixel-art background ("The House at the End of the World").
 * Fills its positioned parent, keeps whole-number pixel scaling at any size,
 * pauses when off-screen or when the tab is hidden, and shows a still frame
 * for visitors who prefer reduced motion.
 */
export function DioramaBackground({ className = "", shiftY = 0, onLayout }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shiftRef = useRef(shiftY);
  const layoutRef = useRef(onLayout);
  shiftRef.current = shiftY;
  layoutRef.current = onLayout;

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const origin = performance.now();
    let diorama: Diorama | null = null;
    let shift = NaN;
    let raf = 0;
    let visible = true;

    const draw = (now: number) => {
      diorama?.frame(reduced.matches ? 14 : (now - origin) / 1000);
      if (!reduced.matches && visible) raf = requestAnimationFrame(draw);
    };
    const play = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    const fit = () => {
      const r = box.getBoundingClientRect();
      const s = shiftRef.current;
      const want = typeof s === "function" ? s(r.width > r.height) : s;
      if (!diorama || want !== shift) {
        diorama = createDiorama(canvas, { shiftY: want });
        shift = want;
      }
      diorama.resize(r.width, r.height, window.devicePixelRatio || 1);
      // the canvas is centred in the box and may overhang it by a pixel or two
      const c = canvas.getBoundingClientRect();
      const ox = c.left - r.left, oy = c.top - r.top;
      const d = diorama;
      layoutRef.current?.((wx, wy) => {
        const p = d.project(wx, wy);
        return { x: p.x + ox, y: p.y + oy };
      }, { width: r.width, height: r.height });
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
      className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden bg-[#03040e] ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block flex-none"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
