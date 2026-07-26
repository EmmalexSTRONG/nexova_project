import type { UserRole } from "@/types";
import { createRecordStore } from "@/lib/shared/local-storage-store";

// There's no live user database in this build, so role changes made from
// the admin Users/Permissions pages are recorded here, keyed by email, and
// overlaid on top of each derived user's default role.
const store = createRecordStore<UserRole>("nexora:admin-user-roles:v1");

export function getRoleOverride(email: string): UserRole | null {
  return store.readAll()[email] ?? null;
}

export function setRoleOverride(email: string, role: UserRole): void {
  const overrides = store.readAll();
  overrides[email] = role;
  store.writeAll(overrides);
}
