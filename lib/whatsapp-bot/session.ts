import { redis } from "@/lib/redis";

export type BotState =
  | "MAIN_MENU"
  | "AWAITING_SEARCH"
  | "AWAITING_QUANTITY"
  | "CART_VIEW"
  | "CHECKOUT_NAME"
  | "CHECKOUT_EMAIL"
  | "CHECKOUT_PHONE"
  | "CHECKOUT_ADDRESS_LINE1"
  | "CHECKOUT_ADDRESS_LINE2"
  | "CHECKOUT_CITY"
  | "CHECKOUT_PROVINCE"
  | "CHECKOUT_PAYMENT_METHOD"
  | "CHECKOUT_PAYMENT_NUMBER"
  | "AWAITING_TRACKING_NUMBER";

export interface CheckoutDraft {
  name?: string;
  email?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  province?: string;
  method?: "ECOCASH" | "INNBUCKS" | "CASH_ON_DELIVERY";
  paymentNumber?: string;
}

export interface BotSession {
  state: BotState;
  /** Product awaiting a quantity reply, or shown as the active product for "add to cart". */
  pendingProductId?: string;
  /** Last search term, so "more" can re-run the same query. */
  searchQuery?: string;
  checkout?: CheckoutDraft;
}

const TTL_SECONDS = 30 * 60;
const sessionKey = (phone: string) => `wa:session:${phone}`;

const DEFAULT_SESSION: BotSession = { state: "MAIN_MENU" };

export async function getSession(phone: string): Promise<BotSession> {
  try {
    const raw = await redis.get(sessionKey(phone));
    if (raw) return JSON.parse(raw) as BotSession;
  } catch {
    // fall through to default — a fresh session is a safe degradation
  }
  return { ...DEFAULT_SESSION };
}

export async function saveSession(phone: string, session: BotSession): Promise<void> {
  try {
    await redis.set(sessionKey(phone), JSON.stringify(session), "EX", TTL_SECONDS);
  } catch {
    // session persistence is best-effort — the conversation can still proceed stateless-ish
  }
}

export async function resetSession(phone: string): Promise<void> {
  try {
    await redis.del(sessionKey(phone));
  } catch {
    // ignore — TTL will expire it eventually
  }
}
