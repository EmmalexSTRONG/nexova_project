import type { Metadata } from "next";
import { services } from "@/lib/data";
import { ServiceCard } from "@/components/marketplace/service-card";

export const metadata: Metadata = {
  title: "Services — Nexora",
  description: "Book vetted local professionals, paid and scheduled through Nexora.",
};

export default function ServicesPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Services</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {services.length} vetted local professionals — booked, scheduled, and paid through Nexora.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
