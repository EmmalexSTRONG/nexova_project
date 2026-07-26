import { createListStore } from "@/lib/shared/local-storage-store";

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  linkUrl: string;
  placement: "HOMEPAGE_HERO" | "HOMEPAGE_BANNER" | "CATEGORY_PAGE";
  active: boolean;
  createdAt: string;
}

const store = createListStore<Advertisement>("nexora:admin-ads:v1");

export function getAds(): Advertisement[] {
  return store.readAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createAd(input: Omit<Advertisement, "id" | "active" | "createdAt">): Advertisement {
  const ad: Advertisement = {
    ...input,
    id: `ad-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    active: true,
    createdAt: new Date().toISOString(),
  };
  const ads = store.readAll();
  ads.push(ad);
  store.writeAll(ads);
  return ad;
}

export function setAdActive(id: string, active: boolean): void {
  const ads = store.readAll();
  const ad = ads.find((a) => a.id === id);
  if (!ad) return;
  ad.active = active;
  store.writeAll(ads);
}

export function deleteAd(id: string): void {
  store.writeAll(store.readAll().filter((a) => a.id !== id));
}
