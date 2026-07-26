"use client";

import { useMemo } from "react";
import { getProductBySlug, type MockProduct } from "@/lib/data";
import type { CartLine } from "./cart-context";

export interface ResolvedCartLine {
  productSlug: string;
  quantity: number;
  product: MockProduct;
}

// Cart lines only store productSlug + quantity; product details (price,
// stock, status) are always looked up fresh so the cart reflects the
// current catalog rather than a stale snapshot.
export function useResolvedCartLines(lines: CartLine[]): ResolvedCartLine[] {
  return useMemo(() => {
    const resolved: ResolvedCartLine[] = [];
    for (const line of lines) {
      const product = getProductBySlug(line.productSlug);
      if (product) resolved.push({ ...line, product });
    }
    return resolved;
  }, [lines]);
}

export function useCartSubtotal(lines: ResolvedCartLine[]): number {
  return useMemo(() => lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0), [lines]);
}
