import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/actions/orders";
import { generateReceiptPdf, resolveReceiptBranding, type ReceiptData } from "@/lib/pdf/receipt";
import { toNumber } from "@/lib/utils/currency";

export const runtime = "nodejs";

interface ShippingAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  province: string;
  country: string;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const address = order.shippingAddress as unknown as ShippingAddress;
  const branding = await resolveReceiptBranding();

  const receiptData: ReceiptData = {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    paymentMethod: order.paymentMethod,
    customerName: address.name,
    customerPhone: address.phone,
    items: order.items.map((item) => ({
      name: item.productName,
      sku: item.productSku,
      quantity: item.quantity,
      price: toNumber(item.price),
      subtotal: toNumber(item.subtotal),
      variantSnapshot: item.variantSnapshot,
    })),
    subtotal: toNumber(order.subtotal),
    deliveryFee: toNumber(order.deliveryFee),
    discount: toNumber(order.discount),
    total: toNumber(order.total),
    shippingAddress: {
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      province: address.province,
      country: address.country,
    },
    ...branding,
  };

  const pdf = await generateReceiptPdf(receiptData);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${order.orderNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
