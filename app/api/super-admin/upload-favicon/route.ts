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

  const validTypes = ["image/x-icon", "image/vnd.microsoft.icon", "image/png", "image/svg+xml", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return Response.json({ error: "Invalid file type. Use ICO, PNG, WebP or SVG." }, { status: 400 });
  }
  if (file.size > 1 * 1024 * 1024) {
    return Response.json({ error: "File too large (max 1 MB)" }, { status: 400 });
  }

  const mimeToExt: Record<string, string> = {
    "image/x-icon": "ico",
    "image/vnd.microsoft.icon": "ico",
    "image/png": "png",
    "image/svg+xml": "svg",
    "image/webp": "webp",
  };
  const ext = mimeToExt[file.type] ?? "png";
  const filename = `favicon-${Date.now()}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  return Response.json({ url: `/uploads/${filename}` });
}
