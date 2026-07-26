import Link from "next/link";
import { Heart, LayoutDashboard, MapPin, Search, ShoppingCart, Store, User } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { CategoryStrip } from "@/components/layout/category-strip";
import { CartCountBadge } from "@/components/cart/cart-count-badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LiveClock } from "@/components/shared/live-clock";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 overflow-hidden bg-ink text-ink-foreground print:hidden">
      <div
        className="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #f0a93c 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 h-px gold-gradient opacity-60" aria-hidden="true" />
      <div className="relative hidden border-b border-ink-border sm:block">
        <div className="container flex h-9 items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Delivering across Ghana
            </span>
            <LiveClock className="hidden items-center gap-1.5 border-l border-ink-border pl-4 md:flex" />
          </div>
          <nav className="flex items-center gap-5">
            <Link href="/register/vendor" className="flex items-center gap-1 hover:text-ink-foreground">
              <Store className="h-3.5 w-3.5" />
              Sell on Nexora
            </Link>
            <Link href="/account/orders" className="hover:text-ink-foreground">
              Track order
            </Link>
            <Link href="/help" className="hover:text-ink-foreground">
              Help
            </Link>
          </nav>
        </div>
      </div>

      <div className="container flex h-16 items-center gap-4">
        <Logo />

        <form action="/search" method="GET" className="hidden flex-1 items-center md:flex">
          <div className="flex w-full overflow-hidden rounded-md bg-white">
            <input
              type="search"
              name="q"
              placeholder="Search products, shops, and services"
              className="w-full bg-transparent px-4 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex items-center justify-center bg-primary px-4 text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {session?.user ? (
            <Button asChild variant="ghost" className="gap-2 text-ink-foreground hover:bg-ink-border hover:text-ink-foreground">
              <Link href="/account">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{session.user.name?.split(" ")[0]}</span>
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" className="gap-2 text-ink-foreground hover:bg-ink-border hover:text-ink-foreground">
              <Link href="/admin/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </Button>
          )}

          <Button asChild variant="ghost" size="icon" className="text-ink-foreground hover:bg-ink-border hover:text-ink-foreground">
            <Link href="/account/wishlist" aria-label="Wishlist">
              <Heart className="h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="ghost" size="icon" className="relative text-ink-foreground hover:bg-ink-border hover:text-ink-foreground">
            <Link href="/cart" aria-label="Cart">
              <ShoppingCart className="h-4 w-4" />
              <CartCountBadge />
            </Link>
          </Button>

          <ThemeToggle className="text-ink-foreground hover:bg-ink-border" />
        </div>
      </div>

      <form action="/search" method="GET" className="border-t border-ink-border px-4 py-2 md:hidden">
        <div className="flex overflow-hidden rounded-md bg-white">
          <input
            type="search"
            name="q"
            placeholder="Search Nexora"
            className="w-full bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <button type="submit" aria-label="Search" className="flex items-center justify-center bg-primary px-3 text-primary-foreground">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      <CategoryStrip />
    </header>
  );
}
