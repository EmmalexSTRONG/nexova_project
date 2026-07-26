import { getVendorProducts, getInventoryLogForShop, getShopBySlug } from "@/lib/data";
import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorProductsContent } from "@/components/vendor/vendor-products-content";

export default function VendorProductsPage() {
  const shop = getShopBySlug(DEMO_SHOP_SLUG);
  const shopProducts = getVendorProducts(DEMO_SHOP_SLUG);
  const inventoryEvents = getInventoryLogForShop(shopProducts.map((p) => p.slug));

  return (
    <VendorProductsContent
      shopSlug={DEMO_SHOP_SLUG}
      shopName={shop?.name ?? "your shop"}
      initialProducts={shopProducts}
      inventoryEvents={inventoryEvents}
    />
  );
}
