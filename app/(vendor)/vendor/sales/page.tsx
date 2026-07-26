import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorSalesContent } from "@/components/vendor/vendor-sales-content";

export default function VendorSalesPage() {
  return <VendorSalesContent shopSlug={DEMO_SHOP_SLUG} />;
}
