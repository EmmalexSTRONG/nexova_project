import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ShoppingBag, Store } from "lucide-react";

export const metadata: Metadata = { title: "Create an account — Nexora" };

const PATHS = [
  {
    href: "/register/customer",
    icon: ShoppingBag,
    title: "Shop as a customer",
    description: "Browse thousands of vendors, track orders, and book services in one place.",
  },
  {
    href: "/register/vendor",
    icon: Store,
    title: "Sell on the marketplace",
    description: "Open your own storefront, list products, and reach buyers across Ghana.",
  },
];

export default function RegisterChooserPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Join Nexora</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Choose how you want to use the marketplace.</p>

      <div className="mt-8 space-y-3">
        {PATHS.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-4 rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="flex items-center justify-between gap-2 font-display text-sm font-semibold text-foreground">
                {title}
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{description}</span>
            </span>
          </Link>
        ))}

        <p className="pt-3 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
