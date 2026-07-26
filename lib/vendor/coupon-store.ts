import { createListStore } from "@/lib/shared/local-storage-store";

export interface VendorCoupon {
  code: string;
  shopSlug: string;
  description: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  minOrderAmount?: number;
  active: boolean;
  createdAt: string;
}

const store = createListStore<VendorCoupon>("nexora:vendor-coupons:v1");

export function getVendorCoupons(shopSlug: string): VendorCoupon[] {
  return store
    .readAll()
    .filter((coupon) => coupon.shopSlug === shopSlug)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Site-wide, unfiltered — used by the admin Coupons oversight page.
export function getAllVendorCoupons(): VendorCoupon[] {
  return store.readAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Coupon codes are global at checkout (one shared discount field for the
// whole cart), so codes must be unique across every vendor's coupons too.
export function isCouponCodeTaken(code: string): boolean {
  return store.readAll().some((coupon) => coupon.code === code.trim().toUpperCase());
}

export function createVendorCoupon(input: Omit<VendorCoupon, "active" | "createdAt" | "code"> & { code: string }): VendorCoupon {
  const coupon: VendorCoupon = {
    ...input,
    code: input.code.trim().toUpperCase(),
    active: true,
    createdAt: new Date().toISOString(),
  };
  const coupons = store.readAll();
  coupons.push(coupon);
  store.writeAll(coupons);
  return coupon;
}

export function setVendorCouponActive(code: string, shopSlug: string, active: boolean): void {
  const coupons = store.readAll();
  const coupon = coupons.find((c) => c.code === code && c.shopSlug === shopSlug);
  if (!coupon) return;
  coupon.active = active;
  store.writeAll(coupons);
}

export function deleteVendorCoupon(code: string, shopSlug: string): void {
  store.writeAll(store.readAll().filter((c) => !(c.code === code && c.shopSlug === shopSlug)));
}

// Looked up by checkout's applyCouponCode() alongside the static site-wide
// coupon list, so a vendor-created coupon genuinely works at checkout.
export function findActiveVendorCoupon(code: string): VendorCoupon | undefined {
  const normalized = code.trim().toUpperCase();
  return store.readAll().find((c) => c.code === normalized && c.active);
}
