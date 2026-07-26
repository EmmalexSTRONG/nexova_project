// Estimates a plausible 5→1 star breakdown that (a) averages out close to
// `rating` and (b) sums to `total`, so the histogram stays consistent with
// the rating/reviewCount already shown everywhere else for this item —
// without needing hundreds of individual mock review rows on file.
export function estimateRatingDistribution(rating: number, total: number): number[] {
  if (total <= 0) return [0, 0, 0, 0, 0];

  const weights = [5, 4, 3, 2, 1].map((star) => Math.max(0, 1 - Math.abs(star - rating) / 2.5) ** 2);
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  const counts = weights.map((w) => Math.round((w / weightSum) * total));

  const drift = total - counts.reduce((sum, c) => sum + c, 0);
  counts[0] += drift;

  return counts;
}
