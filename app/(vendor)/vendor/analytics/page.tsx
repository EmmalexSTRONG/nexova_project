import { getVendorProducts, getShopRatingBreakdown, getShopBySlug } from "@/lib/data";
import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorAnalyticsContent } from "@/components/vendor/vendor-analytics-content";

export default function VendorAnalyticsPage() {
  const shop = getShopBySlug(DEMO_SHOP_SLUG);
  const products = getVendorProducts(DEMO_SHOP_SLUG);
  const { total, counts } = getShopRatingBreakdown(DEMO_SHOP_SLUG);

  return (
    <VendorAnalyticsContent
      shopSlug={DEMO_SHOP_SLUG}
      products={products}
      rating={shop?.rating ?? 0}
      ratingTotal={total}
      ratingCounts={counts}
    />
  );
}
