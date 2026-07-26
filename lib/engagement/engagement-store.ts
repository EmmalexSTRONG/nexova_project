import { createListStore } from "@/lib/shared/local-storage-store";
import { getAllOrders } from "@/lib/checkout/order-store";
import type { PlacedOrder } from "@/lib/checkout/types";
import type { MockProduct } from "@/lib/data";

// Real, timestamped engagement signals recorded as this browser actually
// uses the site — a PDP visit or a wishlist add, each logged once. There's
// no backend to aggregate across shoppers, so this is necessarily a
// per-browser signal, same as every other localStorage-backed store in this
// app; it's genuine usage data, not a fabricated counter.
export type EngagementEventType = "VIEW" | "WISHLIST";

interface EngagementEvent {
  productSlug: string;
  type: EngagementEventType;
  occurredAt: string;
}

export const ENGAGEMENT_EVENTS_STORAGE_KEY = "nexora:engagement-events:v1";
const store = createListStore<EngagementEvent>(ENGAGEMENT_EVENTS_STORAGE_KEY);

// Caps unbounded growth from long-lived sessions; only the last week ever
// factors into ranking anyway, so a generous cap is plenty of headroom.
const MAX_EVENTS = 1000;

export function recordEngagementEvent(productSlug: string, type: EngagementEventType): void {
  const events = store.readAll();
  events.push({ productSlug, type, occurredAt: new Date().toISOString() });
  store.writeAll(events.length > MAX_EVENTS ? events.slice(-MAX_EVENTS) : events);
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isOrderCounted(order: PlacedOrder): boolean {
  if (order.status === "CANCELLED") return false;
  return order.paymentMethod === "CASH" || order.paymentStatus === "SUCCESSFUL";
}

function getWeeklyEventCounts(): Map<string, { views: number; wishlists: number }> {
  const since = Date.now() - WEEK_MS;
  const counts = new Map<string, { views: number; wishlists: number }>();
  for (const event of store.readAll()) {
    if (new Date(event.occurredAt).getTime() < since) continue;
    const entry = counts.get(event.productSlug) ?? { views: 0, wishlists: 0 };
    if (event.type === "VIEW") entry.views += 1;
    else entry.wishlists += 1;
    counts.set(event.productSlug, entry);
  }
  return counts;
}

function getWeeklyPurchaseCounts(): Map<string, number> {
  const since = Date.now() - WEEK_MS;
  const counts = new Map<string, number>();
  for (const order of getAllOrders()) {
    if (!isOrderCounted(order) || new Date(order.placedAt).getTime() < since) continue;
    for (const item of order.items) {
      counts.set(item.productSlug, (counts.get(item.productSlug) ?? 0) + item.quantity);
    }
  }
  return counts;
}

// Ranks by a weighted blend of real weekly signals (purchases weighted
// highest, then wishlist adds, then views). The 7-day window means the
// ranking ages out and "refreshes" continuously with no manual reset. When a
// product has no real engagement yet — the common case on a fresh browser —
// ties break on a static popularity proxy (rating weighted by review volume)
// so the shelf still reads as sensibly ordered rather than arbitrary.
// `skipOverlay` forces the same (localStorage-free) result the server sees,
// for seeding client `useState` initial values so the first client render
// matches the SSR'd HTML — see the matching comment in category-store.ts.
export function getTrendingProducts(allProducts: MockProduct[], limit = 12, skipOverlay = false): MockProduct[] {
  const engagement = skipOverlay ? new Map<string, { views: number; wishlists: number }>() : getWeeklyEventCounts();
  const purchases = skipOverlay ? new Map<string, number>() : getWeeklyPurchaseCounts();

  return allProducts
    .map((product) => {
      const events = engagement.get(product.slug) ?? { views: 0, wishlists: 0 };
      const unitsSold = purchases.get(product.slug) ?? 0;
      const score = events.views * 1 + events.wishlists * 3 + unitsSold * 5;
      const popularityProxy = product.rating * Math.log10(product.reviewCount + 1);
      return { product, score, popularityProxy };
    })
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : b.popularityProxy - a.popularityProxy))
    .slice(0, limit)
    .map((entry) => entry.product);
}
