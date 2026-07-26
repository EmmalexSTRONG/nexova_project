"use client";

import Link from "next/link";
import { useOrderLookup } from "@/lib/checkout/use-order-lookup";
import { Button } from "@/components/ui/button";
import { OrderDocument } from "@/components/checkout/order-document";
import { PrintButton } from "@/components/checkout/print-button";

export function OrderDocumentPageContent({
  orderNumber,
  variant,
}: {
  orderNumber: string;
  variant: "invoice" | "receipt";
}) {
  const order = useOrderLookup(orderNumber);

  if (order === undefined) {
    return <div className="container py-16 text-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (order === null) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">We couldn&apos;t find that order</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This order may have been placed on a different device or browser.
        </p>
        <Button asChild size="lg">
          <Link href="/">Back to homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mx-auto flex max-w-2xl items-center justify-between print:hidden">
        <Link
          href={`/orders/${orderNumber}/confirmation`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to order confirmation
        </Link>
        <PrintButton />
      </div>
      <div className="mt-4">
        <OrderDocument order={order} variant={variant} />
      </div>
    </div>
  );
}
