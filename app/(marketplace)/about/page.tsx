import type { Metadata } from "next";
import Link from "next/link";
import { Store, Users, ShieldCheck, Truck } from "lucide-react";
import { categories } from "@/lib/data";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Nexora",
  description: "Nexora connects thousands of independent vendors across Ghana with a single, trusted checkout.",
};

const STATS = [
  { label: "Independent vendors", value: "3,000+" },
  { label: "Product categories", value: `${categories.length}` },
  { label: "Regions served", value: "16" },
  { label: "Avg. delivery time", value: "1–2 days" },
];

const VALUES = [
  {
    icon: Store,
    title: "Vendors keep their shop, we bring the customers",
    description:
      "Every seller on Nexora runs their own storefront, sets their own prices, and manages their own inventory. We handle discovery, checkout, and delivery coordination so they can focus on their craft.",
  },
  {
    icon: ShieldCheck,
    title: "One trusted checkout, no matter who you're buying from",
    description:
      "Whether you're buying from a phone accessories shop in Kumasi or a tailor in Accra, payment runs through the same secure checkout — cards, mobile money, or cash on delivery.",
  },
  {
    icon: Truck,
    title: "Built around how Ghana actually shops",
    description:
      "From mobile money at checkout to same-day delivery estimates by region, every part of Nexora is built for local buying habits rather than adapted from somewhere else.",
  },
  {
    icon: Users,
    title: "A marketplace, not a warehouse",
    description:
      "We don't hold stock. Every listing ships from the vendor who made or sourced it, which means more selection, fresher inventory, and a direct line between you and the people you're buying from.",
  },
];

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight text-balance">
          Thousands of independent shops. One checkout.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Nexora is a marketplace built for Ghana — connecting independent vendors, from fashion houses in Kumasi
          to electronics dealers in Accra, with buyers across the country through one trusted, unified checkout.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-4 text-center">
            <p className="font-mono text-2xl font-bold text-primary">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {VALUES.map((value) => (
          <div key={value.title} className="rounded-lg border bg-card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-primary">
              <value.icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <h2 className="mt-3 font-display text-base font-semibold">{value.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{value.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-3 rounded-lg border bg-card p-6">
        <div className="flex-1">
          <h2 className="font-display text-lg font-semibold">Want to sell on Nexora?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Join thousands of vendors already reaching customers across Ghana.</p>
        </div>
        <Button asChild>
          <Link href="/register/vendor">Sell on Nexora</Link>
        </Button>
      </div>
    </div>
  );
}
