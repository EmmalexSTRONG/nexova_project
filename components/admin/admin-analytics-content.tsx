"use client";

import { useEffect, useState } from "react";
import {
  getSiteOrders,
  getPlatformRevenueByDay,
  getTopShops,
  getTopProductsSiteWide,
} from "@/lib/admin/dashboard-data";
import { categories } from "@/lib/data";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import type { PlacedOrder } from "@/lib/checkout/types";
import { Price } from "@/components/shared/price";
import { AdminLoadingState } from "./admin-loading-state";

export function AdminAnalyticsContent() {
  const [orders, setOrders] = useState<PlacedOrder[] | undefined>(undefined);

  useEffect(() => {
    function load() {
      setOrders(getSiteOrders());
    }
    load();
    function handleStorage(event: StorageEvent) {
      if (event.key === ORDERS_STORAGE_KEY || event.key === null) load();
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (orders === undefined) {
    return <AdminLoadingState label="Loading analytics..." />;
  }

  const byDay = getPlatformRevenueByDay(orders, 7);
  const topShops = getTopShops(orders, 5);
  const topProducts = getTopProductsSiteWide(orders, 5);
  const maxDayRevenue = Math.max(...byDay.map((d) => d.revenue), 1);
  const currency = orders[0]?.currency ?? "GHS";

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Platform-wide performance across every shop.</p>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h2 className="mb-4 font-display text-sm font-semibold">Revenue — last 7 days</h2>
        <div className="flex h-40 items-end gap-3">
          {byDay.map((day) => (
            <div key={day.dateLabel} className="group flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">{day.revenue > 0 ? day.revenue.toFixed(0) : ""}</span>
              <div
                title={`${day.dateLabel}: ${currency} ${day.revenue.toFixed(2)}`}
                className="gold-gradient w-full rounded-t opacity-80 transition-opacity group-hover:opacity-100"
                style={{ height: `${Math.max((day.revenue / maxDayRevenue) * 100, day.revenue > 0 ? 4 : 1)}%` }}
              />
              <span className="text-[10px] text-muted-foreground">{day.dateLabel}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 font-display text-sm font-semibold">Top shops</h2>
          {topShops.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <ol className="space-y-0.5 text-sm">
              {topShops.map((shop, index) => (
                <li
                  key={shop.shopSlug}
                  className="flex items-center justify-between rounded-md px-1 py-1.5 transition-colors hover:bg-accent/50"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="w-4 shrink-0 font-mono text-xs text-muted-foreground">{index + 1}</span>
                    {shop.shopName}
                  </span>
                  <Price amount={shop.revenue} currency={currency} size="sm" />
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 font-display text-sm font-semibold">Top products</h2>
          {topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <ol className="space-y-0.5 text-sm">
              {topProducts.map((product, index) => (
                <li
                  key={product.productSlug}
                  className="flex items-center justify-between rounded-md px-1 py-1.5 transition-colors hover:bg-accent/50"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="w-4 shrink-0 font-mono text-xs text-muted-foreground">{index + 1}</span>
                    {product.name}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{product.quantitySold} sold</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 font-display text-sm font-semibold">Categories</h2>
          <ul className="space-y-0.5 text-sm">
            {categories.map((category) => (
              <li
                key={category.slug}
                className="flex items-center justify-between rounded-md px-1 py-1.5 transition-colors hover:bg-accent/50"
              >
                <span className="truncate">{category.name}</span>
                <span className="text-muted-foreground">{category.productCount} products</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
