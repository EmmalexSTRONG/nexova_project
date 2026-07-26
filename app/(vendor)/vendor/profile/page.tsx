import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { getShopBySlug } from "@/lib/data";
import { DEMO_SHOP_SLUG } from "@/lib/vendor/demo-shop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function VendorProfilePage() {
  // The (vendor) layout already redirects any session-less request before
  // this page renders, so session.user is guaranteed here.
  const session = await auth();
  const user = session!.user;
  const shop = getShopBySlug(DEMO_SHOP_SLUG);

  return (
    <div className="container max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Your seller identity on Nexora.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{shop?.seller.ownerName ?? user?.name ?? "Dev Vendor"}</CardTitle>
          <CardDescription>{user?.email ?? "dev@nexora.local"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Shop</dt>
              <dd className="font-medium">{shop?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Seller since</dt>
              <dd className="font-medium">{shop?.seller.memberSince ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Response rate</dt>
              <dd className="font-medium">{shop?.seller.responseRate ?? "—"}%</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Response time</dt>
              <dd className="font-medium">{shop?.seller.responseTime ?? "—"}</dd>
            </div>
          </dl>

          {user && !user.isEmailVerified && (
            <p className="text-sm text-destructive">Your email address isn&apos;t verified yet.</p>
          )}

          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/account">Account &amp; security</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/vendor/settings">Shop settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
