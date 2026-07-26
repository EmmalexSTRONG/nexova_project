import { cn } from "@/lib/utils";

export function DiscountBadge({ percent, className }: { percent: number; className?: string }) {
  return (
    <span
      className={cn(
        "tag-notch inline-flex items-center bg-sale px-2 py-1 font-mono text-xs font-bold text-sale-foreground",
        className,
      )}
    >
      -{percent}%
    </span>
  );
}
