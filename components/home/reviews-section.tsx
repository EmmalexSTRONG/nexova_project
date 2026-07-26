import { reviews } from "@/lib/data";
import { ReviewMarqueeCard } from "@/components/marketplace/review-marquee-card";
import { SectionHeader } from "@/components/shared/section-header";

export function ReviewsSection() {
  const half = Math.ceil(reviews.length / 2);
  const rowA = reviews.slice(0, half);
  const rowB = reviews.slice(half);

  return (
    <section className="overflow-hidden py-12 md:py-16">
      <div className="container">
        <SectionHeader
          eyebrow="Trusted"
          title="What shoppers are saying"
          description="Real reviews from real orders across Ghana."
        />
      </div>

      <div className="mt-2 flex flex-col gap-4">
        <div className="group/marquee overflow-hidden [-webkit-mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="flex w-max animate-marquee-left gap-4 group-hover/marquee:[animation-play-state:paused]">
            {[...rowA, ...rowA].map((review, i) => (
              <ReviewMarqueeCard key={`${review.id}-${i}`} review={review} />
            ))}
          </div>
        </div>
        <div className="group/marquee overflow-hidden [-webkit-mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="flex w-max animate-marquee-right gap-4 group-hover/marquee:[animation-play-state:paused]">
            {[...rowB, ...rowB].map((review, i) => (
              <ReviewMarqueeCard key={`${review.id}-${i}`} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
