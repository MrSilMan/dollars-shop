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
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return;

  const template = STATUS_MESSAGES[params.status];
  if (!template) return;

  const body = template
    .replace("{orderNumber}", params.orderNumber)
    .replace("{total}", params.total.toFixed(2));

  // Normalise phone: strip leading 0, prepend country code 263
  const normalised = params.phone.replace(/^\+/, "").replace(/^0/, "263");

  await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: normalised,
      type: "text",
      text: { body },
    }),
  });
}
