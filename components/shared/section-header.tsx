import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  hrefLabel = "View all",
  tone = "default",
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  tone?: "default" | "inverted";
  className?: string;
}) {
  const isInverted = tone === "inverted";

  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4", className)}>
      <div>
        <span
          className={cn(
            "tag-notch inline-block px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider",
            isInverted ? "bg-primary text-primary-foreground" : "bg-ink text-ink-foreground",
          )}
        >
          {eyebrow}
        </span>
        <h2
          className={cn(
            "mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl",
            isInverted ? "text-ink-foreground" : "text-foreground",
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn("mt-1 text-sm", isInverted ? "text-ink-muted" : "text-muted-foreground")}>
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={cn(
            "hidden shrink-0 items-center gap-1 text-sm font-semibold hover:underline sm:flex",
            isInverted ? "text-primary" : "text-foreground",
          )}
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
