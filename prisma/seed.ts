import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import Redis from "ioredis";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:password@localhost:5432/dollar_shop",
});
const prisma = new PrismaClient({ adapter });
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { lazyConnect: true });

async function main() {
  console.log("Seeding database...");

  // Remove obsolete categories — delete dependents in FK order first
  const obsoleteSlugs = [
    "household", "groceries", "personal-care", "stationery",
    "baby-kids", "electronics", "clothing", "food-snacks",
    "home-decor", "food", "locations", "kitchenware-old",
  ];
  const obsoleteCats = await prisma.category.findMany({
    where: { slug: { in: obsoleteSlugs } },
    select: { id: true },
  });
  const obsoleteCatIds = obsoleteCats.map((c) => c.id);
  if (obsoleteCatIds.length > 0) {
    const obsoleteProducts = await prisma.product.findMany({
      where: { categoryId: { in: obsoleteCatIds } },
      select: { id: true },
    });
    const obsoleteProductIds = obsoleteProducts.map((p) => p.id);
    if (obsoleteProductIds.length > 0) {
      await prisma.cartItem.deleteMany({ where: { productId: { in: obsoleteProductIds } } });
      await prisma.wishlistItem.deleteMany({ where: { productId: { in: obsoleteProductIds } } });
      await prisma.review.deleteMany({ where: { productId: { in: obsoleteProductIds } } });
      await prisma.orderItem.deleteMany({ where: { productId: { in: obsoleteProductIds } } });
      await prisma.product.deleteMany({ where: { id: { in: obsoleteProductIds } } });
    }
    await prisma.category.deleteMany({ where: { id: { in: obsoleteCatIds } } });
  }

  // Seed categories — order matches sortOrder
  const categoryData = [
    { slug: "kitchenware",          name: "Kitchenware",           icon: "🍳", description: "Pots, pans, utensils and cooking equipment",         sortOrder: 1  },
    { slug: "plasticware",          name: "Plasticware",           icon: "🥤", description: "Containers, baskets, buckets and plastic goods",     sortOrder: 2  },
    { slug: "school-stationery",    name: "School Stationery",     icon: "✏️", description: "Books, pens, pencils and school supplies",          sortOrder: 3  },
    { slug: "hardware",             name: "Hardware",              icon: "🔧", description: "Tools, fasteners and building materials",            sortOrder: 4  },
    { slug: "baby-necessities",     name: "Baby Necessities",      icon: "👶", description: "Diapers, wipes, formula and baby care",              sortOrder: 5  },
    { slug: "electric-gadgets",     name: "Electric Gadgets",      icon: "⚡", description: "Cables, batteries, chargers and accessories",        sortOrder: 6  },
    { slug: "daily-necessities",    name: "Daily Necessities",     icon: "🛒", description: "Groceries, cleaning and everyday essentials",        sortOrder: 7  },
    { slug: "careerday-uniforms",   name: "Careerday Uniforms",    icon: "👔", description: "School uniforms and career-day outfits",             sortOrder: 8  },
    { slug: "birthday-party-items", name: "Birthday Party Items",  icon: "🎂", description: "Balloons, decorations, gifts and party supplies",    sortOrder: 9  },
    { slug: "swimming-items",       name: "Swimming Items",        icon: "🏊", description: "Swimwear, goggles, floats and pool accessories",     sortOrder: 10 },
    { slug: "bicycles",             name: "Bicycles",              icon: "🚲", description: "Bikes, helmets and cycling accessories",             sortOrder: 11 },
    { slug: "home-improvement",     name: "Home Improvement",      icon: "🏠", description: "Paint, fixtures, fittings and renovation supplies",  sortOrder: 12 },
    { slug: "toys",                 name: "Toys",                  icon: "🪀", description: "Educational toys, games and playthings",             sortOrder: 13 },
  ];

  const categories: Record<string, { id: string }> = {};
  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description, sortOrder: cat.sortOrder },
      create: cat,
    });
    categories[cat.slug] = created;
  }
  console.log(`Seeded ${categoryData.length} categories`);

  // Clear all existing products before inserting the new catalogue
  const allExistingProducts = await prisma.product.findMany({ select: { id: true } });
  const allExistingIds = allExistingProducts.map((p) => p.id);
  if (allExistingIds.length > 0) {
    await prisma.cartItem.deleteMany({ where: { productId: { in: allExistingIds } } });
    await prisma.wishlistItem.deleteMany({ where: { productId: { in: allExistingIds } } });
    await prisma.review.deleteMany({ where: { productId: { in: allExistingIds } } });
    await prisma.orderItem.deleteMany({ where: { productId: { in: allExistingIds } } });
    await prisma.product.deleteMany();
    console.log(`Cleared ${allExistingIds.length} existing products`);
  }

  // Seed products
  const productData = [
    // School Stationery
    { name: "Wax Crayons", slug: "wax-crayons", categorySlug: "school-stationery", price: 2.00, compareAtPrice: null, stock: 200, sku: "SS-001", description: "Vibrant wax crayons for drawing and colouring.", images: ["https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&q=80&auto=format&fit=crop"], tags: ["crayons", "art", "school"], featured: false },
    { name: "Diary Notebook", slug: "diary-notebook", categorySlug: "school-stationery", price: 2.00, compareAtPrice: null, stock: 150, sku: "SS-002", description: "Lined diary notebook for daily writing and journalling.", images: ["https://images.unsplash.com/photo-1517971071642-34a2d3eaac27?w=600&q=80&auto=format&fit=crop"], tags: ["diary", "notebook", "school"], featured: false },
    { name: "Happiness Diary", slug: "happiness-diary", categorySlug: "school-stationery", price: 2.00, compareAtPrice: null, stock: 100, sku: "SS-003", description: "A motivational diary to record your thoughts and happiness.", images: ["https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80&auto=format&fit=crop"], tags: ["diary", "journal", "school"], featured: false },
    // Hardware
    { name: "All Size Spanners Set", slug: "all-size-spanners-set", categorySlug: "hardware", price: 10.00, compareAtPrice: null, stock: 50, sku: "HW-001", description: "Complete set of spanners in all standard sizes.", images: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80&auto=format&fit=crop"], tags: ["spanners", "tools", "hardware"], featured: true },
    { name: "Paint Brush", slug: "paint-brush", categorySlug: "hardware", price: 2.00, compareAtPrice: null, stock: 120, sku: "HW-002", description: "Durable paint brush suitable for walls and surfaces.", images: ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80&auto=format&fit=crop"], tags: ["paint", "brush", "hardware"], featured: false },
    { name: "Electric Tape", slug: "electric-tape", categorySlug: "hardware", price: 0.00, compareAtPrice: null, stock: 200, sku: "HW-003", description: "Insulating electric tape for wiring and cable management. Price on enquiry.", images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80&auto=format&fit=crop"], tags: ["tape", "electrical", "hardware"], featured: false },
    // Baby Necessities
    { name: "Sound Flashing Ball for Babies", slug: "sound-flashing-ball-for-babies", categorySlug: "baby-necessities", price: 1.50, compareAtPrice: null, stock: 80, sku: "BN-001", description: "Colourful ball with lights and sounds to stimulate baby senses.", images: ["https://images.unsplash.com/photo-1566933293069-b55c7f326dd4?w=600&q=80&auto=format&fit=crop"], tags: ["baby", "toy", "sensory"], featured: true },
    { name: "Baby Soothers", slug: "baby-soothers", categorySlug: "baby-necessities", price: 2.00, compareAtPrice: null, stock: 150, sku: "BN-002", description: "Soft silicone soothers to comfort and calm your baby.", images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80&auto=format&fit=crop"], tags: ["baby", "soother", "dummy"], featured: false },
    { name: "Rattle", slug: "rattle", categorySlug: "baby-necessities", price: 1.00, compareAtPrice: null, stock: 120, sku: "BN-003", description: "Lightweight baby rattle to encourage play and motor skills.", images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80&auto=format&fit=crop"], tags: ["baby", "rattle", "toy"], featured: false },
    // Electric Gadgets
    { name: "Heavy Duty Electro Master Iron", slug: "heavy-duty-electro-master-iron", categorySlug: "electric-gadgets", price: 18.00, compareAtPrice: null, stock: 40, sku: "EG-001", description: "Powerful heavy-duty steam iron for wrinkle-free clothes.", images: ["https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=600&q=80&auto=format&fit=crop"], tags: ["iron", "appliance", "electric"], featured: true },
    { name: "Juice Blender 2 in 1", slug: "juice-blender-2in1", categorySlug: "electric-gadgets", price: 20.00, compareAtPrice: null, stock: 30, sku: "EG-002", description: "Versatile 2-in-1 blender and juicer for smoothies and fresh juice.", images: ["https://images.unsplash.com/photo-1536304447766-da0ed4ce1b73?w=600&q=80&auto=format&fit=crop"], tags: ["blender", "juicer", "appliance"], featured: true },
    { name: "Garment Steamer", slug: "garment-steamer", categorySlug: "electric-gadgets", price: 9.80, compareAtPrice: null, stock: 35, sku: "EG-003", description: "Handheld garment steamer to remove creases quickly and safely.", images: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&auto=format&fit=crop"], tags: ["steamer", "garment", "appliance"], featured: false },
    // Careerday Uniforms
    { name: "Doctors' Coat", slug: "doctors-coat", categorySlug: "careerday-uniforms", price: 12.00, compareAtPrice: null, stock: 60, sku: "CU-001", description: "White doctor's coat for career day and role-play activities.", images: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80&auto=format&fit=crop"], tags: ["doctor", "coat", "uniform"], featured: true },
    { name: "Doctors Set", slug: "doctors-set", categorySlug: "careerday-uniforms", price: 6.00, compareAtPrice: null, stock: 80, sku: "CU-002", description: "Complete toy doctors set including stethoscope and accessories.", images: ["https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80&auto=format&fit=crop"], tags: ["doctor", "set", "uniform"], featured: false },
    { name: "Engineer Tools", slug: "engineer-tools", categorySlug: "careerday-uniforms", price: 5.00, compareAtPrice: null, stock: 70, sku: "CU-003", description: "Toy engineer tool set for career day role-play.", images: ["https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&q=80&auto=format&fit=crop"], tags: ["engineer", "tools", "uniform"], featured: false },
    // Birthday Party Items
    { name: "Balloons Pack of 10 Colourful Balloons", slug: "balloons-pack-of-10-colourful", categorySlug: "birthday-party-items", price: 1.00, compareAtPrice: null, stock: 500, sku: "BP-001", description: "Pack of 10 assorted colourful balloons for parties and celebrations.", images: ["https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&q=80&auto=format&fit=crop"], tags: ["balloons", "party", "colourful"], featured: true },
    { name: "Balloons", slug: "balloons", categorySlug: "birthday-party-items", price: 1.00, compareAtPrice: null, stock: 400, sku: "BP-002", description: "Standard party balloons in assorted colours.", images: ["https://images.unsplash.com/photo-1478476868527-002ae3f3e159?w=600&q=80&auto=format&fit=crop"], tags: ["balloons", "party"], featured: false },
    // Swimming Items
    { name: "Swimming Floating Vest", slug: "swimming-floating-vest", categorySlug: "swimming-items", price: 5.00, compareAtPrice: null, stock: 60, sku: "SW-001", description: "Buoyancy vest to keep children safe and afloat while learning to swim.", images: ["https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80&auto=format&fit=crop"], tags: ["swimming", "float", "vest", "safety"], featured: true },
    // Bicycles
    { name: "Middle Sided Bikes Ages 4–8", slug: "middle-sided-bikes-ages-4-8", categorySlug: "bicycles", price: 65.00, compareAtPrice: null, stock: 20, sku: "BI-001", description: "Sturdy mid-size bicycle designed for children aged 4 to 8 years.", images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format&fit=crop"], tags: ["bicycle", "kids", "ages 4-8"], featured: true },
    { name: "Bicycles for 6–13 Years", slug: "bicycles-for-6-13-years", categorySlug: "bicycles", price: 75.00, compareAtPrice: null, stock: 15, sku: "BI-002", description: "Full-size children's bicycle suitable for ages 6 to 13 years.", images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80&auto=format&fit=crop"], tags: ["bicycle", "kids", "ages 6-13"], featured: true },
    { name: "Bicycles", slug: "bicycles-standard", categorySlug: "bicycles", price: 65.00, compareAtPrice: null, stock: 25, sku: "BI-003", description: "Reliable all-purpose bicycle for everyday use.", images: ["https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600&q=80&auto=format&fit=crop"], tags: ["bicycle", "standard"], featured: false },
    // Home Improvement
    { name: "Toilet Brush", slug: "toilet-brush", categorySlug: "home-improvement", price: 2.50, compareAtPrice: null, stock: 100, sku: "HI-001", description: "Durable toilet brush for thorough toilet cleaning.", images: ["https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80&auto=format&fit=crop"], tags: ["toilet", "brush", "cleaning"], featured: false },
    { name: "Shoes Rack", slug: "shoes-rack", categorySlug: "home-improvement", price: 9.00, compareAtPrice: null, stock: 40, sku: "HI-002", description: "Compact shoes rack to keep your entryway tidy and organised.", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&auto=format&fit=crop"], tags: ["shoes", "rack", "organiser"], featured: false },
    { name: "Bamboo Pegs Set of 20", slug: "bamboo-pegs-set-of-20", categorySlug: "home-improvement", price: 0.50, compareAtPrice: null, stock: 300, sku: "HI-003", description: "Eco-friendly bamboo clothes pegs, set of 20.", images: ["https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80&auto=format&fit=crop"], tags: ["pegs", "bamboo", "laundry"], featured: false },
    // Kitchenware
    { name: "Plate Sponge", slug: "plate-sponge", categorySlug: "kitchenware", price: 1.00, compareAtPrice: null, stock: 250, sku: "KW-001", description: "Plate sponge used to wash plates. Tough on grease, gentle on surfaces.", images: ["https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&q=80&auto=format&fit=crop"], tags: ["sponge", "dishes", "cleaning"], featured: false },
    { name: "Plate Sponge Multi-Purpose", slug: "plate-sponge-multi-purpose", categorySlug: "kitchenware", price: 0.50, compareAtPrice: null, stock: 300, sku: "KW-002", description: "Multi-purpose sponge for cleaning plates, pots, and pans.", images: ["https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&q=80&auto=format&fit=crop"], tags: ["sponge", "multipurpose", "cleaning"], featured: false },
    { name: "Aluminium Foil", slug: "aluminium-foil", categorySlug: "kitchenware", price: 2.00, compareAtPrice: null, stock: 180, sku: "KW-003", description: "Heavy-duty aluminium foil for cooking, freezing, and wrapping.", images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&auto=format&fit=crop"], tags: ["foil", "cooking", "kitchen"], featured: false },
    // Plasticware
    { name: "Water Bottle with Straw", slug: "water-bottle-with-straw", categorySlug: "plasticware", price: 2.50, compareAtPrice: null, stock: 200, sku: "PW-001", description: "Best-selling reusable water bottle with built-in straw.", images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80&auto=format&fit=crop"], tags: ["bottle", "water", "straw"], featured: true },
    { name: "Juice Bottle", slug: "juice-bottle", categorySlug: "plasticware", price: 3.00, compareAtPrice: null, stock: 150, sku: "PW-002", description: "Durable plastic juice bottle for storing and serving cold drinks.", images: ["https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600&q=80&auto=format&fit=crop"], tags: ["bottle", "juice", "drinks"], featured: false },
  ];

  for (const product of productData) {
    const { categorySlug, ...data } = product;
    const category = categories[categorySlug];
    if (!category) continue;

    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        categoryId: category.id,
      },
    });
  }
  console.log(`Seeded ${productData.length} products`);

  // Seed admin user
  const adminHash = await bcrypt.hash("admin123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@dollarshop.co.zw" },
    update: {},
    create: {
      email: "admin@dollarshop.co.zw",
      name: "Dollar Shop Admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
  console.log("Seeded admin user: admin@dollarshop.co.zw");

  // ─── Homepage content ──────────────────────────────────────────────────────

  const existingSlides = await prisma.heroSlide.count();
  if (existingSlides === 0) {
    await prisma.heroSlide.createMany({
      data: [
        { tag: "⚡ Flash Deals", tagBg: "bg-(--color-danger)", headline: "Everyday Essentials,\nUnbeatable Prices", sub: "Shop kitchenware, daily necessities & more — all under $5", ctaLabel: "Shop Deals", ctaHref: "/shop", bgFrom: "#FF4400", bgTo: "#E63900", sortOrder: 0, isActive: true },
        { tag: "✨ New Arrivals", tagBg: "bg-white/20", headline: "Fresh Stock\nJust Landed", sub: "New products added weekly across all categories", ctaLabel: "See New Arrivals", ctaHref: "/shop", bgFrom: "#FF6A00", bgTo: "#FF4400", sortOrder: 1, isActive: true },
        { tag: "📱 Mobile Money", tagBg: "bg-white/20", headline: "EcoCash & InnBucks\nAccepted", sub: "Fast, secure checkout with Zimbabwe's favourite payment methods", ctaLabel: "Start Shopping", ctaHref: "/shop", bgFrom: "#E63900", bgTo: "#FF6A00", sortOrder: 2, isActive: true },
      ],
    });
    console.log("Seeded 3 hero slides");
  }

  const existingPromos = await prisma.sidePromo.count();
  if (existingPromos === 0) {
    await prisma.sidePromo.createMany({
      data: [
        { label: "HOT DEALS", headline: "Up to 30% Off\nDaily Necessities", href: "/shop/daily-necessities", bgFrom: "#FF4400", bgTo: "#E63900", sortOrder: 0, isActive: true },
        { label: "PAY YOUR WAY", headline: "EcoCash &\nInnBucks", href: "/checkout", bgFrom: "#FF6A00", bgTo: "#FF4400", sortOrder: 1, isActive: true },
      ],
    });
    console.log("Seeded 2 side promos");
  }

  const existingCards = await prisma.promoCard.count();
  if (existingCards === 0) {
    await prisma.promoCard.createMany({
      data: [
        { amount: "30%", label: "OFF",   desc: "All Groceries",    sub: "Limited time",      href: "/shop/daily-necessities", leftBg: "bg-(--color-danger)",                                        rightBg: "bg-(--color-primary-light)", sortOrder: 0, isActive: true },
        { amount: "FREE", label: "SHIP",  desc: "Orders Over $15",  sub: "Every order",       href: "/shop",                   leftBg: "bg-(--color-accent)",                                        rightBg: "bg-(--color-accent-light)",  sortOrder: 1, isActive: true },
        { amount: "NEW",  label: "IN",    desc: "Fresh Arrivals",   sub: "Shop what's new",   href: "/shop",                   leftBg: "bg-(--color-primary)",                                       rightBg: "bg-(--color-primary-light)", sortOrder: 2, isActive: true },
        { amount: "⚡",   label: "FLASH", desc: "Flash Deals Today", sub: "While stocks last", href: "/shop",                   leftBg: "bg-linear-to-b from-(--color-primary) to-(--color-primary-dark)", rightBg: "bg-(--color-primary-light)", sortOrder: 3, isActive: true },
      ],
    });
    console.log("Seeded 4 promo cards");
  }

  console.log("Seeding complete!");

  // Flush product caches so stale data isn't served after a re-seed
  try {
    const keys = await redis.keys("products:*");
    const pkeys = await redis.keys("product:*");
    const all = [...keys, ...pkeys];
    if (all.length > 0) await redis.del(...all);
    console.log(`Cleared ${all.length} Redis cache entries`);
  } catch {
    console.warn("Redis cache flush skipped (Redis unavailable)");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await redis.quit();
  });
