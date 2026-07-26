"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getVendorApplicationById, verifyVendorApplicationEmail } from "@/lib/vendor/vendor-application-store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Status = "verifying" | "redirecting" | "already-subscribed" | "invalid" | "expired" | "not-found";

export function VendorApplicationVerifyContent({
  applicationId,
  token,
}: {
  applicationId: string | undefined;
  token: string | undefined;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("verifying");

  useEffect(() => {
    if (!applicationId || !token) {
      setStatus("invalid");
      return;
    }

    const result = verifyVendorApplicationEmail(applicationId, token);
    if (result === "NOT_FOUND") {
      setStatus("not-found");
      return;
    }
    if (result === "INVALID") {
      setStatus("invalid");
      return;
    }
    if (result === "EXPIRED") {
      setStatus("expired");
      return;
    }

    // VERIFIED or ALREADY_VERIFIED — a subscribed application is fully done,
    // anything else (freshly verified or verified-but-not-yet-paid) moves on
    // to the subscription payment step.
    const application = getVendorApplicationById(applicationId);
    if (application?.status === "SUBSCRIBED") {
      setStatus("already-subscribed");
      return;
    }

    setStatus("redirecting");
    router.replace(`/register/vendor/subscribe?applicationId=${encodeURIComponent(applicationId)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, token]);

  if (status === "verifying" || status === "redirecting") {
    return <p className="text-sm text-muted-foreground">Verifying your email...</p>;
  }

  if (status === "already-subscribed") {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          <AlertDescription>
            Your email is verified and your subscription is already active. We&apos;ll be in touch with your
            vendor dashboard login shortly.
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full">
          <Link href="/">Back to homepage</Link>
        </Button>
      </div>
    );
  }

  const message =
    status === "not-found"
      ? "We couldn't find that application. It may have been submitted on a different device or browser."
      : status === "expired"
        ? "This verification link has expired. Go back and request a new one from your application."
        : "This verification link is invalid.";

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <Button asChild variant="outline" className="w-full">
        <Link href="/register/vendor">Back to application</Link>
      </Button>
    </div>
  );
}
