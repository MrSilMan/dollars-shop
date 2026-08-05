export function formatUSD(amount: number | string | { toNumber: () => number }): string {
  const num = typeof amount === "object" ? amount.toNumber() : Number(amount);
  return new Intl.NumberFormat("en-ZW", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// ZiG (ZWG) has no widely-supported Intl currency symbol, so format manually
// as "ZW$" with thousands separators, e.g. 282.75 → "ZW$282.75".
export function formatZWG(amount: number | string | { toNumber: () => number }): string {
  const num = typeof amount === "object" ? amount.toNumber() : Number(amount);
  return `ZW$${new Intl.NumberFormat("en-ZW", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)}`;
}

// Convert a USD amount to ZWG at the given rate, rounded to 2 decimals.
export function convertUsdToZwg(usd: number, rate: number): number {
  return Math.round(usd * rate * 100) / 100;
}

export function formatMoney(
  amount: number | string | { toNumber: () => number },
  currency: "USD" | "ZWG"
): string {
  return currency === "ZWG" ? formatZWG(amount) : formatUSD(amount);
}

export function toNumber(value: number | string | { toNumber: () => number }): number {
  if (typeof value === "object" && "toNumber" in value) return value.toNumber();
  return Number(value);
}

export function calcDiscount(price: number, compareAtPrice: number | null): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
