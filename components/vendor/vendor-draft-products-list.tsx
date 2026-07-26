"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import type { MockProduct } from "@/lib/data";
import { getVendorProductDrafts, VENDOR_PRODUCT_DRAFTS_STORAGE_KEY } from "@/lib/vendor/product-draft-store";
import { getCategoryIcon } from "@/lib/icon-map";
import { ProductImage } from "@/components/shared/product-image";
import { Price } from "@/components/shared/price";
import { ProductStatusBadge } from "@/components/marketplace/product-status-badge";

export function VendorDraftProductsList({ shopSlug }: { shopSlug: string }) {
  const [drafts, setDrafts] = useState<MockProduct[]>([]);

  useEffect(() => {
    function load() {
      setDrafts(getVendorProductDrafts(shopSlug));
    }
    load();

    function handleStorage(event: StorageEvent) {
      if (event.key === VENDOR_PRODUCT_DRAFTS_STORAGE_KEY || event.key === null) load();
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [shopSlug]);

  if (drafts.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Recently added by you</h2>
      <p className="text-xs text-muted-foreground">
        Saved on this device — added outside the seed catalog.
      </p>
      <div className="mt-3 overflow-x-auto rounded-lg border bg-card">
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
            {drafts.map((product) => {
              const Icon = getCategoryIcon(product.categorySlug);
              return (
                <tr key={product.id} className="transition-colors hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductImage image={product.image} seed={product.seed} icon={Icon} alt={product.name} className="h-10 w-10 shrink-0 rounded-md" iconClassName="h-1/2 w-1/2" />
                      <span className="line-clamp-2 max-w-xs font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.sku}</td>
                  <td className="px-4 py-3">
                    <Price amount={product.price} currency={product.currency} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{product.stockLevel} units</td>
                  <td className="px-4 py-3">
                    <ProductStatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/vendor/products/${product.slug}/edit`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
