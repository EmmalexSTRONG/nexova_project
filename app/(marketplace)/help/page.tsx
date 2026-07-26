import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw, Store, Megaphone } from "lucide-react";
import { HelpFaqSearch } from "@/components/support/help-faq-search";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Help center — Nexora",
  description: "Answers on delivery, returns, payments, and selling on Nexora.",
};

export default function HelpPage() {
  return (
    <div className="container max-w-3xl py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">Help center</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Search common questions below, or jump to a topic — returns, selling on Nexora, and advertising.
      </p>

      <div className="mt-6">
        <HelpFaqSearch />
      </div>

      <section id="returns" className="mt-12 scroll-mt-20 border-t pt-8">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-primary">
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <h2 className="font-display text-lg font-semibold">Returns & refunds</h2>
        </div>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <p>
            Most items can be returned within 7 days of delivery in their original, unused condition — exact
            windows can vary slightly by vendor, so check the store policies section on the shop&apos;s page before
            you buy.
          </p>
          <p>
            To start a return, open the order in <Link href="/account/orders" className="font-medium text-foreground hover:underline">My orders</Link> and
            use the order tracking page to contact the vendor directly, or message our support team if the item
            arrived damaged or incorrect.
          </p>
          <p>Refunds are issued back to your original payment method once the vendor confirms the returned item.</p>
        </div>
      </section>

      <section id="vendors" className="mt-10 scroll-mt-20 border-t pt-8">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-primary">
            <Store className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <h2 className="font-display text-lg font-semibold">For vendors</h2>
        </div>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <p>
            Selling on Nexora means keeping full control of your shop — pricing, inventory, and fulfillment — while
            we handle discovery, checkout, and payment processing across cards and mobile money.
          </p>
          <p>
            Getting started takes a vendor application, a short shop setup, and your first product listing. Most
            new shops are approved and listing within a day.
          </p>
        </div>
        <Button asChild size="sm" className="mt-3">
          <Link href="/register/vendor">Sell on Nexora</Link>
        </Button>
      </section>

      <section id="advertising" className="mt-10 scroll-mt-20 border-t pt-8 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-primary">
            <Megaphone className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <h2 className="font-display text-lg font-semibold">Advertise with us</h2>
        </div>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <p>
            Vendors can boost visibility through homepage banners, sponsored product placements, and featured shop
            slots — priced per placement and booked directly from the vendor dashboard.
          </p>
          <p>
            Already have a shop? Open <span className="font-medium text-foreground">Advertising</span> in your vendor
            dashboard to see live placements and pricing.
          </p>
        </div>
      </section>

      <div className="mt-8 rounded-lg border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">Still stuck? Reach our support team directly.</p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}
