// Renders a short, seamlessly looping GIF of the diorama (for Twitter/X and
// other social posts) straight from the engine in src/lib/diorama.ts.
//
//   pnpm gif:diorama                       # public/house-at-the-end-of-the-world.gif
//   pnpm gif:diorama --start 224 --seconds 8 --fps 20 --scale 2 --out my.gif
//
// Needs ffmpeg on your PATH. The clip's last `--blend` seconds are faded into
// its first, so it loops without a jump; clouds and fog are held still because
// their slow drift can't loop in a few seconds. Pick --start in a calm stretch
// of the 6-minute loop (default 224 s has no gusts, visitors or shooting stars).
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { values: a } = parseArgs({
  options: {
    start: { type: "string", default: "224" },
    seconds: { type: "string", default: "8" },
    blend: { type: "string", default: "1" },
    fps: { type: "string", default: "20" },
    scale: { type: "string", default: "2" },
    width: { type: "string", default: "480" },
    height: { type: "string", default: "270" },
    out: { type: "string", default: join(root, "public/house-at-the-end-of-the-world.gif") },
  },
});
const start = Number(a.start), seconds = Number(a.seconds), blend = Number(a.blend);
const fps = Number(a.fps), scale = Number(a.scale), W = Number(a.width), H = Number(a.height);
const N = Math.round(seconds * fps), X = Math.round(blend * fps);
if (!(N > 0 && X >= 0 && X < N)) throw new Error("--blend must be shorter than --seconds");

// load the engine: transpile the TypeScript once into a temp module
const tmp = mkdtempSync(join(tmpdir(), "diorama-"));
const engine = join(tmp, "diorama.mjs");
const src = readFileSync(join(root, "src/lib/diorama.ts"), "utf8");
writeFileSync(engine, ts.transpileModule(src, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText);
const { createDiorama } = await import(pathToFileURL(engine).href);
rmSync(tmp, { recursive: true, force: true });

// a minimal stand-in for a canvas: the engine only needs ImageData in and out
let last = null;
const canvas = {
  width: 0,
  height: 0,
  style: {},
  getContext: () => ({
    createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
    putImageData: (img) => { last = img.data; },
  }),
};
const d = createDiorama(canvas, { fixedSize: { w: W, h: H }, skyTime: start });
d.resize(0, 0, 1);
const frameAt = (t) => { d.frame(t); return Buffer.from(last); };

const out = resolve(a.out);
const ff = spawn("ffmpeg", [
  "-v", "error", "-y",
  "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-r", String(fps), "-i", "-",
  "-vf", `scale=${W * scale}:${H * scale}:flags=neighbor,split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=none:diff_mode=rectangle`,
  "-loop", "0", out,
], { stdio: ["pipe", "inherit", "inherit"] });
ff.on("error", (e) => { console.error("Could not run ffmpeg. Is it installed and on your PATH?", e.message); process.exit(1); });

for (let i = 0; i < N; i++) {
  let f = frameAt(start + i / fps);
  if (i < X) {
    // fade the clip's tail into its head so the loop has no seam
    const tail = frameAt(start + (i + N) / fps), k = i / X;
    for (let j = 0; j < f.length; j++) f[j] = Math.round(tail[j] + (f[j] - tail[j]) * k);
  }
  if (!ff.stdin.write(f)) await new Promise((r) => ff.stdin.once("drain", r));
}
ff.stdin.end();
const code = await new Promise((r) => ff.on("close", r));
if (code !== 0) process.exit(code);
console.log(`wrote ${out} (${W * scale}x${H * scale}, ${N} frames at ${fps} fps)`);
