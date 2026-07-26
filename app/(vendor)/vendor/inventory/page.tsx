import { getVendorProducts, getInventoryLogForShop } from "@/lib/data";
import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorInventoryContent } from "@/components/vendor/vendor-inventory-content";

export default function VendorInventoryPage() {
  const products = getVendorProducts(DEMO_SHOP_SLUG);
  const inventoryEvents = getInventoryLogForShop(products.map((p) => p.slug));

  return <VendorInventoryContent products={products} inventoryEvents={inventoryEvents} />;
}
