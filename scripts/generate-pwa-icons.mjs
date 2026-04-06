/**
 * One-off raster exports from public/favicon.svg for PWA manifests and platforms.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public", "favicon.svg");
const svg = readFileSync(svgPath);
const bg = "#faf9f6";

async function main() {
  await sharp(svg).resize(192, 192).png().toFile(path.join(root, "public", "pwa-192x192.png"));
  await sharp(svg).resize(512, 512).png().toFile(path.join(root, "public", "pwa-512x512.png"));
  await sharp(svg).resize(180, 180).png().toFile(path.join(root, "public", "apple-touch-icon.png"));

  const inner = 410;
  const pad = Math.floor((512 - inner) / 2);
  const padded = await sharp(svg)
    .resize(inner, inner)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: bg })
    .png()
    .toBuffer();
  await sharp(padded).toFile(path.join(root, "public", "maskable-icon-512x512.png"));

  console.log("Wrote PWA PNGs to public/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
