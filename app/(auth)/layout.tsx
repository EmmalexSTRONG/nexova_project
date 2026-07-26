import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Logo } from "@/components/shared/logo";

const HIGHLIGHTS = [
  { icon: Sparkles, label: "Thousands of vetted vendors in one place" },
  { icon: Truck, label: "Real-time delivery tracking on every order" },
  { icon: ShieldCheck, label: "Buyer protection built into every checkout" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — the story, hidden below lg where space is tight */}
      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #f0a93c 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #f0a93c 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        <Logo className="relative text-2xl" />

        <div className="relative max-w-md">
          <span className="tag-notch inline-block bg-primary px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
            Ghana&apos;s marketplace
          </span>
          <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink-foreground">
            Shop, sell, and grow with <span className="gold-gradient-text">Nexora</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            One account for shopping, booking services, and running your own storefront — trusted by
            thousands of shoppers and vendors across Ghana.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-ink-foreground/90">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-xs text-ink-muted">
          © {new Date().getFullYear()} Nexora. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col bg-background px-4 py-8 sm:px-8 lg:justify-center lg:px-16 lg:py-12 xl:px-24">
        <div className="mb-10 flex items-center gap-4 lg:absolute lg:right-10 lg:top-10 lg:mb-0">
          <Logo inverted={false} className="lg:hidden" />
          <Link
            href="/"
            className="ml-auto flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
