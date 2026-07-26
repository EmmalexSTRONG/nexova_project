import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { AccountOrdersContent } from "@/components/account/account-orders-content";

export const metadata: Metadata = {
  title: "My orders — Nexora",
};

export default async function AccountOrdersPage() {
  // Middleware already redirects any session-less request away from
  // /account/* — this check is defense in depth against the same race a
  // session could expire in between the middleware and this render.
  const session = await auth();
  if (!session?.user) redirect("/login");
  const customerEmail = session.user.email ?? "";

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-xl font-bold">My orders</h1>
        <p className="text-sm text-muted-foreground">Track and review orders placed with {customerEmail}.</p>
      </div>
      <AccountOrdersContent customerEmail={customerEmail} />
    </div>
  );
}
