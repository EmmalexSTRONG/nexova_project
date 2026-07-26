import type { Metadata } from "next";
import { VendorApplicationVerifyContent } from "@/components/auth/vendor-application-verify-content";

export const metadata: Metadata = { title: "Verify your email — Nexora vendor application" };

export default async function VendorApplicationVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ applicationId?: string; token?: string }>;
}) {
  const { applicationId, token } = await searchParams;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Email verification</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Confirming your vendor application email address.</p>

      <div className="mt-8">
        <VendorApplicationVerifyContent applicationId={applicationId} token={token} />
      </div>
    </div>
  );
}
