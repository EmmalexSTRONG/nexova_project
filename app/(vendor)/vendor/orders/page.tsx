import { getShopBySlug } from "@/lib/data";
import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorOrdersContent } from "@/components/vendor/vendor-orders-content";

export default function VendorOrdersPage() {
  const shop = getShopBySlug(DEMO_SHOP_SLUG);

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">Orders containing items from {shop?.name ?? "your shop"}.</p>
      </div>
      <VendorOrdersContent shopSlug={DEMO_SHOP_SLUG} />
    </div>
  );
}
