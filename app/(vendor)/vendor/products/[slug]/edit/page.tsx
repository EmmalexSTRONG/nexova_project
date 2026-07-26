import type { Metadata } from "next";
import { categories, getShopBySlug } from "@/lib/data";
import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorProductEditClient } from "@/components/vendor/vendor-product-edit-client";

export const metadata: Metadata = {
  title: "Edit product — Nexora",
};

export default async function VendorEditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = getShopBySlug(DEMO_SHOP_SLUG);

  return (
    <VendorProductEditClient
      slug={slug}
      shopSlug={DEMO_SHOP_SLUG}
      shopName={shop?.name ?? "Your shop"}
      categories={categories}
    />
  );
}
