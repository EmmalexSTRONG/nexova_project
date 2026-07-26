"use client";

import { useMemo } from "react";
import { getVendorProducts } from "@/lib/data";
import type { AdPlacement } from "@/lib/advertising/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdCreativeUpload } from "./ad-creative-upload";

export interface AdCreativeValues {
  title: string;
  tagline: string;
  linkUrl: string;
  targetProductSlug?: string;
  targetProductName?: string;
  imageDataUrl?: string;
}

export function AdCreativeStep({
  placement,
  shopSlug,
  values,
  onChange,
  onContinue,
  onBack,
}: {
  placement: AdPlacement;
  shopSlug: string;
  values: AdCreativeValues;
  onChange: (values: AdCreativeValues) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const shopProducts = useMemo(() => getVendorProducts(shopSlug), [shopSlug]);
  const needsProduct = placement === "SPONSORED_PRODUCT";

  const canContinue = values.title.trim().length > 0 && (!needsProduct || Boolean(values.targetProductSlug));

  function patch(next: Partial<AdCreativeValues>) {
    onChange({ ...values, ...next });
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold">Your ad creative</h2>

      {needsProduct && (
        <div>
          <Label htmlFor="ad-target-product">Product to sponsor</Label>
          <select
            id="ad-target-product"
            value={values.targetProductSlug ?? ""}
            onChange={(e) => {
              const product = shopProducts.find((p) => p.slug === e.target.value);
              patch({
                targetProductSlug: e.target.value || undefined,
                targetProductName: product?.name,
                title: product ? product.name : values.title,
              });
            }}
            className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="" disabled>
              Select a product
            </option>
            {shopProducts.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.name}
              </option>
            ))}
          </select>
          {shopProducts.length === 0 && (
            <p className="mt-1 text-xs text-destructive">You need at least one listed product to sponsor.</p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="ad-title">{needsProduct ? "Headline" : "Title"}</Label>
        <Input
          id="ad-title"
          value={values.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder={needsProduct ? "Shown as the sponsored product name" : "e.g. Big Ankara Sale — 20% off"}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="ad-tagline">Tagline (optional)</Label>
        <Textarea
          id="ad-tagline"
          value={values.tagline}
          onChange={(e) => patch({ tagline: e.target.value })}
          placeholder="A short line shown under the title"
          rows={2}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="ad-link">Link URL</Label>
        <Input
          id="ad-link"
          value={values.linkUrl}
          onChange={(e) => patch({ linkUrl: e.target.value })}
          placeholder={needsProduct && values.targetProductSlug ? `/products/${values.targetProductSlug}` : `/vendors/${shopSlug}`}
          className="mt-1.5"
        />
        <p className="mt-1 text-xs text-muted-foreground">Where shoppers land when they click your ad.</p>
      </div>

      <div>
        <Label>Creative image</Label>
        <div className="mt-1.5">
          <AdCreativeUpload imageDataUrl={values.imageDataUrl} onChange={(imageDataUrl) => patch({ imageDataUrl })} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button disabled={!canContinue} onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
