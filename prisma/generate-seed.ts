import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { writeFileSync } from "fs";
import { join } from "path";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:password@localhost:5432/dollar_shop",
});
const prisma = new PrismaClient({ adapter });

// Serialise a string/null to a quoted TS literal
const q = (s: string | null | undefined): string =>
  s == null ? "null" : JSON.stringify(s);

// Prisma Decimal → JS number
const dec = (v: { toString(): string }): number => parseFloat(v.toString());

// String array → inline TS array literal
const strArr = (arr: string[]): string =>
  `[${arr.map((s) => JSON.stringify(s)).join(", ")}]`;

async function main() {
  console.log("Reading live data from database...");

  const [categories, products, appSettings, heroSlides, sidePromos, promoCards] =
    await Promise.all([
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.product.findMany({
        include: { category: { select: { slug: true } } },
        orderBy: { sku: "asc" },
      }),
      prisma.appSettings.findFirst(),
      prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.sidePromo.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.promoCard.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

  console.log(`  ${categories.length} categories`);
  console.log(`  ${products.length} products`);
  console.log(
    `  ${heroSlides.length} hero slides, ${sidePromos.length} side promos, ${promoCards.length} promo cards`,
  );

  // Fallback settings if none in DB
  const s = appSettings ?? {
    primaryColor: "#1A4D3A",
    accentColor: "#F5A623",
    bgColor: "#F8FAF9",
    textColor: "#1A2E25",
    logoUrl: null as string | null,
    faviconUrl: null as string | null,
    appName: "Dollar Shop",
    footerText: "© 2025 Dollar Shop — Quality Everyday. Every Dollar Counts.",
    fontScale: "MEDIUM",
  };

  // ── Data lines ────────────────────────────────────────────────────────────

  const catLines = categories.map(
    (c) =>
      `    { slug: ${q(c.slug)}, name: ${q(c.name)}, icon: ${q(c.icon)}, description: ${q(c.description)}, sortOrder: ${c.sortOrder} },`,
  );

  const prodLines = products.map(
    (p) =>
      `    { name: ${q(p.name)}, slug: ${q(p.slug)}, categorySlug: ${q(p.category.slug)}, ` +
      `price: ${dec(p.price)}, compareAtPrice: ${p.compareAtPrice == null ? "null" : dec(p.compareAtPrice)}, ` +
      `stock: ${p.stock}, sku: ${q(p.sku)}, description: ${q(p.description)}, ` +
      `images: ${strArr(p.images)}, tags: ${strArr(p.tags)}, featured: ${p.featured}, isActive: ${p.isActive} },`,
  );

  const heroLines = heroSlides.map(
    (h) =>
      `      { tag: ${q(h.tag)}, tagBg: ${q(h.tagBg)}, headline: ${q(h.headline)}, sub: ${q(h.sub)}, ` +
      `ctaLabel: ${q(h.ctaLabel)}, ctaHref: ${q(h.ctaHref)}, ctaBg: ${q(h.ctaBg)}, imageUrl: ${q(h.imageUrl)}, ` +
      `bgFrom: ${q(h.bgFrom)}, bgTo: ${q(h.bgTo)}, sortOrder: ${h.sortOrder}, isActive: ${h.isActive} },`,
  );

  const sideLines = sidePromos.map(
    (sp) =>
      `      { label: ${q(sp.label)}, headline: ${q(sp.headline)}, href: ${q(sp.href)}, imageUrl: ${q(sp.imageUrl)}, ` +
      `bgFrom: ${q(sp.bgFrom)}, bgTo: ${q(sp.bgTo)}, sortOrder: ${sp.sortOrder}, isActive: ${sp.isActive} },`,
  );

  const cardLines = promoCards.map(
    (pc) =>
      `      { amount: ${q(pc.amount)}, label: ${q(pc.label)}, desc: ${q(pc.desc)}, sub: ${q(pc.sub)}, ` +
      `href: ${q(pc.href)}, leftBg: ${q(pc.leftBg)}, rightBg: ${q(pc.rightBg)}, sortOrder: ${pc.sortOrder}, isActive: ${pc.isActive} },`,
  );

  // ── Assemble seed.ts lines ────────────────────────────────────────────────
  // Using plain string literals avoids any backtick/interpolation escaping.
  // Products use upsert (never delete) so running db:seed on a live DB is safe.

  const lines: string[] = [
    'import "dotenv/config";',
    'import { PrismaClient } from "../app/generated/prisma/client";',
    'import { PrismaPg } from "@prisma/adapter-pg";',
    'import bcrypt from "bcryptjs";',
    'import Redis from "ioredis";',
    "",
    "const adapter = new PrismaPg({",
    '  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:password@localhost:5432/dollar_shop",',
    "});",
    "const prisma = new PrismaClient({ adapter });",
    'const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { lazyConnect: true });',
    "",
    "async function main() {",
    '  console.log("Seeding database...");',
    "",
    "  // Seed categories — order matches sortOrder",
    "  const categoryData = [",
    ...catLines,
    "  ];",
    "",
    "  const categories: Record<string, { id: string }> = {};",
    "  for (const cat of categoryData) {",
    "    const created = await prisma.category.upsert({",
    "      where: { slug: cat.slug },",
    "      update: { name: cat.name, icon: cat.icon, description: cat.description, sortOrder: cat.sortOrder },",
    "      create: cat,",
    "    });",
    "    categories[cat.slug] = created;",
    "  }",
    "  console.log(`Seeded ${categoryData.length} categories`);",
    "",
    "  // Seed products — upsert by slug so existing DB products are never deleted",
    "  const productData = [",
    ...prodLines,
    "  ];",
    "",
    "  for (const product of productData) {",
    "    const { categorySlug, isActive, ...data } = product;",
    "    const category = categories[categorySlug];",
    "    if (!category) continue;",
    "    const payload = { ...data, compareAtPrice: data.compareAtPrice ?? null, categoryId: category.id, isActive };",
    "    await prisma.product.upsert({",
    "      where: { slug: data.slug },",
    "      update: payload,",
    "      create: payload,",
    "    });",
    "  }",
    "  console.log(`Seeded ${productData.length} products`);",
    "",
    "  // Seed admin user",
    "  const adminHash = await bcrypt.hash(\"admin123!\", 12);",
    "  await prisma.user.upsert({",
    '    where: { email: "admin@dollarshop.co.zw" },',
    "    update: {},",
    "    create: {",
    '      email: "admin@dollarshop.co.zw",',
    '      name: "Dollar Shop Admin",',
    "      passwordHash: adminHash,",
    '      role: "ADMIN",',
    "    },",
    "  });",
    '  console.log("Seeded admin user: admin@dollarshop.co.zw");',
    "",
    "  // Seed super admin user (developer role — not creatable from UI)",
    "  const superAdminHash = await bcrypt.hash(\"superadmin999!\", 12);",
    "  await prisma.user.upsert({",
    '    where: { email: "dev@dollarshop.co.zw" },',
    "    update: {},",
    "    create: {",
    '      email: "dev@dollarshop.co.zw",',
    '      name: "Dollar Shop Developer",',
    "      passwordHash: superAdminHash,",
    '      role: "SUPER_ADMIN",',
    "    },",
    "  });",
    '  console.log("Seeded super admin user: dev@dollarshop.co.zw");',
    "",
    "  // Seed app settings",
    "  await prisma.appSettings.upsert({",
    '    where: { id: "default" },',
    "    update: {",
    `      primaryColor: ${q(s.primaryColor as string)},`,
    `      accentColor: ${q(s.accentColor as string)},`,
    `      bgColor: ${q(s.bgColor as string)},`,
    `      textColor: ${q(s.textColor as string)},`,
    `      logoUrl: ${q(s.logoUrl)},`,
    `      faviconUrl: ${q((s as { faviconUrl?: string | null }).faviconUrl)},`,
    `      appName: ${q(s.appName as string)},`,
    `      footerText: ${q(s.footerText as string)},`,
    `      fontScale: ${q(s.fontScale as string)},`,
    "    },",
    "    create: {",
    '      id: "default",',
    `      primaryColor: ${q(s.primaryColor as string)},`,
    `      accentColor: ${q(s.accentColor as string)},`,
    `      bgColor: ${q(s.bgColor as string)},`,
    `      textColor: ${q(s.textColor as string)},`,
    `      logoUrl: ${q(s.logoUrl)},`,
    `      faviconUrl: ${q((s as { faviconUrl?: string | null }).faviconUrl)},`,
    `      appName: ${q(s.appName as string)},`,
    `      footerText: ${q(s.footerText as string)},`,
    `      fontScale: ${q(s.fontScale as string)},`,
    "    },",
    "  });",
    '  console.log("Seeded app settings");',
    "",
    "  // ─── Homepage content ──────────────────────────────────────────────────────",
    "",
    "  await prisma.heroSlide.deleteMany();",
    ...(heroSlides.length > 0
      ? [
          "  await prisma.heroSlide.createMany({",
          "    data: [",
          ...heroLines,
          "    ],",
          "  });",
          `  console.log("Seeded ${heroSlides.length} hero slides");`,
        ]
      : ['  console.log("No hero slides to seed");']),
    "",
    "  await prisma.sidePromo.deleteMany();",
    ...(sidePromos.length > 0
      ? [
          "  await prisma.sidePromo.createMany({",
          "    data: [",
          ...sideLines,
          "    ],",
          "  });",
          `  console.log("Seeded ${sidePromos.length} side promos");`,
        ]
      : ['  console.log("No side promos to seed");']),
    "",
    "  await prisma.promoCard.deleteMany();",
    ...(promoCards.length > 0
      ? [
          "  await prisma.promoCard.createMany({",
          "    data: [",
          ...cardLines,
          "    ],",
          "  });",
          `  console.log("Seeded ${promoCards.length} promo cards");`,
        ]
      : ['  console.log("No promo cards to seed");']),
    "",
    '  console.log("Seeding complete!");',
    "",
    "  // Flush product caches so stale data isn't served after a re-seed",
    "  try {",
    '    const keys = await redis.keys("products:*");',
    '    const pkeys = await redis.keys("product:*");',
    "    const all = [...keys, ...pkeys];",
    "    if (all.length > 0) await redis.del(...all);",
    "    console.log(`Cleared ${all.length} Redis cache entries`);",
    "  } catch {",
    '    console.warn("Redis cache flush skipped (Redis unavailable)");',
    "  }",
    "}",
    "",
    "main()",
    "  .catch((e) => {",
    "    console.error(e);",
    "    process.exit(1);",
    "  })",
    "  .finally(async () => {",
    "    await prisma.$disconnect();",
    "    await redis.quit();",
    "  });",
    "",
  ];

  const content = lines.join("\n");
  const seedPath = join(__dirname, "seed.ts");
  writeFileSync(seedPath, content, "utf-8");

  console.log(`\nWrote ${seedPath}`);
  console.log(
    `  ${categories.length} categories, ${products.length} products, ${heroSlides.length} hero slides, ${sidePromos.length} side promos, ${promoCards.length} promo cards`,
  );
  console.log('\nRun "npm run db:seed" to apply the updated seed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
