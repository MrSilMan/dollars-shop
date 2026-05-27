import type { OrderEmailData } from "../index";
import { emailWrapper, itemsTable, totalsBlock } from "./base";

export function paymentReceivedHtml(data: OrderEmailData): string {
  const body = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:56px;height:56px;background:#dcfce7;border-radius:50%;line-height:56px;font-size:26px;margin-bottom:12px;">✓</div>
      <h2 style="margin:0 0 6px;font-size:20px;color:#111;">Payment Received!</h2>
      <p style="margin:0;font-size:15px;color:#555;">Your payment has been confirmed and your order is on its way.</p>
    </div>

    <div style="background:#fef2f2;border-left:4px solid #D4251C;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;font-weight:700;letter-spacing:.5px;">Order Number</p>
      <p style="margin:4px 0 0;font-size:20px;font-weight:900;color:#D4251C;font-family:monospace;">${data.orderNumber}</p>
    </div>

    <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#888;">Order Summary</h3>
    ${itemsTable(data.items)}
    ${totalsBlock(data.subtotal, data.deliveryFee, data.discount, data.total)}

    <p style="margin:28px 0 0;font-size:14px;color:#555;">
      We'll keep you updated as your order is packed and shipped. Need help?
      <a href="https://wa.me/263772566468" style="color:#D4251C;font-weight:600;text-decoration:none;">Chat with us on WhatsApp</a>.
    </p>`;

  return emailWrapper(`Payment Received — ${data.orderNumber}`, body);
}
