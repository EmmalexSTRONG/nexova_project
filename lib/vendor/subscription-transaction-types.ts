export type SubscriptionTransactionStatus = "PENDING" | "SUCCESSFUL" | "FAILED";

// One row per payment attempt — a retry after a failure is a new row, never
// an overwrite, so the full attempt history survives.
export interface VendorSubscriptionTransaction {
  reference: string;
  vendorApplicationId: string;
  network: "MTN";
  phone: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: SubscriptionTransactionStatus;
  providerStatus?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}
