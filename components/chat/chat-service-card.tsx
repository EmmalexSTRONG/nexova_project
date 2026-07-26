import Link from "next/link";
import { Clock, Star } from "lucide-react";
import { getServiceIcon } from "@/lib/icon-map";
import { ProductImage } from "@/components/shared/product-image";
import { Price } from "@/components/shared/price";
import type { ChatServiceCard as ChatServiceCardData } from "@/lib/chat/types";

export function ChatServiceCard({ service }: { service: ChatServiceCardData }) {
  const Icon = getServiceIcon(service.seed);

  return (
    <Link
      href={`/services/${service.slug}`}
      target="_blank"
      className="relative flex w-32 shrink-0 flex-col gap-1.5 rounded-lg border bg-background p-2 text-left transition-shadow hover:shadow-md"
    >
      <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-ink/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-foreground backdrop-blur-sm">
        Book
      </span>
      <ProductImage image={service.image} seed={service.seed} icon={Icon} alt={service.name} className="aspect-square w-full rounded-md" iconClassName="h-1/3 w-1/3" />
      <p className="line-clamp-2 text-xs font-medium leading-snug">{service.name}</p>
      <p className="truncate text-[10px] text-muted-foreground">{service.providerName}</p>
      <div className="flex items-center justify-between gap-1">
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <Star className="h-2.5 w-2.5 fill-primary text-primary" />
          {service.rating}
        </span>
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <Clock className="h-2.5 w-2.5" />
          {service.durationLabel}
        </span>
      </div>
      <Price amount={service.price} currency={service.currency} size="sm" />
    </Link>
  );
}
