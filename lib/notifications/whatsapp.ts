import { createHmac, timingSafeEqual } from "crypto";
import { logger } from "@/lib/logger";

/** Normalise a Zimbabwean number to E.164-ish digits the Cloud API expects (strip +, leading 0 → 263). */
export function normaliseWhatsAppPhone(phone: string): string {
  return phone.replace(/^\+/, "").replace(/^0/, "263");
}

/** Verify the `X-Hub-Signature-256` header Meta sends on every webhook delivery. */
export function verifyWhatsAppSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;

  const expected = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function callWhatsAppApi(payload: Record<string, unknown>) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return;

  const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });

  if (!response.ok) {
    logger.error("WhatsApp message delivery failed", {
      status: response.status,
      body: await response.text().catch(() => ""),
      to: payload.to,
    });
  }
}

/** Send a plain text message — used for free-form bot replies. */
export async function sendWhatsAppText(phone: string, body: string) {
  await callWhatsAppApi({
    to: normaliseWhatsAppPhone(phone),
    type: "text",
    text: { body },
  });
}

export type WhatsAppButton = { id: string; title: string };

/** Send up to 3 quick-reply buttons (Meta's limit) alongside a body message. */
export async function sendWhatsAppButtons(phone: string, body: string, buttons: WhatsAppButton[]) {
  await callWhatsAppApi({
    to: normaliseWhatsAppPhone(phone),
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: {
        buttons: buttons.slice(0, 3).map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.title.slice(0, 20) },
        })),
      },
    },
  });
}

export type WhatsAppListRow = { id: string; title: string; description?: string };
export type WhatsAppListSection = { title?: string; rows: WhatsAppListRow[] };

/** Send a scrollable option list (up to 10 rows total) — used for menus, categories, and product pickers. */
export async function sendWhatsAppList(
  phone: string,
  body: string,
  buttonLabel: string,
  sections: WhatsAppListSection[]
) {
  await callWhatsAppApi({
    to: normaliseWhatsAppPhone(phone),
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: body },
      action: {
        button: buttonLabel.slice(0, 20),
        sections: sections.map((s) => ({
          ...(s.title ? { title: s.title.slice(0, 24) } : {}),
          rows: s.rows.slice(0, 10).map((r) => ({
            id: r.id,
            title: r.title.slice(0, 24),
            ...(r.description ? { description: r.description.slice(0, 72) } : {}),
          })),
        })),
      },
    },
  });
}

const STATUS_MESSAGES: Record<string, string> = {
  CONFIRMED:  "✅ Your Dollar Shop order *{orderNumber}* has been confirmed! Total: *${total}*. We'll keep you posted.",
  PROCESSING: "📦 Your order *{orderNumber}* is being packed and prepared for dispatch.",
  SHIPPED:    "🚚 Your order *{orderNumber}* is on its way! Expect delivery soon. Total paid: *${total}*.",
  DELIVERED:  "🎉 Your order *{orderNumber}* has been delivered. Thank you for shopping with Dollar Shop!",
  CANCELLED:  "❌ Your order *{orderNumber}* has been cancelled. Questions? Reply or WhatsApp us.",
  REFUNDED:   "💰 Your refund for order *{orderNumber}* ($${total}) has been processed. Allow 3–5 days.",
};

export async function sendWhatsAppStatusUpdate(params: {
  phone: string;
  orderNumber: string;
  status: string;
  total: number;
}) {
  const template = STATUS_MESSAGES[params.status];
  if (!template) return;

  const body = template
    .replace("{orderNumber}", params.orderNumber)
    .replace("{total}", params.total.toFixed(2));

  await sendWhatsAppText(params.phone, body);
}
