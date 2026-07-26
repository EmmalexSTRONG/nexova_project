import type { MetadataRoute } from "next";
import { products, shops, services } from "@/lib/data";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Covers the static marketing/browse routes plus every product/vendor/service
// detail page. A fully dynamic sitemap isn't meaningful without a live
// database behind these listings, but this still gives search engines a
// real, accurate map of everything that's actually browsable today.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${APP_URL}/categories`, changeFrequency: "daily", priority: 0.8 },
    { url: `${APP_URL}/vendors`, changeFrequency: "daily", priority: 0.8 },
    { url: `${APP_URL}/services`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${APP_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${APP_URL}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${APP_URL}/help`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${APP_URL}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${APP_URL}/register/vendor`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${APP_URL}/products/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const vendorRoutes: MetadataRoute.Sitemap = shops.map((shop) => ({
    url: `${APP_URL}/vendors/${shop.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${APP_URL}/services/${service.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...vendorRoutes, ...serviceRoutes];
}
