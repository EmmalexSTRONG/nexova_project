import Link from "next/link";
import type { Metadata } from "next";
import { BecomeVendorForm } from "@/components/auth/become-vendor-form";

export const metadata: Metadata = { title: "Sell on Nexora — Become a vendor" };

export default function RegisterVendorPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Become a vendor</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Tell us about your business. We&apos;ll verify your email, then you can activate your shop with a
        subscription plan.
      </p>

      <div className="mt-8 space-y-6">
        <BecomeVendorForm />

        <p className="text-center text-sm text-muted-foreground">
          Already have a vendor account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
