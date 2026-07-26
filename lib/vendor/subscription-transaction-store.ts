import { createRecordStore } from "@/lib/shared/local-storage-store";
import type { VendorSubscriptionTransaction } from "./subscription-transaction-types";

export const VENDOR_SUBSCRIPTION_TRANSACTIONS_STORAGE_KEY = "nexora:vendor-subscription-transactions:v1";
const store = createRecordStore<VendorSubscriptionTransaction>(VENDOR_SUBSCRIPTION_TRANSACTIONS_STORAGE_KEY);

export function generateSubscriptionTransactionReference(applicationId: string): string {
  return `${applicationId}-${Date.now()}`;
}

export function saveSubscriptionTransaction(transaction: VendorSubscriptionTransaction): void {
  const transactions = store.readAll();
  transactions[transaction.reference] = transaction;
  store.writeAll(transactions);
}

export function updateSubscriptionTransaction(
  reference: string,
  patch: Partial<VendorSubscriptionTransaction>,
): VendorSubscriptionTransaction | null {
  const transactions = store.readAll();
  const existing = transactions[reference];
  if (!existing) return null;
  const updated: VendorSubscriptionTransaction = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  transactions[reference] = updated;
  store.writeAll(transactions);
  return updated;
}

// Every payment attempt for a given application, newest first — the audit
// trail a vendor (or admin) sees, distinct from the application's single
// "current" status field.
export function getSubscriptionTransactionsForApplication(applicationId: string): VendorSubscriptionTransaction[] {
  return Object.values(store.readAll())
    .filter((transaction) => transaction.vendorApplicationId === applicationId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
