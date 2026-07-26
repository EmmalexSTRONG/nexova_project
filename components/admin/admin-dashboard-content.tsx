"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Package, ShoppingBag, Store, Users } from "lucide-react";
import { products, shops } from "@/lib/data";
import { getStockStatus } from "@/lib/stock";
import { getSiteOrders, getPlatformSalesSummary, getPlatformCustomers, getTopShops } from "@/lib/admin/dashboard-data";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import type { PlacedOrder } from "@/lib/checkout/types";
import { Price } from "@/components/shared/price";
import { OrderStatusBadge } from "@/components/checkout/order-status-badge";
import { AdminLoadingState } from "./admin-loading-state";
import { cn } from "@/lib/utils";

export function AdminDashboardContent() {
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

  const lowStockProducts = products.filter((p) => {
    const stock = getStockStatus(p);
    return stock.purchasable && stock.tone === "sale";
  });

  // Each of these does its own filter/reduce pass over the full order list —
  // memoized so an unrelated parent re-render doesn't recompute them for
  // nothing. Hooks must run unconditionally, so these sit above the
  // loading-state early return below rather than after it.
  const summary = useMemo(() => getPlatformSalesSummary(orders ?? []), [orders]);
  const customers = useMemo(() => getPlatformCustomers(orders ?? []), [orders]);
  const topShops = useMemo(() => getTopShops(orders ?? [], 5), [orders]);
  const recentOrders = useMemo(
    () => [...(orders ?? [])].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()).slice(0, 5),
    [orders],
  );

  if (orders === undefined) {
    return <AdminLoadingState label="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform-wide overview across every shop.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          icon={ArrowUpRight}
          label="Total revenue"
          value={<Price amount={summary.totalRevenue} currency={summary.currency} size="lg" />}
          tone="text-primary"
          accent
        />
        <KpiCard icon={ShoppingBag} label="Orders" value={summary.orderCount} />
        <KpiCard icon={Store} label="Shops" value={shops.length} />
        <KpiCard icon={Package} label="Products" value={products.length} />
        <KpiCard icon={Users} label="Customers" value={customers.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="divide-y">
              {recentOrders.map((order) => (
                <Link
                  key={order.orderNumber}
                  href={`/orders/${order.orderNumber}/track`}
                  className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-accent/50"
                >
                  <div>
                    <p className="font-mono font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.customerName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Price amount={order.total} currency={order.currency} size="sm" />
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold">Top shops</h2>
              <Link href="/admin/vendors" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            {topShops.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              <div className="space-y-0.5">
                {topShops.map((shop) => (
                  <div
                    key={shop.shopSlug}
                    className="flex items-center justify-between rounded-md px-1 py-1.5 text-sm transition-colors hover:bg-accent/50"
                  >
                    <span className="truncate">{shop.shopName}</span>
                    <Price amount={shop.revenue} currency={summary.currency} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold">Low stock</h2>
              <Link href="/admin/inventory" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Nothing running low.</p>
            ) : (
              <div className="space-y-0.5">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.slug}
                    className="flex items-center gap-2 rounded-md px-1 py-1.5 text-sm transition-colors hover:bg-accent/50"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-sale" />
                    <span className="flex-1 truncate">{product.name}</span>
                    <span className="shrink-0 font-medium text-sale">{product.stockLevel} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
  accent,
}: {
  icon: typeof ArrowUpRight;
  label: string;
  value: React.ReactNode;
  tone?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "tag-notch relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md",
        accent && "border-primary/30",
      )}
    >
      <span className="gold-gradient absolute inset-x-0 top-0 h-0.5" aria-hidden="true" />
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full",
          accent ? "gold-gradient" : "bg-accent",
        )}
      >
        <Icon className={cn("h-4 w-4", accent ? "text-primary-foreground" : "text-muted-foreground")} />
      </span>
      <div className={cn("mt-3 font-mono text-xl font-bold", tone)}>{value}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
