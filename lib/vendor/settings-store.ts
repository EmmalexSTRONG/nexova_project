export interface VendorShopSettings {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
}

const STORAGE_KEY_PREFIX = "nexora:vendor-settings:";

export function getVendorSettingsOverride(shopSlug: string): VendorShopSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + shopSlug);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveVendorSettingsOverride(shopSlug: string, settings: VendorShopSettings): void {
  window.localStorage.setItem(STORAGE_KEY_PREFIX + shopSlug, JSON.stringify(settings));
}
