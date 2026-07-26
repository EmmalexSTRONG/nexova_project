import { createRecordStore } from "@/lib/shared/local-storage-store";

export type ShopAdminStatus = "ACTIVE" | "SUSPENDED";

const store = createRecordStore<ShopAdminStatus>("nexora:admin-shop-status:v1");

export function getShopStatus(shopSlug: string): ShopAdminStatus {
  return store.readAll()[shopSlug] ?? "ACTIVE";
}

export function setShopStatus(shopSlug: string, status: ShopAdminStatus): void {
  const overrides = store.readAll();
  overrides[shopSlug] = status;
  store.writeAll(overrides);
}
