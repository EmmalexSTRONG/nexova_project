"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import {
  getVendorCoupons,
  createVendorCoupon,
  setVendorCouponActive,
  deleteVendorCoupon,
  isCouponCodeTaken,
  type VendorCoupon,
} from "@/lib/vendor/coupon-store";
import { coupons as staticCoupons } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function VendorCouponsContent({ shopSlug }: { shopSlug: string }) {
  const [coupons, setCoupons] = useState<VendorCoupon[] | undefined>(undefined);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<VendorCoupon["type"]>("PERCENTAGE");
  const [value, setValue] = useState("10");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setCoupons(getVendorCoupons(shopSlug));
  }

  useEffect(refresh, [shopSlug]);

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setError("Enter a coupon code.");
      return;
    }
    if (staticCoupons.some((c) => c.code === normalized) || isCouponCodeTaken(normalized)) {
      setError("That code is already in use — try a different one.");
      return;
    }
    if (!description.trim()) {
      setError("Add a short description customers will see.");
      return;
    }

    createVendorCoupon({
      code: normalized,
      shopSlug,
      description: description.trim(),
      type,
      value: type === "FREE_SHIPPING" ? 0 : Number(value) || 0,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
    });

    setCode("");
    setDescription("");
    setValue("10");
    setMinOrderAmount("");
    refresh();
  }

  return (
    <div className="container space-y-8 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Coupons</h1>
        <p className="text-sm text-muted-foreground">Create discount codes customers can apply at checkout.</p>
      </div>

      <form onSubmit={handleCreate} className="rounded-lg border bg-card p-5">
        <h2 className="mb-4 font-display text-sm font-semibold">Create a coupon</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUMMER15" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="15% off summer picks" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as VendorCoupon["type"])}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="PERCENTAGE">Percentage off</option>
              <option value="FIXED_AMOUNT">Fixed amount off</option>
              <option value="FREE_SHIPPING">Free shipping</option>
            </select>
          </div>
          {type !== "FREE_SHIPPING" && (
            <div className="space-y-2">
              <Label htmlFor="value">{type === "PERCENTAGE" ? "Percent off" : "Amount off (GHS)"}</Label>
              <Input id="value" type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="minOrderAmount">Minimum order (GHS, optional)</Label>
            <Input id="minOrderAmount" type="number" min={0} value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" className="mt-4">
          Create coupon
        </Button>
      </form>

      {coupons === undefined ? (
        <p className="text-sm text-muted-foreground">Loading coupons...</p>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
            <Tag className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium">No coupons yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">Create one above — customers can apply it in their cart.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map((coupon) => (
                <tr key={coupon.code}>
                  <td className="px-4 py-3 font-mono font-medium">{coupon.code}</td>
                  <td className="px-4 py-3 text-muted-foreground">{coupon.description}</td>
                  <td className="px-4 py-3">
                    <Badge variant={coupon.active ? "success" : "secondary"}>{coupon.active ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setVendorCouponActive(coupon.code, shopSlug, !coupon.active);
                          refresh();
                        }}
                      >
                        {coupon.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          deleteVendorCoupon(coupon.code, shopSlug);
                          refresh();
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
