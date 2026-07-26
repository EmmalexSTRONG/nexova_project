"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { MockCategory, MockProduct } from "@/lib/data";
import { addVendorProductDraft, updateVendorProductDraft } from "@/lib/vendor/product-draft-store";
import { saveProductEdit } from "@/lib/vendor/product-edit-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VendorMainPhotoUpload, VendorGalleryPhotoUpload } from "@/components/vendor/vendor-product-photo-upload";

const SELECT_CLASSNAME =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function VendorProductForm({
  shopSlug,
  shopName,
  categories,
  product,
  isDraft = false,
}: {
  shopSlug: string;
  shopName: string;
  categories: MockCategory[];
  product?: MockProduct;
  isDraft?: boolean;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mainPhoto, setMainPhoto] = useState<string | undefined>(product?.image);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(product?.galleryImages ?? []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const categorySlug = String(formData.get("categorySlug") ?? "");
    const brand = String(formData.get("brand") ?? "").trim();
    const sku = String(formData.get("sku") ?? "").trim();
    const price = Number(formData.get("price"));
    const compareAtPriceRaw = String(formData.get("compareAtPrice") ?? "").trim();
    const stockLevel = Number(formData.get("stockLevel"));
    const condition = String(formData.get("condition") ?? "NEW") as "NEW" | "REFURBISHED" | "USED";
    const description = String(formData.get("description") ?? "").trim();

    if (!name || !categorySlug || !brand || !sku) {
      setError("Please fill in the product name, category, brand, and SKU.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }
    if (!Number.isFinite(stockLevel) || stockLevel < 0) {
      setError("Enter a valid stock quantity.");
      return;
    }

    const compareAtPrice = compareAtPriceRaw ? Number(compareAtPriceRaw) : undefined;
    if (compareAtPrice !== undefined && (!Number.isFinite(compareAtPrice) || compareAtPrice <= price)) {
      setError("The compare-at price must be a number greater than the selling price.");
      return;
    }

    setSubmitting(true);

    if (isEdit && product) {
      const patch = {
        name,
        categorySlug,
        brand,
        sku,
        price,
        compareAtPrice,
        stockLevel,
        condition,
        description: description || product.description,
        image: mainPhoto,
        galleryImages: galleryPhotos.length > 0 ? galleryPhotos : undefined,
      };
      if (isDraft) {
        updateVendorProductDraft(product.slug, patch);
      } else {
        saveProductEdit(product.slug, patch);
      }
      router.push("/vendor/products");
      router.refresh();
      return;
    }

    const seed = Math.floor(Math.random() * 1_000_000);
    addVendorProductDraft({
      id: `draft-${Date.now()}`,
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      name,
      categorySlug,
      shopSlug,
      shopName,
      price,
      compareAtPrice,
      currency: "GHS",
      rating: 0,
      reviewCount: 0,
      image: mainPhoto,
      seed,
      galleryImageSeeds: [seed],
      galleryImages: galleryPhotos.length > 0 ? galleryPhotos : undefined,
      sku,
      brand,
      description: description || `${name} from ${shopName}.`,
      specifications: [],
      condition,
      status: "ACTIVE",
      stockLevel,
    });

    router.push("/vendor/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-5 border-b pb-6">
        <div>
          <Label>Main photo</Label>
          <div className="mt-1.5">
            <VendorMainPhotoUpload image={mainPhoto} onChange={setMainPhoto} />
          </div>
        </div>
        <div>
          <Label>Gallery photos</Label>
          <div className="mt-1.5">
            <VendorGalleryPhotoUpload images={galleryPhotos} onChange={setGalleryPhotos} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">Product name</Label>
          <Input id="name" name="name" placeholder="e.g. Wireless earbuds Pro" defaultValue={product?.name} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="categorySlug">Category</Label>
          <select
            id="categorySlug"
            name="categorySlug"
            className={SELECT_CLASSNAME}
            required
            defaultValue={product?.categorySlug ?? ""}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" placeholder="e.g. Sonic" defaultValue={product?.brand} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" placeholder="e.g. SNC-EB-002" defaultValue={product?.sku} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="condition">Condition</Label>
          <select id="condition" name="condition" className={SELECT_CLASSNAME} defaultValue={product?.condition ?? "NEW"}>
            <option value="NEW">New</option>
            <option value="REFURBISHED">Refurbished</option>
            <option value="USED">Used</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="price">Price (GHS)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            defaultValue={product?.price}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="compareAtPrice">Compare-at price (optional)</Label>
          <Input
            id="compareAtPrice"
            name="compareAtPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            defaultValue={product?.compareAtPrice}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="stockLevel">Stock quantity</Label>
          <Input
            id="stockLevel"
            name="stockLevel"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            defaultValue={product?.stockLevel}
            required
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe the product for shoppers..."
            defaultValue={product?.description}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/vendor/products")}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save changes" : "Add product"}
        </Button>
      </div>
    </form>
  );
}
