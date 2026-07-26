import Link from "next/link";
import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { RegisterCustomerForm } from "@/components/auth/register-customer-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export const metadata: Metadata = { title: "Create your account — Nexora" };

export default function RegisterCustomerPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Shop from thousands of vendors in one place.</p>

      <div className="mt-8 space-y-6">
        <RegisterCustomerForm />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>

        <OAuthButtons callbackUrl="/account" />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
