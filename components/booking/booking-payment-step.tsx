"use client";

import { Banknote, CreditCard, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CheckoutPaymentMethod } from "@/lib/checkout/types";

export function BookingPaymentStep({
  value,
  onChange,
  onContinue,
  onBack,
}: {
  value: CheckoutPaymentMethod | null;
  onChange: (method: CheckoutPaymentMethod) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const options: { key: CheckoutPaymentMethod; label: string; description: string; icon: typeof CreditCard; channels?: string[] }[] = [
    {
      key: "PAYSTACK",
      label: "Paystack",
      description: "Pay by card, bank transfer or mobile money.",
      icon: CreditCard,
      channels: ["Visa", "Mastercard", "Bank Transfer", "Mobile Money"],
    },
    {
      key: "FLUTTERWAVE",
      label: "Flutterwave",
      description: "Pay by card, bank transfer or mobile money.",
      icon: Smartphone,
      channels: ["Visa", "Mastercard", "Bank Transfer", "Mobile Money"],
    },
    {
      key: "CASH",
      label: "Pay in person",
      description: "Pay the provider directly at your appointment.",
      icon: Banknote,
    },
  ];

  return (
    <div>
      <h2 className="font-display text-lg font-semibold">How would you like to pay?</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors hover:border-primary",
              value === option.key && "border-primary bg-accent",
            )}
          >
            <option.icon className="h-5 w-5 text-primary" />
            <span className="font-medium">{option.label}</span>
            <span className="text-xs text-muted-foreground">{option.description}</span>
            {option.channels && (
              <span className="mt-1 flex flex-wrap gap-1">
                {option.channels.map((channel) => (
                  <span key={channel} className="rounded-full border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {channel}
                  </span>
                ))}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button disabled={!value} onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
