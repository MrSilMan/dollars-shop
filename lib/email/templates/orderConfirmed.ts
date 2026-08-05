import type { OrderEmailData } from "../index";
import { emailWrapper, itemsTable, totalsBlock } from "./base";
import { STORE_PICKUP_LOCATION } from "@/lib/store-location";

export function orderConfirmedHtml(data: OrderEmailData): string {
  const isPickup = data.fulfillmentType === "PICKUP";
  const methodLabel: Record<string, string> = {
    ECOCASH: "EcoCash",
    INNBUCKS: "InnBucks",
    CASH_ON_DELIVERY: isPickup ? "Cash on Collection" : "Cash on Delivery",
  };
  const addr = data.shippingAddress;

  const body = `
    <h2 style="margin:0 0 6px;font-size:20px;color:#111;">Hi ${data.customerName},</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555;">
      Thank you for your order! We've received it and it's currently being processed.
      ${isPickup
        ? "We'll let you know as soon as it's packed and ready to collect at our shop."
        : data.paymentMethod === "CASH_ON_DELIVERY" ? "Our team will contact you to arrange delivery and payment." : ""}
    </p>

    <div style="background:#fef2f2;border-left:4px solid #D4251C;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;font-weight:700;letter-spacing:.5px;">Order Number</p>
      <p style="margin:4px 0 0;font-size:20px;font-weight:900;color:#D4251C;font-family:monospace;">${data.orderNumber}</p>
    </div>

    <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#888;">Order Items</h3>
    ${itemsTable(data.items)}
    ${totalsBlock(data.subtotal, data.deliveryFee, data.discount, data.total)}

    <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:10px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#888;">
        ${isPickup ? "Collection Point" : "Delivery Address"}
      </p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">
        ${isPickup ? `<strong>${STORE_PICKUP_LOCATION.name}</strong><br/>` : ""}
        ${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}<br/>
        ${addr.city}, ${addr.province}<br/>
        Zimbabwe
      </p>
      ${isPickup
        ? `<p style="margin:10px 0 0;font-size:13px;color:#666;line-height:1.6;">
             Open ${STORE_PICKUP_LOCATION.hours}<br/>
             Bring your order number <strong>${data.orderNumber}</strong> and an ID when you collect.
           </p>`
        : ""}
    </div>

    <div style="margin-top:12px;padding:16px;background:#f9f9f9;border-radius:10px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#888;">Payment Method</p>
      <p style="margin:0;font-size:14px;color:#333;">${methodLabel[data.paymentMethod] ?? data.paymentMethod}</p>
    </div>

    <p style="margin:28px 0 0;font-size:14px;color:#555;">
      Questions? Reply to this email or chat with us on
      <a href="https://wa.me/263772566468" style="color:#D4251C;font-weight:600;text-decoration:none;">WhatsApp</a>.
    </p>`;

  return emailWrapper(`Order Confirmed — ${data.orderNumber}`, body);
}
