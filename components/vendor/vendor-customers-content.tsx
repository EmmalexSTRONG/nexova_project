"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { getVendorOrders, getVendorCustomers } from "@/lib/vendor/dashboard-data";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import type { PlacedOrder } from "@/lib/checkout/types";
import { Price } from "@/components/shared/price";

export function VendorCustomersContent({ shopSlug }: { shopSlug: string }) {
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
    return <div className="container py-16 text-center text-sm text-muted-foreground">Loading customers...</div>;
  }

  const customers = getVendorCustomers(orders, shopSlug);
  const currency = orders[0]?.currency ?? "GHS";

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">{customers.length} customers have bought from your shop.</p>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
            <Users className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium">No customers yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Customers who complete a purchase from your shop will show up here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total spent</th>
                <th className="px-4 py-3 font-medium">Last order</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((customer) => (
                <tr key={customer.email}>
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {customer.email}
                    <br />
                    {customer.phone}
                  </td>
                  <td className="px-4 py-3">{customer.orderCount}</td>
                  <td className="px-4 py-3">
                    <Price amount={customer.totalSpent} currency={currency} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(customer.lastOrderAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
