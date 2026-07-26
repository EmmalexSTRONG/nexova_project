import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-amber-200 to-orange-300",
  "from-rose-200 to-red-300",
  "from-emerald-200 to-teal-300",
  "from-sky-200 to-blue-300",
  "from-violet-200 to-purple-300",
  "from-lime-200 to-green-300",
  "from-fuchsia-200 to-pink-300",
  "from-yellow-100 to-amber-300",
];

export function PlaceholderArt({
  seed,
  icon: Icon,
  className,
  iconClassName,
}: {
  seed: number;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}) {
  const gradient = GRADIENTS[seed % GRADIENTS.length];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        gradient,
        className,
      )}
    >
      <Icon className={cn("h-1/3 w-1/3 text-black/20", iconClassName)} strokeWidth={1.5} />
    </div>
  );
}
