"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resendVerificationSchema, type ResendVerificationInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resendVerificationAction, verifyEmailAction } from "@/lib/auth/actions";

type Status = "verifying" | "success" | "error" | "missing-token";

export function VerifyEmailStatus({ token }: { token: string | undefined }) {
  const [status, setStatus] = useState<Status>(token ? "verifying" : "missing-token");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    verifyEmailAction({ token }).then((result) => {
      setStatus(result.success ? "success" : "error");
      setMessage(result.message ?? null);
    });
  }, [token]);

  if (status === "verifying") {
    return <p className="text-sm text-muted-foreground">Verifying your email...</p>;
  }

  if (status === "success") {
    return (
      <Alert variant="success">
        <AlertDescription>{message ?? "Your email has been verified."}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertDescription>
          {status === "missing-token" ? "No verification token provided." : message}
        </AlertDescription>
      </Alert>
      <ResendVerificationForm />
    </div>
  );
}

function ResendVerificationForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendVerificationInput>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ResendVerificationInput) => {
    startTransition(async () => {
      const res = await resendVerificationAction(data);
      setResult({ success: res.success, message: res.message ?? "Something went wrong." });
    });
  };

  if (result?.success) {
    return (
      <Alert variant="success">
        <AlertDescription>{result.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="resend-email">Resend verification link to</Label>
        <Input id="resend-email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Sending..." : "Resend link"}
      </Button>
    </form>
  );
}
