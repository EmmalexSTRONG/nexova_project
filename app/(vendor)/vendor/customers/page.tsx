import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorCustomersContent } from "@/components/vendor/vendor-customers-content";

export default function VendorCustomersPage() {
  return <VendorCustomersContent shopSlug={DEMO_SHOP_SLUG} />;
}
