import { NextResponse } from "next/server";
import { pollEcoCashStatus } from "@/lib/payments/ecocash";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const { transactionId } = await params;
  const status = await pollEcoCashStatus(transactionId);
  return NextResponse.json({ status });
}
