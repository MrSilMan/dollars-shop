export function emailWrapper(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
      <!-- Header -->
      <tr>
        <td style="background:#D4251C;padding:24px 32px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Dollar Shop</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,.8);font-size:13px;">Your trusted dollar store in Zimbabwe</p>
        </td>
      </tr>
      <!-- Body -->
      <tr><td style="padding:32px;">${body}</td></tr>
      <!-- Footer -->
      <tr>
        <td style="background:#f9f9f9;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
          <p style="margin:0;color:#888;font-size:12px;">
            Dollar Shop &bull; Harare, Zimbabwe &bull;
            <a href="https://wa.me/263772566468" style="color:#D4251C;text-decoration:none;">WhatsApp Support</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export function itemsTable(items: { name: string; quantity: number; price: number; variantSnapshot?: string | null }[]): string {
  const rows = items.map(i => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">
        ${i.name}${i.variantSnapshot ? `<br/><span style="color:#888;font-size:12px;">${i.variantSnapshot}</span>` : ""}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:center;font-size:14px;color:#555;">×${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;font-weight:600;color:#333;">$${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`).join("");

  return `<table width="100%" cellpadding="0" cellspacing="0">
    <thead>
      <tr style="background:#f9f9f9;">
        <th style="padding:8px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.5px;">Item</th>
        <th style="padding:8px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.5px;">Qty</th>
        <th style="padding:8px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.5px;">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function totalsBlock(subtotal: number, deliveryFee: number, discount: number, total: number): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#666;">Subtotal</td>
        <td style="padding:4px 0;text-align:right;font-size:13px;color:#666;">$${subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#666;">Delivery</td>
        <td style="padding:4px 0;text-align:right;font-size:13px;color:#666;">${deliveryFee === 0 ? "FREE" : "$" + deliveryFee.toFixed(2)}</td>
      </tr>
      ${discount > 0 ? `<tr>
        <td style="padding:4px 0;font-size:13px;color:#22a06b;">Discount</td>
        <td style="padding:4px 0;text-align:right;font-size:13px;color:#22a06b;">-$${discount.toFixed(2)}</td>
      </tr>` : ""}
      <tr style="border-top:2px solid #eee;">
        <td style="padding:10px 0 4px;font-size:16px;font-weight:800;color:#111;">Total</td>
        <td style="padding:10px 0 4px;text-align:right;font-size:18px;font-weight:900;color:#D4251C;">$${total.toFixed(2)}</td>
      </tr>
    </table>`;
}
