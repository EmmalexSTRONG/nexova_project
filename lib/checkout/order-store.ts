import { createRecordStore } from "@/lib/shared/local-storage-store";
import type { OrderStatus, PlacedOrder } from "./types";

export const ORDERS_STORAGE_KEY = "nexora:orders:v1";
const store = createRecordStore<PlacedOrder>(ORDERS_STORAGE_KEY);

export function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `MKT-${datePart}-${randomPart}`;
}

export function saveOrder(order: PlacedOrder): void {
  const orders = store.readAll();
  orders[order.orderNumber] = order;
  store.writeAll(orders);
}

export function getOrderByNumber(orderNumber: string): PlacedOrder | null {
  return store.readAll()[orderNumber] ?? null;
}

export function updateOrder(orderNumber: string, patch: Partial<PlacedOrder>): void {
  const orders = store.readAll();
  const existing = orders[orderNumber];
  if (!existing) return;
  orders[orderNumber] = { ...existing, ...patch };
  store.writeAll(orders);
}

export function getAllOrders(): PlacedOrder[] {
  return Object.values(store.readAll()).sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
  );
}

export function updateOrderStatus(orderNumber: string, status: OrderStatus, note?: string): PlacedOrder | null {
  const orders = store.readAll();
  const existing = orders[orderNumber];
  if (!existing) return null;

  const event = { status, timestamp: new Date().toISOString(), note };
  const updated: PlacedOrder = { ...existing, status, statusHistory: [...existing.statusHistory, event] };
  orders[orderNumber] = updated;
  store.writeAll(orders);
  return updated;
}
