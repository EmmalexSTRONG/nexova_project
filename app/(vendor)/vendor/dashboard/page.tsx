import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorDashboardContent } from "@/components/vendor/vendor-dashboard-content";

export default function VendorDashboardPage() {
  return <VendorDashboardContent shopSlug={DEMO_SHOP_SLUG} />;
}
