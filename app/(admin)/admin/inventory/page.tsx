import { products, inventoryLog } from "@/lib/data";
import { VendorInventoryContent } from "@/components/vendor/vendor-inventory-content";

export default function AdminInventoryPage() {
  return <VendorInventoryContent products={products} inventoryEvents={inventoryLog} />;
}
