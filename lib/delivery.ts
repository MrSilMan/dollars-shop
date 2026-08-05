/**
 * Single source of truth for delivery pricing and where we deliver. Imported by
 * the storefront, checkout, the server actions that price orders, and the
 * WhatsApp bot, so a change here updates the price, the maths and the copy
 * everywhere at once.
 */
export const DELIVERY_FEE_USD = 3;
export const FREE_DELIVERY_THRESHOLD_USD = 32;

/** Where the standard fee applies — deliveries outside this are arranged on request. */
export const DELIVERY_AREA_LABEL = "Harare CBD & surrounding areas";

/** One-line summary for banners, product pages and trust badges. */
export const DELIVERY_SUMMARY = `$${DELIVERY_FEE_USD} delivery in ${DELIVERY_AREA_LABEL} · Free over $${FREE_DELIVERY_THRESHOLD_USD}`;

/** Pickup is always free; otherwise the fee is waived above the threshold. */
export function calculateDeliveryFee(subtotal: number, isPickup = false): number {
  if (isPickup) return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD_USD ? 0 : DELIVERY_FEE_USD;
}
