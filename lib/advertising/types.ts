import type { CheckoutPaymentMethod, PaymentStatus } from "@/lib/checkout/types";

export type AdPlacement = "HOMEPAGE_BANNER" | "SIDEBAR" | "SPONSORED_PRODUCT" | "FEATURED_SHOP";

export type AdPlanDuration = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type AdCampaignStatus = "PENDING_PAYMENT" | "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface AdCampaignStatusEvent {
  status: AdCampaignStatus;
  timestamp: string;
  note?: string;
}

export interface PlacedAdCampaign {
  id: string;
  placement: AdPlacement;
  duration: AdPlanDuration;
  shopSlug: string;
  shopName: string;
  targetProductSlug?: string; // SPONSORED_PRODUCT only
  targetProductName?: string;
  title: string;
  tagline: string;
  linkUrl: string;
  imageDataUrl?: string; // falls back to deterministic placeholder art when absent
  imageSeed: number;
  createdAt: string;
  startsAt: string;
  endsAt: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: CheckoutPaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  status: AdCampaignStatus;
  statusHistory: AdCampaignStatusEvent[];
}
