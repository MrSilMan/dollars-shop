export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export function getStockStatus(stock: number, lowStockAlert = 10): StockStatus {
  if (stock <= 0) return "out_of_stock";
  if (stock <= lowStockAlert) return "low_stock";
  return "in_stock";
}

export function stockLabel(status: StockStatus): string {
  if (status === "out_of_stock") return "Out of Stock";
  if (status === "low_stock") return "Low Stock";
  return "In Stock";
}
