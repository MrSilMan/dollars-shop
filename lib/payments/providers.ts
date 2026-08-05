/**
 * Which payment providers are actually usable at runtime.
 *
 * InnBucks is fully implemented but stays switched off until a real merchant
 * account exists — the credentials in `.env` are still placeholders. Offering a
 * provider we cannot charge is not just a dead button: `createOrder` commits
 * the order (and increments coupon usage) before payment initiation runs, so
 * every attempt leaves an orphan PENDING/UNPAID order behind.
 *
 * Gate every surface that offers a payment method on this module — checkout,
 * the server actions and the WhatsApp bot — so the provider comes back with a
 * single change to the environment.
 *
 * Server-only: these read non-public env vars, which are empty in the client
 * bundle. Pass the result down to client components as a prop.
 */

/** The values shipped in `.env.example`, still in place until real ones land. */
const PLACEHOLDER = /^your-/;

function isConfigured(...values: (string | undefined)[]): boolean {
  return values.every((v) => {
    const trimmed = v?.trim();
    return !!trimmed && !PLACEHOLDER.test(trimmed);
  });
}

/** Sandbox stubs the provider out entirely, so it needs no real credentials. */
export function isInnBucksEnabled(): boolean {
  if (process.env.PAYMENT_MODE === "sandbox") return true;
  return isConfigured(
    process.env.INNBUCKS_MERCHANT_ID,
    process.env.INNBUCKS_MERCHANT_SECRET,
    process.env.INNBUCKS_API_URL
  );
}

/** Customer-facing list of accepted methods — keeps marketing copy honest. */
export function paymentMethodsSummary(): string {
  return isInnBucksEnabled() ? "EcoCash & InnBucks" : "EcoCash & Cash";
}
