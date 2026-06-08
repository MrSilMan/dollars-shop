import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { verifyWhatsAppSignature, sendWhatsAppText } from "@/lib/notifications/whatsapp";
import { handleIncomingMessage, type IncomingMessage } from "@/lib/whatsapp-bot/engine";

// ─── Meta webhook payload shapes (only the fields we read) ─────────────────

interface WhatsAppTextMessage {
  from: string;
  id: string;
  type: "text";
  text: { body: string };
}

interface WhatsAppInteractiveMessage {
  from: string;
  id: string;
  type: "interactive";
  interactive:
    | { type: "list_reply"; list_reply: { id: string; title: string } }
    | { type: "button_reply"; button_reply: { id: string; title: string } };
}

interface WhatsAppOtherMessage {
  from: string;
  id: string;
  type: Exclude<string, "text" | "interactive">;
}

type WhatsAppMessage = WhatsAppTextMessage | WhatsAppInteractiveMessage | WhatsAppOtherMessage;

interface WebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: { messages?: WhatsAppMessage[] };
    }>;
  }>;
}

// Meta retries deliveries — dedupe on message id so a retry doesn't replay the conversation step
async function alreadyProcessed(messageId: string): Promise<boolean> {
  try {
    const isNew = await redis.set(`wa:msg:${messageId}`, "1", "EX", 3600, "NX");
    return isNew === null;
  } catch {
    return false;
  }
}

function toIncomingMessage(message: WhatsAppMessage): IncomingMessage | null {
  if (message.type === "text") {
    return { kind: "text", text: (message as WhatsAppTextMessage).text.body };
  }
  if (message.type === "interactive") {
    const interactive = (message as WhatsAppInteractiveMessage).interactive;
    const reply = interactive.type === "list_reply" ? interactive.list_reply : interactive.button_reply;
    return { kind: "selection", id: reply.id, title: reply.title };
  }
  return null;
}

/** Verification handshake — Meta calls this once when the webhook is configured. */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifyWhatsAppSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const messages = (payload.entry ?? [])
    .flatMap((entry) => entry.changes ?? [])
    .flatMap((change) => change.value?.messages ?? []);

  for (const message of messages) {
    if (await alreadyProcessed(message.id)) continue;

    try {
      const incoming = toIncomingMessage(message);
      if (!incoming) {
        await sendWhatsAppText(message.from, "I can only understand text messages and menu selections right now — type *menu* to see what I can help with.");
        continue;
      }
      await handleIncomingMessage(message.from, incoming);
    } catch (error) {
      logger.error("WhatsApp bot message handling failed", { error, from: message.from, messageId: message.id });
      await sendWhatsAppText(message.from, "Sorry, something went wrong on our end. Please try again, or type *menu* to restart.").catch(() => {});
    }
  }

  // Always acknowledge quickly — Meta retries on non-2xx responses
  return NextResponse.json({ received: true });
}
