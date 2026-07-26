import { createRecordStore } from "@/lib/shared/local-storage-store";
import type { VendorApplication, VendorApplicationStatus } from "./vendor-application-types";

export const VENDOR_APPLICATIONS_STORAGE_KEY = "nexora:vendor-applications:v1";
const store = createRecordStore<VendorApplication>(VENDOR_APPLICATIONS_STORAGE_KEY);

export const VERIFICATION_TOKEN_TTL_HOURS = 24;

export function generateVendorApplicationId(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `VA-${datePart}-${randomPart}`;
}

export function generateVerificationToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().replace(/-/g, "");
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export function saveVendorApplication(application: VendorApplication): void {
  const applications = store.readAll();
  applications[application.id] = application;
  store.writeAll(applications);
}

export function getVendorApplicationById(id: string): VendorApplication | null {
  return store.readAll()[id] ?? null;
}

// Lets the "Become a vendor" form resume an in-flight application on this
// browser instead of starting over — e.g. after a refresh, or coming back
// from an expired verification link.
export function getLatestUnfinishedVendorApplication(): VendorApplication | null {
  const applications = Object.values(store.readAll()).filter((application) => application.status !== "SUBSCRIBED");
  if (applications.length === 0) return null;
  return applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

export function updateVendorApplication(id: string, patch: Partial<VendorApplication>): VendorApplication | null {
  const applications = store.readAll();
  const existing = applications[id];
  if (!existing) return null;
  const updated: VendorApplication = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  applications[id] = updated;
  store.writeAll(applications);
  return updated;
}

// Issues a fresh token + expiry for a new or resent verification email —
// shared by both the initial submit and the "resend" action so the two
// paths can never drift out of sync.
export function issueVerificationToken(id: string): VendorApplication | null {
  const token = generateVerificationToken();
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString();
  return updateVendorApplication(id, { verificationToken: token, verificationExpiresAt: expiresAt });
}

export type VerifyEmailResult = "VERIFIED" | "ALREADY_VERIFIED" | "EXPIRED" | "INVALID" | "NOT_FOUND";

// Consumes a verification link click: validates the token against the
// stored one and its expiry, then marks the application EMAIL_VERIFIED.
// Already-verified applications succeed idempotently (a vendor re-clicking
// an old email link shouldn't see an error).
export function verifyVendorApplicationEmail(id: string, token: string): VerifyEmailResult {
  const application = getVendorApplicationById(id);
  if (!application) return "NOT_FOUND";
  if (application.status !== "PENDING_VERIFICATION") return "ALREADY_VERIFIED";
  if (application.verificationToken !== token) return "INVALID";
  if (new Date(application.verificationExpiresAt).getTime() < Date.now()) return "EXPIRED";

  updateVendorApplication(id, { status: "EMAIL_VERIFIED", emailVerifiedAt: new Date().toISOString() });
  return "VERIFIED";
}

export function markVendorApplicationSubscribed(
  id: string,
  patch: { subscriptionPlanId: string; subscriptionAmount: number },
): VendorApplication | null {
  return updateVendorApplication(id, {
    status: "SUBSCRIBED" as VendorApplicationStatus,
    subscribedAt: new Date().toISOString(),
    ...patch,
  });
}
