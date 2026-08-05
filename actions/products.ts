"use server";

import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ProductSchema, type ProductFormData } from "@/schemas/product.schema";
import { canAccess } from "@/lib/permissions";
import { getCached, setCached, invalidateProductCache } from "@/lib/redis";
import { logAudit } from "@/lib/audit";

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
    // A product belongs to this category if it's its primary category OR one of
    // its additional (many-to-many) categories.
    const where = {
      isActive: true,
      OR: [
        { categoryId: category.id },
        { additionalCategories: { some: { id: category.id } } },
      ],
    };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
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
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!session || !canAccess("products", user?.role ?? "")) return { error: "Unauthorized" };

  const parsed = ProductSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  const { additionalCategoryIds, categoryId, ...rest } = parsed.data;
  const extraIds = additionalCategoryIds.filter((cid) => cid !== categoryId);

  const product = await prisma.product.create({
    data: {
      ...rest,
      categoryId,
      price: parsed.data.price,
      compareAtPrice: parsed.data.compareAtPrice ?? null,
      weight: parsed.data.weight ?? null,
      additionalCategories: { connect: extraIds.map((cid) => ({ id: cid })) },
    },
  });

  logAudit({ actorId: user?.id, actorEmail: user?.email, actorRole: user?.role, action: "PRODUCT_CREATE", entity: "product", entityId: product.id, entityLabel: product.name });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true, productId: product.id };
}

export async function updateProduct(id: string, data: Partial<ProductFormData>) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!session || !canAccess("products", user?.role ?? "")) return { error: "Unauthorized" };

  // additionalCategoryIds is not a column; when provided, replace the M2M set.
  const { additionalCategoryIds, ...rest } = data;
  const extraIds = additionalCategoryIds?.filter((cid) => cid !== (rest.categoryId ?? undefined));

  // Capture the categories the product WAS in (before update) so we can
  // revalidate those pages too when its categories change.
  const before = await prisma.product.findUnique({
    where: { id },
    include: { category: { select: { slug: true } }, additionalCategories: { select: { slug: true } } },
  });

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      updatedAt: new Date(),
      ...(extraIds ? { additionalCategories: { set: extraIds.map((cid) => ({ id: cid })) } } : {}),
    },
    include: { category: { select: { slug: true } }, additionalCategories: { select: { slug: true } } },
  });

  logAudit({ actorId: user?.id, actorEmail: user?.email, actorRole: user?.role, action: "PRODUCT_UPDATE", entity: "product", entityId: product.id, entityLabel: product.name });

  // Union of old + new category slugs so every affected listing is refreshed.
  const categorySlugs = new Set<string>([
    before?.category.slug,
    ...(before?.additionalCategories.map((c) => c.slug) ?? []),
    product.category.slug,
    ...product.additionalCategories.map((c) => c.slug),
  ].filter((s): s is string => Boolean(s)));

  await invalidateProductCache(product.slug, [...categorySlugs]);
  revalidatePath("/admin/products");
  revalidatePath(`/product/${product.slug}`);
  for (const slug of categorySlugs) revalidatePath(`/shop/${slug}`);
  revalidatePath("/shop");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!session || !canAccess("products", user?.role ?? "")) return { error: "Unauthorized" };

  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  logAudit({ actorId: user?.id, actorEmail: user?.email, actorRole: user?.role, action: "PRODUCT_DELETE", entity: "product", entityId: product.id, entityLabel: product.name });

  await invalidateProductCache(product.slug);
  revalidatePath("/admin/products");
  return { success: true };
}

/**
 * categoryId → one representative product photo, used when a category has no
 * curated imageUrl of its own. Featured products win, then the newest; only the
 * primary categoryId counts, which is enough for every category to get a photo
 * without paying for the many-to-many join. Cached because it scans products.
 */
async function getCategoryImageFallbacks(): Promise<Record<string, string>> {
  return withCache("categories:images", 1800, async () => {
    const samples = await prisma.product.findMany({
      where: { isActive: true, images: { isEmpty: false } },
      select: { categoryId: true, images: true },
      distinct: ["categoryId"],
      orderBy: [{ categoryId: "asc" }, { featured: "desc" }, { createdAt: "desc" }],
    });
    return Object.fromEntries(samples.map((p) => [p.categoryId, p.images[0]]));
  });
}

/** Resolve a single category's display image: curated upload first, else a product photo. */
export async function getCategoryImage(categoryId: string, imageUrl?: string | null) {
  if (imageUrl) return imageUrl;
  const fallbacks = await getCategoryImageFallbacks();
  return fallbacks[categoryId] ?? null;
}

export async function getAllCategories() {
  const [categories, fallbacks] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      // Same tie-break as getCategoriesForAdmin, so what the admin drags into
      // place in /admin/categories is the order the storefront renders.
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    getCategoryImageFallbacks(),
  ]);
  return categories.map((c) => ({ ...c, image: c.imageUrl ?? fallbacks[c.id] ?? null }));
}

/**
 * Every category — hidden ones included — with the two images that matter to the
 * admin: `imageUrl` is the pinned upload, `fallbackImage` is the product photo the
 * storefront shows in its absence. Both are returned so the UI can say which is live.
 */
export async function getCategoriesForAdmin() {
  const [categories, fallbacks] = await Promise.all([
    prisma.category.findMany({
      // Name breaks the tie: 7 categories share sortOrder 0, and without it the
      // admin list reshuffles on every refresh.
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    }),
    getCategoryImageFallbacks(),
  ]);
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    isActive: c.isActive,
    productCount: c._count.products,
    imageUrl: c.imageUrl,
    fallbackImage: fallbacks[c.id] ?? null,
  }));
}

/**
 * Persist the admin's category order. `ids` is the full list in its new order —
 * each row's index becomes its sortOrder, so the storefront (which orders by
 * sortOrder, name) renders exactly what the admin sees.
 */
export async function reorderCategories(ids: string[]) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!session || !canAccess("products", user?.role ?? "")) return { error: "Unauthorized" };

  if (!Array.isArray(ids) || ids.length === 0) return { error: "Nothing to reorder" };

  const known = await prisma.category.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true },
  });
  // A stale admin tab could post ids that no longer exist; renumbering a partial
  // list would scramble the rest, so reject instead of half-applying.
  if (known.length !== ids.length) return { error: "Category list is out of date — refresh and try again" };

  await prisma.$transaction(
    ids.map((id, sortOrder) => prisma.category.update({ where: { id }, data: { sortOrder } }))
  );

  logAudit({ actorId: user?.id, actorEmail: user?.email, actorRole: user?.role, action: "CATEGORY_UPDATE", entity: "category", entityLabel: `Reordered ${ids.length} categories` });

  revalidatePath("/");
  revalidatePath("/shop");
  for (const c of known) revalidatePath(`/shop/${c.slug}`);
  revalidatePath("/admin/categories");
  return { success: true };
}

/** Pin a category's image, or pass null to drop back to the auto-picked product photo. */
export async function updateCategoryImage(id: string, imageUrl: string | null) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!session || !canAccess("products", user?.role ?? "")) return { error: "Unauthorized" };

  const category = await prisma.category.update({
    where: { id },
    data: { imageUrl: imageUrl || null },
    select: { id: true, name: true, slug: true },
  });

  logAudit({ actorId: user?.id, actorEmail: user?.email, actorRole: user?.role, action: "CATEGORY_UPDATE", entity: "category", entityId: category.id, entityLabel: category.name });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/shop/${category.slug}`);
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function createCategory(name: string) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!session || !canAccess("products", user?.role ?? "")) return { error: "Unauthorized" };

  const trimmed = name.trim();
  if (!trimmed) return { error: "Category name is required" };

  const slug = trimmed.toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  if (!slug) return { error: "Category name is required" };

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return existing.isActive ? { error: "Category already exists" } : { error: "A deleted category with this name already exists" };

  const category = await prisma.category.create({ data: { name: trimmed, slug } });

  logAudit({ actorId: user?.id, actorEmail: user?.email, actorRole: user?.role, action: "CATEGORY_CREATE", entity: "category", entityId: category.id, entityLabel: category.name });

  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");
  return { success: true, category };
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
  if (!session || !canAccess("products", user?.role ?? "")) return { error: "Unauthorized" };

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

export async function getFlashDealsPaginated(page = 1, limit = 12) {
  // Not cached — flash deals are time-sensitive, matching getFlashDeals above.
  const where = { isActive: true, compareAtPrice: { not: null } } as const;
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);
  return { products: products.map(serializeProduct), total };
}

export async function getNewArrivals(limit = 8) {
  const products = await withCache(`products:new-arrivals:${limit}`, 1800, () =>
    prisma.product.findMany({
      where: { isActive: true, featured: false },
      include: { category: true },
      take: limit,
      orderBy: { createdAt: "desc" },
    })
  );
  return products.map(serializeProduct);
}

export async function getNewArrivalsPaginated(page = 1, limit = 12) {
  const result = await withCache(`products:new-arrivals-paginated:${page}:${limit}`, 1800, async () => {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: { category: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);
    return { products, total };
  });
  return { ...result, products: result.products.map(serializeProduct) };
}

/**
 * Paginated catalogue listing.
 *
 * `excludeIds` drops products that a caller already renders elsewhere on the same
 * page (e.g. the homepage rails), so they aren't shown twice. The exclusion applies
 * to both the rows and the count, keeping page boundaries consistent across pages.
 * `total` is the size of the paginated list; `storeTotal` is the full active
 * catalogue count, for "N products in store" style copy.
 */
export async function getAllProductsPaginated(page = 1, limit = 12, excludeIds: string[] = []) {
  const exclude = [...new Set(excludeIds)].sort();
  const cacheKey = exclude.length
    ? `products:all-paginated:${page}:${limit}:x${createHash("sha1").update(exclude.join(",")).digest("hex").slice(0, 12)}`
    : `products:all-paginated:${page}:${limit}`;

  const result = await withCache(cacheKey, 1800, async () => {
    const where = exclude.length ? { isActive: true, id: { notIn: exclude } } : { isActive: true };
    const [products, total, excludedStoreTotal] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
      exclude.length ? prisma.product.count({ where: { isActive: true } }) : undefined,
    ]);
    return { products, total, storeTotal: excludedStoreTotal ?? total };
  });
  return { ...result, products: result.products.map(serializeProduct) };
}
