"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Boxes,
  Megaphone,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { getVendorProducts, getShopBySlug } from "@/lib/data";
import { getStockStatus } from "@/lib/stock";
import {
  getVendorOrders,
  getVendorSalesSummary,
  getVendorCustomers,
  getVendorRevenueByDay,
  getVendorTopProducts,
  type VendorDayRevenue,
} from "@/lib/vendor/dashboard-data";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import type { PlacedOrder } from "@/lib/checkout/types";
import { Price } from "@/components/shared/price";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/checkout/order-status-badge";
import { VendorLoadingState } from "./vendor-loading-state";
import { cn } from "@/lib/utils";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function VendorDashboardContent({ shopSlug }: { shopSlug: string }) {
  const [orders, setOrders] = useState<PlacedOrder[] | undefined>(undefined);
  const shop = getShopBySlug(shopSlug);
  const products = getVendorProducts(shopSlug);
  const lowStockProducts = products.filter((p) => {
    const stock = getStockStatus(p);
    return stock.purchasable && stock.tone === "sale";
  });

  useEffect(() => {
    function load() {
      setOrders(getVendorOrders(shopSlug));
    }
    load();
    function handleStorage(event: StorageEvent) {
      if (event.key === ORDERS_STORAGE_KEY || event.key === null) load();
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [shopSlug]);

  const summary = useMemo(() => getVendorSalesSummary(orders ?? [], shopSlug), [orders, shopSlug]);
  const customers = useMemo(() => getVendorCustomers(orders ?? [], shopSlug), [orders, shopSlug]);
  const revenueByDay = useMemo(() => getVendorRevenueByDay(orders ?? [], shopSlug), [orders, shopSlug]);
  const topProducts = useMemo(() => getVendorTopProducts(orders ?? [], shopSlug, 5), [orders, shopSlug]);
  const recentOrders = useMemo(() => (orders ?? []).slice(0, 5), [orders]);

  if (orders === undefined) {
    return <VendorLoadingState label="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="relative overflow-hidden bg-ink px-6 py-8 text-ink-foreground">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #f0a93c 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #f0a93c 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 h-px gold-gradient opacity-60" aria-hidden="true" />

        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="tag-notch inline-flex items-center gap-1.5 bg-primary px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              {getGreeting()}
            </span>
            <h1 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {shop?.name ?? "Your shop"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-muted">
              {shop && <StarRating rating={shop.rating} tone="inverted" />}
              {shop?.verified && (
                <span className="flex items-center gap-1 text-success">
                  <BadgeCheck className="h-4 w-4" />
                  Verified seller
                </span>
              )}
              {shop && <span>{shop.followers.toLocaleString()} followers</span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg">
              <Link href="/vendor/products/new">
                <Plus className="h-4 w-4" />
                Add product
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-ink-border bg-transparent text-ink-foreground hover:bg-ink-border hover:text-ink-foreground"
            >
              <Link href={`/vendors/${shopSlug}`} target="_blank" rel="noopener noreferrer">
                View storefront
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container space-y-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            icon={ArrowUpRight}
            label="Total revenue"
            value={<Price amount={summary.totalRevenue} currency={summary.currency} size="lg" />}
            tone="text-primary"
            accent
            footer={<RevenueSparkline data={revenueByDay} currency={summary.currency} />}
          />
          <KpiCard icon={ShoppingBag} label="Orders" value={summary.orderCount} />
          <KpiCard icon={Package} label="Products listed" value={products.length} />
          <KpiCard icon={Users} label="Customers" value={customers.length} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickAction href="/vendor/products/new" icon={Plus} label="Add product" />
          <QuickAction href="/vendor/inventory" icon={Boxes} label="Manage inventory" />
          <QuickAction href="/vendor/orders" icon={ShoppingBag} label="View orders" />
          <QuickAction href="/vendor/advertising" icon={Megaphone} label="Promote shop" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-5 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold">Recent orders</h2>
              <Link href="/vendor/orders" className="text-xs font-medium text-primary hover:underline">
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
                <h2 className="font-display text-sm font-semibold">Top products</h2>
                <Link href="/vendor/analytics" className="text-xs font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
              {topProducts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No sales yet.</p>
              ) : (
                <div className="space-y-0.5">
                  {topProducts.map((product) => (
                    <div
                      key={product.productSlug}
                      className="flex items-center justify-between rounded-md px-1 py-1.5 text-sm transition-colors hover:bg-accent/50"
                    >
                      <span className="truncate">{product.name}</span>
                      <Price amount={product.revenue} currency={summary.currency} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold">Low stock</h2>
                <Link href="/vendor/inventory" className="text-xs font-medium text-primary hover:underline">
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
    </div>
  );
}

function RevenueSparkline({ data, currency }: { data: VendorDayRevenue[]; currency: string }) {
  const max = Math.max(1, ...data.map((day) => day.revenue));
  return (
    <div className="mt-3 flex h-8 items-end gap-1" aria-hidden="true">
      {data.map((day) => (
        <div
          key={day.dateLabel}
          title={`${day.dateLabel}: ${currency} ${day.revenue.toLocaleString()}`}
          className="flex-1 rounded-sm bg-gradient-to-t from-primary/70 to-primary/25"
          style={{ height: `${Math.max(4, (day.revenue / max) * 32)}px` }}
        />
      ))}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Plus;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
  accent,
  footer,
}: {
  icon: typeof ArrowUpRight;
  label: string;
  value: React.ReactNode;
  tone?: string;
  accent?: boolean;
  footer?: React.ReactNode;
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
      {footer}
    </div>
  );
}
