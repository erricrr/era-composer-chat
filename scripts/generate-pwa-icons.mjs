/**
 * Raster exports from public/apple-touch-icon.png for favicon and PWA assets.
 * Keeps apple-touch-icon.png as the source of truth (file is not overwritten).
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "public", "apple-touch-icon.png");
const bg = "#f7f6f2";

async function main() {
  const pwa192Path = path.join(root, "public", "pwa-192x192.png");
  const pwa512Path = path.join(root, "public", "pwa-512x512.png");
  const android192Path = path.join(root, "public", "android-chrome-192x192.png");
  const android512Path = path.join(root, "public", "android-chrome-512x512.png");
  const favicon16Path = path.join(root, "public", "favicon-16x16.png");
  const favicon32Path = path.join(root, "public", "favicon-32x32.png");
  const favicon48Path = path.join(root, "public", "favicon-48x48.png");

  await sharp(sourcePath).resize(192, 192).png().toFile(pwa192Path);
  await sharp(sourcePath).resize(512, 512).png().toFile(pwa512Path);
  await sharp(sourcePath).resize(192, 192).png().toFile(android192Path);
  await sharp(sourcePath).resize(512, 512).png().toFile(android512Path);
  await sharp(sourcePath).resize(16, 16).png().toFile(favicon16Path);
  await sharp(sourcePath).resize(32, 32).png().toFile(favicon32Path);
  await sharp(sourcePath).resize(48, 48).png().toFile(favicon48Path);

  const inner = 410;
  const pad = Math.floor((512 - inner) / 2);
  const padded = await sharp(sourcePath)
    .resize(inner, inner)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: bg })
    .png()
    .toBuffer();
  await sharp(padded).toFile(path.join(root, "public", "maskable-icon-512x512.png"));

  const icoBuf = await pngToIco([favicon16Path, favicon32Path, favicon48Path]);
  writeFileSync(path.join(root, "public", "favicon.ico"), icoBuf);

  console.log(
    "Wrote pwa-*, android-chrome-*, favicon-16/32, maskable-icon-512x512.png, and favicon.ico from apple-touch-icon.png",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
