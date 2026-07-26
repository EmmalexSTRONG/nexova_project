"use client";

import { useEffect, useState } from "react";
import {
  getVendorOrders,
  getVendorSalesSummary,
  getVendorRevenueByDay,
  getVendorTopProducts,
  getVendorPaymentBreakdown,
} from "@/lib/vendor/dashboard-data";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import { PAYMENT_METHOD_LABEL } from "@/lib/checkout/labels";
import type { PlacedOrder } from "@/lib/checkout/types";
import { Price } from "@/components/shared/price";

export function VendorSalesContent({ shopSlug }: { shopSlug: string }) {
  const [orders, setOrders] = useState<PlacedOrder[] | undefined>(undefined);

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

  if (orders === undefined) {
    return <div className="container py-16 text-center text-sm text-muted-foreground">Loading sales...</div>;
  }

  const summary = getVendorSalesSummary(orders, shopSlug);
  const byDay = getVendorRevenueByDay(orders, shopSlug, 7);
  const topProducts = getVendorTopProducts(orders, shopSlug, 5);
  const paymentBreakdown = getVendorPaymentBreakdown(orders, shopSlug);
  const maxDayRevenue = Math.max(...byDay.map((d) => d.revenue), 1);

  return (
    <div className="container space-y-8 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Sales</h1>
        <p className="text-sm text-muted-foreground">Revenue and order performance for your shop.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total revenue" value={<Price amount={summary.totalRevenue} currency={summary.currency} size="lg" />} />
        <SummaryCard label="Orders" value={summary.orderCount} />
        <SummaryCard label="Average order value" value={<Price amount={summary.averageOrderValue} currency={summary.currency} size="lg" />} />
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h2 className="mb-4 font-display text-sm font-semibold">Revenue — last 7 days</h2>
        <div className="flex h-40 items-end gap-3">
          {byDay.map((day) => (
            <div key={day.dateLabel} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">
                {day.revenue > 0 ? day.revenue.toFixed(0) : ""}
              </span>
              <div
                className="w-full rounded-t bg-primary/80 transition-all"
                style={{ height: `${Math.max((day.revenue / maxDayRevenue) * 100, day.revenue > 0 ? 4 : 1)}%` }}
              />
              <span className="text-[10px] text-muted-foreground">{day.dateLabel}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 font-display text-sm font-semibold">Top products</h2>
          {topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <div className="divide-y">
              {topProducts.map((product) => (
                <div key={product.productSlug} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.quantitySold} sold</p>
                  </div>
                  <Price amount={product.revenue} currency={summary.currency} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 font-display text-sm font-semibold">By payment method</h2>
          {paymentBreakdown.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {paymentBreakdown.map((entry) => (
                <div key={entry.method}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{PAYMENT_METHOD_LABEL[entry.method]}</span>
                    <span className="text-muted-foreground">{entry.orderCount} orders</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(entry.revenue / summary.totalRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 font-mono text-xl font-bold">{value}</div>
    </div>
  );
}
