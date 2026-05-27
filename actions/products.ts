"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ProductSchema, type ProductFormData } from "@/schemas/product.schema";
import { getCached, setCached, invalidateProductCache } from "@/lib/redis";

async function withCache<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  const cached = await getCached<T>(key);
  if (cached !== null) return cached;
  const result = await fn();
  await setCached(key, result, ttl);
  return result;
}

type DecimalLike = { toNumber: () => number } | number | string;
function toNum(v: DecimalLike | null | undefined): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v);
  return v.toNumber();
}

function serializeProduct<T extends { price: DecimalLike; compareAtPrice?: DecimalLike | null; weight?: DecimalLike | null }>(p: T) {
  return { ...p, price: toNum(p.price)!, compareAtPrice: toNum(p.compareAtPrice), weight: toNum(p.weight) };
}

export async function getFeaturedProducts() {
  const products = await withCache("products:featured", 3600, () =>
    prisma.product.findMany({
      where: { featured: true, isActive: true },
      include: { category: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    })
  );
  return products.map(serializeProduct);
}

export async function getProductBySlug(slug: string) {
  const product = await withCache(`product:${slug}`, 1800, async () => {
    return prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: true,
        reviews: { include: { user: { select: { name: true } } }, where: { isVisible: true } },
      },
    });
  });
  return product ? serializeProduct(product) : null;
}

export async function getProductsByCategory(categorySlug: string, page = 1, limit = 20) {
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) return { products: [] as Awaited<ReturnType<typeof prisma.product.findMany<{ include: { category: true } }>>>, total: 0, category: null };

  const result = await withCache(`products:category:${categorySlug}:${page}`, 1800, async () => {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId: category.id, isActive: true },
        include: { category: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where: { categoryId: category.id, isActive: true } }),
    ]);
    return { products, total, category };
  });
  return { ...result, products: result.products.map(serializeProduct) };
}

export async function searchProducts(query: string) {
  if (!query.trim()) return [] as Awaited<ReturnType<typeof prisma.product.findMany<{ include: { category: true } }>>>;
  const products = await withCache(`search:${query.toLowerCase()}`, 600, () =>
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { tags: { has: query.toLowerCase() } },
        ],
      },
      include: { category: true },
      take: 20,
    })
  );
  return products.map(serializeProduct);
}

export async function createProduct(data: ProductFormData) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!session || user?.role !== "ADMIN") return { error: "Unauthorized" };

  const parsed = ProductSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      price: parsed.data.price,
      compareAtPrice: parsed.data.compareAtPrice ?? null,
      weight: parsed.data.weight ?? null,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}

export async function updateProduct(id: string, data: Partial<ProductFormData>) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!session || user?.role !== "ADMIN") return { error: "Unauthorized" };

  const product = await prisma.product.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  });

  await invalidateProductCache(product.slug);
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!session || user?.role !== "ADMIN") return { error: "Unauthorized" };

  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  await invalidateProductCache(product.slug);
  revalidatePath("/admin/products");
  return { success: true };
}

export async function getAllCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getFlashDeals() {
  const products = await prisma.product.findMany({
    where: { isActive: true, compareAtPrice: { not: null } },
    include: { category: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
  return products.map(serializeProduct);
}
