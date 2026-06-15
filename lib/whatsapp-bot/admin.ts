import { prisma } from "@/lib/prisma";
import { sendWhatsAppText, sendWhatsAppButtons, sendWhatsAppList } from "@/lib/notifications/whatsapp";
import { sendWhatsAppStatusUpdate } from "@/lib/notifications/whatsapp";
import { logger } from "@/lib/logger";
import { getSession, saveSession, resetSession } from "./session";
import type { IncomingMessage } from "./engine";

const money = (n: number) => `$${n.toFixed(2)}`;

const VALID_STATUSES = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

const STATUS_LABELS: Record<OrderStatus, string> = {
  CONFIRMED: "✅ Confirmed",
  PROCESSING: "📦 Processing",
  SHIPPED: "🚚 Shipped",
  DELIVERED: "🎉 Delivered",
  CANCELLED: "❌ Cancelled",
};

/** Next logical statuses to offer for a given current status. */
function nextStatuses(current: string): OrderStatus[] {
  switch (current) {
    case "PENDING":     return ["CONFIRMED", "CANCELLED"];
    case "CONFIRMED":   return ["PROCESSING", "CANCELLED"];
    case "PROCESSING":  return ["SHIPPED", "CANCELLED"];
    case "SHIPPED":     return ["DELIVERED", "CANCELLED"];
    default:            return ["CANCELLED"];
  }
}

/** Entry point — called from engine.ts when the sender is the admin. */
export async function handleAdminMessage(phone: string, message: IncomingMessage): Promise<void> {
  if (message.kind === "selection") {
    await handleAdminSelection(phone, message.id);
    return;
  }

  const text = message.text.trim();
  const lower = text.toLowerCase();

  if (["menu", "hi", "hello", "start", "cancel"].includes(lower)) {
    await resetSession(phone);
    await showAdminMenu(phone);
    return;
  }

  const session = await getSession(phone);

  if (session.state === "ADMIN_AWAITING_ORDER_NUMBER") {
    await handleOrderSearch(phone, text);
    return;
  }

  await showAdminMenu(phone);
}

async function handleAdminSelection(phone: string, id: string): Promise<void> {
  const idx = id.indexOf(":");
  const prefix = idx === -1 ? id : id.slice(0, idx);
  const value  = idx === -1 ? "" : id.slice(idx + 1);

  switch (prefix) {
    case "adm_menu":
      if (value === "pending")   return showPendingOrders(phone);
      if (value === "search")    return startOrderSearch(phone);
      if (value === "sales")     return showTodaySales(phone);
      if (value === "lowstock")  return showLowStock(phone);
      return showAdminMenu(phone);

    case "adm_order":
      return showOrderDetail(phone, value);

    case "adm_status":
      return applyStatusUpdate(phone, value);

    case "adm_back":
      return showAdminMenu(phone);

    default:
      return showAdminMenu(phone);
  }
}

// ─── Admin menu ──────────────────────────────────────────────────────────────

async function showAdminMenu(phone: string): Promise<void> {
  await saveSession(phone, { state: "ADMIN_MENU" });
  await sendWhatsAppList(phone, "👋 *Admin Panel* — what would you like to do?", "Choose action", [
    {
      rows: [
        { id: "adm_menu:pending",  title: "📋 Orders",           description: "Orders waiting to be actioned" },
        { id: "adm_menu:search",   title: "🔍 Find Order",       description: "Look up any order by number" },
        { id: "adm_menu:sales",    title: "📈 Today's Sales",    description: "Revenue and order count today" },
        { id: "adm_menu:lowstock", title: "⚠️ Low Stock",        description: "Products with 5 or fewer units" },
      ],
    },
  ]);
}

// ─── Pending orders ──────────────────────────────────────────────────────────

async function showPendingOrders(phone: string): Promise<void> {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] } },
    orderBy: { createdAt: "desc" },
    take: 9,
    select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
  });

  if (orders.length === 0) {
    await sendWhatsAppButtons(phone, "✅ No pending orders right now.", [
      { id: "adm_back:menu", title: "Back to menu" },
    ]);
    return;
  }

  await saveSession(phone, { state: "ADMIN_MENU" });
  await sendWhatsAppList(phone, `📋 *Active orders* (${orders.length}):`, "View Order", [
    {
      rows: orders.map((o) => ({
        id: `adm_order:${o.id}`,
        title: o.orderNumber,
        description: `${money(Number(o.total))} · ${o.status} · ${o.createdAt.toLocaleDateString("en-ZW", { day: "numeric", month: "short" })}`,
      })),
    },
  ]);
}

// ─── Order search ────────────────────────────────────────────────────────────

async function startOrderSearch(phone: string): Promise<void> {
  await saveSession(phone, { state: "ADMIN_AWAITING_ORDER_NUMBER" });
  await sendWhatsAppText(phone, "🔍 Enter the order number to look up (e.g. DS-2026-XXXXX):");
}

async function handleOrderSearch(phone: string, text: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { orderNumber: text.trim().toUpperCase() },
    select: { id: true, orderNumber: true, status: true, paymentStatus: true, total: true, createdAt: true, guestPhone: true, shippingAddress: true },
  });

  if (!order) {
    await sendWhatsAppText(phone, `❌ No order found for *${text.toUpperCase()}*. Try again or type *menu*.`);
    return;
  }

  await showOrderDetail(phone, order.id);
}

// ─── Order detail ────────────────────────────────────────────────────────────

async function showOrderDetail(phone: string, orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { select: { productName: true, quantity: true, subtotal: true } } },
  });

  if (!order) {
    await sendWhatsAppText(phone, "Order not found.");
    return showAdminMenu(phone);
  }

  const addr = order.shippingAddress as { name?: string; phone?: string; city?: string };
  const itemLines = order.items.map((i) => `• ${i.quantity}× ${i.productName} — ${money(Number(i.subtotal))}`).join("\n");

  const detail = [
    `📦 *${order.orderNumber}*`,
    `Status: *${order.status}*  |  Payment: *${order.paymentStatus}*`,
    `Total: *${money(Number(order.total))}*`,
    `Customer: ${addr.name ?? "—"} · ${addr.phone ?? order.guestPhone ?? "—"}`,
    `City: ${addr.city ?? "—"}`,
    `Date: ${order.createdAt.toLocaleDateString("en-ZW", { day: "numeric", month: "short", year: "numeric" })}`,
    "",
    itemLines,
  ].join("\n");

  await saveSession(phone, { state: "ADMIN_ORDER_DETAIL", adminOrderId: order.id });

  const next = nextStatuses(order.status);
  if (next.length === 0 || ["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status)) {
    await sendWhatsAppButtons(phone, detail, [
      { id: "adm_back:menu", title: "Back to menu" },
    ]);
    return;
  }

  const buttons = [
    ...next.slice(0, 2).map((s) => ({ id: `adm_status:${s}`, title: STATUS_LABELS[s] })),
    { id: "adm_back:menu", title: "⬅️ Back" },
  ];

  await sendWhatsAppButtons(phone, detail, buttons);
}

// ─── Status update ───────────────────────────────────────────────────────────

async function applyStatusUpdate(phone: string, newStatus: string): Promise<void> {
  if (!(VALID_STATUSES as readonly string[]).includes(newStatus)) {
    return showAdminMenu(phone);
  }

  const session = await getSession(phone);
  const orderId = session.adminOrderId;
  if (!orderId) return showAdminMenu(phone);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, orderNumber: true, total: true, guestPhone: true, shippingAddress: true },
  });

  if (!order) {
    await sendWhatsAppText(phone, "Order no longer found.");
    return showAdminMenu(phone);
  }

  try {
    await prisma.order.update({ where: { id: orderId }, data: { status: newStatus as OrderStatus } });
  } catch (err) {
    logger.error("Admin WhatsApp status update failed", { err, orderId, newStatus });
    await sendWhatsAppText(phone, "❌ Failed to update order status. Please try again.");
    return showAdminMenu(phone);
  }

  await resetSession(phone);
  await sendWhatsAppText(
    phone,
    `✅ Order *${order.orderNumber}* updated to *${newStatus}*.`
  );

  // Notify the customer
  const customerPhone = (order.shippingAddress as { phone?: string })?.phone ?? order.guestPhone;
  if (customerPhone) {
    sendWhatsAppStatusUpdate({
      phone: customerPhone,
      orderNumber: order.orderNumber,
      status: newStatus,
      total: Number(order.total),
    }).catch((err) => logger.error("Customer WhatsApp notification failed", { err, orderId }));
  }

  logger.info("Admin WhatsApp status update", { orderId, newStatus });
  await showAdminMenu(phone);
}

// ─── Today's sales ───────────────────────────────────────────────────────────

async function showTodaySales(phone: string): Promise<void> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [orders, revenue] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: start }, status: { not: "CANCELLED" } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: start }, status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
  ]);

  const pending    = await prisma.order.count({ where: { createdAt: { gte: start }, status: "PENDING" } });
  const confirmed  = await prisma.order.count({ where: { createdAt: { gte: start }, status: "CONFIRMED" } });
  const processing = await prisma.order.count({ where: { createdAt: { gte: start }, status: "PROCESSING" } });
  const shipped    = await prisma.order.count({ where: { createdAt: { gte: start }, status: "SHIPPED" } });
  const delivered  = await prisma.order.count({ where: { createdAt: { gte: start }, status: "DELIVERED" } });

  const total = Number(revenue._sum.total ?? 0);
  const msg = [
    `📈 *Today's Sales* — ${new Date().toLocaleDateString("en-ZW", { weekday: "long", day: "numeric", month: "short" })}`,
    "",
    `💰 Revenue: *${money(total)}*`,
    `🛒 Orders: *${orders}*`,
    "",
    `📊 Breakdown:`,
    `  • Pending: ${pending}`,
    `  • Confirmed: ${confirmed}`,
    `  • Processing: ${processing}`,
    `  • Shipped: ${shipped}`,
    `  • Delivered: ${delivered}`,
  ].join("\n");

  await saveSession(phone, { state: "ADMIN_MENU" });
  await sendWhatsAppButtons(phone, msg, [
    { id: "adm_menu:pending", title: "📋 Pending Orders" },
    { id: "adm_back:menu",    title: "⬅️ Back" },
  ]);
}

// ─── Low stock ───────────────────────────────────────────────────────────────

async function showLowStock(phone: string): Promise<void> {
  const LOW_THRESHOLD = 5;
  const products = await prisma.product.findMany({
    where: { isActive: true, stock: { lte: LOW_THRESHOLD } },
    orderBy: { stock: "asc" },
    take: 10,
    select: { name: true, stock: true, sku: true },
  });

  if (products.length === 0) {
    await sendWhatsAppButtons(phone, "✅ All products are well stocked (> 5 units each).", [
      { id: "adm_back:menu", title: "⬅️ Back" },
    ]);
    return;
  }

  const lines = products.map((p) =>
    p.stock === 0 ? `❌ *${p.name}* — OUT OF STOCK` : `⚠️ *${p.name}* — ${p.stock} left`
  );

  const msg = [`⚠️ *Low Stock Alert* (${products.length} product${products.length > 1 ? "s" : ""}):`, "", ...lines].join("\n");

  await saveSession(phone, { state: "ADMIN_MENU" });
  await sendWhatsAppButtons(phone, msg, [
    { id: "adm_back:menu", title: "⬅️ Back" },
  ]);
}
