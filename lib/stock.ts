import type { MockProduct } from "@/lib/data";

export interface StockStatus {
  label: string;
  tone: "success" | "sale" | "muted";
  purchasable: boolean;
}

const LOW_STOCK_THRESHOLD = 10;

// The single source of truth for "Only X left" — every place stock is
// shown (product card, PDP, vendor table) computes it from status +
// stockLevel here, so it can never drift out of sync or be set by hand.
export function getStockStatus(product: Pick<MockProduct, "status" | "stockLevel">): StockStatus {
  if (product.status === "ARCHIVED") {
    return { label: "Discontinued", tone: "muted", purchasable: false };
  }
  if (product.status === "DRAFT" || product.status === "INACTIVE") {
    return { label: "Currently unavailable", tone: "muted", purchasable: false };
  }
  if (product.status === "OUT_OF_STOCK" || product.stockLevel <= 0) {
    return { label: "Out of stock", tone: "muted", purchasable: false };
  }
  if (product.stockLevel <= LOW_STOCK_THRESHOLD) {
    return { label: `Only ${product.stockLevel} left in stock`, tone: "sale", purchasable: true };
  }
  return { label: "In stock", tone: "success", purchasable: true };
}
