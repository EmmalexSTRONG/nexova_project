import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SessionsList } from "@/components/auth/sessions-list";

export const metadata: Metadata = { title: "My account — Nexora" };

export default async function AccountPage() {
  // Middleware already redirects any session-less request away from
  // /account/* — this check is defense in depth against the same race a
  // session could expire in between the middleware and this render.
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;
  const displayName = user.name ?? "";
  const displayEmail = user.email ?? "";
  const displayRole = user.role.toLowerCase();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>My account</CardTitle>
          <CardDescription>{displayEmail}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user.isEmailVerified && (
            <Alert variant="destructive">
              <AlertDescription>
                Your email address isn&apos;t verified yet. Check your inbox for the verification link.
              </AlertDescription>
            </Alert>
          )}
          <p className="text-sm">
            Signed in as <span className="font-medium">{displayName}</span> ({displayRole})
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/account/orders">My orders</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/account/bookings">My bookings</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/account/wishlist">My wishlist</Link>
            </Button>
            <SignOutButton />
            <SignOutButton allDevices />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>Devices currently signed in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading sessions...</p>}>
            <SessionsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
