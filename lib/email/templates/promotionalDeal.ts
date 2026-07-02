export function promotionalDealHtml(data: { subject: string; bodyHtml: string; ctaText?: string | null; ctaUrl?: string | null }): string {
  const cta = data.ctaText && data.ctaUrl
    ? `<div style="margin-top:28px;text-align:center;">
        <a href="${data.ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#FF4D8D,#D4251C);color:#ffffff;font-weight:800;font-size:15px;padding:14px 36px;border-radius:999px;text-decoration:none;box-shadow:0 6px 16px rgba(212,37,28,.35);">${data.ctaText} →</a>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${data.subject}</title>
</head>
<body style="margin:0;padding:0;background:#1a0b12;font-family:system-ui,-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0b12;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,.35);">
      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#FF4D8D 0%,#D4251C 55%,#8B0F2E 100%);padding:36px 32px;text-align:center;">
          <span style="display:inline-block;background:rgba(255,255,255,.18);color:#ffffff;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:6px 14px;border-radius:999px;margin-bottom:14px;">⚡ Members-Only Deal</span>
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">Dollar Shop</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,.85);font-size:13px;">Your trusted dollar store in Zimbabwe</p>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:36px 32px;">
          <h2 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#1a0b12;line-height:1.3;">${data.subject}</h2>
          <div style="font-size:15px;color:#444;line-height:1.7;">${data.bodyHtml}</div>
          ${cta}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#f9f5f6;padding:22px 32px;text-align:center;border-top:1px solid #f0e5e7;">
          <p style="margin:0 0 6px;color:#888;font-size:12px;">
            Dollar Shop &bull; Harare, Zimbabwe &bull;
            <a href="https://wa.me/263772566468" style="color:#D4251C;text-decoration:none;font-weight:600;">WhatsApp Support</a>
          </p>
          <p style="margin:0;color:#aaa;font-size:11px;">You're receiving this because you subscribed to Dollar Shop deals.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
