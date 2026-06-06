import { randomBytes } from "crypto";

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  // Timestamp (ms) + 3 random bytes = collision-resistant without a DB round-trip
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `DS-${year}-${ts}${rand}`;
}
