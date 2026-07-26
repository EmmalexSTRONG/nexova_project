"use client";

import { useState } from "react";
import { Package, Search } from "lucide-react";
import { getCategoryIcon } from "@/lib/icon-map";
import type { MockProduct, MockShop } from "@/lib/data";
import { getStockStatus } from "@/lib/stock";
import { ProductImage } from "@/components/shared/product-image";
import { Price } from "@/components/shared/price";
import { ProductStatusBadge } from "@/components/marketplace/product-status-badge";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminPagination } from "./admin-pagination";

const PAGE_SIZE = 10;

export function AdminProductsContent({ products, shops }: { products: MockProduct[]; shops: MockShop[] }) {
  const [shopFilter, setShopFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const needle = query.trim().toLowerCase();
  const visible = products
    .filter((p) => shopFilter === "ALL" || p.shopSlug === shopFilter)
    .filter((p) => !needle || p.name.toLowerCase().includes(needle) || p.shopName.toLowerCase().includes(needle));

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} products listed across every shop.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              className="h-9 w-48 rounded-md border border-input bg-background pl-8 pr-2 text-sm placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={shopFilter}
            onChange={(e) => {
              setShopFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="ALL">All shops</option>
            {shops.map((shop) => (
              <option key={shop.slug} value={shop.slug}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <AdminEmptyState
          icon={Package}
          title="No products match"
          description="Try a different search term or shop filter."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Shop</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageItems.map((product) => {
                const Icon = getCategoryIcon(product.categorySlug);
                const stock = getStockStatus(product);
                return (
                  <tr key={product.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage image={product.image} seed={product.seed} icon={Icon} alt={product.name} className="h-10 w-10 shrink-0 rounded-md" iconClassName="h-1/2 w-1/2" />
                        <span className="line-clamp-2 max-w-xs font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.shopName}</td>
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
