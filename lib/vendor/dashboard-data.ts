import { getAllOrders } from "@/lib/checkout/order-store";
import type { CheckoutPaymentMethod, PlacedOrder } from "@/lib/checkout/types";

// Orders live in localStorage (no live database in this build — see the
// order-store module for why), so every function here is meant to be called
// client-side, typically from a "use client" component's effect, exactly
// like VendorOrdersContent already does.

export function getVendorOrders(shopSlug: string): PlacedOrder[] {
  return getAllOrders().filter((order) => order.items.some((item) => item.shopSlug === shopSlug));
}

// Cash orders count as revenue once placed (the sale is committed even
// before cash physically changes hands); online payments only count once
// verified successful. Cancelled orders never count.
function isRevenueCounted(order: PlacedOrder): boolean {
  if (order.status === "CANCELLED") return false;
  return order.paymentMethod === "CASH" || order.paymentStatus === "SUCCESSFUL";
}

function shopRevenueForOrder(order: PlacedOrder, shopSlug: string): number {
  return order.items
    .filter((item) => item.shopSlug === shopSlug)
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export interface VendorSalesSummary {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  currency: string;
}

export function getVendorSalesSummary(orders: PlacedOrder[], shopSlug: string): VendorSalesSummary {
  const counted = orders.filter(isRevenueCounted);
  const totalRevenue = counted.reduce((sum, order) => sum + shopRevenueForOrder(order, shopSlug), 0);
  return {
    totalRevenue,
    orderCount: counted.length,
    averageOrderValue: counted.length > 0 ? totalRevenue / counted.length : 0,
    currency: orders[0]?.currency ?? "GHS",
  };
}

export interface VendorDayRevenue {
  dateLabel: string;
  revenue: number;
}

export function getVendorRevenueByDay(orders: PlacedOrder[], shopSlug: string, days = 7): VendorDayRevenue[] {
  const buckets: VendorDayRevenue[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayKey = day.toDateString();

    const revenue = orders
      .filter((order) => isRevenueCounted(order) && new Date(order.placedAt).toDateString() === dayKey)
      .reduce((sum, order) => sum + shopRevenueForOrder(order, shopSlug), 0);

    buckets.push({ dateLabel: day.toLocaleDateString(undefined, { weekday: "short", day: "numeric" }), revenue });
  }

  return buckets;
}

export interface VendorPaymentBreakdown {
  method: CheckoutPaymentMethod;
  orderCount: number;
  revenue: number;
}

export function getVendorPaymentBreakdown(orders: PlacedOrder[], shopSlug: string): VendorPaymentBreakdown[] {
  const counted = orders.filter(isRevenueCounted);
  const methods: CheckoutPaymentMethod[] = ["PAYSTACK", "FLUTTERWAVE", "CASH"];

  return methods
    .map((method) => {
      const methodOrders = counted.filter((order) => order.paymentMethod === method);
      return {
        method,
        orderCount: methodOrders.length,
        revenue: methodOrders.reduce((sum, order) => sum + shopRevenueForOrder(order, shopSlug), 0),
      };
    })
    .filter((entry) => entry.orderCount > 0);
}

export interface VendorTopProduct {
  productSlug: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export function getVendorTopProducts(orders: PlacedOrder[], shopSlug: string, limit = 5): VendorTopProduct[] {
  const counted = orders.filter(isRevenueCounted);
  const byProduct = new Map<string, VendorTopProduct>();

  for (const order of counted) {
    for (const item of order.items) {
      if (item.shopSlug !== shopSlug) continue;
      const existing = byProduct.get(item.productSlug);
      const revenue = item.unitPrice * item.quantity;
      if (existing) {
        existing.quantitySold += item.quantity;
        existing.revenue += revenue;
      } else {
        byProduct.set(item.productSlug, { productSlug: item.productSlug, name: item.name, quantitySold: item.quantity, revenue });
      }
    }
  }

  return [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export interface VendorCustomer {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
}

export function getVendorCustomers(orders: PlacedOrder[], shopSlug: string): VendorCustomer[] {
  const counted = orders.filter(isRevenueCounted);
  const byEmail = new Map<string, VendorCustomer>();

  for (const order of counted) {
    const spent = shopRevenueForOrder(order, shopSlug);
    const existing = byEmail.get(order.customerEmail);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += spent;
      if (new Date(order.placedAt) > new Date(existing.lastOrderAt)) existing.lastOrderAt = order.placedAt;
    } else {
      byEmail.set(order.customerEmail, {
        email: order.customerEmail,
        name: order.customerName,
        phone: order.customerPhone,
        orderCount: 1,
        totalSpent: spent,
        lastOrderAt: order.placedAt,
      });
    }
  }

  return [...byEmail.values()].sort((a, b) => b.totalSpent - a.totalSpent);
}
