import { services } from "@/lib/data";
import { ServiceSpotlightCard } from "@/components/marketplace/service-spotlight-card";
import { SectionHeader } from "@/components/shared/section-header";
import { HorizontalScroller } from "@/components/shared/horizontal-scroller";

export function ServicesSection() {
  return (
    <section className="relative overflow-hidden bg-ink py-12 md:py-16">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-px gold-gradient opacity-40" aria-hidden="true" />

      <div className="container relative">
        <SectionHeader
          eyebrow="Book a pro"
          title="Services near you"
          description="Vetted local professionals — booked and paid through Nexora."
          href="/services"
          tone="inverted"
        />
        <HorizontalScroller className="pt-2">
          {services.map((service) => (
            <ServiceSpotlightCard key={service.id} service={service} />
          ))}
        </HorizontalScroller>
      </div>
    </section>
  );
}
