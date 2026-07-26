"use client";

import { useState } from "react";
import { useLiveRefresh } from "./use-live-refresh";

// Resolves a single entity (a blog post by slug, a category by slug, a
// campaign by id) from a store on mount and whenever a watched key changes.
// `undefined` means "still resolving," `null` means "resolved, not found" —
// the shape every admin edit-client page needs for its loading/not-found UI.
export function useResolvedEntity<T>(resolve: () => T | null, watchKeys: string[]): T | null | undefined {
  const [entity, setEntity] = useState<T | null | undefined>(undefined);
  useLiveRefresh(() => setEntity(resolve()), watchKeys);
  return entity;
}
