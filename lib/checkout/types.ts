import type { GhanaRegion } from "@/lib/shipping";

export type FulfillmentMethod = "DELIVERY" | "PICKUP";

export type CheckoutPaymentMethod = "PAYSTACK" | "FLUTTERWAVE" | "CASH";

// PENDING covers both "awaiting redirect-back verification" (Paystack/Flutterwave)
// and "will pay in person" (Cash) — the two are distinguished by paymentMethod.
export type PaymentStatus = "PENDING" | "SUCCESSFUL" | "FAILED";

export type OrderStatus =
  | "ORDER_RECEIVED"
  | "PAYMENT_CONFIRMED"
  | "PROCESSING"
  | "PACKING"
  | "READY_FOR_PICKUP"
  | "DISPATCHED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface ShippingAddressInput {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  region: GhanaRegion;
  lat?: number;
  lng?: number;
}

export interface PickupPoint {
  shopSlug: string;
  shopName: string;
  addressLine: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
}

export interface PlacedOrderItem {
  productSlug: string;
  name: string;
  shopSlug: string;
  shopName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
}

export interface PlacedOrder {
  orderNumber: string;
  placedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillment: FulfillmentMethod;
  shippingAddress?: ShippingAddressInput;
  pickupPoints?: PickupPoint[];
  paymentMethod: CheckoutPaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  items: PlacedOrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  total: number;
  currency: string;
  emailSent: boolean;
}
