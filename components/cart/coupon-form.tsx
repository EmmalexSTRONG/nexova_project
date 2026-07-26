"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { applyCouponCode, type CouponResult } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CouponForm({
  subtotal,
  appliedCoupon,
  onApply,
  onRemove,
}: {
  subtotal: number;
  appliedCoupon: CouponResult | null;
  onApply: (code: string) => void;
  onRemove: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (appliedCoupon?.valid) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h2 className="font-display text-sm font-semibold">Have a coupon?</h2>
        <div className="mt-2 flex items-center justify-between rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          <span>{appliedCoupon.message}</span>
          <button type="button" aria-label="Remove coupon" onClick={onRemove}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="font-display text-sm font-semibold">Have a coupon?</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!code.trim()) return;
          const result = applyCouponCode(code, subtotal);
          if (result.valid) {
            setError(null);
            onApply(code);
          } else {
            setError(result.message);
          }
        }}
        className="mt-2 flex gap-2"
      >
        <Input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Enter code"
          className="h-9"
        />
        <Button type="submit" size="sm" variant="outline" className="shrink-0">
          Apply
        </Button>
      </form>
      {error && <p className="mt-2 text-xs text-sale">{error}</p>}
    </div>
  );
}
