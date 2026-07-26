import type { Metadata } from "next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Set a new password — Nexora" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Reset your password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Choose a new password for your account.</p>

      <div className="mt-8">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <Alert variant="destructive">
            <AlertDescription>
              This reset link is missing its token. Please request a new one from the forgot password
              page.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
