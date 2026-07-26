import type { BusinessHour } from "@/lib/data";
import { cn } from "@/lib/utils";

export function BusinessHoursTable({ hours }: { hours: BusinessHour[] }) {
  return (
    <dl className="divide-y text-sm">
      {hours.map((entry) => (
        <div key={entry.day} className="flex items-center justify-between py-2">
          <dt className="text-muted-foreground">{entry.day}</dt>
          <dd className={cn("font-medium", entry.hours === "Closed" && "text-muted-foreground")}>
            {entry.hours}
          </dd>
        </div>
      ))}
    </dl>
  );
}
