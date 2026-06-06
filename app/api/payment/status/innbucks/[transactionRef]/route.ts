import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ transactionRef: string }> }
) {
  const { transactionRef } = await params;
  const order = await prisma.order.findFirst({
    where: { paymentRef: transactionRef },
    select: { paymentStatus: true },
  });
  if (!order) return NextResponse.json({ status: "PENDING" });
  const status =
    order.paymentStatus === "PAID" ? "PAID"
    : order.paymentStatus === "FAILED" ? "FAILED"
    : "PENDING";
  return NextResponse.json({ status });
}
