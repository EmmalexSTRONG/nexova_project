"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { becomeVendorSchema, type BecomeVendorInput } from "@/lib/validators";
import { categories as staticCategories } from "@/lib/data";
import {
  CATEGORY_CREATED_STORAGE_KEY,
  CATEGORY_DELETED_STORAGE_KEY,
  CATEGORY_EDITS_STORAGE_KEY,
  getActiveCategoriesSorted,
} from "@/lib/admin/category-store";
import { useLiveRefresh } from "@/lib/shared/use-live-refresh";
import {
  generateVendorApplicationId,
  getLatestUnfinishedVendorApplication,
  getVendorApplicationById,
  issueVerificationToken,
  saveVendorApplication,
} from "@/lib/vendor/vendor-application-store";
import { sendVendorApplicationVerificationEmailAction } from "@/lib/vendor/vendor-application-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MailCheck } from "lucide-react";

export function BecomeVendorForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<"form" | "submitted">("form");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applicantEmail, setApplicantEmail] = useState("");
  const [emailSendFailed, setEmailSendFailed] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Resume an in-flight application on this browser instead of dropping the
  // vendor back into an empty form — e.g. after a refresh, or coming back
  // from an expired verification link.
  useEffect(() => {
    const existing = getLatestUnfinishedVendorApplication();
    if (!existing) return;
    if (existing.status === "EMAIL_VERIFIED") {
      router.replace(`/register/vendor/subscribe?applicationId=${encodeURIComponent(existing.id)}`);
      return;
    }
    setApplicationId(existing.id);
    setApplicantEmail(existing.email);
    setPhase("submitted");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [categories, setCategories] = useState(() => getActiveCategoriesSorted(staticCategories, true));
  useLiveRefresh(
    () => setCategories(getActiveCategoriesSorted(staticCategories)),
    [CATEGORY_EDITS_STORAGE_KEY, CATEGORY_CREATED_STORAGE_KEY, CATEGORY_DELETED_STORAGE_KEY],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BecomeVendorInput>({
    resolver: zodResolver(becomeVendorSchema),
    defaultValues: {
      businessName: "",
      ownerName: "",
      phone: "",
      whatsapp: "",
      email: "",
      businessAddress: "",
      shopName: "",
      category: "",
    },
  });

  async function sendVerification(id: string, data: { email: string; ownerName: string; businessName: string }) {
    const withToken = issueVerificationToken(id);
    if (!withToken) return false;
    return sendVendorApplicationVerificationEmailAction({
      email: data.email,
      ownerName: data.ownerName,
      businessName: data.businessName,
      applicationId: id,
      token: withToken.verificationToken,
    });
  }

  const onSubmit = (data: BecomeVendorInput) => {
    startTransition(async () => {
      const id = generateVendorApplicationId();
      const now = new Date().toISOString();
      saveVendorApplication({
        id,
        ...data,
        status: "PENDING_VERIFICATION",
        verificationToken: "",
        verificationExpiresAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const sent = await sendVerification(id, data);
      setApplicationId(id);
      setApplicantEmail(data.email);
      setEmailSendFailed(!sent);
      setPhase("submitted");
    });
  };

  async function handleResend() {
    if (!applicationId) return;
    const application = getVendorApplicationById(applicationId);
    if (!application) return;
    setIsResending(true);
    const sent = await sendVerification(applicationId, application);
    setEmailSendFailed(!sent);
    setIsResending(false);
  }

  if (phase === "submitted") {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
          <MailCheck className="h-6 w-6" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold">Check your email</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We&apos;ve sent a verification link to <span className="font-medium text-foreground">{applicantEmail}</span>.
            Your application is saved as <span className="font-medium text-foreground">pending verification</span> —
            click the link to continue to the subscription payment step.
          </p>
        </div>

        {emailSendFailed && (
          <Alert variant="destructive" className="text-left">
            <AlertDescription>
              We couldn&apos;t send that email just now. You can try again below.
            </AlertDescription>
          </Alert>
        )}

        <Button type="button" variant="outline" onClick={handleResend} disabled={isResending}>
          {isResending ? "Resending..." : "Resend verification email"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="businessName">Business name</Label>
        <Input id="businessName" className="h-11 rounded-lg" {...register("businessName")} />
        {errors.businessName && <p className="text-sm text-destructive">{errors.businessName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ownerName">Owner name</Label>
        <Input id="ownerName" autoComplete="name" className="h-11 rounded-lg" {...register("ownerName")} />
        {errors.ownerName && <p className="text-sm text-destructive">{errors.ownerName.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+233501234567"
            className="h-11 rounded-lg"
            {...register("phone")}
          />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp number</Label>
          <Input
            id="whatsapp"
            type="tel"
            placeholder="+233501234567"
            className="h-11 rounded-lg"
            {...register("whatsapp")}
          />
          {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" className="h-11 rounded-lg" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessAddress">Business address</Label>
        <Textarea id="businessAddress" rows={2} {...register("businessAddress")} />
        {errors.businessAddress && <p className="text-sm text-destructive">{errors.businessAddress.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="shopName">Shop name</Label>
        <Input id="shopName" className="h-11 rounded-lg" {...register("shopName")} />
        <p className="text-xs text-muted-foreground">The name shoppers will see on your storefront.</p>
        {errors.shopName && <p className="text-sm text-destructive">{errors.shopName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          defaultValue=""
          className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...register("category")}
        >
          <option value="" disabled>
            Choose a category
          </option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit application"}
      </Button>

      <p className="text-xs text-muted-foreground">
        We&apos;ll email you a verification link. Once verified, you&apos;ll choose a subscription plan to
        activate your shop.
      </p>
    </form>
  );
}
