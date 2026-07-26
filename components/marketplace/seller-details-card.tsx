import { CalendarClock, MessageSquare, TrendingUp, UserRound } from "lucide-react";
import type { ShopSellerDetails } from "@/lib/data";

export function SellerDetailsCard({ seller }: { seller: ShopSellerDetails }) {
  const items = [
    { icon: UserRound, label: "Owner", value: seller.ownerName },
    { icon: CalendarClock, label: "Vendor since", value: String(seller.memberSince) },
    { icon: TrendingUp, label: "Response rate", value: `${seller.responseRate}%` },
    { icon: MessageSquare, label: "Response time", value: seller.responseTime },
  ];

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-display text-sm font-semibold">Seller details</h3>
      <dl className="mt-3 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 text-sm">
            <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <dt className="text-muted-foreground">{item.label}</dt>
            <dd className="ml-auto font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
