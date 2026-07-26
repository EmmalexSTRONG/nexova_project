import { createRecordStore } from "@/lib/shared/local-storage-store";
import type { MockProduct } from "@/lib/data";

// Seed-catalog products are static (lib/data/products.ts), so edits to them
// can't be written back to that file at runtime — instead each edit is
// stored as a partial overlay keyed by slug and merged in wherever seed
// products are read for a vendor. Locally-drafted products (added via
// "Add product") are mutated directly in product-draft-store instead, since
// those already live in a mutable list store.
export const VENDOR_PRODUCT_EDITS_STORAGE_KEY = "nexora:vendor-product-edits:v1";
const store = createRecordStore<Partial<MockProduct>>(VENDOR_PRODUCT_EDITS_STORAGE_KEY);

export function getProductEdit(slug: string): Partial<MockProduct> | undefined {
  return store.readAll()[slug];
}

export function saveProductEdit(slug: string, patch: Partial<MockProduct>): void {
  const all = store.readAll();
  all[slug] = { ...all[slug], ...patch };
  store.writeAll(all);
}

export function applyProductEdits(products: MockProduct[]): MockProduct[] {
  const edits = store.readAll();
  return products.map((product) => (edits[product.slug] ? { ...product, ...edits[product.slug] } : product));
}
