import { prisma } from "@/lib/prisma";
import { sendWhatsAppText, sendWhatsAppButtons, sendWhatsAppList } from "@/lib/notifications/whatsapp";
import { getAllCategories, getProductsByCategory, searchProducts } from "@/actions/products";
import { CheckoutContactSchema, ZWPhoneSchema, AddressLine1Schema, AddressCitySchema, ProvinceEnum } from "@/schemas/checkout.schema";
import { getSession, saveSession, resetSession, type BotSession, type CheckoutDraft } from "./session";
import { getBotCartItems, addToBotCart, clearBotCart, botCartTotal } from "./cart";
import { createBotOrder, findOrderForTracking, type CompleteCheckoutDraft } from "./order";
import { handleAdminMessage } from "./admin";
import { STORE_PICKUP_LOCATION } from "@/lib/store-location";
import { DELIVERY_FEE_USD, FREE_DELIVERY_THRESHOLD_USD, DELIVERY_AREA_LABEL } from "@/lib/delivery";
import { isInnBucksEnabled } from "@/lib/payments/providers";

export type IncomingMessage =
  | { kind: "text"; text: string }
  | { kind: "selection"; id: string; title: string };

const RESET_WORDS = ["menu", "hi", "hello", "hey", "start", "cancel"];
const PROVINCES = ProvinceEnum.options;
const PAYMENT_METHODS = ["ECOCASH", "INNBUCKS", "CASH_ON_DELIVERY"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Mirrors checkout: never offer a provider we cannot actually charge. */
const availablePaymentMethods = (): readonly PaymentMethod[] =>
  PAYMENT_METHODS.filter((m) => m !== "INNBUCKS" || isInnBucksEnabled());

const money = (n: number) => `$${n.toFixed(2)}`;

function splitId(id: string): [string, string] {
  const idx = id.indexOf(":");
  return idx === -1 ? [id, ""] : [id.slice(0, idx), id.slice(idx + 1)];
}

function productRow(p: { id: string; name: string; price: unknown; stock: number }) {
  const price = Number(p.price);
  return {
    id: `prod:${p.id}`,
    title: p.name,
    description: p.stock > 0 ? `${money(price)} · ${p.stock} in stock` : `${money(price)} · Out of stock`,
  };
}

async function isAdmin(phone: string): Promise<boolean> {
  const normalize = (p: string) => p.replace(/\D/g, "").slice(-9);
  const normalizedPhone = normalize(phone);

  const settings = await prisma.appSettings.findFirst({ select: { whatsappAdminNumbers: true } });
  const dbNumbers: string[] = settings?.whatsappAdminNumbers ?? [];

  // Fall back to env var when no numbers are configured in the DB
  const allNumbers = dbNumbers.length > 0 ? dbNumbers : [process.env.WHATSAPP_ADMIN_NUMBER ?? ""].filter(Boolean);

  return allNumbers.some((n) => normalize(n) === normalizedPhone);
}

/** Entry point — routes an inbound WhatsApp message through the menu-driven conversation. */
export async function handleIncomingMessage(phone: string, message: IncomingMessage): Promise<void> {
  if (await isAdmin(phone)) {
    await handleAdminMessage(phone, message);
    return;
  }
  if (message.kind === "selection") {
    await handleSelection(phone, message.id);
    return;
  }

  const text = message.text.trim();
  const lower = text.toLowerCase();

  // Global escape hatches — work from any state so users never get stuck
  if (RESET_WORDS.includes(lower)) {
    await resetSession(phone);
    await showMainMenu(phone, lower === "menu" || lower === "cancel" ? undefined : "👋 Welcome to Dollar Shop!");
    return;
  }
  if (lower === "cart") {
    await showCart(phone);
    return;
  }

  const session = await getSession(phone);
  await handleTextForState(phone, session, text);
}

async function handleSelection(phone: string, id: string) {
  const [prefix, value] = splitId(id);

  switch (prefix) {
    case "menu":
      if (value === "browse") return showCategories(phone);
      if (value === "search") return startSearch(phone);
      if (value === "cart") return showCart(phone);
      if (value === "track") return startTracking(phone);
      return showMainMenu(phone);
    case "cat":
      return showProductsForCategory(phone, value);
    case "prod":
      return showProductDetail(phone, value);
    case "add":
      return startQuantityPrompt(phone, value);
    case "cart_action":
      if (value === "checkout") return startCheckout(phone);
      if (value === "clear") return handleClearCart(phone);
      return showMainMenu(phone);
    case "fulfil":
      return handleFulfillmentSelection(phone, value);
    case "province":
      return handleProvinceSelection(phone, value);
    case "pay":
      if ((availablePaymentMethods() as readonly string[]).includes(value)) {
        return handlePaymentMethodSelection(phone, value as PaymentMethod);
      }
      return showMainMenu(phone);
    default:
      return showMainMenu(phone);
  }
}

async function handleTextForState(phone: string, session: BotSession, text: string) {
  switch (session.state) {
    case "AWAITING_SEARCH":
      if (!text) return sendWhatsAppText(phone, "Please type a keyword to search for.");
      return runSearch(phone, text);
    case "AWAITING_QUANTITY":
      return handleQuantityReply(phone, session, text);
    case "AWAITING_TRACKING_NUMBER":
      return handleTrackingReply(phone, text);
    case "CHECKOUT_NAME":
      return handleCheckoutName(phone, session, text);
    case "CHECKOUT_EMAIL":
      return handleCheckoutEmail(phone, session, text);
    case "CHECKOUT_PHONE":
      return handleCheckoutPhone(phone, session, text);
    case "CHECKOUT_ADDRESS_LINE1":
      return handleCheckoutLine1(phone, session, text);
    case "CHECKOUT_ADDRESS_LINE2":
      return handleCheckoutLine2(phone, session, text);
    case "CHECKOUT_CITY":
      return handleCheckoutCity(phone, session, text);
    case "CHECKOUT_PAYMENT_NUMBER":
      return handleCheckoutPaymentNumber(phone, session, text);
    default:
      return showMainMenu(phone, "I didn't quite catch that.");
  }
}

// ─── Main menu & browsing ───────────────────────────────────────────────────

async function showMainMenu(phone: string, greeting?: string) {
  await saveSession(phone, { state: "MAIN_MENU" });
  const body = greeting ? `${greeting}\n\nHow can I help you today?` : "How can I help you today?";
  await sendWhatsAppList(phone, body, "Choose an option", [
    {
      rows: [
        { id: "menu:browse", title: "🗂️ Browse Categories", description: "Shop by category" },
        { id: "menu:search", title: "🔍 Search Products", description: "Find something specific" },
        { id: "menu:cart", title: "🛒 View Cart", description: "Review items & checkout" },
        { id: "menu:track", title: "📦 Track an Order", description: "Check order status" },
      ],
    },
  ]);
}

async function showCategories(phone: string) {
  const categories = await getAllCategories();
  if (categories.length === 0) {
    await sendWhatsAppText(phone, "No categories are available right now — please try again later.");
    return showMainMenu(phone);
  }

  await saveSession(phone, { state: "MAIN_MENU" });
  await sendWhatsAppList(phone, "📂 Pick a category to browse:", "View Categories", [
    { rows: categories.slice(0, 10).map((c) => ({ id: `cat:${c.slug}`, title: c.name, description: c.description ?? undefined })) },
  ]);
}

async function showProductsForCategory(phone: string, slug: string) {
  const { products, category } = await getProductsByCategory(slug, 1, 10);
  if (!category) {
    await sendWhatsAppText(phone, "That category isn't available anymore.");
    return showCategories(phone);
  }
  if (products.length === 0) {
    await sendWhatsAppText(phone, `No products in *${category.name}* right now — check back soon!`);
    return showCategories(phone);
  }

  await sendWhatsAppList(phone, `🛍️ Products in *${category.name}*:`, "View Products", [
    { rows: products.map(productRow) },
  ]);
}

async function startSearch(phone: string) {
  await saveSession(phone, { state: "AWAITING_SEARCH" });
  await sendWhatsAppText(phone, "🔍 What are you looking for? Type a product name or keyword.");
}

async function runSearch(phone: string, query: string) {
  const results = await searchProducts(query);
  if (results.length === 0) {
    await saveSession(phone, { state: "AWAITING_SEARCH", searchQuery: query });
    await sendWhatsAppText(phone, `No results for "${query}". Try another keyword, or type *menu* to go back.`);
    return;
  }

  await saveSession(phone, { state: "MAIN_MENU" });
  await sendWhatsAppList(phone, `🔍 Results for "${query}":`, "View Results", [
    { rows: results.slice(0, 10).map(productRow) },
  ]);
}

async function showProductDetail(phone: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId, isActive: true },
    include: { category: true },
  });
  if (!product) {
    await sendWhatsAppText(phone, "That product is no longer available.");
    return showMainMenu(phone);
  }

  await saveSession(phone, { state: "MAIN_MENU", pendingProductId: product.id });

  const lines = [
    `*${product.name}*`,
    product.description ? product.description.slice(0, 300) : null,
    `💵 Price: *${money(Number(product.price))}*`,
    product.stock > 0 ? `📦 In stock: ${product.stock}` : "❌ Currently out of stock",
    `📂 Category: ${product.category.name}`,
  ].filter((l): l is string => l !== null);

  const buttons = product.stock > 0
    ? [
        { id: `add:${product.id}`, title: "Add to cart" },
        { id: "menu:browse", title: "Browse more" },
        { id: "menu:main", title: "Main menu" },
      ]
    : [
        { id: "menu:browse", title: "Browse more" },
        { id: "menu:main", title: "Main menu" },
      ];

  await sendWhatsAppButtons(phone, lines.join("\n"), buttons);
}

async function startQuantityPrompt(phone: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } });
  if (!product || product.stock <= 0) {
    await sendWhatsAppText(phone, "Sorry, that item is no longer available.");
    return showMainMenu(phone);
  }

  await saveSession(phone, { state: "AWAITING_QUANTITY", pendingProductId: product.id });
  await sendWhatsAppText(phone, `How many *${product.name}* would you like? Reply with a number (1–${product.stock}).`);
}

async function handleQuantityReply(phone: string, session: BotSession, text: string) {
  const productId = session.pendingProductId;
  if (!productId) return showMainMenu(phone);

  const quantity = parseInt(text, 10);
  if (!Number.isFinite(quantity) || quantity < 1) {
    await sendWhatsAppText(phone, "Please reply with a valid whole number, e.g. 1");
    return;
  }

  const result = await addToBotCart(phone, productId, quantity);
  if (!result.success) {
    await sendWhatsAppText(
      phone,
      result.error === "Insufficient stock"
        ? "Sorry, we don't have that much stock available for that item."
        : "Couldn't add that to your cart — it may no longer be available."
    );
    return showMainMenu(phone);
  }

  await saveSession(phone, { state: "MAIN_MENU" });
  await sendWhatsAppButtons(phone, `✅ Added ${quantity} to your cart.`, [
    { id: "menu:cart", title: "View cart" },
    { id: "menu:browse", title: "Keep shopping" },
    { id: "menu:main", title: "Main menu" },
  ]);
}

// ─── Cart ───────────────────────────────────────────────────────────────────

async function showCart(phone: string) {
  const items = await getBotCartItems(phone);
  if (items.length === 0) {
    await saveSession(phone, { state: "MAIN_MENU" });
    await sendWhatsAppButtons(phone, "Your cart is empty.", [
      { id: "menu:browse", title: "Browse products" },
      { id: "menu:main", title: "Main menu" },
    ]);
    return;
  }

  const subtotal = botCartTotal(items);
  const lines = items.map(
    (item) => `• ${item.quantity} × ${item.product.name} — ${money(Number(item.product.price) * item.quantity)}`
  );
  lines.push(
    "",
    `Subtotal: *${money(subtotal)}*`,
    `_Delivery is $${DELIVERY_FEE_USD} in ${DELIVERY_AREA_LABEL}, free over $${FREE_DELIVERY_THRESHOLD_USD} — or collect free in store._`
  );

  await saveSession(phone, { state: "MAIN_MENU" });
  await sendWhatsAppButtons(phone, lines.join("\n"), [
    { id: "cart_action:checkout", title: "Checkout" },
    { id: "cart_action:clear", title: "Clear cart" },
    { id: "menu:main", title: "Main menu" },
  ]);
}

async function handleClearCart(phone: string) {
  await clearBotCart(phone);
  await sendWhatsAppText(phone, "🗑️ Your cart has been cleared.");
  await showMainMenu(phone);
}

// ─── Checkout ───────────────────────────────────────────────────────────────

async function startCheckout(phone: string) {
  const items = await getBotCartItems(phone);
  if (items.length === 0) {
    await sendWhatsAppText(phone, "Your cart is empty — add something first!");
    return showMainMenu(phone);
  }

  await saveSession(phone, { state: "CHECKOUT_NAME", checkout: {} });
  await sendWhatsAppText(phone, "Let's get you checked out 📝\n\nWhat's your full name?");
}

async function handleCheckoutName(phone: string, session: BotSession, text: string) {
  const result = CheckoutContactSchema.shape.name.safeParse(text);
  if (!result.success) {
    await sendWhatsAppText(phone, "Please enter your full name (at least 2 characters).");
    return;
  }
  await saveSession(phone, { ...session, state: "CHECKOUT_EMAIL", checkout: { ...session.checkout, name: result.data } });
  await sendWhatsAppText(phone, "Thanks! What's your email address? (for your order confirmation)");
}

async function handleCheckoutEmail(phone: string, session: BotSession, text: string) {
  const result = CheckoutContactSchema.shape.email.safeParse(text);
  if (!result.success) {
    await sendWhatsAppText(phone, "That doesn't look like a valid email address. Please try again.");
    return;
  }
  await saveSession(phone, { ...session, state: "CHECKOUT_PHONE", checkout: { ...session.checkout, email: result.data } });
  await sendWhatsAppText(phone, "And a contact phone number for delivery? (07XXXXXXXX — or start with your country code, like +XX, if you're outside Zimbabwe)");
}

async function handleCheckoutPhone(phone: string, session: BotSession, text: string) {
  const result = CheckoutContactSchema.shape.phone.safeParse(text.replace(/\s+/g, ""));
  if (!result.success) {
    await sendWhatsAppText(phone, "Please enter a valid mobile number, e.g. 07XXXXXXXX — or include your country code, starting with +, if you're outside Zimbabwe.");
    return;
  }
  await saveSession(phone, { ...session, state: "CHECKOUT_FULFILLMENT", checkout: { ...session.checkout, phone: result.data } });
  await sendWhatsAppButtons(
    phone,
    `How would you like to get your order?\n\n🚚 Delivery — $${DELIVERY_FEE_USD} in ${DELIVERY_AREA_LABEL}, free over $${FREE_DELIVERY_THRESHOLD_USD}\n🏬 Collect in store — always free`,
    [
      { id: "fulfil:DELIVERY", title: "Deliver to me" },
      { id: "fulfil:PICKUP", title: "Collect in store" },
    ]
  );
}

async function handleFulfillmentSelection(phone: string, value: string) {
  const session = await getSession(phone);
  if (session.state !== "CHECKOUT_FULFILLMENT") return showMainMenu(phone);
  if (value !== "DELIVERY" && value !== "PICKUP") return showMainMenu(phone);

  const checkout: CheckoutDraft = { ...session.checkout, fulfillmentType: value };

  if (value === "PICKUP") {
    await sendWhatsAppText(
      phone,
      `🏬 Great — collect at *${STORE_PICKUP_LOCATION.name}*\n` +
        `${STORE_PICKUP_LOCATION.line1}, ${STORE_PICKUP_LOCATION.city}\n` +
        `Open ${STORE_PICKUP_LOCATION.hours}\n\n` +
        `Collection is free. We'll message you when your order is ready.`
    );
    await saveSession(phone, { ...session, state: "CHECKOUT_PAYMENT_METHOD", checkout });
    return askPaymentMethod(phone, true);
  }

  await saveSession(phone, { ...session, state: "CHECKOUT_ADDRESS_LINE1", checkout });
  await sendWhatsAppText(phone, "What's your delivery address — street/house number and area?");
}

async function askPaymentMethod(phone: string, isPickup: boolean) {
  const titles: Record<PaymentMethod, string> = {
    ECOCASH: "EcoCash",
    INNBUCKS: "InnBucks",
    CASH_ON_DELIVERY: isPickup ? "Cash on collection" : "Cash on delivery",
  };
  await sendWhatsAppButtons(
    phone,
    "How would you like to pay?",
    availablePaymentMethods().map((m) => ({ id: `pay:${m}`, title: titles[m] }))
  );
}

async function handleCheckoutLine1(phone: string, session: BotSession, text: string) {
  const result = AddressLine1Schema.safeParse(text);
  if (!result.success) {
    await sendWhatsAppText(phone, "Please enter a more complete address (at least 5 characters).");
    return;
  }
  await saveSession(phone, { ...session, state: "CHECKOUT_ADDRESS_LINE2", checkout: { ...session.checkout, line1: result.data } });
  await sendWhatsAppText(phone, "Apartment, suite, or unit number? Reply *skip* if not applicable.");
}

async function handleCheckoutLine2(phone: string, session: BotSession, text: string) {
  const skip = ["skip", "none", "no", "n/a"].includes(text.toLowerCase());
  await saveSession(phone, { ...session, state: "CHECKOUT_CITY", checkout: { ...session.checkout, line2: skip ? undefined : text } });
  await sendWhatsAppText(phone, "Which city or town?");
}

async function handleCheckoutCity(phone: string, session: BotSession, text: string) {
  const result = AddressCitySchema.safeParse(text);
  if (!result.success) {
    await sendWhatsAppText(phone, "Please enter a valid city/town name.");
    return;
  }
  await saveSession(phone, { ...session, state: "CHECKOUT_PROVINCE", checkout: { ...session.checkout, city: result.data } });
  await sendWhatsAppList(phone, "Which province?", "Select Province", [
    { rows: PROVINCES.map((p) => ({ id: `province:${p}`, title: p })) },
  ]);
}

async function handleProvinceSelection(phone: string, value: string) {
  const session = await getSession(phone);
  if (session.state !== "CHECKOUT_PROVINCE") return showMainMenu(phone);

  const province = PROVINCES.find((p) => p === value);
  if (!province) return showMainMenu(phone);

  await saveSession(phone, { ...session, state: "CHECKOUT_PAYMENT_METHOD", checkout: { ...session.checkout, province } });
  await askPaymentMethod(phone, false);
}

async function handlePaymentMethodSelection(phone: string, method: PaymentMethod) {
  const session = await getSession(phone);
  if (session.state !== "CHECKOUT_PAYMENT_METHOD") return showMainMenu(phone);

  const checkout: CheckoutDraft = { ...session.checkout, method };

  if (method === "CASH_ON_DELIVERY") {
    return finishCheckout(phone, { ...session, checkout });
  }

  await saveSession(phone, { ...session, state: "CHECKOUT_PAYMENT_NUMBER", checkout });
  await sendWhatsAppText(
    phone,
    `Enter the mobile number that should receive the ${method === "ECOCASH" ? "EcoCash" : "InnBucks"} payment prompt (07XXXXXXXX).`
  );
}

// Not the contact schema: this number is charged, so it stays Zimbabwe-only
// even though the contact number above no longer is.
async function handleCheckoutPaymentNumber(phone: string, session: BotSession, text: string) {
  const result = ZWPhoneSchema.safeParse(text.replace(/\s+/g, ""));
  if (!result.success) {
    await sendWhatsAppText(phone, "Please enter a valid Zimbabwean mobile number, e.g. 0772566468.");
    return;
  }
  const checkout: CheckoutDraft = { ...session.checkout, paymentNumber: result.data };
  await finishCheckout(phone, { ...session, checkout });
}

function isCompleteDraft(draft: CheckoutDraft | undefined): draft is CompleteCheckoutDraft {
  if (!draft || !draft.name || !draft.email || !draft.phone || !draft.method) return false;
  // Pickup orders are collected in store, so they carry no customer address.
  if (draft.fulfillmentType === "PICKUP") return true;
  return !!draft.line1 && !!draft.city && !!draft.province;
}

async function finishCheckout(phone: string, session: BotSession) {
  const draft = session.checkout;
  if (!isCompleteDraft(draft)) {
    await sendWhatsAppText(phone, "Something went wrong collecting your details — let's start over.");
    return startCheckout(phone);
  }

  await saveSession(phone, { ...session, checkout: draft });
  await sendWhatsAppText(phone, "⏳ Placing your order...");
  const result = await createBotOrder(phone, draft);

  if (!result.success) {
    await sendWhatsAppText(phone, `❌ ${result.error}. Please try again, or type *menu* to start over.`);
    return;
  }

  await resetSession(phone);
  const { payment } = result;

  if (payment.success && payment.method === "ECOCASH") {
    await sendWhatsAppText(
      phone,
      `✅ Order *${result.orderNumber}* placed!\n\n` +
        `📲 We've sent an EcoCash payment request for *${money(payment.amount)}* to *${draft.paymentNumber}*. ` +
        `Please approve it on your phone to complete your order.`
    );
  } else if (payment.success && payment.method === "INNBUCKS") {
    await sendWhatsAppText(
      phone,
      `✅ Order *${result.orderNumber}* placed!\n\n` +
        `💳 Complete your payment of *${money(payment.amount)}* via InnBucks here:\n${payment.checkoutUrl}`
    );
  } else if (payment.success && payment.method === "CASH_ON_DELIVERY") {
    await sendWhatsAppText(
      phone,
      `✅ Order *${result.orderNumber}* placed!\n\n` +
        (draft.fulfillmentType === "PICKUP"
          ? `💵 Pay *${money(payment.amount)}* in cash when you collect at ${STORE_PICKUP_LOCATION.name}. Thanks for shopping with Dollar Shop!`
          : `💵 Pay *${money(payment.amount)}* in cash when your order is delivered. Thanks for shopping with Dollar Shop!`)
    );
  }

  if (draft.fulfillmentType === "PICKUP") {
    await sendWhatsAppText(
      phone,
      `🏬 Collect at *${STORE_PICKUP_LOCATION.name}* — ${STORE_PICKUP_LOCATION.line1}, ${STORE_PICKUP_LOCATION.city}\n` +
        `Open ${STORE_PICKUP_LOCATION.hours}. Bring order *${result.orderNumber}* and an ID.`
    );
  }

  await sendWhatsAppText(phone, "Type *menu* anytime to start a new conversation.");
}

// ─── Order tracking ─────────────────────────────────────────────────────────

async function startTracking(phone: string) {
  await saveSession(phone, { state: "AWAITING_TRACKING_NUMBER" });
  await sendWhatsAppText(phone, "📦 What's your order number? (e.g. DS-2026-XXXXX)");
}

async function handleTrackingReply(phone: string, text: string) {
  if (!text) {
    await sendWhatsAppText(phone, "Please enter your order number, e.g. DS-2026-XXXXX.");
    return;
  }

  const order = await findOrderForTracking(text, phone);
  if (!order) {
    await sendWhatsAppText(
      phone,
      "We couldn't find an order with that number linked to this phone number. Double-check and try again, or type *menu* to go back."
    );
    return;
  }

  await resetSession(phone);
  await sendWhatsAppText(
    phone,
    `📦 Order *${order.orderNumber}*\n` +
      `Status: *${order.status}*\n` +
      `Payment: *${order.paymentStatus}*\n` +
      `Total: *${money(Number(order.total))}*\n` +
      `Placed: ${order.createdAt.toLocaleDateString("en-ZW", { year: "numeric", month: "short", day: "numeric" })}`
  );
  await showMainMenu(phone);
}
