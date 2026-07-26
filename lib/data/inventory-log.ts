import type { InventoryLogEntry } from "./types";

export const inventoryLog: InventoryLogEntry[] = [
  {
    id: "inv-1",
    productSlug: "wireless-bluetooth-earbuds",
    changeType: "SALE",
    quantityDelta: -3,
    note: "3 units sold",
    occurredAtLabel: "2 hours ago",
  },
  {
    id: "inv-2",
    productSlug: "samsung-galaxy-a15-128gb",
    changeType: "RESTOCK",
    quantityDelta: 20,
    note: "New shipment received",
    occurredAtLabel: "Yesterday",
  },
  {
    id: "inv-3",
    productSlug: "14inch-laptop-8gb-256gb",
    changeType: "SALE",
    quantityDelta: -1,
    note: "1 unit sold",
    occurredAtLabel: "Yesterday",
  },
  {
    id: "inv-4",
    productSlug: "car-phone-mount-dashboard",
    changeType: "ADJUSTMENT",
    quantityDelta: 0,
    note: "Marked as discontinued — removed from public listings",
    occurredAtLabel: "3 days ago",
  },
  {
    id: "inv-5",
    productSlug: "wireless-bluetooth-earbuds",
    changeType: "RETURN",
    quantityDelta: 1,
    note: "Customer return — resealed, restocked",
    occurredAtLabel: "4 days ago",
  },
  {
    id: "inv-6",
    productSlug: "samsung-galaxy-a15-128gb",
    changeType: "SALE",
    quantityDelta: -2,
    note: "2 units sold",
    occurredAtLabel: "5 days ago",
  },
];

export function getInventoryLogForShop(productSlugs: string[]) {
  return inventoryLog.filter((entry) => productSlugs.includes(entry.productSlug));
}
