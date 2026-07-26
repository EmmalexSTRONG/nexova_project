import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { getServiceBySlug, services } from "@/lib/data";
import { getServiceIcon } from "@/lib/icon-map";
import { ProductImage } from "@/components/shared/product-image";
import { StarRating } from "@/components/shared/star-rating";
import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactLinks } from "@/components/marketplace/contact-links";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return { title: `${service.name} — Nexora`, description: service.description };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const Icon = getServiceIcon(service.seed);

  return (
    <div className="container max-w-4xl py-10">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/services" className="hover:text-foreground">
          Services
        </Link>
        <span className="mx-1.5">/</span>
        <span>{service.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductImage image={service.image} seed={service.seed} icon={Icon} alt={service.name} className="aspect-[4/3] w-full rounded-lg" />

        <div>
          <Badge variant="secondary">{service.category}</Badge>
          <h1 className="mt-2 font-display text-2xl font-bold">{service.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">by {service.providerName}</p>

          <div className="mt-3">
            <StarRating rating={service.rating} reviewCount={service.reviewCount} />
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Price amount={service.price} currency={service.currency} size="lg" />
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {service.durationLabel}
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{service.description}</p>

          <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
            <Link href={`/services/${service.slug}/book`}>Book now</Link>
          </Button>

          <div className="mt-8 rounded-lg border bg-card p-4">
            <h2 className="font-display text-sm font-semibold">Contact the provider</h2>
            <p className="mt-1 text-xs text-muted-foreground">Have a question before booking? Reach out directly.</p>
            <div className="mt-3">
              <ContactLinks phone={service.phone} whatsapp={service.whatsapp} email={service.email} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
