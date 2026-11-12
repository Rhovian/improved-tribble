"use client";

import { useEffect, useRef, useState } from "react";

const LINE =
  "Hi, I'm Joseph. Developer, writer, and tinkerer. I build things and occasionally write about them.";
/** Delay between typed characters. */
const TYPE_MS = 32;
/** How long the box stays up once the line is shown, unless someone is using it. */
const AUTO_HIDE_MS = 12000;

/** Remembers, for this browser session, that the intro was seen (or closed). */
const SEEN_KEY = "hd-state";

type Phase = "typing" | "open" | "closed";

export interface DialogueAnchor {
  left: number;
  top: number;
  width: number;
}

/**
 * The home page introduction as a game dialogue box. It types out once, then
 * after a while tucks itself away into its "Joseph" name tag; tapping (or dragging
 * up) the tag pulls it back. A separate element from the scene behind it.
 */
export function HeroDialogue({ anchor }: { anchor: DialogueAnchor | null }) {
  const [phase, setPhase] = useState<Phase>("typing");
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const [hold, setHold] = useState(false);
  const dragStart = useRef<number | null>(null);
  const dragged = useRef(false);

  // First visit this session: type the line out. Later visits (or reduced
  // motion): show it at once, or stay tucked away if it was closed.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.sessionStorage.getItem(SEEN_KEY);
    } catch {}
    if (saved === "closed" || saved === "seen" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(LINE.length);
      setPhase(saved === "closed" ? "closed" : "open");
    } else {
      setTyping(true);
    }
  }, []);

  useEffect(() => {
    if (phase === "typing") return;
    try {
      window.sessionStorage.setItem(SEEN_KEY, phase === "closed" ? "closed" : "seen");
    } catch {}
  }, [phase]);

  useEffect(() => {
    if (phase !== "typing" || !typing) return;
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
  }, [phase, typing]);

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
      className="hd"
      data-phase={phase}
      style={anchor ? { left: anchor.left, top: anchor.top, width: anchor.width } : { visibility: "hidden" }}
      onPointerEnter={() => setHold(true)}
      onPointerLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHold(false);
      }}
    >
      <h1 className="sr-only">Hi, I&apos;m Joseph</h1>
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
        Joseph{closed && <span className="hd-caret" aria-hidden="true">▴</span>}
      </button>
      <div id="hero-dialogue" className="hd-box" role="region" aria-label="Introduction">
        <button type="button" className="hd-close" aria-label="Hide introduction" onClick={() => setPhase("closed")}>
          ▾
        </button>
        <p className="hd-say" onClick={skipTyping}>
          <span className="sr-only">{LINE}</span>
          <span aria-hidden="true">
            {/* every character keeps its place from the first frame; typing only
                recolours it, so nothing reflows or shifts */}
            {LINE.split("").map((ch, i) => (
              <span key={i} className={i < shown ? undefined : "hd-ghost"}>
                {ch}
              </span>
            ))}
            {phase !== "typing" && <span className="hd-more">▾</span>}
          </span>
        </p>
        <ul className="hd-choices">
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
