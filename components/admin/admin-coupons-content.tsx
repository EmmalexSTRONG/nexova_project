"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { getAllVendorCoupons, setVendorCouponActive, type VendorCoupon } from "@/lib/vendor/coupon-store";
import { coupons as staticCoupons, type MockCoupon } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminLoadingState } from "./admin-loading-state";

export function AdminCouponsContent() {
  const [vendorCoupons, setVendorCoupons] = useState<VendorCoupon[] | undefined>(undefined);

  function refresh() {
    setVendorCoupons(getAllVendorCoupons());
  }

  useEffect(refresh, []);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Coupons</h1>
        <p className="text-sm text-muted-foreground">Every discount code active on the platform.</p>
      </div>

      <div>
        <h2 className="mb-3 font-display text-sm font-semibold">Site-wide coupons</h2>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {staticCoupons.map((coupon: MockCoupon) => (
                <tr key={coupon.code} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-medium">{coupon.code}</td>
                  <td className="px-4 py-3 text-muted-foreground">{coupon.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">{coupon.type.replace("_", " ").toLowerCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-sm font-semibold">Vendor coupons</h2>
        {vendorCoupons === undefined ? (
          <AdminLoadingState label="Loading vendor coupons..." />
        ) : vendorCoupons.length === 0 ? (
          <AdminEmptyState icon={Tag} title="No vendor coupons yet" description="Coupons vendors create for their own shop will show up here." />
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Shop</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {vendorCoupons.map((coupon) => (
                  <tr key={`${coupon.shopSlug}-${coupon.code}`} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-medium">{coupon.code}</td>
                    <td className="px-4 py-3 text-muted-foreground">{coupon.shopSlug}</td>
                    <td className="px-4 py-3 text-muted-foreground">{coupon.description}</td>
                    <td className="px-4 py-3">
                      <Badge variant={coupon.active ? "success" : "secondary"}>{coupon.active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setVendorCouponActive(coupon.code, coupon.shopSlug, !coupon.active);
                          refresh();
                        }}
                      >
                        {coupon.active ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
