import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { categories, getShopBySlug } from "@/lib/data";
import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorProductForm } from "@/components/vendor/vendor-product-form";

export const metadata: Metadata = {
  title: "Add product — Nexora",
};

export default function VendorNewProductPage() {
  const shop = getShopBySlug(DEMO_SHOP_SLUG);

  return (
    <div className="container max-w-2xl space-y-6 py-8">
      <div>
        <Link href="/vendor/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Add product</h1>
        <p className="text-sm text-muted-foreground">List a new product for {shop?.name ?? "your shop"}.</p>
      </div>
      <VendorProductForm shopSlug={DEMO_SHOP_SLUG} shopName={shop?.name ?? "Your shop"} categories={categories} />
    </div>
  );
}
