import { auth } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";
import { setImageBlur } from "@/lib/redis";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import type { NextRequest } from "next/server";

const MAX_DIMENSION = 1920;

function detectMimeType(buf: Buffer): string | null {
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return "image/png";
  if (buf.length >= 12 && buf.subarray(0, 4).toString("binary") === "RIFF" && buf.subarray(8, 12).toString("binary") === "WEBP") return "image/webp";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  return null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!session || !canAccess("products", user?.role ?? "")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "File too large (max 5 MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedType = detectMimeType(buffer);
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!detectedType || !validTypes.includes(detectedType)) {
    return Response.json({ error: "Invalid file type. Use JPEG, PNG, WebP or GIF." }, { status: 400 });
  }

  // Animated GIFs can't be safely re-encoded as WebP without losing animation; keep them as-is.
  const isAnimatedGif = detectedType === "image/gif";

  const filename = isAnimatedGif
    ? `${Date.now()}-${Math.random().toString(36).slice(2)}.gif`
    : `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });

  const outputBuffer = isAnimatedGif
    ? buffer
    : await sharp(buffer)
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

  await writeFile(join(uploadDir, filename), outputBuffer);

  const url = `/uploads/${filename}`;

  let blurDataURL: string | undefined;
  if (!isAnimatedGif) {
    const blurBuffer = await sharp(outputBuffer)
      .resize(16, 16, { fit: "inside" })
      .webp({ quality: 50 })
      .toBuffer();
    blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
    await setImageBlur(url, blurDataURL);
  }

  return Response.json({ url, blurDataURL });
}
