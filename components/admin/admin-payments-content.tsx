"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { getSiteOrders, getPlatformPaymentBreakdown } from "@/lib/admin/dashboard-data";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import { PAYMENT_METHOD_LABEL } from "@/lib/checkout/labels";
import type { PaymentStatus, PlacedOrder } from "@/lib/checkout/types";
import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminLoadingState } from "./admin-loading-state";

const STATUS_VARIANT: Record<PaymentStatus, "success" | "destructive" | "secondary"> = {
  SUCCESSFUL: "success",
  FAILED: "destructive",
  PENDING: "secondary",
};

export function AdminPaymentsContent() {
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
    return <AdminLoadingState label="Loading payments..." />;
  }

  const breakdown = getPlatformPaymentBreakdown(orders);
  const transactions = [...orders].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">Transactions across every payment method.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {breakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          breakdown.map((entry) => (
            <div key={entry.method} className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">{PAYMENT_METHOD_LABEL[entry.method]}</p>
              <div className="mt-1 font-mono text-xl font-bold">
                <Price amount={entry.revenue} currency={orders[0]?.currency ?? "GHS"} size="lg" />
              </div>
              <p className="text-xs text-muted-foreground">{entry.orderCount} transactions</p>
            </div>
          ))
        )}
      </div>

      {transactions.length === 0 ? (
        <AdminEmptyState icon={CreditCard} title="No transactions yet" />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((order) => (
                <tr key={order.orderNumber} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{order.paymentReference ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Price amount={order.total} currency={order.currency} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[order.paymentStatus]}>{order.paymentStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
