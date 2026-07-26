"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { getSiteOrders } from "@/lib/admin/dashboard-data";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import { PAYMENT_METHOD_LABEL } from "@/lib/checkout/labels";
import type { PlacedOrder } from "@/lib/checkout/types";
import { Price } from "@/components/shared/price";
import { OrderStatusBadge } from "@/components/checkout/order-status-badge";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminLoadingState } from "./admin-loading-state";
import { AdminPagination } from "./admin-pagination";

const PAGE_SIZE = 10;

export function AdminOrdersContent() {
  const [orders, setOrders] = useState<PlacedOrder[] | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

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
    return <AdminLoadingState label="Loading orders..." />;
  }

  const needle = query.trim().toLowerCase();
  const visible = orders.filter(
    (order) =>
      !needle ||
      order.orderNumber.toLowerCase().includes(needle) ||
      order.customerName.toLowerCase().includes(needle),
  );

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">{orders.length} orders placed across every shop.</p>
        </div>
        {orders.length > 0 && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search order # or customer..."
              className="h-9 w-56 rounded-md border border-input bg-background pl-8 pr-2 text-sm placeholder:text-muted-foreground"
            />
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <AdminEmptyState icon={ShoppingBag} title="No orders yet" />
      ) : visible.length === 0 ? (
        <AdminEmptyState icon={Search} title="No orders match" description="Try a different order number or customer name." />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Shop(s)</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageItems.map((order) => {
                const shopNames = [...new Set(order.items.map((item) => item.shopName))];
                return (
                  <tr key={order.orderNumber} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/orders/${order.orderNumber}/track`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono font-medium hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="text-xs text-muted-foreground">{new Date(order.placedAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{order.customerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{shopNames.join(", ")}</td>
                    <td className="px-4 py-3 text-muted-foreground">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</td>
                    <td className="px-4 py-3">
                      <Price amount={order.total} currency={order.currency} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <AdminPagination
            page={safePage}
            pageCount={pageCount}
            totalCount={visible.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
