import { getVendorProducts } from "@/lib/data";
import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorReportsContent } from "@/components/vendor/vendor-reports-content";

export default function VendorReportsPage() {
  const products = getVendorProducts(DEMO_SHOP_SLUG);
  return <VendorReportsContent shopSlug={DEMO_SHOP_SLUG} products={products} />;
}
