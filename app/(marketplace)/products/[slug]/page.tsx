import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { products, getProductBySlug, getRelatedProducts, getShopBySlug } from "@/lib/data";
import { auth } from "@/lib/auth/config";
import { getCategoryIcon } from "@/lib/icon-map";
import { getStockStatus } from "@/lib/stock";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/star-rating";
import { Price, discountPercent } from "@/components/shared/price";
import { DiscountBadge } from "@/components/shared/discount-badge";
import { ProductImage } from "@/components/shared/product-image";
import { ProductImageGallery } from "@/components/marketplace/product-image-gallery";
import { ProductPurchasePanel } from "@/components/marketplace/product-purchase-panel";
import { SpecificationsTable } from "@/components/marketplace/specifications-table";
import { ProductReviewsSection } from "@/components/reviews/product-reviews-section";
import { SidebarAdSlot } from "@/components/advertising/sidebar-ad-slot";
import { ProductCard } from "@/components/marketplace/product-card";
import { ProductViewTracker } from "@/components/marketplace/product-view-tracker";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  const title = `${product.name} — Nexora`;
  return {
    title,
    description: product.description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title,
      description: product.description,
      url: `/products/${slug}`,
      type: "website",
      ...(product.image ? { images: [{ url: product.image }] } : {}),
    },
    twitter: {
      title,
      description: product.description,
      ...(product.image ? { images: [product.image] } : {}),
    },
  };
}

const CONDITION_LABEL: Record<string, string> = {
  NEW: "New",
  REFURBISHED: "Refurbished",
  USED: "Used",
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const session = await auth();
  const shop = getShopBySlug(product.shopSlug);
  const CategoryIcon = getCategoryIcon(product.categorySlug);
  const stock = getStockStatus(product);
  const percent = discountPercent(product.price, product.compareAtPrice);
  const relatedProducts = getRelatedProducts(product);

  // Vendors can upload distinct "small" gallery photos separate from the
  // "big" cover photo; when they haven't, every slot falls back to reusing
  // the cover photo (or its seeded placeholder) as before.
  const gallerySlots =
    product.galleryImages && product.galleryImages.length > 0
      ? product.galleryImages.map((url, index) => ({
          key: `${product.slug}-gallery-${index}`,
          image: url,
          seed: product.galleryImageSeeds[index] ?? product.seed,
        }))
      : product.galleryImageSeeds.map((seed) => ({
          key: `${product.slug}-seed-${seed}`,
          image: product.image,
          seed,
        }));

  const galleryImages = gallerySlots.map(({ key, image, seed }) => (
    <ProductImage
      key={key}
      image={image}
      seed={seed}
      icon={CategoryIcon}
      alt={product.name}
      className="aspect-square w-full rounded-lg"
      iconClassName="h-1/4 w-1/4"
    />
  ));
  const galleryThumbnails = gallerySlots.map(({ key, image, seed }) => (
    <ProductImage
      key={key}
      image={image}
      seed={seed}
      icon={CategoryIcon}
      alt={product.name}
      className="h-16 w-16"
      iconClassName="h-1/3 w-1/3"
    />
  ));

  return (
    <div className="container py-8">
      <ProductViewTracker productSlug={product.slug} />
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href={`/categories/${product.categorySlug}`} className="hover:text-foreground">
          {product.categorySlug.replace(/-/g, " ")}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductImageGallery images={galleryImages} thumbnails={galleryThumbnails} name={product.name} />

        <div>
          {shop && (
            <Link
              href={`/vendors/${shop.slug}`}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              {shop.name}
              {shop.verified && <BadgeCheck className="h-3.5 w-3.5 text-success" />}
            </Link>
          )}
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
            <a href="#reviews" className="text-sm text-primary hover:underline">
              See reviews
            </a>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Price amount={product.price} currency={product.currency} compareAt={product.compareAtPrice} size="lg" />
            {percent && <DiscountBadge percent={percent} />}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{CONDITION_LABEL[product.condition]}</Badge>
            <span
              className={cn(
                "text-sm font-medium",
                stock.tone === "sale" && "text-sale",
                stock.tone === "success" && "text-success",
                stock.tone === "muted" && "text-muted-foreground",
              )}
            >
              {stock.label}
            </span>
          </div>

          <div className="mt-6">
            <ProductPurchasePanel
              productSlug={product.slug}
              stock={stock}
              maxQuantity={Math.min(product.stockLevel, 10)}
            />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">SKU</dt>
              <dd className="font-mono font-medium">{product.sku}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Brand</dt>
              <dd className="font-medium">{product.brand}</dd>
            </div>
            {product.model && (
              <div>
                <dt className="text-muted-foreground">Model</dt>
                <dd className="font-medium">{product.model}</dd>
              </div>
            )}
          </dl>

          {product.warranty && (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
              {product.warranty}
            </p>
          )}

          {shop && (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              Ships from {shop.location.city}, {shop.location.region}
            </p>
          )}
        </div>
      </div>

      <section className="mt-12 grid gap-10 border-t pt-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Description</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold">Specifications</h2>
            <div className="mt-3">
              <SpecificationsTable specifications={product.specifications} />
            </div>
          </div>
          <SidebarAdSlot />
        </div>
      </section>

      <ProductReviewsSection
        productSlug={product.slug}
        shopSlug={product.shopSlug}
        fallbackRating={product.rating}
        fallbackReviewCount={product.reviewCount}
        defaultName={session?.user?.name ?? undefined}
        defaultEmail={session?.user?.email ?? undefined}
      />

      {relatedProducts.length > 0 && (
        <section className="mt-12 border-t pt-10">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">You may also like</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
