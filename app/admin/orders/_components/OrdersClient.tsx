"use client";

import { useState } from "react";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { OrderDetail } from "./OrderDetail";

interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  subtotal: number;
  variantSnapshot?: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string | null;
  fulfillmentType?: string;
  shippingAddress: Record<string, string>;
  createdAt: Date;
  items: OrderItem[];
  user?: { name?: string | null; email: string } | null;
  guestEmail?: string | null;
  payment?: { currency: string; amount: number; exchangeRate: number | null } | null;
}

export function OrdersClient({ orders }: { orders: Order[] }) {
  const [selected, setSelected] = useState<Order | null>(null);

  return (
    <>
      <OrdersTable orders={orders} onRowClick={id => setSelected(orders.find(o => o.id === id) ?? null)} />
      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
