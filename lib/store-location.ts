/**
 * The physical shop customers collect PICKUP orders from. Kept in one place so
 * checkout, receipts, emails and the admin panel all quote the same address.
 * Overridable per-environment without a rebuild of every consumer.
 */
export const STORE_PICKUP_LOCATION = {
  name: process.env.NEXT_PUBLIC_STORE_NAME ?? "Dollar Shop",
  line1: process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "123 Samora Machel Ave",
  city: process.env.NEXT_PUBLIC_STORE_CITY ?? "Harare",
  province: process.env.NEXT_PUBLIC_STORE_PROVINCE ?? "Harare",
  country: "Zimbabwe",
  hours: process.env.NEXT_PUBLIC_STORE_HOURS ?? "Mon–Sat, 8:00 AM – 6:00 PM",
  phone: process.env.NEXT_PUBLIC_STORE_PHONE ?? "+263 77 256 6468",
} as const;

/** Single-line rendering, e.g. "123 Samora Machel Ave, Harare, Zimbabwe". */
export function formatStoreAddress(): string {
  const s = STORE_PICKUP_LOCATION;
  return `${s.line1}, ${s.city}, ${s.country}`;
}
