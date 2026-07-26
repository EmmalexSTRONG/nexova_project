"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { products, shops } from "@/lib/data";
import { getSiteOrders, getPlatformSalesSummary, getPlatformCustomers, getVendorUsers } from "@/lib/admin/dashboard-data";
import { ORDERS_STORAGE_KEY } from "@/lib/checkout/order-store";
import { PAYMENT_METHOD_LABEL } from "@/lib/checkout/labels";
import { ORDER_STATUS_LABEL } from "@/lib/checkout/order-status";
import { toCsv, downloadCsv } from "@/lib/vendor/csv";
import { getStockStatus } from "@/lib/stock";
import type { PlacedOrder } from "@/lib/checkout/types";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";

export function AdminReportsContent() {
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

  const summary = orders ? getPlatformSalesSummary(orders) : null;
  const customers = orders ? getPlatformCustomers(orders) : [];

  function exportOrders() {
    if (!orders) return;
    const rows = orders.map((order) => ({
      "Order number": order.orderNumber,
      "Date placed": new Date(order.placedAt).toISOString(),
      Customer: order.customerName,
      Email: order.customerEmail,
      Shops: [...new Set(order.items.map((i) => i.shopName))].join("; "),
      Status: ORDER_STATUS_LABEL[order.status],
      "Payment method": PAYMENT_METHOD_LABEL[order.paymentMethod],
      "Payment status": order.paymentStatus,
      Total: order.total,
      Currency: order.currency,
    }));
    downloadCsv("nexora-orders.csv", toCsv(rows));
  }

  function exportProducts() {
    const rows = products.map((product) => ({
      Name: product.name,
      Shop: product.shopName,
      SKU: product.sku,
      Price: product.price,
      "Stock level": product.stockLevel,
      Status: getStockStatus(product).label,
      Rating: product.rating,
    }));
    downloadCsv("nexora-products.csv", toCsv(rows));
  }

  function exportUsers() {
    const vendorRows = getVendorUsers().map((v) => ({
      Name: v.name,
      Email: v.email,
      Role: "VENDOR",
      Detail: v.shopName,
    }));
    const customerRows = customers.map((c) => ({
      Name: c.name,
      Email: c.email,
      Role: "CUSTOMER",
      Detail: `${c.orderCount} orders`,
    }));
    downloadCsv("nexora-users.csv", toCsv([...vendorRows, ...customerRows]));
  }

  function exportShops() {
    const rows = shops.map((shop) => ({
      Name: shop.name,
      Owner: shop.seller.ownerName,
      City: shop.location.city,
      Region: shop.location.region,
      Rating: shop.rating,
      Verified: shop.verified ? "Yes" : "No",
    }));
    downloadCsv("nexora-shops.csv", toCsv(rows));
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Download platform-wide data as CSV files.</p>
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
          <p className="text-xs text-muted-foreground">Shops</p>
          <p className="mt-1 font-mono text-xl font-bold">{shops.length}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportCard title="Orders" description="Every order across every shop." onExport={exportOrders} disabled={!orders} />
        <ReportCard title="Products" description="The full catalogue across every shop." onExport={exportProducts} />
        <ReportCard title="Users" description="Vendors and customers who've used the platform." onExport={exportUsers} disabled={!orders} />
        <ReportCard title="Shops" description="Every shop and its owner." onExport={exportShops} />
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
