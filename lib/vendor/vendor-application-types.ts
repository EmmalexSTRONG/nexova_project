export type VendorApplicationStatus = "PENDING_VERIFICATION" | "EMAIL_VERIFIED" | "SUBSCRIBED";

export type VendorSubscriptionPaymentStatus = "PENDING" | "SUCCESSFUL" | "FAILED";

export interface VendorApplication {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  businessAddress: string;
  shopName: string;
  category: string;
  status: VendorApplicationStatus;
  verificationToken: string;
  verificationExpiresAt: string;
  emailVerifiedAt?: string;
  subscriptionPlanId?: string;
  subscriptionAmount?: number;
  paymentMethod?: "PAYSTACK" | "FLUTTERWAVE";
  paymentReference?: string;
  paymentStatus?: VendorSubscriptionPaymentStatus;
  subscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}
