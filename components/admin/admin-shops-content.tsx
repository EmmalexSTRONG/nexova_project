"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, MapPin, Search, Store } from "lucide-react";
import { shops } from "@/lib/data";
import { shopIcon } from "@/lib/icon-map";
import { getShopStatus, setShopStatus, type ShopAdminStatus } from "@/lib/admin/shop-status-store";
import { getPinnedShopSlugs, setShopPinnedNearby } from "@/lib/admin/nearby-shops-store";
import { ProductImage } from "@/components/shared/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminEmptyState } from "./admin-empty-state";

export function AdminShopsContent() {
  const [statuses, setStatuses] = useState<Record<string, ShopAdminStatus> | null>(null);
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");

  useEffect(() => {
    const next: Record<string, ShopAdminStatus> = {};
    for (const shop of shops) next[shop.slug] = getShopStatus(shop.slug);
    setStatuses(next);
    setPinned(new Set(getPinnedShopSlugs()));
  }, []);

  function toggleStatus(shopSlug: string) {
    const next = statuses?.[shopSlug] === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    setShopStatus(shopSlug, next);
    setStatuses((current) => ({ ...current, [shopSlug]: next }));
  }

  function togglePinned(shopSlug: string) {
    const nextPinned = !pinned.has(shopSlug);
    setShopPinnedNearby(shopSlug, nextPinned);
    setPinned(new Set(getPinnedShopSlugs()));
  }

  const needle = query.trim().toLowerCase();
  const visible = shops.filter(
    (shop) => !needle || shop.name.toLowerCase().includes(needle) || shop.seller.ownerName.toLowerCase().includes(needle),
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Shops</h1>
          <p className="text-sm text-muted-foreground">{shops.length} shops selling on Nexora.</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shop or owner..."
            className="h-9 w-56 rounded-md border border-input bg-background pl-8 pr-2 text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <AdminEmptyState icon={Store} title="No shops match" description="Try a different shop or owner name." />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Shop</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((shop) => {
                const status = statuses?.[shop.slug] ?? "ACTIVE";
                return (
                  <tr key={shop.slug} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage image={shop.image} seed={shop.seed} icon={shopIcon} alt={shop.name} className="h-10 w-10 shrink-0 rounded-full" iconClassName="h-1/2 w-1/2" />
                        <div className="flex items-center gap-1.5 font-medium">
                          <Link href={`/vendors/${shop.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {shop.name}
                          </Link>
                          {shop.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-success" />}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{shop.seller.ownerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {shop.location.city}, {shop.location.region}
                    </td>
                    <td className="px-4 py-3">{shop.rating.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={status === "SUSPENDED" ? "destructive" : "success"}>
                        {status === "SUSPENDED" ? "Suspended" : "Active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant={pinned.has(shop.slug) ? "default" : "outline"}
                          className="gap-1"
                          onClick={() => togglePinned(shop.slug)}
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          {pinned.has(shop.slug) ? "Pinned" : "Pin nearby"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleStatus(shop.slug)}>
                          {status === "SUSPENDED" ? "Reactivate" : "Suspend"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
