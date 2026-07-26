import type { Metadata } from "next";
import { auth } from "@/lib/auth/config";
import { AccountWishlistContent } from "@/components/account/account-wishlist-content";

export const metadata: Metadata = {
  title: "My wishlist — Nexora",
};

export default async function AccountWishlistPage() {
  // Public page — wishlist state lives in localStorage, not a real account,
  // so this greets by name only when a session happens to exist.
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-xl font-bold">My wishlist</h1>
        <p className="text-sm text-muted-foreground">
          {firstName ? `Products you've saved, ${firstName}.` : "Products you've saved for later."}
        </p>
      </div>
      <AccountWishlistContent />
    </div>
  );
}
