import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { PlaceholderArt } from "./placeholder-art";
import { cn } from "@/lib/utils";

// Drop-in replacement for a bare PlaceholderArt call — shows the product's
// real photo when one exists, and falls back to the seeded gradient/icon
// otherwise (e.g. a vendor-drafted product with no photo yet).
export function ProductImage({
  image,
  seed,
  icon,
  alt = "",
  className,
  iconClassName,
}: {
  image?: string;
  seed: number;
  icon: LucideIcon;
  alt?: string;
  className?: string;
  iconClassName?: string;
}) {
  if (!image) {
    return <PlaceholderArt seed={seed} icon={icon} className={className} iconClassName={iconClassName} />;
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <Image
        src={`${image}?w=300&h=300&fit=crop&q=75&auto=format`}
        alt={alt}
        fill
        unoptimized
        sizes="300px"
        className="object-cover"
      />
    </div>
  );
}
