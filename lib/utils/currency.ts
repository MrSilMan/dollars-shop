export function formatUSD(amount: number | string | { toNumber: () => number }): string {
  const num = typeof amount === "object" ? amount.toNumber() : Number(amount);
  return new Intl.NumberFormat("en-ZW", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function toNumber(value: number | string | { toNumber: () => number }): number {
  if (typeof value === "object" && "toNumber" in value) return value.toNumber();
  return Number(value);
}

export function calcDiscount(price: number, compareAtPrice: number | null): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
