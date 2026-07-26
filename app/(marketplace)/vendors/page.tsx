import type { Metadata } from "next";
import { shops } from "@/lib/data";
import { ShopCard } from "@/components/marketplace/shop-card";
import { NearbyShops } from "@/components/marketplace/nearby-shops";

export const metadata: Metadata = {
  title: "All shops — Nexora",
  description: "Browse every vendor on Nexora.",
};

export default function VendorsPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">All shops</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {shops.length} independent vendors selling on Nexora.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-semibold">Nearby shops</h2>
        <NearbyShops limit={4} />
      </section>

      <h2 className="mb-4 font-display text-lg font-semibold">All shops</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </div>
  );
}
