"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { MockCategory, MockProduct } from "@/lib/data";
import { getProductBySlug } from "@/lib/data";
import { getVendorProductDraftBySlug } from "@/lib/vendor/product-draft-store";
import { getProductEdit } from "@/lib/vendor/product-edit-store";
import { VendorProductForm } from "@/components/vendor/vendor-product-form";
import { VendorLoadingState } from "@/components/vendor/vendor-loading-state";

type ResolvedProduct = { product: MockProduct; isDraft: boolean };

export function VendorProductEditClient({
  slug,
  shopSlug,
  shopName,
  categories,
}: {
  slug: string;
  shopSlug: string;
  shopName: string;
  categories: MockCategory[];
}) {
  const [state, setState] = useState<ResolvedProduct | null | undefined>(undefined);

  useEffect(() => {
    const draft = getVendorProductDraftBySlug(slug);
    if (draft && draft.shopSlug === shopSlug) {
      setState({ product: draft, isDraft: true });
      return;
    }

    const base = getProductBySlug(slug);
    if (base && base.shopSlug === shopSlug) {
      const edit = getProductEdit(slug);
      setState({ product: edit ? { ...base, ...edit } : base, isDraft: false });
      return;
    }

    setState(null);
  }, [slug, shopSlug]);

  if (state === undefined) {
    return <VendorLoadingState label="Loading product..." />;
  }

  if (state === null) {
    return (
      <div className="container max-w-2xl space-y-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">This product couldn&apos;t be found in your shop.</p>
        <Link
          href="/vendor/products"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl space-y-6 py-8">
      <div>
        <Link
          href="/vendor/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Edit product</h1>
        <p className="text-sm text-muted-foreground">Update the listing details for {state.product.name}.</p>
      </div>
      <VendorProductForm
        shopSlug={shopSlug}
        shopName={shopName}
        categories={categories}
        product={state.product}
        isDraft={state.isDraft}
      />
    </div>
  );
}
