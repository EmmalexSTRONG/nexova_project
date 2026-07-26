import { getVendorProducts } from "@/lib/data";
import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorNotificationsContent } from "@/components/vendor/vendor-notifications-content";

export default function VendorNotificationsPage() {
  const products = getVendorProducts(DEMO_SHOP_SLUG);
  return <VendorNotificationsContent shopSlug={DEMO_SHOP_SLUG} products={products} />;
}
