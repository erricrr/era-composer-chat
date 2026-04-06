/**
 * Raster exports from public/apple-touch-icon.png for favicon and PWA assets.
 * Keeps apple-touch-icon.png as the source of truth (file is not overwritten).
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import toIco from "to-ico";
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "public", "apple-touch-icon.png");
const bg = "#f7f6f2";

async function main() {
  await sharp(sourcePath).resize(192, 192).png().toFile(path.join(root, "public", "pwa-192x192.png"));
  await sharp(sourcePath).resize(512, 512).png().toFile(path.join(root, "public", "pwa-512x512.png"));
  await sharp(sourcePath).resize(192, 192).png().toFile(path.join(root, "public", "android-chrome-192x192.png"));
  await sharp(sourcePath).resize(512, 512).png().toFile(path.join(root, "public", "android-chrome-512x512.png"));
  await sharp(sourcePath).resize(16, 16).png().toFile(path.join(root, "public", "favicon-16x16.png"));
  await sharp(sourcePath).resize(32, 32).png().toFile(path.join(root, "public", "favicon-32x32.png"));

  const inner = 410;
  const pad = Math.floor((512 - inner) / 2);
  const padded = await sharp(sourcePath)
    .resize(inner, inner)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: bg })
    .png()
    .toBuffer();
  await sharp(padded).toFile(path.join(root, "public", "maskable-icon-512x512.png"));

  const icoBuf = await toIco([
    await sharp(sourcePath).resize(16, 16).png().toBuffer(),
    await sharp(sourcePath).resize(32, 32).png().toBuffer(),
    await sharp(sourcePath).resize(48, 48).png().toBuffer(),
  ]);
  writeFileSync(path.join(root, "public", "favicon.ico"), icoBuf);

  console.log(
    "Wrote pwa-*, android-chrome-*, favicon-16/32, maskable-icon-512x512.png, and favicon.ico from apple-touch-icon.png",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
