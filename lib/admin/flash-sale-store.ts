import { createRecordStore } from "@/lib/shared/local-storage-store";
import type { MockProduct } from "@/lib/data";

export type DiscountType = "PERCENTAGE" | "FIXED";
export type FlashSaleCampaignStatus = "ACTIVE" | "CANCELLED";

export interface FlashSaleCampaign {
  id: string;
  title: string;
  discountType: DiscountType;
  discountValue: number;
  productSlugs: string[];
  startsAt: string;
  endsAt: string;
  status: FlashSaleCampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export const FLASH_SALE_CAMPAIGNS_STORAGE_KEY = "nexora:admin-flash-sale-campaigns:v1";
const store = createRecordStore<FlashSaleCampaign>(FLASH_SALE_CAMPAIGNS_STORAGE_KEY);

export function generateFlashSaleCampaignId(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `FS-${datePart}-${randomPart}`;
}

export function saveFlashSaleCampaign(campaign: FlashSaleCampaign): void {
  const all = store.readAll();
  all[campaign.id] = campaign;
  store.writeAll(all);
}

export function getFlashSaleCampaignById(id: string): FlashSaleCampaign | null {
  return store.readAll()[id] ?? null;
}

export function updateFlashSaleCampaign(id: string, patch: Partial<FlashSaleCampaign>): void {
  const all = store.readAll();
  const existing = all[id];
  if (!existing) return;
  all[id] = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  store.writeAll(all);
}

export function cancelFlashSaleCampaign(id: string): void {
  updateFlashSaleCampaign(id, { status: "CANCELLED" });
}

export function deleteFlashSaleCampaign(id: string): void {
  const all = store.readAll();
  delete all[id];
  store.writeAll(all);
}

export function getAllFlashSaleCampaigns(): FlashSaleCampaign[] {
  return Object.values(store.readAll()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

// A campaign is live purely as a function of its start/end window — checked
// at read time so campaigns auto-activate and auto-deactivate without any
// admin action or background job.
export function isFlashSaleCampaignLive(campaign: FlashSaleCampaign): boolean {
  const now = Date.now();
  return (
    campaign.status !== "CANCELLED" &&
    new Date(campaign.startsAt).getTime() <= now &&
    new Date(campaign.endsAt).getTime() > now
  );
}

export function getFlashSaleCampaignPhase(campaign: FlashSaleCampaign): "upcoming" | "live" | "ended" | "cancelled" {
  if (campaign.status === "CANCELLED") return "cancelled";
  const now = Date.now();
  if (now < new Date(campaign.startsAt).getTime()) return "upcoming";
  if (now >= new Date(campaign.endsAt).getTime()) return "ended";
  return "live";
}

export function getLiveFlashSaleCampaigns(): FlashSaleCampaign[] {
  return getAllFlashSaleCampaigns()
    .filter(isFlashSaleCampaignLive)
    .sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime());
}

// Earliest end time among currently-live campaigns — drives the homepage
// countdown so it reflects a real deadline instead of a decorative one.
export function getSoonestFlashSaleEndTime(): string | undefined {
  return getLiveFlashSaleCampaigns()[0]?.endsAt;
}

function applyDiscount(price: number, campaign: FlashSaleCampaign): number {
  if (campaign.discountType === "PERCENTAGE") {
    return Math.max(0, Math.round(price * (1 - campaign.discountValue / 100)));
  }
  return Math.max(0, Math.round((price - campaign.discountValue) * 100) / 100);
}

// Deterministic fallback "% claimed" for campaign products that don't
// already carry a stockPercent from the seed catalog — purely decorative
// urgency UI, so a stable pseudo-random value is enough.
function fallbackStockPercent(seed: number): number {
  return 20 + (seed % 60);
}

// Overlays live campaign pricing onto the full catalog: discounted price,
// original price preserved as the strike-through compareAtPrice, and a flash
// sale flag/urgency bar — without mutating the static seed products' own
// evergreen `isFlashSale` items.
// `skipOverlay` forces the same (localStorage-free) result the server
// sees, for seeding client `useState` initial values so the first client
// render matches the SSR'd HTML — see the matching comment in
// category-store.ts.
export function getEffectiveFlashSaleProducts(allProducts: MockProduct[], skipOverlay = false): MockProduct[] {
  const liveCampaigns = skipOverlay ? [] : getLiveFlashSaleCampaigns();
  const bySlug = new Map<string, MockProduct>();

  for (const product of allProducts) {
    if (product.isFlashSale) bySlug.set(product.slug, product);
  }

  for (const campaign of liveCampaigns) {
    for (const slug of campaign.productSlugs) {
      const product = allProducts.find((p) => p.slug === slug);
      if (!product) continue;
      bySlug.set(slug, {
        ...product,
        price: applyDiscount(product.price, campaign),
        compareAtPrice: Math.max(product.compareAtPrice ?? 0, product.price),
        isFlashSale: true,
        stockPercent: product.stockPercent ?? fallbackStockPercent(product.seed),
      });
    }
  }

  return Array.from(bySlug.values());
}
