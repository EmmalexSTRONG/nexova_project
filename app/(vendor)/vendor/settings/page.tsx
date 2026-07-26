import { getShopBySlug } from "@/lib/data";
import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorSettingsContent } from "@/components/vendor/vendor-settings-content";

export default function VendorSettingsPage() {
  const shop = getShopBySlug(DEMO_SHOP_SLUG);

  return (
    <VendorSettingsContent
      shopSlug={DEMO_SHOP_SLUG}
      defaults={{
        name: shop?.name ?? "",
        tagline: shop?.tagline ?? "",
        description: shop?.description ?? "",
        phone: shop?.phone ?? "",
        whatsapp: shop?.whatsapp ?? "",
        email: shop?.email ?? "",
      }}
    />
  );
}
