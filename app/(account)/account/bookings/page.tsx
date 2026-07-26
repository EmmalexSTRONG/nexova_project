import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { AccountBookingsContent } from "@/components/account/account-bookings-content";

export const metadata: Metadata = {
  title: "My bookings — Nexora",
};

export default async function AccountBookingsPage() {
  // Middleware already redirects any session-less request away from
  // /account/* — this check is defense in depth against the same race a
  // session could expire in between the middleware and this render.
  const session = await auth();
  if (!session?.user) redirect("/login");
  const customerEmail = session.user.email ?? "";

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-xl font-bold">My bookings</h1>
        <p className="text-sm text-muted-foreground">Service appointments booked with {customerEmail}.</p>
      </div>
      <AccountBookingsContent customerEmail={customerEmail} />
    </div>
  );
}
