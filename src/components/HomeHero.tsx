"use client";

import { useCallback, useEffect, useState } from "react";
import { DioramaBackground, type ScenePoint } from "./DioramaBackground";
import { HeroDialogue, type DialogueAnchor } from "./HeroDialogue";

/** Room the dialogue needs below its top edge, so it never runs off-screen. */
const DIALOGUE_ROOM = 200;
/** Remembers a visitor's choice to pause the animation. */
const PAUSE_KEY = "scene-paused";

/**
 * Home hero: the animated scene, with the introduction dialogue as its own
 * element set on the rock face just under the snow.
 */
export function HomeHero() {
  const [anchor, setAnchor] = useState<DialogueAnchor | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    try {
      setPaused(window.localStorage.getItem(PAUSE_KEY) === "1");
    } catch {}
  }, []);
  const togglePause = () => {
    setPaused((p) => {
      try {
        window.localStorage.setItem(PAUSE_KEY, p ? "0" : "1");
      } catch {}
      return !p;
    });
  };

  const onLayout = useCallback((project: ScenePoint, box: { width: number; height: number }) => {
    const house = project(140, 230); // the cabin's left wall, just under the snow lip
    const edge = project(326, 0); // the cliff face, where the rock gives way to water
    const width = Math.min(620, box.width - 32);
    // desktop: against the left edge of the screen; phones: under the cabin
    const desktop = box.width >= 768 && box.width > box.height;
    const left = desktop
      ? Math.max(24, box.width * 0.04)
      : Math.max(16, Math.min(house.x - 12, edge.x - width, box.width - width - 16));
    const top = Math.max(96, Math.min(house.y, box.height - DIALOGUE_ROOM));
    setAnchor({ left: Math.round(left), top: Math.round(top), width: Math.round(width) });
  }, []);

  return (
    <section className="relative isolate h-[100svh] min-h-[560px] overflow-hidden bg-[#03040e]">
      <DioramaBackground
        className="z-0"
        shiftY={(landscape) => (landscape ? 26 : 48)}
        onLayout={onLayout}
        paused={paused}
      />
      <HeroDialogue anchor={anchor} />
      <button
        type="button"
        className="scene-toggle"
        aria-pressed={paused}
        aria-label={paused ? "Play the background animation" : "Pause the background animation"}
        title={paused ? "Play" : "Pause"}
        onClick={togglePause}
      >
        <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
      </button>
    </section>
  );
}
