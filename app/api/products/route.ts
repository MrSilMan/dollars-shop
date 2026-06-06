import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20") || 20));

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category && { category: { slug: category } }),
      ...(featured === "true" && { featured: true }),
    },
    include: { category: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}
