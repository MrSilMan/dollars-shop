import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "SUPER_ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
  if (!validTypes.includes(file.type)) {
    return Response.json({ error: "Invalid file type. Use JPEG, PNG, WebP or SVG." }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return Response.json({ error: "File too large (max 2 MB)" }, { status: 400 });
  }

  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg", "image/jpg": "jpg",
    "image/png": "png", "image/webp": "webp", "image/svg+xml": "svg",
  };
  const ext = mimeToExt[file.type] ?? "png";
  const filename = `logo-${Date.now()}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  return Response.json({ url: `/uploads/${filename}` });
}
