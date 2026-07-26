import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getShopBySlug } from "@/lib/data";
import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { VendorShell } from "@/components/vendor/vendor-shell";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  // Middleware already redirects any session-less request away from
  // /vendor/* — this check is defense in depth against the same race a
  // session could expire in between the middleware and this render.
  const session = await auth();
  if (!session?.user) redirect("/login");

  const shop = getShopBySlug(DEMO_SHOP_SLUG);

  return (
    <VendorShell
      shopSlug={DEMO_SHOP_SLUG}
      shopName={shop?.name ?? "Your shop"}
      userName={session.user.name ?? ""}
      userEmail={session.user.email ?? ""}
    >
      {children}
    </VendorShell>
  );
}
