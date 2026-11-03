// Renders the site's share image and icons from the diorama, using Next's
// file conventions so the meta tags are added automatically:
//   src/app/opengraph-image.png + twitter-image.png  (1200x630 still of the scene)
//   src/app/icon.png (32x32) + apple-icon.png (180x180)  (the gold "J" tag)
//   public/scene-band.png (1400x70)  (horizon strip behind the inner pages' header)
//
//   pnpm images:diorama            # optional: --t 224 (moment in the loop)
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { renderFrame, root } from "./lib/engine.mjs";
import { encodePNG, upscale } from "./lib/png.mjs";

const { values: a } = parseArgs({ options: { t: { type: "string", default: "224" } } });
const app = join(root, "src/app");

// --- share image: 600x315 art pixels, doubled to 1200x630
const og = upscale(600, 315, await renderFrame(600, 315, Number(a.t)), 2);
const ogPng = encodePNG(1200, 630, og);
const alt = "Pixel-art night scene: a snowy cabin with glowing windows on a clifftop above a moonlit sea, a hooded figure by a campfire, mountains on the horizon.";
for (const name of ["opengraph-image", "twitter-image"]) {
  writeFileSync(join(app, `${name}.png`), ogPng);
  writeFileSync(join(app, `${name}.alt.txt`), alt);
}

// --- scene band for the top of inner pages: the horizon seen from the cabin,
// with the moon rising over the sea. 1400x70 art px; pages show it at 2x.
const BAND = { w: 1400, h: 70 };
const band = await renderFrame(BAND.w, BAND.h, Number(a.t), { focusX: 300, shiftY: -12, moon: { x: 550, y: 140 } });
writeFileSync(join(root, "public/scene-band.png"), encodePNG(BAND.w, BAND.h, band));

// --- icon: the dialogue's gold "J" tag on lapis, drawn as 16x16 pixel art
const ICON = [
  ".bbbbbbbbbbbbbb.",
  "bLLLLLLLLLLLLLLb",
  "bLLLLLLLLLLLLLLb",
  "bLLLLGGGGGGGGLLb",
  "bLLLLGGGGGGGGLLb",
  "bLLLLsssssGGsLLb",
  "bLLLLLLLLLGGsLLb",
  "bLLLLLLLLLGGsLLb",
  "bLLLLLLLLLGGsLLb",
  "bLLLGGLLLLGGsLLb",
  "bLLLGGsLLLGGsLLb",
  "bLLLLGGGGGGsLLLb",
  "bLLLLLGGGGssLLLb",
  "bLLLLLLssssLLLLb",
  "bLLLLLLLLLLLLLLb",
  ".bbbbbbbbbbbbbb.",
];
const COL = { L: [17, 31, 80, 255], b: [43, 66, 130, 255], G: [241, 217, 143, 255], s: [6, 10, 30, 255], ".": [0, 0, 0, 0] };
const tile = (fillCorners) => {
  const px = Buffer.alloc(16 * 16 * 4);
  ICON.forEach((row, y) => [...row].forEach((ch, x) => {
    const c = ch === "." && fillCorners ? COL.L : COL[ch];
    px.set(c, (y * 16 + x) * 4);
  }));
  return px;
};
writeFileSync(join(app, "icon.png"), encodePNG(32, 32, upscale(16, 16, tile(false), 2)));
// apple touch icons are shown on their own background, so no transparent corners
const apple = Buffer.alloc(180 * 180 * 4);
for (let i = 0; i < 180 * 180; i++) apple.set(COL.L, i * 4);
const big = upscale(16, 16, tile(true), 11); // 176x176, centred
for (let y = 0; y < 176; y++) big.copy(apple, ((y + 2) * 180 + 2) * 4, y * 176 * 4, (y + 1) * 176 * 4);
writeFileSync(join(app, "apple-icon.png"), encodePNG(180, 180, apple));

console.log("wrote opengraph-image.png, twitter-image.png (1200x630), icon.png (32x32), apple-icon.png (180x180) in src/app; public/scene-band.png (1400x70)");
