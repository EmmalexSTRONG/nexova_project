import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketplaceNotFound() {
  return (
    <div className="container flex flex-col items-center gap-4 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
        <Compass className="h-6 w-6" />
      </span>
      <h1 className="font-display text-2xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The shop, product, or page you&apos;re looking for may have moved or no longer exists.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Back to homepage</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/vendors">Browse all shops</Link>
        </Button>
      </div>
    </div>
  );
}
