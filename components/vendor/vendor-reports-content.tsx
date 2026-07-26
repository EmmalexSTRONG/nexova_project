"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { getVendorOrders, getVendorSalesSummary, getVendorCustomers } from "@/lib/vendor/dashboard-data";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import { PAYMENT_METHOD_LABEL } from "@/lib/checkout/labels";
import { ORDER_STATUS_LABEL } from "@/lib/checkout/order-status";
import { toCsv, downloadCsv } from "@/lib/vendor/csv";
import type { PlacedOrder } from "@/lib/checkout/types";
import type { MockProduct } from "@/lib/data";
import { getStockStatus } from "@/lib/stock";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";

export function VendorReportsContent({ shopSlug, products }: { shopSlug: string; products: MockProduct[] }) {
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

  const summary = orders ? getVendorSalesSummary(orders, shopSlug) : null;
  const customers = orders ? getVendorCustomers(orders, shopSlug) : [];

  function exportOrders() {
    if (!orders) return;
    const rows = orders.map((order) => ({
      "Order number": order.orderNumber,
      "Date placed": new Date(order.placedAt).toISOString(),
      Customer: order.customerName,
      Email: order.customerEmail,
      Status: ORDER_STATUS_LABEL[order.status],
      "Payment method": PAYMENT_METHOD_LABEL[order.paymentMethod],
      "Payment status": order.paymentStatus,
      Total: order.total,
      Currency: order.currency,
    }));
    downloadCsv(`${shopSlug}-orders.csv`, toCsv(rows));
  }

  function exportProducts() {
    const rows = products.map((product) => ({
      Name: product.name,
      SKU: product.sku,
      Price: product.price,
      "Stock level": product.stockLevel,
      Status: getStockStatus(product).label,
      Rating: product.rating,
      Reviews: product.reviewCount,
    }));
    downloadCsv(`${shopSlug}-products.csv`, toCsv(rows));
  }

  function exportCustomers() {
    const rows = customers.map((customer) => ({
      Name: customer.name,
      Email: customer.email,
      Phone: customer.phone,
      Orders: customer.orderCount,
      "Total spent": customer.totalSpent,
      "Last order": new Date(customer.lastOrderAt).toISOString(),
    }));
    downloadCsv(`${shopSlug}-customers.csv`, toCsv(rows));
  }

  return (
    <div className="container space-y-8 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Download your shop data as CSV files.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total revenue</p>
          <div className="mt-1 font-mono text-xl font-bold">
            {summary ? <Price amount={summary.totalRevenue} currency={summary.currency} size="lg" /> : "—"}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Orders</p>
          <p className="mt-1 font-mono text-xl font-bold">{summary?.orderCount ?? "—"}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Customers</p>
          <p className="mt-1 font-mono text-xl font-bold">{customers.length}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ReportCard
          title="Orders report"
          description="Every order containing your products, with status and payment details."
          onExport={exportOrders}
          disabled={!orders}
        />
        <ReportCard
          title="Products report"
          description="Your full product catalogue with pricing, stock, and ratings."
          onExport={exportProducts}
        />
        <ReportCard
          title="Customers report"
          description="Customers who've bought from you, with spend and order counts."
          onExport={exportCustomers}
          disabled={!orders}
        />
      </div>
    </div>
  );
}

function ReportCard({
  title,
  description,
  onExport,
  disabled,
}: {
  title: string;
  description: string;
  onExport: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-lg border bg-card p-5">
      <h2 className="font-display text-sm font-semibold">{title}</h2>
      <p className="mt-1 flex-1 text-xs text-muted-foreground">{description}</p>
      <Button size="sm" variant="outline" className="mt-4 gap-1.5" onClick={onExport} disabled={disabled}>
        <Download className="h-3.5 w-3.5" />
        Export CSV
      </Button>
    </div>
  );
}
