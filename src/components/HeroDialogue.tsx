"use client";

import { Pixelify_Sans } from "next/font/google";
import { useEffect, useRef, useState } from "react";

const pixel = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixel", display: "swap" });

const LINE =
  "Hi, I'm J. Developer, writer, and tinkerer. I build things and occasionally write about them.";
/** Delay between typed characters. */
const TYPE_MS = 32;
/** How long the box stays up once the line is shown, unless someone is using it. */
const AUTO_HIDE_MS = 12000;

type Phase = "typing" | "open" | "closed";

export interface DialogueAnchor {
  left: number;
  top: number;
  width: number;
}

/**
 * The home page introduction as a game dialogue box. It types out once, then
 * after a while tucks itself away into its "J" name tag; tapping (or dragging
 * up) the tag pulls it back. A separate element from the scene behind it.
 */
export function HeroDialogue({ anchor }: { anchor: DialogueAnchor | null }) {
  const [phase, setPhase] = useState<Phase>("typing");
  const [shown, setShown] = useState(0);
  const [hold, setHold] = useState(false);
  const dragStart = useRef<number | null>(null);
  const dragged = useRef(false);

  // type the line out (or show it at once for reduced motion)
  useEffect(() => {
    if (phase !== "typing") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(LINE.length);
      setPhase("open");
      return;
    }
    const id = window.setInterval(() => {
      setShown((n) => {
        if (n + 1 >= LINE.length) {
          window.clearInterval(id);
          setPhase("open");
          return LINE.length;
        }
        return n + 1;
      });
    }, TYPE_MS);
    return () => window.clearInterval(id);
  }, [phase]);

  // tuck away on a timer, but never while the pointer or focus is on it
  useEffect(() => {
    if (phase !== "open" || hold) return;
    const id = window.setTimeout(() => setPhase("closed"), AUTO_HIDE_MS);
    return () => window.clearTimeout(id);
  }, [phase, hold]);

  const open = () => {
    setShown(LINE.length);
    setPhase("open");
  };
  const toggle = () => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    if (phase === "closed") open();
    else setPhase("closed");
  };
  const skipTyping = () => {
    if (phase === "typing") open();
  };

  const closed = phase === "closed";

  return (
    <div
      className={`hd ${pixel.variable}`}
      data-phase={phase}
      style={anchor ? { left: anchor.left, top: anchor.top, width: anchor.width } : { visibility: "hidden" }}
      onPointerEnter={() => setHold(true)}
      onPointerLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHold(false);
      }}
    >
      <h1 className="sr-only">Hi, I&apos;m J</h1>
      <button
        type="button"
        className="hd-tag"
        aria-expanded={!closed}
        aria-controls="hero-dialogue"
        aria-label={closed ? "Show introduction" : "Hide introduction"}
        onClick={toggle}
        onPointerDown={(e) => {
          dragStart.current = e.clientY;
        }}
        onPointerMove={(e) => {
          if (closed && dragStart.current !== null && dragStart.current - e.clientY > 12) {
            dragStart.current = null;
            dragged.current = true;
            open();
          }
        }}
        onPointerUp={() => {
          dragStart.current = null;
        }}
      >
        J{closed && <span className="hd-caret" aria-hidden="true">▴</span>}
      </button>
      <div id="hero-dialogue" className="hd-box" role="region" aria-label="Introduction">
        <button type="button" className="hd-close" aria-label="Hide introduction" onClick={() => setPhase("closed")}>
          ▾
        </button>
        <p className="hd-say" onClick={skipTyping}>
          <span className="sr-only">{LINE}</span>
          <span aria-hidden="true">
            {LINE.slice(0, shown)}
            {phase !== "typing" && <span className="hd-more">▾</span>}
          </span>
        </p>
        <ul className="hd-choices" data-ready={phase !== "typing"}>
          <li>
            <a href="https://github.com/Rhovian" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
