// Draws the diorama on an OffscreenCanvas, off the page's main thread, so the
// animation never competes with taps, scrolling or page load.
import { createDiorama, type Diorama, type DioramaOptions } from "./diorama";

export type WorkerMessage =
  | { type: "init"; canvas: OffscreenCanvas; opts: DioramaOptions; cssW: number; cssH: number; dpr: number; running: boolean; still: boolean }
  | { type: "resize"; opts: DioramaOptions; cssW: number; cssH: number; dpr: number }
  | { type: "run"; running: boolean; still: boolean };

/** Frame intervals (ms): 30 fps normally, lower on devices that can't keep up. */
const STEPS = [1000 / 30, 1000 / 20, 1000 / 15];
const STILL_T = 14;

const scope = self as unknown as {
  onmessage: ((e: MessageEvent<WorkerMessage>) => void) | null;
  requestAnimationFrame?: (cb: (now: number) => void) => number;
  cancelAnimationFrame?: (id: number) => void;
};

let canvas: OffscreenCanvas | null = null;
let diorama: Diorama | null = null;
let shift = NaN;
let running = false;
let still = false;
let sceneT = 0; // seconds of animation shown so far; survives pauses
let last = 0;
let pending = 0;
let step = 0;
let cost = 0; // smoothed render time (ms)

const now = () => performance.now();

function schedule() {
  if (pending || !running || still) return;
  if (scope.requestAnimationFrame) pending = scope.requestAnimationFrame(tick);
  else pending = setTimeout(() => tick(now()), STEPS[step]) as unknown as number;
}

function tick(at: number) {
  pending = 0;
  if (!running || still || !diorama) return;
  const interval = STEPS[step];
  if (at - last >= interval - 2) {
    // advance by real time, but never leap after a long stall
    sceneT += Math.min(at - last, 250) / 1000;
    last = at;
    const t0 = now();
    diorama.frame(sceneT);
    cost = cost * 0.9 + (now() - t0) * 0.1;
    // adapt: slow devices drop to 20 or 15 fps; recover when there is room
    if (cost > interval * 0.45 && step < STEPS.length - 1) step++;
    else if (step > 0 && cost < STEPS[step - 1] * 0.2) step--;
  }
  schedule();
}

function setup(opts: DioramaOptions, cssW: number, cssH: number, dpr: number) {
  if (!canvas) return;
  const want = opts.shiftY ?? 0;
  if (!diorama || want !== shift) {
    diorama = createDiorama(canvas, opts);
    shift = want;
  }
  diorama.resize(cssW, cssH, dpr);
  diorama.frame(still ? STILL_T : sceneT);
}

scope.onmessage = (e) => {
  const m = e.data;
  if (m.type === "init") {
    canvas = m.canvas;
    running = m.running;
    still = m.still;
    setup(m.opts, m.cssW, m.cssH, m.dpr);
  } else if (m.type === "resize") {
    setup(m.opts, m.cssW, m.cssH, m.dpr);
  } else if (m.type === "run") {
    running = m.running;
    const wasStill = still;
    still = m.still;
    if (still && diorama) diorama.frame(STILL_T);
    else if (wasStill && diorama) diorama.frame(sceneT);
  }
  last = now();
  schedule();
};
