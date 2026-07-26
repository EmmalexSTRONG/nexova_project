"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Bell,
  Boxes,
  FileText,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const NAV_ITEMS = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/sales", label: "Sales", icon: TrendingUp },
  { href: "/vendor/orders", label: "Orders", icon: ShoppingBag },
  { href: "/vendor/products", label: "Products", icon: Package },
  { href: "/vendor/customers", label: "Customers", icon: Users },
  { href: "/vendor/inventory", label: "Inventory", icon: Boxes },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/vendor/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/vendor/advertising", label: "Advertising", icon: Megaphone },
  { href: "/vendor/coupons", label: "Coupons", icon: Tag },
  { href: "/vendor/reports", label: "Reports", icon: FileText },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
] as const;

export function VendorShell({
  shopSlug,
  shopName,
  userName,
  userEmail,
  children,
}: {
  shopSlug: string;
  shopName: string;
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  // Belt-and-braces: close the drawer on route change, Escape, and lock
  // background scroll while it's open (nav links already close it on click).
  useEffect(() => setMobileNavOpen(false), [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileNavOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileNavOpen]);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-1.5 overflow-hidden bg-ink px-3 text-ink-foreground sm:gap-3 sm:px-4">
        <div
          className="pointer-events-none absolute -left-24 -top-32 h-64 w-64 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #f0a93c 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 h-px gold-gradient opacity-70" aria-hidden="true" />
        <button
          type="button"
          className="relative md:hidden"
          onClick={() => setMobileNavOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/vendor/dashboard" className="relative font-display text-lg font-bold">
          NE<span className="text-primary">X</span>ORA
          <span className="ml-1.5 hidden text-sm font-medium opacity-70 sm:inline">Vendor</span>
        </Link>
        <div className="flex-1" />
        <Link
          href={`/vendors/${shopSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium hover:bg-white/10 sm:flex"
        >
          <Store className="h-3.5 w-3.5" />
          View storefront
        </Link>
        <Link
          href={`/vendors/${shopSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View storefront"
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 sm:hidden"
        >
          <Store className="h-4 w-4" />
        </Link>
        <Link
          href="/vendor/notifications"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10",
            pathname === "/vendor/notifications" && "bg-white/10 text-primary",
          )}
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
        </Link>
        <ThemeToggle className="text-ink-foreground hover:bg-white/10" />
        <SignOutButton />
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 flex-col border-r bg-background md:flex">
          <SidebarNav pathname={pathname} />
          <UserFooter userName={userName} userEmail={userEmail} />
        </aside>

        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              key="vendor-nav-backdrop"
              className="fixed inset-0 top-14 z-20 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.18 }}
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileNavOpen && (
            <motion.aside
              key="vendor-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Vendor navigation"
              className="fixed inset-y-0 top-14 left-0 z-30 flex w-72 max-w-[85vw] flex-col border-r bg-background shadow-2xl md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={reducedMotion ? { duration: 0 } : { type: "tween", ease: "easeOut", duration: 0.22 }}
            >
              <SidebarNav pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
              <UserFooter userName={userName} userEmail={userEmail} />
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1">
          <div className="border-b bg-background px-4 py-2 md:hidden">
            <p className="truncate text-sm font-medium">{shopName}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {isActive && <span className="gold-gradient absolute inset-y-1.5 left-0 w-[3px] rounded-full" aria-hidden="true" />}
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter({ userName, userEmail }: { userName: string; userEmail: string }) {
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      href="/vendor/profile"
      className="mt-auto flex items-center gap-2.5 border-t p-4 transition-colors hover:bg-accent"
    >
      <span className="gold-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground">
        {initials || "V"}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{userName}</p>
        <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
      </div>
    </Link>
  );
}
