"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutContactOnlySchema, type CheckoutContactOnlyInput } from "@/lib/checkout/validators";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function BookingDetailsStep({
  defaultValues,
  onSubmit,
  onBack,
  description = "The provider will use these to confirm your appointment.",
}: {
  defaultValues: Partial<CheckoutContactOnlyInput>;
  onSubmit: (data: CheckoutContactOnlyInput) => void;
  onBack: () => void;
  description?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutContactOnlyInput>({
    resolver: zodResolver(checkoutContactOnlySchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="font-display text-lg font-semibold">Your contact details</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" placeholder="+233501234567" {...register("phone")} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
