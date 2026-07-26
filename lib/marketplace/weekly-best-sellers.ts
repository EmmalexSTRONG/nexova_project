import { getAllOrders } from "@/lib/checkout/order-store";
import type { PlacedOrder } from "@/lib/checkout/types";
import { shops, type MockShop } from "@/lib/data";

// Cash orders count as revenue once placed; online payments only once
// verified successful; cancelled orders never count — same rule vendor
// dashboards already use (lib/vendor/dashboard-data.ts), just aggregated
// across every shop instead of scoped to one.
function isRevenueCounted(order: PlacedOrder): boolean {
  if (order.status === "CANCELLED") return false;
  return order.paymentMethod === "CASH" || order.paymentStatus === "SUCCESSFUL";
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface ShopWeeklyStats {
  shop: MockShop;
  unitsSold: number;
  revenue: number;
  orderCount: number;
  // Whether this shop has an actual completed sale in the last 7 days, vs.
  // being backfilled by the popularity fallback below.
  hasRealSales: boolean;
}

// Ranks shops by real completed sales within a rolling 7-day window — the
// window itself ages orders out automatically, so this "resets weekly"
// without any scheduled job. Shops with no sales yet this week (the norm on
// a fresh install with no order history) are ranked after real sellers by
// their static rating, so the shelf still reads as sensibly ordered; those
// shops are flagged via `hasRealSales: false` so the UI never claims a sale
// count that didn't happen.
// `skipOverlay` forces the same (localStorage-free) result the server sees,
// for seeding client `useState` initial values so the first client render
// matches the SSR'd HTML — see the matching comment in category-store.ts.
export function getBestSellerShopsThisWeek(limit = 6, skipOverlay = false): ShopWeeklyStats[] {
  const since = Date.now() - WEEK_MS;
  const weeklyOrders = skipOverlay
    ? []
    : getAllOrders().filter((order) => isRevenueCounted(order) && new Date(order.placedAt).getTime() >= since);

  const bySlug = new Map<string, { unitsSold: number; revenue: number; orderNumbers: Set<string> }>();
  for (const order of weeklyOrders) {
    for (const item of order.items) {
      const entry = bySlug.get(item.shopSlug) ?? { unitsSold: 0, revenue: 0, orderNumbers: new Set<string>() };
      entry.unitsSold += item.quantity;
      entry.revenue += item.unitPrice * item.quantity;
      entry.orderNumbers.add(order.orderNumber);
      bySlug.set(item.shopSlug, entry);
    }
  }

  const ranked: ShopWeeklyStats[] = shops.map((shop) => {
    const stats = bySlug.get(shop.slug);
    return {
      shop,
      unitsSold: stats?.unitsSold ?? 0,
      revenue: stats?.revenue ?? 0,
      orderCount: stats?.orderNumbers.size ?? 0,
      hasRealSales: Boolean(stats),
    };
  });

  ranked.sort((a, b) => {
    if (a.hasRealSales !== b.hasRealSales) return a.hasRealSales ? -1 : 1;
    if (b.unitsSold !== a.unitsSold) return b.unitsSold - a.unitsSold;
    if (b.revenue !== a.revenue) return b.revenue - a.revenue;
    return b.shop.rating - a.shop.rating;
  });

  return ranked.slice(0, limit);
}
