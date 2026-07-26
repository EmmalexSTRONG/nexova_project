import { auth } from "@/lib/auth/config";
import { getShopBySlug } from "@/lib/data";
import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { AdPurchaseWizard } from "@/components/advertising/ad-purchase-wizard";

export default async function NewVendorAdvertisingPage() {
  const session = await auth();
  const shop = getShopBySlug(DEMO_SHOP_SLUG);

  return (
    <AdPurchaseWizard
      shopSlug={DEMO_SHOP_SLUG}
      shopName={shop?.name ?? "Your shop"}
      defaultName={session?.user?.name ?? undefined}
      defaultEmail={session?.user?.email ?? undefined}
    />
  );
}
