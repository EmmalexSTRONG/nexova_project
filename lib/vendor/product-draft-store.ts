import { createListStore } from "@/lib/shared/local-storage-store";
import type { MockProduct } from "@/lib/data";

export const VENDOR_PRODUCT_DRAFTS_STORAGE_KEY = "nexora:vendor-product-drafts:v1";
const store = createListStore<MockProduct>(VENDOR_PRODUCT_DRAFTS_STORAGE_KEY);

export function getVendorProductDrafts(shopSlug: string): MockProduct[] {
  return store.readAll().filter((product) => product.shopSlug === shopSlug);
}

// Every vendor-drafted product across every shop — used for marketplace-wide
// views like the homepage's "Latest products" feed, which needs to see new
// listings the moment a vendor adds one, not just that vendor's own list.
export function getAllVendorProductDrafts(): MockProduct[] {
  return store.readAll();
}

export function addVendorProductDraft(product: MockProduct): void {
  const drafts = store.readAll();
  drafts.unshift(product);
  store.writeAll(drafts);
}

export function getVendorProductDraftBySlug(slug: string): MockProduct | undefined {
  return store.readAll().find((product) => product.slug === slug);
}

export function updateVendorProductDraft(slug: string, patch: Partial<MockProduct>): void {
  const drafts = store.readAll();
  const index = drafts.findIndex((product) => product.slug === slug);
  if (index === -1) return;
  drafts[index] = { ...drafts[index], ...patch };
  store.writeAll(drafts);
}
