import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin } from "lucide-react";
import { getShopBySlug, getProductsByShop, getShopReviews, getShopRatingBreakdown, shops } from "@/lib/data";
import { shopIcon, getCategoryIcon } from "@/lib/icon-map";
import { ProductImage } from "@/components/shared/product-image";
import { StarRating } from "@/components/shared/star-rating";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/marketplace/product-card";
import { FollowButton } from "@/components/marketplace/follow-button";
import { ContactLinks } from "@/components/marketplace/contact-links";
import { SellerDetailsCard } from "@/components/marketplace/seller-details-card";
import { BusinessHoursTable } from "@/components/marketplace/business-hours-table";
import { StorePolicies } from "@/components/marketplace/store-policies";
import { RatingBreakdown } from "@/components/marketplace/rating-breakdown";
import { ShopReviewCard } from "@/components/marketplace/shop-review-card";
import { LocationMap } from "@/components/maps/location-map-dynamic";
import { NearbyShops } from "@/components/marketplace/nearby-shops";

export function generateStaticParams() {
  return shops.map((shop) => ({ slug: shop.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const shop = getShopBySlug(slug);
  if (!shop) return {};
  return {
    title: `${shop.name} — Nexora`,
    description: shop.tagline,
  };
}

const SUB_NAV = [
  { href: "#about", label: "About" },
  { href: "#products", label: "Products" },
  { href: "#reviews", label: "Reviews" },
  { href: "#policies", label: "Store policies" },
  { href: "#nearby", label: "Nearby shops" },
];

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = getShopBySlug(slug);
  if (!shop) notFound();

  const shopProducts = getProductsByShop(shop.slug);
  const shopReviews = getShopReviews(shop.slug);
  const { total, counts } = getShopRatingBreakdown(shop.slug);
  const CategoryIcon = getCategoryIcon(shop.categorySlug);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${shop.location.addressLine}, ${shop.location.city}, ${shop.location.region}, Ghana`,
  )}`;

  return (
    <div>
      <ProductImage image={shop.image} seed={shop.bannerSeed} icon={CategoryIcon} alt={shop.name} className="h-40 w-full sm:h-56" iconClassName="h-1/4 w-1/4" />

      <div className="container">
        <div className="relative z-10 -mt-12 flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-sm sm:-mt-14 sm:flex-row sm:items-end">
          <ProductImage
            image={shop.image}
            seed={shop.seed}
            icon={shopIcon}
            alt={shop.name}
            className="h-24 w-24 shrink-0 rounded-full ring-4 ring-card"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{shop.name}</h1>
              {shop.verified && (
                <span className="flex items-center gap-1 text-sm font-medium text-success">
                  <BadgeCheck className="h-4 w-4" />
                  Verified
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{shop.tagline}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <StarRating rating={shop.rating} reviewCount={total} />
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {shop.location.city}, {shop.location.region}
              </span>
              <span className="text-muted-foreground">{shop.productCount.toLocaleString()} products</span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <FollowButton initialFollowers={shop.followers} />
            <ContactLinks phone={shop.phone} whatsapp={shop.whatsapp} email={shop.email} />
          </div>
        </div>

        <nav className="-mx-4 mt-6 flex gap-6 overflow-x-auto border-b bg-background px-4 text-sm sm:mx-0 sm:px-0">
          {SUB_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap border-b-2 border-transparent py-3 font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <section id="about" className="scroll-mt-40 py-8">
          <h2 className="font-display text-xl font-semibold">About {shop.name}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{shop.description}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <SellerDetailsCard seller={shop.seller} />
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-display text-sm font-semibold">Business hours</h3>
              <div className="mt-2">
                <BusinessHoursTable hours={shop.businessHours} />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-display text-sm font-semibold">Location</h3>
              <LocationMap
                seller={{ lat: shop.location.lat, lng: shop.location.lng, label: shop.name }}
                heightClassName="h-40"
                className="mt-3"
              />
              <p className="mt-3 text-sm text-muted-foreground">
                {shop.location.addressLine}
                <br />
                {shop.location.city}, {shop.location.region} Region
                <br />
                Ghana
              </p>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <MapPin className="h-4 w-4" />
                Get directions
              </a>
            </div>
          </div>
        </section>

        <section id="nearby" className="scroll-mt-40 border-t py-8">
          <h2 className="mb-1 font-display text-xl font-semibold">Shops near {shop.name}</h2>
          <p className="mb-4 text-sm text-muted-foreground">Other vendors close to this location.</p>
          <NearbyShops referencePoint={{ lat: shop.location.lat, lng: shop.location.lng }} excludeSlug={shop.slug} />
        </section>

        <section id="products" className="scroll-mt-40 border-t py-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Products</h2>
            <Badge variant="secondary">{shopProducts.length} listed</Badge>
          </div>
          {shopProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {shopProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">This shop hasn&apos;t listed any products yet.</p>
          )}
        </section>

        <section id="reviews" className="scroll-mt-40 border-t py-8">
          <h2 className="font-display text-xl font-semibold">Reviews & ratings</h2>
          <div className="mt-4 rounded-lg border bg-card p-5">
            <RatingBreakdown rating={shop.rating} total={total} counts={counts} />
          </div>
          {shopReviews.length > 0 && (
            <div className="mt-4 rounded-lg border bg-card px-5">
              {shopReviews.map((review) => (
                <ShopReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </section>

        <section id="policies" className="scroll-mt-40 border-t py-8">
          <h2 className="mb-4 font-display text-xl font-semibold">Store policies</h2>
          <StorePolicies policies={shop.policies} />
        </section>
      </div>
    </div>
  );
}
