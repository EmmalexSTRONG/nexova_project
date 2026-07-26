import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers — Nexora",
  description: "Open roles at Nexora.",
};

export default function CareersPage() {
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">Careers at Nexora</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We&apos;re a small team building the marketplace that connects independent vendors across Ghana with
        buyers everywhere. We hire deliberately, and post roles here as soon as they open.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border bg-card py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
          <Briefcase className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium">No open positions right now</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Check back soon, or{" "}
          <Link href="/contact" className="font-medium text-foreground hover:underline">
            reach out
          </Link>{" "}
          if you think you&apos;d be a great fit for a future role.
        </p>
      </div>
    </div>
  );
}
