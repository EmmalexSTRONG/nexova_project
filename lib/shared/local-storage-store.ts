// Shared read/write primitives for the localStorage-backed "store" modules
// used throughout this app (orders, bookings, ad campaigns, reviews, chat
// history, etc.) — every one of those files used to hand-roll the same
// typeof-window guard + try/catch JSON parse pair. Centralizing it here
// means that guard only has to be correct in one place.

function readRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): void {
  window.localStorage.setItem(key, value);
}

// For stores keyed by id: Record<id, T> (orders, bookings, ad campaigns,
// reviews, engagement, push subscriptions, shop-status/role overrides, ...).
export function createRecordStore<T>(key: string) {
  function readAll(): Record<string, T> {
    const raw = readRaw(key);
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }
  function writeAll(data: Record<string, T>): void {
    writeRaw(key, JSON.stringify(data));
  }
  return { key, readAll, writeAll };
}

// For stores that are just a flat list (admin-authored ads, vendor coupons,
// chat history, hidden-review ids).
export function createListStore<T>(key: string) {
  function readAll(): T[] {
    const raw = readRaw(key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  function writeAll(data: T[]): void {
    writeRaw(key, JSON.stringify(data));
  }
  return { key, readAll, writeAll };
}
