import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getShopBySlug } from "@/lib/data";
import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorAdvertisingContent } from "@/components/vendor/vendor-advertising-content";
import { Button } from "@/components/ui/button";

export default function VendorAdvertisingPage() {
  const shop = getShopBySlug(DEMO_SHOP_SLUG);

  return (
    <div className="container space-y-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Advertising</h1>
          <p className="text-sm text-muted-foreground">
            Paid placements purchased for {shop?.name ?? "your shop"}.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/vendor/advertising/new">
            <PlusCircle className="h-4 w-4" />
            Buy an ad
          </Link>
        </Button>
      </div>
      <VendorAdvertisingContent shopSlug={DEMO_SHOP_SLUG} />
    </div>
  );
}
