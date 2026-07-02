import "dotenv/config";
import { readdir, readFile, writeFile, stat } from "fs/promises";
import { join, extname } from "path";
import sharp from "sharp";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), "public", "uploads");
const MAX_DIMENSION = 1920;
const SKIP_IF_UNDER = 200 * 1024; // already small enough, not worth re-encoding

const encoders = {
  ".jpg": (img) => img.jpeg({ quality: 82 }),
  ".jpeg": (img) => img.jpeg({ quality: 82 }),
  ".png": (img) => img.png({ quality: 82, compressionLevel: 9 }),
  ".webp": (img) => img.webp({ quality: 82 }),
};

const files = await readdir(uploadDir);
let shrunk = 0;
let skipped = 0;
let totalBefore = 0;
let totalAfter = 0;

for (const filename of files) {
  const ext = extname(filename).toLowerCase();
  const encode = encoders[ext];
  const path = join(uploadDir, filename);
  const { size: before } = await stat(path);

  if (!encode) { skipped++; continue; } // unrecognized extension: leave untouched, no blur

  const buffer = await readFile(path);
  let finalBuffer = buffer;

  if (before >= SKIP_IF_UNDER) {
    const outputBuffer = await encode(
      sharp(buffer).resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    ).toBuffer();

    if (outputBuffer.length < before) {
      await writeFile(path, outputBuffer);
      totalBefore += before;
      totalAfter += outputBuffer.length;
      finalBuffer = outputBuffer;
      shrunk++;
    } else {
      skipped++;
    }
  } else {
    skipped++;
  }

  const blurBuffer = await sharp(finalBuffer)
    .resize(16, 16, { fit: "inside" })
    .webp({ quality: 50 })
    .toBuffer();
  const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
  await redis.set(`image:blur:/uploads/${filename}`, blurDataURL);
}

console.log(`Re-compressed ${shrunk} files, skipped ${skipped}.`);
if (shrunk > 0) {
  console.log(`Total size: ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB`);
}
console.log(`Cached blur placeholders for ${files.length} files.`);

await redis.quit();
