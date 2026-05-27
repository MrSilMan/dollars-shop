import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:password@localhost:5432/dollar_shop",
});
const prisma = new PrismaClient({ adapter });

const q = "?w=600&q=80&auto=format&fit=crop";

const productImages: Record<string, string[]> = {
  // School Stationery
  "wax-crayons": [
    `https://images.unsplash.com/photo-1513542789411-b6a5d4f31634${q}`,
  ],
  "diary-notebook": [
    `https://images.unsplash.com/photo-1517971071642-34a2d3eaac27${q}`,
  ],
  "happiness-diary": [
    `https://images.unsplash.com/photo-1455390582262-044cdead277a${q}`,
  ],
  // Hardware
  "all-size-spanners-set": [
    `https://images.unsplash.com/photo-1504148455328-c376907d081c${q}`,
  ],
  "paint-brush": [
    `https://images.unsplash.com/photo-1513364776144-60967b0f800f${q}`,
  ],
  "electric-tape": [
    `https://images.unsplash.com/photo-1621905251189-08b45d6a269e${q}`,
  ],
  // Baby Necessities
  "sound-flashing-ball-for-babies": [
    `https://images.unsplash.com/photo-1566933293069-b55c7f326dd4${q}`,
  ],
  "baby-soothers": [
    `https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4${q}`,
  ],
  "rattle": [
    `https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4${q}`,
  ],
  // Electric Gadgets
  "heavy-duty-electro-master-iron": [
    `https://images.unsplash.com/photo-1489274495757-95c7c837b101${q}`,
  ],
  "juice-blender-2in1": [
    `https://images.unsplash.com/photo-1536304447766-da0ed4ce1b73${q}`,
  ],
  "garment-steamer": [
    `https://images.unsplash.com/photo-1556742049-0cfed4f6a45d${q}`,
  ],
  // Careerday Uniforms
  "doctors-coat": [
    `https://images.unsplash.com/photo-1576091160550-2173dba999ef${q}`,
  ],
  "doctors-set": [
    `https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf${q}`,
  ],
  "engineer-tools": [
    `https://images.unsplash.com/photo-1581235720704-06d3acfcb36f${q}`,
  ],
  // Birthday Party Items
  "balloons-pack-of-10-colourful": [
    `https://images.unsplash.com/photo-1527529482837-4698179dc6ce${q}`,
  ],
  "balloons": [
    `https://images.unsplash.com/photo-1478476868527-002ae3f3e159${q}`,
  ],
  // Swimming Items
  "swimming-floating-vest": [
    `https://images.unsplash.com/photo-1530549387789-4c1017266635${q}`,
  ],
  // Bicycles
  "middle-sided-bikes-ages-4-8": [
    `https://images.unsplash.com/photo-1558618666-fcd25c85cd64${q}`,
  ],
  "bicycles-for-6-13-years": [
    `https://images.unsplash.com/photo-1485965120184-e220f721d03e${q}`,
  ],
  "bicycles-standard": [
    `https://images.unsplash.com/photo-1507035895480-2b3156c31fc8${q}`,
  ],
  // Home Improvement
  "toilet-brush": [
    `https://images.unsplash.com/photo-1563453392212-326f5e854473${q}`,
  ],
  "shoes-rack": [
    `https://images.unsplash.com/photo-1542291026-7eec264c27ff${q}`,
  ],
  "bamboo-pegs-set-of-20": [
    `https://images.unsplash.com/photo-1582735689369-4fe89db7114c${q}`,
  ],
  // Kitchenware
  "plate-sponge": [
    `https://images.unsplash.com/photo-1584464491033-06628f3a6b7b${q}`,
  ],
  "plate-sponge-multi-purpose": [
    `https://images.unsplash.com/photo-1584464491033-06628f3a6b7b${q}`,
  ],
  "aluminium-foil": [
    `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136${q}`,
  ],
  // Plasticware
  "water-bottle-with-straw": [
    `https://images.unsplash.com/photo-1602143407151-7111542de6e8${q}`,
  ],
  "juice-bottle": [
    `https://images.unsplash.com/photo-1534353436294-0dbd4bdac845${q}`,
  ],
};

async function main() {
  console.log("Updating product images…");
  let updated = 0;

  for (const [slug, images] of Object.entries(productImages)) {
    const result = await prisma.product.updateMany({
      where: { slug },
      data: { images },
    });
    if (result.count > 0) {
      console.log(`  ✓ ${slug}`);
      updated++;
    } else {
      console.warn(`  ✗ not found: ${slug}`);
    }
  }

  console.log(`\nDone — updated ${updated}/${Object.keys(productImages).length} products.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
