import type { Metadata } from "next";
import { Zap } from "lucide-react";
import { DealsContent } from "@/components/marketplace/deals-content";

export const metadata: Metadata = {
  title: "Flash sales — Nexora",
  description: "Time-limited deals from vendors across Ghana — while stock lasts.",
};

export default function DealsPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sale/10 text-sale">
          <Zap className="h-5 w-5" />
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight">Flash sales</h1>
      </div>
      <DealsContent />
    </div>
  );
}
