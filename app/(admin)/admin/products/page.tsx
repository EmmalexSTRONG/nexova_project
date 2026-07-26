import { products, shops } from "@/lib/data";
import { AdminProductsContent } from "@/components/admin/admin-products-content";

export default function AdminProductsPage() {
  return <AdminProductsContent products={products} shops={shops} />;
}
