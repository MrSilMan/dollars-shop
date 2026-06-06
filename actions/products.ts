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
        variants: { orderBy: [{ groupName: "asc" }, { sortOrder: "asc" }] },
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
  if (!session || (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN")) return { error: "Unauthorized" };

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
  return { success: true, productId: product.id };
}

export async function updateProduct(id: string, data: Partial<ProductFormData>) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!session || (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN")) return { error: "Unauthorized" };

  const product = await prisma.product.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
    include: { category: true },
  });

  await invalidateProductCache(product.slug, product.category.slug);
  revalidatePath("/admin/products");
  revalidatePath(`/product/${product.slug}`);
  revalidatePath(`/shop/${product.category.slug}`);
  revalidatePath("/shop");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!session || (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN")) return { error: "Unauthorized" };

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

export async function getProductVariants(productId: string) {
  return prisma.productVariant.findMany({
    where: { productId },
    orderBy: [{ groupName: "asc" }, { sortOrder: "asc" }],
  });
}

export async function upsertVariants(productId: string, variants: { id?: string; groupName: string; value: string; sku?: string; stock: number; priceAdjust: number; sortOrder: number }[]) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!session || (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN")) return { error: "Unauthorized" };

  await prisma.$transaction(async (tx) => {
    const incoming = variants.filter(v => v.id);
    const incomingIds = incoming.map(v => v.id!);
    await tx.productVariant.deleteMany({ where: { productId, id: { notIn: incomingIds } } });
    for (const v of variants) {
      if (v.id) {
        await tx.productVariant.update({ where: { id: v.id }, data: { groupName: v.groupName, value: v.value, sku: v.sku ?? null, stock: v.stock, priceAdjust: v.priceAdjust, sortOrder: v.sortOrder } });
      } else {
        await tx.productVariant.create({ data: { productId, groupName: v.groupName, value: v.value, sku: v.sku ?? null, stock: v.stock, priceAdjust: v.priceAdjust, sortOrder: v.sortOrder } });
      }
    }
  });

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
  if (product) await invalidateProductCache(product.slug);
  revalidatePath(`/admin/products`);
  return { success: true };
}

function deriveCategoryPrefix(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return name.slice(0, 2).toUpperCase();
  return words.map(w => w[0].toUpperCase()).join("");
}

export async function generateSku(categoryId: string): Promise<string | null> {
  const [category, existingInCategory, others] = await Promise.all([
    prisma.category.findUnique({ where: { id: categoryId }, select: { name: true } }),
    prisma.product.findFirst({ where: { categoryId }, select: { sku: true } }),
    prisma.category.findMany({ where: { id: { not: categoryId } }, select: { name: true } }),
  ]);
  if (!category) return null;

  // Respect the prefix already in use for this category
  let prefix: string;
  if (existingInCategory) {
    prefix = existingInCategory.sku.split("-")[0];
  } else {
    const naturalPrefix = deriveCategoryPrefix(category.name);
    const otherPrefixes = new Set(others.map(c => deriveCategoryPrefix(c.name)));
    prefix = naturalPrefix;
    if (otherPrefixes.has(naturalPrefix)) {
      const words = category.name.trim().split(/\s+/);
      const firstWord = words[0];
      const tailInitials = words.slice(1).map(w => w[0].toUpperCase()).join("");
      for (let len = 2; len <= firstWord.length; len++) {
        const candidate = firstWord.slice(0, len).toUpperCase() + tailInitials;
        if (!otherPrefixes.has(candidate)) { prefix = candidate; break; }
      }
    }
  }

  const existing = await prisma.product.findMany({
    where: { sku: { startsWith: `${prefix}-` } },
    select: { sku: true },
  });
  const maxNum = existing.reduce((max, { sku }) => {
    const n = parseInt(sku.slice(prefix.length + 1), 10);
    return isNaN(n) ? max : Math.max(max, n);
  }, 0);

  return `${prefix}-${String(maxNum + 1).padStart(3, "0")}`;
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
