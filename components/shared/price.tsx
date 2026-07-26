import { cn } from "@/lib/utils";

export function Price({
  amount,
  currency = "GHS",
  compareAt,
  size = "md",
  className,
}: {
  amount: number;
  currency?: string;
  compareAt?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  }[size];

  return (
    <span className={cn("inline-flex items-baseline gap-2 font-mono font-bold tabular-nums", sizeClass, className)}>
      <span>
        {currency} {amount.toLocaleString()}
      </span>
      {compareAt !== undefined && compareAt > amount && (
        <span className="text-xs font-normal text-muted-foreground line-through">
          {currency} {compareAt.toLocaleString()}
        </span>
      )}
    </span>
  );
}

export function discountPercent(amount: number, compareAt?: number) {
  if (!compareAt || compareAt <= amount) return null;
  return Math.round(((compareAt - amount) / compareAt) * 100);
}
