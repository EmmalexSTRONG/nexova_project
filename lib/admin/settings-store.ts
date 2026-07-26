export interface PlatformSettings {
  siteName: string;
  supportEmail: string;
  currency: string;
  commissionPercent: number;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  siteName: "Nexora",
  supportEmail: "support@nexora.example",
  currency: "GHS",
  commissionPercent: 8,
};

const STORAGE_KEY = "nexora:admin-platform-settings:v1";

export function getPlatformSettings(): PlatformSettings {
  if (typeof window === "undefined") return DEFAULT_PLATFORM_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PLATFORM_SETTINGS, ...JSON.parse(raw) } : DEFAULT_PLATFORM_SETTINGS;
  } catch {
    return DEFAULT_PLATFORM_SETTINGS;
  }
}

export function savePlatformSettings(settings: PlatformSettings): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
