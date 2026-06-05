/**
 * Restores the 30 products lost when db:seed was run on a live database.
 *
 * Data sources:
 *   ✓ confirmed  — name / price / stock read directly from the admin screenshot
 *   ⚠ estimated  — name inferred from uploaded image content; price & stock are
 *                   best guesses — please verify and correct in the admin panel
 *
 * Safe to run multiple times: uses upsert by SKU.
 */
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://postgres:password@localhost:5432/dollar_shop",
});
const prisma = new PrismaClient({ adapter });

type ProductRow = {
  sku: string;
  name: string;
  slug: string;
  cat: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  images: string[];
  tags: string[];
  featured: boolean;
  note: string;
};

const C = "✓ confirmed";   // data read from the products screenshot
const E = "⚠ estimated";   // inferred from image — verify in admin

const products: ProductRow[] = [
  // ── Plasticware ─────────────────────────────────────────────────────────
  {
    sku: "PW-003", name: "Plastic Flask", slug: "plastic-flask",
    cat: "plasticware", price: 2.00, stock: 100,
    images: ["/uploads/1780073079590-zfxtj3ssxel.jpg"],
    tags: ["flask", "plastic", "bottle"], featured: false, note: E,
  },
  {
    sku: "PW-004", name: "Fridge Bottles", slug: "fridge-bottles",
    cat: "plasticware", price: 3.00, stock: 50,
    images: ["/uploads/1780081428730-gw3h5cdpi9b.jpg"],
    tags: ["fridge", "bottle", "plastic"], featured: false, note: E,
  },
  {
    sku: "PW-005", name: "Plastic Pags", slug: "plastic-pags",
    cat: "plasticware", price: 1.00, stock: 30,
    images: ["/uploads/1780087952817-a5y5sv1a55r.jpg"],
    tags: ["pags", "plastic", "container"], featured: false, note: C,
  },
  {
    sku: "PW-006", name: "Plastic Plates", slug: "plastic-plates",
    cat: "plasticware", price: 3.00, stock: 20,
    images: ["/uploads/1780088013844-emht9hgfzyr.jpg"],
    tags: ["plates", "plastic", "dining"], featured: false, note: C,
  },
  {
    sku: "PW-007", name: "Good Quality Juice Bottles", slug: "good-quality-juice-bottles",
    cat: "plasticware", price: 3.00, stock: 0,
    images: ["/uploads/1780087772051-8nj09r722n5.jpg"],
    tags: ["juice", "bottle", "plastic"], featured: false, note: C,
  },
  {
    sku: "PW-008", name: "Small Dish", slug: "small-dish",
    cat: "plasticware", price: 1.00, stock: 60,
    images: ["/uploads/1780088212735-6k2imnuiere.jpg"],
    tags: ["dish", "bowl", "plastic"], featured: false, note: C,
  },
  {
    sku: "PW-009", name: "Kids Chair", slug: "kids-chair",
    cat: "plasticware", price: 3.00, stock: 20,
    images: ["/uploads/1780088262256-h96l4w1drje.jpg"],
    tags: ["chair", "kids", "plastic"], featured: false, note: C,
  },

  // ── Bicycles ────────────────────────────────────────────────────────────
  {
    sku: "BI-004", name: "Pink 12 Inch Bike", slug: "pink-12-inch-bike",
    cat: "bicycles", price: 55.00, stock: 29,
    images: ["/uploads/1780088408487-279diwvrre2.jpg"],
    tags: ["bicycle", "pink", "12 inch", "kids"], featured: true, note: C,
  },
  {
    sku: "BI-005", name: "16 Inch Bike", slug: "16-inch-bike",
    cat: "bicycles", price: 65.00, stock: 15,
    images: ["/uploads/1780067117256-k3cum3byjd8.jpg"],
    tags: ["bicycle", "16 inch", "kids"], featured: false, note: E,
  },
  {
    sku: "BI-006", name: "Girls Pink Bike", slug: "girls-pink-bike",
    cat: "bicycles", price: 55.00, stock: 10,
    images: ["/uploads/1780067158007-6cic8vall5e.jpg"],
    tags: ["bicycle", "pink", "girls"], featured: false, note: E,
  },
  {
    sku: "BI-007", name: "Green Bike Ages 4-8", slug: "green-bike-ages-4-8",
    cat: "bicycles", price: 65.00, stock: 10,
    images: ["/uploads/1780067272128-vlhn5jwrpf.jpg"],
    tags: ["bicycle", "green", "ages 4-8"], featured: false, note: E,
  },

  // ── Baby Necessities ────────────────────────────────────────────────────
  {
    sku: "BN-004", name: "Baby Star Rattle", slug: "baby-star-rattle",
    cat: "baby-necessities", price: 1.50, stock: 80,
    images: ["/uploads/1780066127439-48bb5x8rnen.jpg"],
    tags: ["baby", "rattle", "toy"], featured: false, note: E,
  },
  {
    sku: "BN-005", name: "Baby Teether", slug: "baby-teether",
    cat: "baby-necessities", price: 2.00, stock: 100,
    images: ["/uploads/1780066157939-cge2sry3bl7.jpg"],
    tags: ["baby", "teether", "bpa free"], featured: false, note: E,
  },

  // ── Birthday Party Items ────────────────────────────────────────────────
  {
    sku: "BP-003", name: "Confetti Balloons Pack of 10", slug: "confetti-balloons-pack-of-10",
    cat: "birthday-party-items", price: 1.50, stock: 200,
    images: ["/uploads/1780067350581-cfoqbav2j5e.jpg"],
    tags: ["balloons", "confetti", "party", "10 pack"], featured: false, note: E,
  },

  // ── Careerday Uniforms ──────────────────────────────────────────────────
  {
    sku: "CU-004", name: "Doctor Costume", slug: "doctor-costume",
    cat: "careerday-uniforms", price: 12.00, stock: 20,
    images: ["/uploads/1780074447600-qf8r2p978q.png"],
    tags: ["doctor", "costume", "careerday"], featured: false, note: E,
  },
  {
    sku: "CU-005", name: "Engineer Uniform", slug: "engineer-uniform",
    cat: "careerday-uniforms", price: 12.00, stock: 20,
    images: ["/uploads/1780075412541-3wul715by9o.png"],
    tags: ["engineer", "uniform", "careerday"], featured: false, note: E,
  },
  {
    sku: "CU-006", name: "Pilot Costume", slug: "pilot-costume",
    cat: "careerday-uniforms", price: 14.00, stock: 15,
    images: ["/uploads/1780079462186-bb8ernyvrk.png"],
    tags: ["pilot", "costume", "careerday"], featured: false, note: E,
  },
  {
    sku: "CU-007", name: "Firefighter Costume", slug: "firefighter-costume",
    cat: "careerday-uniforms", price: 12.00, stock: 20,
    images: ["/uploads/1780079522673-tx9wn1c8fmk.png"],
    tags: ["firefighter", "costume", "careerday"], featured: false, note: E,
  },
  {
    sku: "CU-008", name: "Police Costume", slug: "police-costume",
    cat: "careerday-uniforms", price: 12.00, stock: 20,
    images: ["/uploads/1780079613765-5ujkw7jxxtu.png"],
    tags: ["police", "costume", "careerday"], featured: false, note: E,
  },
  {
    sku: "CU-009", name: "Lawyer Costume", slug: "lawyer-costume",
    cat: "careerday-uniforms", price: 15.00, stock: 15,
    images: ["/uploads/1780078210639-j657y5h60a8.png"],
    tags: ["lawyer", "costume", "careerday"], featured: false, note: E,
  },

  // ── Kitchenware ─────────────────────────────────────────────────────────
  {
    sku: "KW-004", name: "Sponge Scourer Set", slug: "sponge-scourer-set",
    cat: "kitchenware", price: 1.00, stock: 150,
    images: ["/uploads/1780079777489-uy0i2yna5de.jpg"],
    tags: ["sponge", "scourer", "cleaning"], featured: false, note: E,
  },
  {
    sku: "KW-005", name: "Garlic Press", slug: "garlic-press",
    cat: "kitchenware", price: 3.00, stock: 80,
    images: ["/uploads/1780080314277-htlju8mk5m.jpg"],
    tags: ["garlic", "press", "kitchen"], featured: false, note: E,
  },
  {
    sku: "KW-006", name: "2-Tier Dish Rack", slug: "2-tier-dish-rack",
    cat: "kitchenware", price: 8.00, stock: 30,
    images: ["/uploads/1780080388365-6tk0vkxxgo5.jpg"],
    tags: ["dish rack", "drying", "kitchen"], featured: false, note: E,
  },

  // ── Electric Gadgets ────────────────────────────────────────────────────
  {
    sku: "EG-004", name: "Blender 2 in 1 450W", slug: "blender-2-in-1-450w",
    cat: "electric-gadgets", price: 18.00, stock: 25,
    images: ["/uploads/1780080022134-179gkq8yma5.jpg"],
    tags: ["blender", "2 in 1", "450w", "appliance"], featured: false, note: E,
  },
  {
    sku: "EG-005", name: "Portable Juicer", slug: "portable-juicer",
    cat: "electric-gadgets", price: 12.00, stock: 30,
    images: ["/uploads/1780080466787-vzfdoyyr2dg.jpg"],
    tags: ["juicer", "portable", "appliance"], featured: false, note: E,
  },
  {
    sku: "EG-006", name: "Hand Mixer 7-Speed", slug: "hand-mixer-7-speed",
    cat: "electric-gadgets", price: 15.00, stock: 25,
    images: ["/uploads/1780080539971-gct898c6twq.jpg"],
    tags: ["mixer", "hand mixer", "7 speed", "appliance"], featured: false, note: E,
  },

  // ── Home Improvement ────────────────────────────────────────────────────
  {
    sku: "HI-004", name: "Window Squeegee", slug: "window-squeegee",
    cat: "home-improvement", price: 3.50, stock: 50,
    images: ["/uploads/1780131444858-skugknmgxj.jpg"],
    tags: ["window", "squeegee", "cleaning"], featured: false, note: E,
  },
  {
    sku: "HI-005", name: "Portable Wardrobe", slug: "portable-wardrobe",
    cat: "home-improvement", price: 15.00, stock: 20,
    images: ["/uploads/1780131707841-vdxbaf6pp.jpg"],
    tags: ["wardrobe", "closet", "storage"], featured: false, note: E,
  },

  // ── Toys ────────────────────────────────────────────────────────────────
  {
    sku: "TY-001", name: "Squishy Animal Toys", slug: "squishy-animal-toys",
    cat: "toys", price: 2.00, stock: 60,
    images: ["/uploads/1780066974757-98vnwdlw7at.jpg"],
    tags: ["squishy", "animal", "toy"], featured: false, note: E,
  },
  {
    sku: "TY-002", name: "Kids Walkie Talkie", slug: "kids-walkie-talkie",
    cat: "toys", price: 5.00, stock: 40,
    images: ["/uploads/1780076490905-qtc6nlzmtm.jpg"],
    tags: ["walkie talkie", "toy", "communication"], featured: false, note: E,
  },
];

async function main() {
  console.log("Restoring lost products...\n");

  // Build category slug → id map
  const cats = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    const categoryId = catMap[p.cat];
    if (!categoryId) {
      console.warn(`  SKIP ${p.sku} — category "${p.cat}" not found`);
      skipped++;
      continue;
    }

    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (existing) {
      console.log(`  SKIP ${p.sku} "${p.name}" — already exists`);
      skipped++;
      continue;
    }

    await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        description: p.name,
        categoryId,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        stock: p.stock,
        images: p.images,
        tags: p.tags,
        featured: p.featured,
        isActive: true,
      },
    });

    console.log(`  ADD  ${p.sku} "${p.name}"  $${p.price}  stock ${p.stock}  [${p.note}]`);
    created++;
  }

  console.log(`\nDone — ${created} created, ${skipped} skipped.`);
  if (created > 0) {
    const confirmed = products.filter((p) => p.note.startsWith("✓")).length;
    const estimated = products.filter((p) => p.note.startsWith("⚠")).length;
    console.log(`\n  ${confirmed} products have confirmed data from the screenshot.`);
    console.log(`  ${estimated} products have ESTIMATED prices/stock — please verify them in`);
    console.log(`  the admin panel at /admin/products and correct any that are wrong.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
