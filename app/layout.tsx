import type { Metadata } from "next";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { fontMono } from "@/lib/fonts";
import { CartProvider } from "@/lib/cart/cart-context";
import { ChatWidget } from "@/components/chat/chat-widget-dynamic";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { ThemeScript } from "@/lib/theme/theme-script";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const SITE_NAME = "Nexora";
const DEFAULT_TITLE = "Nexora — Shop the market";
const DEFAULT_DESCRIPTION = "A multi-vendor marketplace: thousands of shops, one checkout.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning is required here because ThemeScript sets the
    // `dark` class (and color-scheme) before React hydrates — without it,
    // React would (harmlessly) warn about a server/client markup mismatch.
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(fontMono.variable)}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <CartProvider>{children}</CartProvider>
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
