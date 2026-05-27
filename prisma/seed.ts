import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:password@localhost:5432/dollar_shop",
});
const prisma = new PrismaClient({ adapter });

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

  // Seed products
  const productData = [
    // Daily Necessities (groceries, cleaning, personal care)
    { name: "Multi-Surface Spray Cleaner 500ml", slug: "multi-surface-spray-cleaner-500ml", categorySlug: "daily-necessities", price: 1.50, compareAtPrice: 2.00, stock: 120, sku: "HH-001", description: "Effective on tiles, counters, and glass. Lemon fresh scent.", images: ["/images/products/placeholder.svg"], tags: ["cleaning", "spray", "household"], featured: true },
    { name: "Dish Washing Liquid 750ml", slug: "dish-washing-liquid-750ml", categorySlug: "daily-necessities", price: 1.25, compareAtPrice: null, stock: 200, sku: "HH-002", description: "Tough on grease, gentle on hands. Long-lasting foam.", images: ["/images/products/placeholder.svg"], tags: ["dishes", "cleaning"], featured: false },
    { name: "Roller Meal 2kg", slug: "roller-meal-2kg", categorySlug: "daily-necessities", price: 1.80, compareAtPrice: null, stock: 300, sku: "GR-001", description: "Finely milled maize meal. A Zimbabwean staple. Quick-cook.", images: ["/images/products/placeholder.svg"], tags: ["sadza", "maize", "staple"], featured: true },
    { name: "Cooking Oil 2L", slug: "cooking-oil-2l", categorySlug: "daily-necessities", price: 3.50, compareAtPrice: 4.00, stock: 150, sku: "GR-002", description: "Sunflower cooking oil. Cholesterol-free. Ideal for frying and baking.", images: ["/images/products/placeholder.svg"], tags: ["oil", "cooking", "sunflower"], featured: false },
    { name: "Sugar 1kg", slug: "sugar-1kg", categorySlug: "daily-necessities", price: 1.20, compareAtPrice: null, stock: 400, sku: "GR-003", description: "White granulated sugar. Essential for every kitchen.", images: ["/images/products/placeholder.svg"], tags: ["sugar", "baking"], featured: false },
    { name: "Black Tea Bags (100 pack)", slug: "black-tea-bags-100pack", categorySlug: "daily-necessities", price: 2.00, compareAtPrice: 2.50, stock: 200, sku: "GR-004", description: "Rich Zimbabwean black tea. Bold flavour, perfect brew.", images: ["/images/products/placeholder.svg"], tags: ["tea", "beverages"], featured: true },
    { name: "Salt 500g", slug: "salt-500g", categorySlug: "daily-necessities", price: 0.75, compareAtPrice: null, stock: 500, sku: "GR-005", description: "Iodised table salt. Essential seasoning for every meal.", images: ["/images/products/placeholder.svg"], tags: ["salt", "seasoning"], featured: false },
    { name: "Petroleum Jelly 250ml", slug: "petroleum-jelly-250ml", categorySlug: "daily-necessities", price: 1.00, compareAtPrice: null, stock: 300, sku: "PC-001", description: "Multi-purpose skin protector. Soothes dry skin and lips.", images: ["/images/products/placeholder.svg"], tags: ["skincare", "moisturiser"], featured: false },
    { name: "Antibacterial Soap Bar (3-Pack)", slug: "antibacterial-soap-3pack", categorySlug: "daily-necessities", price: 1.50, compareAtPrice: 2.00, stock: 500, sku: "PC-002", description: "Long-lasting protection. Fresh clean scent.", images: ["/images/products/placeholder.svg"], tags: ["soap", "hygiene", "antibacterial"], featured: true },
    { name: "Shampoo 400ml", slug: "shampoo-400ml", categorySlug: "daily-necessities", price: 2.00, compareAtPrice: 2.75, stock: 180, sku: "PC-003", description: "Moisturising formula for all hair types. No sulfates.", images: ["/images/products/placeholder.svg"], tags: ["shampoo", "haircare"], featured: false },
    { name: "Roll-On Deodorant 50ml", slug: "roll-on-deodorant-50ml", categorySlug: "daily-necessities", price: 1.75, compareAtPrice: null, stock: 220, sku: "PC-004", description: "48-hour protection. Light fresh fragrance.", images: ["/images/products/placeholder.svg"], tags: ["deodorant", "hygiene"], featured: false },
    { name: "Toothpaste 75ml", slug: "toothpaste-75ml", categorySlug: "daily-necessities", price: 1.25, compareAtPrice: 1.75, stock: 350, sku: "PC-005", description: "Fluoride toothpaste for cavity protection and fresh breath.", images: ["/images/products/placeholder.svg"], tags: ["dental", "hygiene"], featured: false },
    { name: "Assorted Biscuits 400g", slug: "assorted-biscuits-400g", categorySlug: "daily-necessities", price: 1.50, compareAtPrice: null, stock: 200, sku: "FS-001", description: "Cream-filled and plain varieties. Great for tea time.", images: ["/images/products/placeholder.svg"], tags: ["snacks", "biscuits"], featured: false },
    { name: "Instant Noodles (5-Pack)", slug: "instant-noodles-5pack", categorySlug: "daily-necessities", price: 2.00, compareAtPrice: 2.50, stock: 300, sku: "FS-002", description: "Chicken and beef flavour options. Ready in 3 minutes.", images: ["/images/products/placeholder.svg"], tags: ["noodles", "instant", "quick-meal"], featured: true },
    { name: "Peanut Butter 400g", slug: "peanut-butter-400g", categorySlug: "daily-necessities", price: 2.25, compareAtPrice: null, stock: 180, sku: "FS-003", description: "Creamy peanut butter. High in protein. No added sugar.", images: ["/images/products/placeholder.svg"], tags: ["peanut", "spread", "protein"], featured: false },
    { name: "Drinking Chocolate 250g", slug: "drinking-chocolate-250g", categorySlug: "daily-necessities", price: 1.75, compareAtPrice: 2.25, stock: 200, sku: "FS-004", description: "Rich cocoa drinking chocolate. Perfect for cold mornings.", images: ["/images/products/placeholder.svg"], tags: ["chocolate", "beverage"], featured: false },
    // Home Improvement
    { name: "Broom & Dustpan Set", slug: "broom-dustpan-set", categorySlug: "home-improvement", price: 3.00, compareAtPrice: 4.50, stock: 60, sku: "HH-003", description: "Sturdy plastic broom with matching dustpan. Compact design.", images: ["/images/products/placeholder.svg"], tags: ["broom", "cleaning"], featured: true },
    { name: "Mop & Bucket Set", slug: "mop-bucket-set", categorySlug: "home-improvement", price: 4.00, compareAtPrice: 5.50, stock: 45, sku: "HH-005", description: "Heavy duty mop with wringer bucket. Easy to use.", images: ["/images/products/placeholder.svg"], tags: ["cleaning", "mop"], featured: false },
    // School Stationery
    { name: "Exercise Book A4 (10-Pack)", slug: "exercise-book-a4-10pack", categorySlug: "school-stationery", price: 2.50, compareAtPrice: 3.00, stock: 400, sku: "ST-001", description: "96-page ruled exercise books. Perfect for school use.", images: ["/images/products/placeholder.svg"], tags: ["school", "books", "writing"], featured: true },
    { name: "Ballpoint Pens (12-Pack)", slug: "ballpoint-pens-12pack", categorySlug: "school-stationery", price: 1.50, compareAtPrice: null, stock: 600, sku: "ST-002", description: "Smooth blue ink. Medium tip. Great value multipack.", images: ["/images/products/placeholder.svg"], tags: ["pens", "writing"], featured: false },
    { name: "Pencils HB (12-Pack)", slug: "pencils-hb-12pack", categorySlug: "school-stationery", price: 1.25, compareAtPrice: null, stock: 500, sku: "ST-003", description: "HB graphite pencils. Ideal for writing and drawing.", images: ["/images/products/placeholder.svg"], tags: ["pencils", "school"], featured: false },
    // Baby Necessities
    { name: "Baby Wipes (80-pack)", slug: "baby-wipes-80pack", categorySlug: "baby-necessities", price: 1.75, compareAtPrice: 2.25, stock: 250, sku: "BK-001", description: "Gentle, alcohol-free wipes. Suitable from birth.", images: ["/images/products/placeholder.svg"], tags: ["baby", "wipes", "hygiene"], featured: true },
    { name: "Diapers Size 3 (20-pack)", slug: "diapers-size-3-20pack", categorySlug: "baby-necessities", price: 4.50, compareAtPrice: 5.50, stock: 100, sku: "BK-002", description: "Super absorbent with wetness indicator. Soft inner lining.", images: ["/images/products/placeholder.svg"], tags: ["diapers", "baby"], featured: true },
    { name: "Baby Powder 200g", slug: "baby-powder-200g", categorySlug: "baby-necessities", price: 1.50, compareAtPrice: null, stock: 200, sku: "BK-003", description: "Gentle talc-free baby powder. Keeps skin fresh and dry.", images: ["/images/products/placeholder.svg"], tags: ["baby", "powder", "skincare"], featured: false },
    // Electric Gadgets
    { name: "AA Batteries (8-Pack)", slug: "aa-batteries-8pack", categorySlug: "electric-gadgets", price: 2.00, compareAtPrice: null, stock: 350, sku: "EL-001", description: "Long-lasting alkaline batteries for remotes, torches & more.", images: ["/images/products/placeholder.svg"], tags: ["batteries", "electronics"], featured: false },
    { name: "USB-C Charging Cable 1m", slug: "usb-c-cable-1m", categorySlug: "electric-gadgets", price: 2.50, compareAtPrice: 3.50, stock: 200, sku: "EL-002", description: "Fast charge compatible. Braided nylon for durability.", images: ["/images/products/placeholder.svg"], tags: ["cable", "charging", "usb"], featured: true },
    { name: "Phone Screen Protector", slug: "phone-screen-protector", categorySlug: "electric-gadgets", price: 1.50, compareAtPrice: null, stock: 300, sku: "EL-003", description: "Universal tempered glass screen protector. Easy to apply.", images: ["/images/products/placeholder.svg"], tags: ["phone", "protection"], featured: false },
    // Careerday Uniforms
    { name: "Men's White T-Shirt (M)", slug: "mens-white-tshirt-m", categorySlug: "careerday-uniforms", price: 3.00, compareAtPrice: 4.00, stock: 80, sku: "CL-001", description: "100% cotton. Comfortable everyday basic.", images: ["/images/products/placeholder.svg"], tags: ["tshirt", "men", "basics"], featured: false },
    { name: "Ladies Socks (3-Pack)", slug: "ladies-socks-3pack", categorySlug: "careerday-uniforms", price: 2.00, compareAtPrice: null, stock: 150, sku: "CL-002", description: "Ankle socks in assorted colours. Comfortable cotton blend.", images: ["/images/products/placeholder.svg"], tags: ["socks", "women"], featured: false },
    // Plasticware
    { name: "Plastic Storage Basket (3-Pack)", slug: "plastic-storage-basket-3pack", categorySlug: "plasticware", price: 2.50, compareAtPrice: 3.75, stock: 80, sku: "HH-004", description: "Stackable, versatile baskets for home organisation.", images: ["/images/products/placeholder.svg"], tags: ["storage", "organisation"], featured: false },
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

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
