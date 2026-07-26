import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "Press — Nexora",
  description: "Media inquiries and press resources for Nexora.",
};

export default function PressPage() {
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">Press</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Nexora connects thousands of independent vendors across Ghana with a single, trusted checkout. For
        interview requests, data, or brand assets, reach out to our media contact below.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border bg-card py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
          <Newspaper className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium">Media inquiries</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          For press and media requests, contact us and mention &ldquo;Press&rdquo; in your message.
        </p>
        <Link href="/contact" className="text-sm font-medium text-primary hover:underline">
          Contact us
        </Link>
      </div>
    </div>
  );
}
