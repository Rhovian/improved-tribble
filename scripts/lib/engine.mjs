// Loads the diorama engine (src/lib/diorama.ts) in Node, with a stand-in
// canvas, for scripts and tests that render frames without a browser.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** Transpile and import the engine module. */
export async function loadEngine() {
  const tmp = mkdtempSync(join(tmpdir(), "diorama-"));
  try {
    const file = join(tmp, "diorama.mjs");
    const src = readFileSync(join(root, "src/lib/diorama.ts"), "utf8");
    writeFileSync(file, ts.transpileModule(src, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText);
    return await import(pathToFileURL(file).href);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

/** A minimal canvas: the engine only needs ImageData in and out. `pixels()` is the last frame (RGBA). */
export function headlessCanvas() {
  let last = null;
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({
      createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
      putImageData: (img) => { last = img.data; },
    }),
  };
  return { canvas, pixels: () => Buffer.from(last) };
}

/** Render one frame of a w x h scene at loop time t; returns RGBA bytes. */
export async function renderFrame(w, h, t, opts = {}) {
  const { createDiorama } = await loadEngine();
  const { canvas, pixels } = headlessCanvas();
  const d = createDiorama(canvas, { ...opts, fixedSize: { w, h } });
  d.resize(0, 0, 1);
  d.frame(t);
  return pixels();
}
