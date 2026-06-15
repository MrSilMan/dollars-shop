const ROLE_DESCRIPTIONS: Record<string, { tagline: string; perks: string[] }> = {
  INVENTORY: {
    tagline: "You'll keep the store stocked and the catalogue sharp.",
    perks: [
      "Browse and manage all product listings",
      "Update stock levels and prices",
      "Monitor low-stock alerts before they become problems",
    ],
  },
  SALES: {
    tagline: "You'll be the engine that keeps orders moving and customers happy.",
    perks: [
      "View and process incoming orders",
      "Manage customer accounts and history",
      "Apply coupons and track sales performance",
    ],
  },
  MANAGER: {
    tagline: "You'll keep the team aligned and operations running smoothly.",
    perks: [
      "Full visibility across orders, products, and customers",
      "Invite and manage Inventory Specialists & Sales Executives",
      "Monitor store health and revenue overview",
    ],
  },
  ADMIN: {
    tagline: "You'll have full control over the store and its team.",
    perks: [
      "Manage products, orders, customers, and coupons",
      "Invite and remove staff at any role level",
      "Configure homepage content and promotions",
    ],
  },
};

export function staffInviteHtml(data: {
  inviterName: string;
  roleLabel: string;
  acceptUrl: string;
  expiresHours: number;
  appName: string;
  primaryColor?: string;
  logoUrl?: string | null;
  role: string;
}): string {
  const primary = data.primaryColor ?? "#e3029a";
  const roleInfo = ROLE_DESCRIPTIONS[data.role] ?? {
    tagline: `You've been given access to ${data.appName}'s admin panel.`,
    perks: ["Access the admin panel", "Manage your assigned area"],
  };

  // Derive a slightly darker shade for hover/depth
  const headerGradient = `linear-gradient(135deg, ${primary} 0%, #7b1fa2 100%)`;

  const perksHtml = roleInfo.perks
    .map(p => `
      <tr>
        <td style="padding:6px 0;vertical-align:top;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:24px;padding-top:1px;vertical-align:top;">
              <div style="width:20px;height:20px;border-radius:50%;background:${primary}18;display:flex;align-items:center;justify-content:center;">
                <span style="color:${primary};font-size:12px;font-weight:900;line-height:20px;display:block;text-align:center;">✓</span>
              </div>
            </td>
            <td style="padding-left:10px;font-size:14px;color:#444;line-height:1.5;">${p}</td>
          </tr></table>
        </td>
      </tr>`)
    .join("");

  // Initials avatar for the inviter
  const initials = data.inviterName
    .split(" ")
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? "")
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>You're invited to ${data.appName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f5;padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- ── Header ── -->
  <tr>
    <td style="background:${headerGradient};border-radius:20px 20px 0 0;padding:40px 40px 36px;text-align:center;position:relative;">
      <!-- Decorative dots -->
      <div style="position:absolute;top:16px;right:24px;opacity:.15;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#fff;margin:0 2px;"></span>
        <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#fff;margin:0 2px;vertical-align:middle;"></span>
        <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:#fff;margin:0 2px;"></span>
      </div>

      <!-- Logo or brand mark -->
      ${data.logoUrl
        ? `<img src="${data.logoUrl}" alt="${data.appName}" height="52" style="display:block;margin:0 auto 14px;height:52px;width:auto;filter:brightness(0) invert(1);" />`
        : `<div style="display:inline-block;width:52px;height:52px;border-radius:16px;background:rgba(255,255,255,.15);margin-bottom:14px;line-height:52px;text-align:center;">
             <span style="color:#fff;font-size:26px;font-weight:900;letter-spacing:-1px;">${data.appName[0]}</span>
           </div>`
      }

      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">${data.appName}</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,.7);font-size:13px;">Staff Invitation</p>
    </td>
  </tr>

  <!-- ── Body card ── -->
  <tr>
    <td style="background:#ffffff;padding:40px 40px 32px;box-shadow:0 4px 20px rgba(0,0,0,.06);">

      <!-- Headline -->
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111;letter-spacing:-0.3px;">
        You're invited to the team 🎉
      </h2>
      <p style="margin:0 0 28px;font-size:15px;color:#666;line-height:1.6;">
        ${roleInfo.tagline}
      </p>

      <!-- Invited by -->
      <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#fafafa;border:1px solid #ebebeb;border-radius:14px;padding:16px 18px;width:100%;">
        <tr>
          <td style="vertical-align:middle;width:42px;">
            <div style="width:42px;height:42px;border-radius:50%;background:${primary};color:#fff;font-size:15px;font-weight:800;text-align:center;line-height:42px;">${initials}</div>
          </td>
          <td style="padding-left:14px;vertical-align:middle;">
            <p style="margin:0 0 2px;font-size:13px;color:#999;font-weight:500;">Invited by</p>
            <p style="margin:0;font-size:15px;font-weight:700;color:#222;">${data.inviterName}</p>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <span style="display:inline-block;background:${primary}15;color:${primary};font-size:12px;font-weight:700;padding:5px 12px;border-radius:100px;white-space:nowrap;">${data.roleLabel}</span>
          </td>
        </tr>
      </table>

      <!-- What you'll be able to do -->
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#bbb;">
        What you'll have access to
      </p>
      <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:32px;">
        ${perksHtml}
      </table>

      <!-- CTA -->
      <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
        <tr>
          <td align="center">
            <a href="${data.acceptUrl}"
               style="display:inline-block;background:${primary};color:#ffffff;font-size:16px;font-weight:800;padding:16px 48px;border-radius:14px;text-decoration:none;letter-spacing:.1px;box-shadow:0 4px 14px ${primary}55;">
              Accept Invitation &rarr;
            </a>
          </td>
        </tr>
      </table>

      <!-- Expiry notice -->
      <table cellpadding="0" cellspacing="0" style="width:100%;background:#fffbf0;border:1px solid #fde8b0;border-radius:10px;padding:12px 16px;">
        <tr>
          <td>
            <p style="margin:0;font-size:13px;color:#92680a;line-height:1.5;">
              ⏱ &nbsp;This invitation expires in <strong>${data.expiresHours} hours</strong>.
              If you weren't expecting this, you can safely ignore it.
            </p>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <!-- ── Footer ── -->
  <tr>
    <td style="background:#1a1a2e;border-radius:0 0 20px 20px;padding:24px 40px;text-align:center;">
      <p style="margin:0 0 6px;color:rgba(255,255,255,.9);font-size:14px;font-weight:700;">${data.appName}</p>
      <p style="margin:0 0 12px;color:rgba(255,255,255,.35);font-size:12px;">Harare, Zimbabwe</p>
      <p style="margin:0;font-size:12px;color:rgba(255,255,255,.2);">
        You received this because someone with admin access sent you an invitation.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}
