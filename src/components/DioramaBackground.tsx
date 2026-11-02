"use client";

import { useEffect, useRef } from "react";
import { computeLayout, createDiorama, projectPoint, type DioramaOptions } from "@/lib/diorama";

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
  /** Stop the animation (the current frame stays on screen). */
  paused?: boolean;
}

const FRAME_MS = 1000 / 30;
const STILL_T = 14;

/**
 * Animated pixel-art background ("The House at the End of the World").
 * Fills its positioned parent with whole-number pixel scaling. Drawing runs in
 * a Web Worker on an OffscreenCanvas where supported (main thread otherwise),
 * at up to 30 fps; it stops when off-screen, hidden or paused, and shows a
 * still frame for visitors who prefer reduced motion.
 */
export function DioramaBackground({ className = "", shiftY = 0, onLayout, paused = false }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const shiftRef = useRef(shiftY);
  const layoutRef = useRef(onLayout);
  const pausedRef = useRef(paused);
  const syncRef = useRef<() => void>(() => {});
  shiftRef.current = shiftY;
  layoutRef.current = onLayout;
  pausedRef.current = paused;

  useEffect(() => {
    syncRef.current();
  }, [paused]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    // A fresh canvas per mount: an OffscreenCanvas transfer can happen only once.
    const canvas = document.createElement("canvas");
    canvas.className = "block flex-none";
    canvas.style.imageRendering = "pixelated";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;

    const optsFor = (w: number, h: number): DioramaOptions => {
      const s = shiftRef.current;
      return { shiftY: typeof s === "function" ? s(w > h) : s };
    };
    const measure = () => {
      const r = box.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const opts = optsFor(r.width, r.height);
      const l = computeLayout(r.width, r.height, dpr, opts);
      // size the canvas before it paints, so nothing shifts on load
      canvas.style.width = `${l.cssWidth}px`;
      canvas.style.height = `${l.cssHeight}px`;
      const ox = (r.width - l.cssWidth) / 2, oy = (r.height - l.cssHeight) / 2;
      layoutRef.current?.((wx, wy) => {
        const p = projectPoint(l, wx, wy);
        return { x: p.x + ox, y: p.y + oy };
      }, { width: r.width, height: r.height });
      return { w: r.width, h: r.height, dpr, opts };
    };
    const live = () => !pausedRef.current && visible && !document.hidden && !reduced.matches;

    let first = measure();
    box.appendChild(canvas);

    // --- renderer: worker if possible, main thread otherwise
    let worker: Worker | null = null;
    if (typeof OffscreenCanvas !== "undefined" && "transferControlToOffscreen" in canvas) {
      try {
        worker = new Worker(new URL("../lib/diorama.worker.ts", import.meta.url));
        const off = canvas.transferControlToOffscreen();
        worker.postMessage(
          { type: "init", canvas: off, opts: first.opts, cssW: first.w, cssH: first.h, dpr: first.dpr, running: live(), still: reduced.matches },
          [off],
        );
      } catch {
        worker?.terminate();
        worker = null;
      }
    }

    let sync: () => void;
    let resize: () => void;
    let stopLocal = () => {};
    if (worker) {
      const w = worker;
      sync = () => w.postMessage({ type: "run", running: live(), still: reduced.matches });
      resize = () => {
        first = measure();
        w.postMessage({ type: "resize", opts: first.opts, cssW: first.w, cssH: first.h, dpr: first.dpr });
      };
    } else {
      let diorama = createDiorama(canvas, first.opts);
      let shift = first.opts.shiftY;
      let sceneT = 0, last = performance.now(), raf = 0;
      const draw = (at: number) => {
        raf = 0;
        if (!live()) return;
        if (at - last >= FRAME_MS - 2) {
          sceneT += Math.min(at - last, 250) / 1000;
          last = at;
          diorama.frame(sceneT);
        }
        raf = requestAnimationFrame(draw);
      };
      sync = () => {
        if (reduced.matches) diorama.frame(STILL_T);
        if (live() && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(draw);
        }
      };
      resize = () => {
        first = measure();
        if (first.opts.shiftY !== shift) {
          diorama = createDiorama(canvas, first.opts);
          shift = first.opts.shiftY;
        }
        diorama.resize(first.w, first.h, first.dpr);
        diorama.frame(reduced.matches ? STILL_T : sceneT);
      };
      diorama.resize(first.w, first.h, first.dpr);
      diorama.frame(reduced.matches ? STILL_T : 0);
      stopLocal = () => cancelAnimationFrame(raf);
    }
    syncRef.current = sync;

    let skipFirst = true; // ResizeObserver reports the initial size; we already used it
    const ro = new ResizeObserver(() => {
      if (skipFirst) { skipFirst = false; return; }
      resize();
    });
    ro.observe(box);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(box);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    sync();

    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      stopLocal();
      worker?.terminate();
      canvas.remove();
      syncRef.current = () => {};
    };
  }, []);

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden bg-[#03040e] ${className}`}
    />
  );
}
