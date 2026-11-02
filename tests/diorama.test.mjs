// Guards the diorama's promises: every frame is a pure function of time, so
// the scene loops seamlessly, and layout maths matches what the page expects.
//   pnpm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { headlessCanvas, loadEngine } from "../scripts/lib/engine.mjs";

const engine = await loadEngine();
const { createDiorama, computeLayout, projectPoint, LOOP_SECONDS } = engine;

function renderer(w, h) {
  const { canvas, pixels } = headlessCanvas();
  const d = createDiorama(canvas, { fixedSize: { w, h } });
  d.resize(0, 0, 1);
  return (t) => { d.frame(t); return pixels(); };
}

for (const [w, h, label] of [[480, 270, "16:9 video frame"], [293, 633, "tall phone"]]) {
  test(`loops seamlessly (${label})`, () => {
    const at = renderer(w, h);
    const start = at(0);
    assert.ok(start.equals(at(LOOP_SECONDS)), "frame at the end of the loop matches the start");
    assert.ok(start.equals(at(LOOP_SECONDS * 100)), "and still matches after 100 loops (10 hours)");
    assert.ok(!start.equals(at(LOOP_SECONDS / 2)), "the scene actually moves");
  });
}

test("frames are deterministic", () => {
  assert.ok(renderer(480, 270)(123.45).equals(renderer(480, 270)(123.45)));
});

test("1080p maps to exactly 4x4 device pixels per art pixel", () => {
  const l = computeLayout(1920, 1080, 1);
  assert.equal(l.bufW, 480);
  assert.equal(l.bufH, 270);
  assert.equal(l.scale, 4);
  assert.deepEqual(projectPoint(l, l.camX, l.camY), { x: 0, y: 0 });
});

test("layout keeps whole-number pixels on a phone", () => {
  const l = computeLayout(390, 844, 3);
  assert.equal(l.scale, Math.floor(l.scale));
  assert.ok(l.cssWidth >= 390 && l.cssHeight >= 844, "the canvas covers the screen");
});
