import { createRecordStore } from "@/lib/shared/local-storage-store";
import type { SubmittedReview } from "./types";

export const REVIEWS_STORAGE_KEY = "nexora:reviews:v1";
const store = createRecordStore<SubmittedReview>(REVIEWS_STORAGE_KEY);

export function generateReviewId(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `REV-${datePart}-${randomPart}`;
}

export function saveReview(review: SubmittedReview): void {
  const reviews = store.readAll();
  reviews[review.id] = review;
  store.writeAll(reviews);
}

export function getAllSubmittedReviews(): SubmittedReview[] {
  return Object.values(store.readAll()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getSubmittedReviewsByProductSlug(productSlug: string): SubmittedReview[] {
  return getAllSubmittedReviews().filter((review) => review.productSlug === productSlug);
}

export function hasCustomerReviewedProduct(email: string, productSlug: string): boolean {
  const normalized = email.toLowerCase();
  return getAllSubmittedReviews().some(
    (review) => review.productSlug === productSlug && review.customerEmail.toLowerCase() === normalized,
  );
}
