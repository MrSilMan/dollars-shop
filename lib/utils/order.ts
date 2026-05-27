import { prisma } from "@/lib/prisma";

export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.order.count({
    where: { createdAt: { gte: new Date(`${year}-01-01`) } },
  });
  const seq = String(count + 1).padStart(6, "0");
  return `DS-${year}-${seq}`;
}
