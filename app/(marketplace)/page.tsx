import type { Metadata } from "next";
import { OrbitalHero } from "@/components/home/orbital-hero";
import { AdBannerSection } from "@/components/home/ad-banner-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { ProductSliderSection } from "@/components/home/product-slider-section";
import { FeaturedShopsSection } from "@/components/home/featured-shops-section";
import { ShopsNearYouSection } from "@/components/home/shops-near-you-section";
import { SponsoredProductsSection } from "@/components/home/sponsored-products-section";
import { LatestProductsSection } from "@/components/home/latest-products-section";
import { ServicesSection } from "@/components/home/services-section";
import { FlashSalesSection } from "@/components/home/flash-sales-section";
import { BestSellersSection } from "@/components/home/best-sellers-section";
import { TopShopsThisWeekSection } from "@/components/home/top-shops-this-week-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { ReviewsSection } from "@/components/home/reviews-section";
import { BlogSection } from "@/components/home/blog-section";

const TITLE = "Nexora — Shop thousands of independent vendors across Ghana";
const DESCRIPTION =
  "Fashion, electronics, home goods, beauty, and services from thousands of vetted vendors — one cart, one checkout, delivered across Ghana.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function HomePage() {
  return (
    <>
      <OrbitalHero />
      <AdBannerSection />
      <CategoriesSection />
      <ProductSliderSection />
      <SponsoredProductsSection />
      <FeaturedShopsSection />
      <ShopsNearYouSection />
      <FlashSalesSection />
      <LatestProductsSection />
      <ServicesSection />
      <BestSellersSection />
      <TopShopsThisWeekSection />
      <ReviewsSection />
      <BlogSection />
      <NewsletterSection />
    </>
  );
}
