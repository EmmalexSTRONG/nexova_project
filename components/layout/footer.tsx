import Link from "next/link";
import { Facebook, Instagram, Twitter, ArrowUp, CreditCard, Smartphone as MobileMoneyIcon } from "lucide-react";
import { Logo } from "@/components/shared/logo";

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Get to know us",
    links: [
      { label: "About Nexora", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Nexora Blog", href: "/blog" },
    ],
  },
  {
    title: "Customer service",
    links: [
      { label: "Help center", href: "/help" },
      { label: "Track your order", href: "/account/orders" },
      { label: "Returns & refunds", href: "/help#returns" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    title: "For vendors",
    links: [
      { label: "Sell on Nexora", href: "/register/vendor" },
      { label: "Vendor dashboard", href: "/vendor/dashboard" },
      { label: "Vendor help center", href: "/help#vendors" },
      { label: "Advertise with us", href: "/help#advertising" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "All categories", href: "/categories" },
      { label: "Flash sales", href: "/deals" },
      { label: "Featured shops", href: "/vendors" },
      { label: "Services", href: "/services" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground print:hidden">
      <a
        href="#"
        className="flex items-center justify-center gap-2 border-b border-ink-border py-4 text-sm text-ink-muted transition-colors hover:text-ink-foreground"
      >
        <ArrowUp className="h-4 w-4" />
        Back to top
      </a>

      <div className="container grid grid-cols-2 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="font-display text-sm font-semibold">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ink-border">
        <div className="container flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo />
            <p className="mt-2 max-w-xs text-xs text-ink-muted">
              Thousands of independent shops, one checkout. Proudly connecting buyers and vendors across
              Ghana.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <CreditCard className="h-4 w-4" />
              Cards
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <MobileMoneyIcon className="h-4 w-4" />
              Mobile Money
            </div>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="text-ink-muted transition-colors hover:text-ink-foreground">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="text-ink-muted transition-colors hover:text-ink-foreground">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Twitter" className="text-ink-muted transition-colors hover:text-ink-foreground">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-border py-4">
        <p className="container text-center text-xs text-ink-muted">
          © {new Date().getFullYear()} Nexora. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
