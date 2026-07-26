import { getShopBySlug } from "@/lib/data";
import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorReviewsContent } from "@/components/vendor/vendor-reviews-content";

export default function VendorReviewsPage() {
  const shop = getShopBySlug(DEMO_SHOP_SLUG);

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Product reviews left by customers of {shop?.name ?? "your shop"}. Reply to build trust with future buyers.
        </p>
      </div>
      <VendorReviewsContent shopSlug={DEMO_SHOP_SLUG} shopName={shop?.name ?? "Your shop"} />
    </div>
  );
}
