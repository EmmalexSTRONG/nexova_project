import { getVisibleProducts, type MockProduct } from "@/lib/data";
import { getAllVendorProductDrafts } from "@/lib/vendor/product-draft-store";

function isPubliclyVisible(product: MockProduct): boolean {
  return product.status === "ACTIVE" || product.status === "OUT_OF_STOCK";
}

// Vendor-drafted products carry their creation time in their generated id
// (`draft-<timestamp>`, see product-draft-store.ts) — there's no separate
// createdAt field on MockProduct today, so this recovers it from there.
function draftCreatedAtMs(product: MockProduct): number {
  const match = /^draft-(\d+)$/.exec(product.id);
  return match ? Number(match[1]) : 0;
}

// "Newest first" across BOTH the static seed catalog and whatever vendors
// have actually added through the "Add product" form — a new vendor upload
// shows up here immediately, ahead of the seed catalog, satisfying "new
// vendor uploads auto-appear, sorted newest-first" without a manual step.
// `skipOverlay` forces the same (localStorage-free) result the server sees,
// for seeding client `useState` initial values so the first client render
// matches the SSR'd HTML — see the matching comment in category-store.ts.
export function getLatestProductsLive(limit = 10, skipOverlay = false): MockProduct[] {
  const staticProducts = [...getVisibleProducts()].reverse();
  const drafts = skipOverlay
    ? []
    : getAllVendorProductDrafts()
        .filter(isPubliclyVisible)
        .sort((a, b) => draftCreatedAtMs(b) - draftCreatedAtMs(a));

  return [...drafts, ...staticProducts].slice(0, limit);
}
