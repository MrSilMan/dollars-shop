import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const txns = await prisma.paymentTransaction.findMany({
    where: { provider: "ECOCASH" },
    orderBy: { createdAt: "asc" },
    include: { order: { select: { orderNumber: true, total: true, paymentStatus: true } } },
  });

  for (const t of txns) {
    console.log(
      [
        t.createdAt.toISOString().replace("T", " ").slice(0, 19),
        t.order?.orderNumber ?? "?",
        `${t.amount} ${t.currency}`,
        t.status.padEnd(9),
        `corr=${t.clientCorrelator}`,
        `ref=${t.providerRef ?? "-"}`,
        t.failureReason ? `reason=${t.failureReason}` : "",
      ].join("  |  ")
    );
  }
  console.log(`\nTOTAL: ${txns.length}`);
  await prisma.$disconnect();
}

main();
