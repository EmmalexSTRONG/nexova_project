import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Gated dashboards and auth flows have nothing worth indexing and
        // shouldn't show up in search results even if a link ever leaks.
        disallow: ["/account/", "/vendor/", "/admin/", "/login", "/register", "/forgot-password", "/reset-password"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
