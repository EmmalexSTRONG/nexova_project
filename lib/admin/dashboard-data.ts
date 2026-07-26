import { getAllOrders } from "@/lib/checkout/order-store";
import { shops } from "@/lib/data";
import type { CheckoutPaymentMethod, PlacedOrder } from "@/lib/checkout/types";

// Same client-only caveat as the vendor dashboard data module: orders live
// in localStorage, so these are meant to be called from "use client"
// components after mount, not during server rendering.

export function getSiteOrders(): PlacedOrder[] {
  return getAllOrders();
}

function isRevenueCounted(order: PlacedOrder): boolean {
  if (order.status === "CANCELLED") return false;
  return order.paymentMethod === "CASH" || order.paymentStatus === "SUCCESSFUL";
}

export interface PlatformSalesSummary {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  currency: string;
}

export function getPlatformSalesSummary(orders: PlacedOrder[]): PlatformSalesSummary {
  const counted = orders.filter(isRevenueCounted);
  const totalRevenue = counted.reduce((sum, order) => sum + order.total, 0);
  return {
    totalRevenue,
    orderCount: counted.length,
    averageOrderValue: counted.length > 0 ? totalRevenue / counted.length : 0,
    currency: orders[0]?.currency ?? "GHS",
  };
}

export interface PlatformDayRevenue {
  dateLabel: string;
  revenue: number;
}

export function getPlatformRevenueByDay(orders: PlacedOrder[], days = 7): PlatformDayRevenue[] {
  const buckets: PlatformDayRevenue[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayKey = day.toDateString();

    const revenue = orders
      .filter((order) => isRevenueCounted(order) && new Date(order.placedAt).toDateString() === dayKey)
      .reduce((sum, order) => sum + order.total, 0);

    buckets.push({ dateLabel: day.toLocaleDateString(undefined, { weekday: "short", day: "numeric" }), revenue });
  }

  return buckets;
}

export interface TopShop {
  shopSlug: string;
  shopName: string;
  revenue: number;
  orderCount: number;
}

export function getTopShops(orders: PlacedOrder[], limit = 5): TopShop[] {
  const counted = orders.filter(isRevenueCounted);
  const byShop = new Map<string, TopShop>();

  for (const order of counted) {
    const shopSlugsInOrder = new Set(order.items.map((item) => item.shopSlug));
    for (const shopSlug of shopSlugsInOrder) {
      const revenue = order.items
        .filter((item) => item.shopSlug === shopSlug)
        .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const shopName = order.items.find((item) => item.shopSlug === shopSlug)?.shopName ?? shopSlug;
      const existing = byShop.get(shopSlug);
      if (existing) {
        existing.revenue += revenue;
        existing.orderCount += 1;
      } else {
        byShop.set(shopSlug, { shopSlug, shopName, revenue, orderCount: 1 });
      }
    }
  }

  return [...byShop.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export interface TopProduct {
  productSlug: string;
  name: string;
  shopName: string;
  quantitySold: number;
  revenue: number;
}

export function getTopProductsSiteWide(orders: PlacedOrder[], limit = 5): TopProduct[] {
  const counted = orders.filter(isRevenueCounted);
  const byProduct = new Map<string, TopProduct>();

  for (const order of counted) {
    for (const item of order.items) {
      const revenue = item.unitPrice * item.quantity;
      const existing = byProduct.get(item.productSlug);
      if (existing) {
        existing.quantitySold += item.quantity;
        existing.revenue += revenue;
      } else {
        byProduct.set(item.productSlug, {
          productSlug: item.productSlug,
          name: item.name,
          shopName: item.shopName,
          quantitySold: item.quantity,
          revenue,
        });
      }
    }
  }

  return [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export interface PlatformCustomer {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
}

export function getPlatformCustomers(orders: PlacedOrder[]): PlatformCustomer[] {
  const counted = orders.filter(isRevenueCounted);
  const byEmail = new Map<string, PlatformCustomer>();

  for (const order of counted) {
    const existing = byEmail.get(order.customerEmail);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += order.total;
      if (new Date(order.placedAt) > new Date(existing.lastOrderAt)) existing.lastOrderAt = order.placedAt;
    } else {
      byEmail.set(order.customerEmail, {
        email: order.customerEmail,
        name: order.customerName,
        phone: order.customerPhone,
        orderCount: 1,
        totalSpent: order.total,
        lastOrderAt: order.placedAt,
      });
    }
  }

  return [...byEmail.values()].sort((a, b) => b.totalSpent - a.totalSpent);
}

export interface PlatformPaymentBreakdown {
  method: CheckoutPaymentMethod;
  orderCount: number;
  revenue: number;
}

export function getPlatformPaymentBreakdown(orders: PlacedOrder[]): PlatformPaymentBreakdown[] {
  const counted = orders.filter(isRevenueCounted);
  const methods: CheckoutPaymentMethod[] = ["PAYSTACK", "FLUTTERWAVE", "CASH"];

  return methods
    .map((method) => {
      const methodOrders = counted.filter((order) => order.paymentMethod === method);
      return {
        method,
        orderCount: methodOrders.length,
        revenue: methodOrders.reduce((sum, order) => sum + order.total, 0),
      };
    })
    .filter((entry) => entry.orderCount > 0);
}

// "Vendor users" — the app has no live user database, so the seller behind
// each mock shop stands in for a registered vendor account.
export interface VendorUser {
  shopSlug: string;
  name: string;
  email: string;
  shopName: string;
  memberSince: number;
  verified: boolean;
}

export function getVendorUsers(): VendorUser[] {
  return shops.map((shop) => ({
    shopSlug: shop.slug,
    name: shop.seller.ownerName,
    email: shop.email,
    shopName: shop.name,
    memberSince: shop.seller.memberSince,
    verified: shop.verified,
  }));
}
