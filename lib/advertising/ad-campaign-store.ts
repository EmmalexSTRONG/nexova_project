import { createRecordStore } from "@/lib/shared/local-storage-store";
import type { AdCampaignStatus, PlacedAdCampaign } from "./types";

export const AD_CAMPAIGNS_STORAGE_KEY = "nexora:ad-campaigns:v1";
const store = createRecordStore<PlacedAdCampaign>(AD_CAMPAIGNS_STORAGE_KEY);

export function generateAdCampaignId(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `AD-${datePart}-${randomPart}`;
}

export function saveAdCampaign(campaign: PlacedAdCampaign): void {
  const campaigns = store.readAll();
  campaigns[campaign.id] = campaign;
  store.writeAll(campaigns);
}

export function getAdCampaignById(id: string): PlacedAdCampaign | null {
  return store.readAll()[id] ?? null;
}

export function updateAdCampaign(id: string, patch: Partial<PlacedAdCampaign>): void {
  const campaigns = store.readAll();
  const existing = campaigns[id];
  if (!existing) return;
  campaigns[id] = { ...existing, ...patch };
  store.writeAll(campaigns);
}

export function getAllAdCampaigns(): PlacedAdCampaign[] {
  return Object.values(store.readAll()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getAdCampaignsByShop(shopSlug: string): PlacedAdCampaign[] {
  return getAllAdCampaigns().filter((campaign) => campaign.shopSlug === shopSlug);
}

export function updateAdCampaignStatus(id: string, status: AdCampaignStatus, note?: string): PlacedAdCampaign | null {
  const campaigns = store.readAll();
  const existing = campaigns[id];
  if (!existing) return null;

  const event = { status, timestamp: new Date().toISOString(), note };
  const updated: PlacedAdCampaign = { ...existing, status, statusHistory: [...existing.statusHistory, event] };
  campaigns[id] = updated;
  store.writeAll(campaigns);
  return updated;
}
