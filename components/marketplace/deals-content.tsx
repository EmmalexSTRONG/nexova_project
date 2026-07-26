"use client";

import { useState } from "react";
import { getVisibleProducts, type MockProduct } from "@/lib/data";
import { FLASH_SALE_CAMPAIGNS_STORAGE_KEY, getEffectiveFlashSaleProducts } from "@/lib/admin/flash-sale-store";
import { LIVE_REFRESH_FAST_MS, useLiveRefresh } from "@/lib/shared/use-live-refresh";
import { usePagedList } from "@/lib/shared/use-paged-list";
import { ProductCard } from "@/components/marketplace/product-card";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 16;

export function DealsContent() {
  // Safe during SSR too: the campaign store's localStorage read is a no-op
  // on the server, so this degrades to the same static list either way —
  // but on the client it avoids a one-frame flash when a campaign is live.
  const [deals, setDeals] = useState<MockProduct[]>(() => getEffectiveFlashSaleProducts(getVisibleProducts(), true));

  useLiveRefresh(
    () => setDeals(getEffectiveFlashSaleProducts(getVisibleProducts())),
    [FLASH_SALE_CAMPAIGNS_STORAGE_KEY],
    LIVE_REFRESH_FAST_MS,
  );

  const { visible, hasMore, loadMore, announcement } = usePagedList(deals, PAGE_SIZE);

  return (
    <>
      <p className="mt-1 text-sm text-muted-foreground">{deals.length} deals live now — while stock lasts.</p>
      {deals.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={loadMore}>
                Load more
              </Button>
            </div>
          )}
          <span className="sr-only" role="status" aria-live="polite">
            {announcement}
          </span>
        </>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">No flash sales running right now — check back soon.</p>
      )}
    </>
  );
}
