"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Package, PackageMinus, PackageX, Pencil, Plus } from "lucide-react";
import type { MockProduct, getInventoryLogForShop } from "@/lib/data";
import { getStockStatus } from "@/lib/stock";
import { getCategoryIcon } from "@/lib/icon-map";
import { applyProductEdits, VENDOR_PRODUCT_EDITS_STORAGE_KEY } from "@/lib/vendor/product-edit-store";
import { ProductImage } from "@/components/shared/product-image";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { ProductStatusBadge } from "@/components/marketplace/product-status-badge";
import { VendorDraftProductsList } from "@/components/vendor/vendor-draft-products-list";

export function VendorProductsContent({
  shopSlug,
  shopName,
  initialProducts,
  inventoryEvents,
}: {
  shopSlug: string;
  shopName: string;
  initialProducts: MockProduct[];
  inventoryEvents: ReturnType<typeof getInventoryLogForShop>;
}) {
  const [products, setProducts] = useState<MockProduct[]>(initialProducts);

  useEffect(() => {
    function load() {
      setProducts(applyProductEdits(initialProducts));
    }
    load();
    function handleStorage(event: StorageEvent) {
      if (event.key === VENDOR_PRODUCT_EDITS_STORAGE_KEY || event.key === null) load();
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [initialProducts]);

  const activeCount = products.filter((p) => p.status === "ACTIVE").length;
  const lowStockCount = products.filter((p) => getStockStatus(p).tone === "sale").length;
  const outOfStockCount = products.filter((p) => getStockStatus(p).label === "Out of stock").length;

  return (
    <div className="container space-y-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Managing listings for {shopName}.</p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/vendor/products/new">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Package} label="Total listed" value={products.length} />
        <StatCard icon={ArrowUpRight} label="Active" value={activeCount} tone="text-success" />
        <StatCard icon={PackageMinus} label="Low stock" value={lowStockCount} tone="text-sale" />
        <StatCard icon={PackageX} label="Out of stock" value={outOfStockCount} tone="text-muted-foreground" />
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => {
              const stock = getStockStatus(product);
              const Icon = getCategoryIcon(product.categorySlug);
              return (
                <tr key={product.id} className="transition-colors hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        image={product.image}
                        seed={product.seed}
                        icon={Icon}
                        alt={product.name}
                        className="h-10 w-10 shrink-0 rounded-md"
                        iconClassName="h-1/2 w-1/2"
                      />
                      <span className="line-clamp-2 max-w-xs font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.sku}</td>
                  <td className="px-4 py-3">
                    <Price amount={product.price} currency={product.currency} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <span className={stock.tone === "sale" ? "font-medium text-sale" : "text-muted-foreground"}>
                      {product.stockLevel} units
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ProductStatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/vendor/products/${product.slug}/edit`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <VendorDraftProductsList shopSlug={shopSlug} />

      <div>
        <h2 className="font-display text-lg font-semibold">Recent inventory activity</h2>
        <div className="mt-3 rounded-lg border bg-card">
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
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Package;
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <Icon className={`h-4 w-4 ${tone ?? "text-muted-foreground"}`} />
      <p className={`mt-2 font-mono text-2xl font-bold ${tone ?? ""}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
