import { emailWrapper } from "./base";

const STATUS_LABELS: Record<string, { label: string; desc: string; emoji: string; color: string }> = {
  CONFIRMED:  { label: "Order Confirmed",   desc: "Your order has been confirmed and is being prepared.",                emoji: "✅", color: "#2563eb" },
  PROCESSING: { label: "Being Packed",      desc: "Your items are currently being packed and prepared for dispatch.",    emoji: "📦", color: "#7c3aed" },
  SHIPPED:    { label: "Out for Delivery",  desc: "Your order is on its way! Expect delivery soon.",                    emoji: "🚚", color: "#0891b2" },
  DELIVERED:  { label: "Delivered",         desc: "Your order has been delivered. Enjoy your purchase!",                emoji: "🎉", color: "#16a34a" },
  CANCELLED:  { label: "Order Cancelled",   desc: "Your order has been cancelled. If you have questions, contact us.",  emoji: "❌", color: "#dc2626" },
  REFUNDED:   { label: "Refund Processed",  desc: "Your refund has been processed. Please allow 3–5 business days.",   emoji: "💰", color: "#d97706" },
};

export function statusUpdateHtml(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  newStatus: string;
  total: number;
}): string {
  const info = STATUS_LABELS[data.newStatus] ?? {
    label: data.newStatus,
    desc: "Your order status has been updated.",
    emoji: "📋",
    color: "#6b7280",
  };

  const body = `
    <h2 style="margin:0 0 6px;font-size:20px;color:#111;">Hi ${data.customerName},</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555;">Here's an update on your order.</p>

    <div style="text-align:center;padding:28px;background:#f9f9f9;border-radius:12px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:36px;">${info.emoji}</p>
      <p style="margin:0 0 6px;font-size:18px;font-weight:800;color:${info.color};">${info.label}</p>
      <p style="margin:0;font-size:14px;color:#666;">${info.desc}</p>
    </div>

    <div style="background:#fef2f2;border-left:4px solid #D4251C;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;font-weight:700;letter-spacing:.5px;">Order Number</p>
      <p style="margin:4px 0 0;font-size:20px;font-weight:900;color:#D4251C;font-family:monospace;">${data.orderNumber}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#666;">Total: $${Number(data.total).toFixed(2)}</p>
    </div>

    <p style="margin:0;font-size:14px;color:#555;">
      Need help?
      <a href="https://wa.me/263772566468" style="color:#D4251C;font-weight:600;text-decoration:none;">Chat with us on WhatsApp</a>.
    </p>`;

  return emailWrapper(`Order Update — ${data.orderNumber}`, body);
}
