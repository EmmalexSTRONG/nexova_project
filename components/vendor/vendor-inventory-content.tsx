"use client";

import { useState } from "react";
import { getStockStatus } from "@/lib/stock";
import { getCategoryIcon } from "@/lib/icon-map";
import type { InventoryLogEntry, MockProduct } from "@/lib/data";
import { ProductImage } from "@/components/shared/product-image";
import { cn } from "@/lib/utils";

type Filter = "ALL" | "LOW" | "OUT";

export function VendorInventoryContent({ products, inventoryEvents }: { products: MockProduct[]; inventoryEvents: InventoryLogEntry[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");

  const withStock = products.map((product) => ({ product, stock: getStockStatus(product) }));
  const lowStock = withStock.filter((p) => p.stock.purchasable && p.stock.tone === "sale");
  const outOfStock = withStock.filter((p) => p.stock.label === "Out of stock");

  const visible =
    filter === "LOW" ? lowStock : filter === "OUT" ? outOfStock : withStock;

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground">Stock levels across all your listings.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Total products" value={products.length} active={filter === "ALL"} onClick={() => setFilter("ALL")} />
        <SummaryCard label="Low stock" value={lowStock.length} tone="text-sale" active={filter === "LOW"} onClick={() => setFilter("LOW")} />
        <SummaryCard label="Out of stock" value={outOfStock.length} tone="text-muted-foreground" active={filter === "OUT"} onClick={() => setFilter("OUT")} />
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Stock level</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Nothing to show here.
                </td>
              </tr>
            ) : (
              visible.map(({ product, stock }) => {
                const Icon = getCategoryIcon(product.categorySlug);
                return (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage image={product.image} seed={product.seed} icon={Icon} alt={product.name} className="h-10 w-10 shrink-0 rounded-md" iconClassName="h-1/2 w-1/2" />
                        <span className="line-clamp-2 max-w-xs font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.sku}</td>
                    <td className="px-4 py-3">{product.stockLevel} units</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          stock.tone === "success" && "text-success",
                          stock.tone === "sale" && "text-sale",
                          stock.tone === "muted" && "text-muted-foreground",
                        )}
                      >
                        {stock.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold">Recent stock activity</h2>
        <div className="mt-3 rounded-lg border bg-card">
          {inventoryEvents.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No inventory activity recorded.</p>
          ) : (
            <ul className="divide-y text-sm">
              {inventoryEvents.map((event) => {
                const product = products.find((p) => p.slug === event.productSlug);
                return (
                  <li key={event.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <p className="font-medium">{product?.name ?? event.productSlug}</p>
                      <p className="text-xs text-muted-foreground">{event.note}</p>
                    </div>
                    <div className="text-right">
                      {event.quantityDelta !== 0 && (
                        <p className={`font-mono text-sm font-semibold ${event.quantityDelta > 0 ? "text-success" : "text-sale"}`}>
                          {event.quantityDelta > 0 ? "+" : ""}
                          {event.quantityDelta}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">{event.occurredAtLabel}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("rounded-lg border bg-card p-4 text-left transition-colors", active ? "border-primary bg-accent" : "hover:bg-accent/50")}
    >
      <p className={`font-mono text-2xl font-bold ${tone ?? ""}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </button>
  );
}
