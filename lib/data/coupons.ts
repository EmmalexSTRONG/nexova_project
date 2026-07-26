import { findActiveVendorCoupon } from "@/lib/vendor/coupon-store";

export interface MockCoupon {
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number; // percent (0-100) or flat GHS amount; ignored for FREE_SHIPPING
  minOrderAmount?: number;
}

export const coupons: MockCoupon[] = [
  { code: "WELCOME10", description: "10% off your order", type: "PERCENTAGE", value: 10 },
  {
    code: "SAVE20",
    description: "GHS 20 off orders over GHS 200",
    type: "FIXED_AMOUNT",
    value: 20,
    minOrderAmount: 200,
  },
  { code: "FREESHIP", description: "Free shipping on this order", type: "FREE_SHIPPING", value: 0 },
];

export interface CouponResult {
  valid: boolean;
  message: string;
  discount: number;
  freeShipping: boolean;
}

export function applyCouponCode(code: string, subtotal: number): CouponResult {
  const normalized = code.trim().toUpperCase();
  const staticCoupon = coupons.find((c) => c.code === normalized);
  // Vendor-created coupons (from the Coupons dashboard page) are stored in
  // localStorage rather than this static list — checked here too so they
  // genuinely apply at checkout, not just in the vendor's own preview.
  const vendorCoupon = !staticCoupon ? findActiveVendorCoupon(normalized) : undefined;
  const coupon = staticCoupon ?? vendorCoupon;

  if (!coupon) {
    return { valid: false, message: "That coupon code isn't valid.", discount: 0, freeShipping: false };
  }

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Add GHS ${(coupon.minOrderAmount - subtotal).toFixed(2)} more to use this coupon.`,
      discount: 0,
      freeShipping: false,
    };
  }

  if (coupon.type === "PERCENTAGE") {
    return {
      valid: true,
      message: `${coupon.description} applied.`,
      discount: Math.round(subtotal * (coupon.value / 100) * 100) / 100,
      freeShipping: false,
    };
  }

  if (coupon.type === "FIXED_AMOUNT") {
    return {
      valid: true,
      message: `${coupon.description} applied.`,
      discount: Math.min(coupon.value, subtotal),
      freeShipping: false,
    };
  }

  return { valid: true, message: `${coupon.description} applied.`, discount: 0, freeShipping: true };
}
