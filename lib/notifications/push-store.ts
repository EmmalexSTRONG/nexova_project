import { createRecordStore } from "@/lib/shared/local-storage-store";
import type { StoredPushSubscription } from "./types";

// Keyed by customer email so any role's tab in this browser (customer,
// vendor, admin) can look up a customer's subscription when dispatching a
// notification — mirrors how order-store/booking-store are implicitly
// shared across simulated roles within one browser in this demo.
const store = createRecordStore<StoredPushSubscription>("nexora:push-subscriptions:v1");

export function savePushSubscription(email: string, subscription: StoredPushSubscription): void {
  if (typeof window === "undefined") return;
  const all = store.readAll();
  all[email.toLowerCase()] = subscription;
  store.writeAll(all);
}

export function getPushSubscription(email: string): StoredPushSubscription | null {
  return store.readAll()[email.toLowerCase()] ?? null;
}

export function removePushSubscription(email: string): void {
  if (typeof window === "undefined") return;
  const all = store.readAll();
  delete all[email.toLowerCase()];
  store.writeAll(all);
}
