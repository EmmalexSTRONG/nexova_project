import type { Metadata } from "next";
import { VerifyEmailStatus } from "@/components/auth/verify-email-status";

export const metadata: Metadata = { title: "Verify your email — Nexora" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Email verification</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Confirming your email address.</p>

      <div className="mt-8">
        <VerifyEmailStatus token={token} />
      </div>
    </div>
  );
}
