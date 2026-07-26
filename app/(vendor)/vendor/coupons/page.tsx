import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorCouponsContent } from "@/components/vendor/vendor-coupons-content";

export default function VendorCouponsPage() {
  return <VendorCouponsContent shopSlug={DEMO_SHOP_SLUG} />;
}
