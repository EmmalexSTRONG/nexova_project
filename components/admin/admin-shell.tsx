"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, ExternalLink, Menu, X } from "lucide-react";
import { ADMIN_NAV_GROUPS } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AdminCommandPalette } from "@/components/admin/admin-command-palette";

export function AdminShell({
  userName,
  userEmail,
  children,
}: {
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
        <Link href="/admin/dashboard" className="relative font-display text-lg font-bold">
          NE<span className="text-primary">X</span>ORA
          <span className="ml-1.5 hidden text-sm font-medium opacity-70 sm:inline">Admin</span>
        </Link>
        <div className="relative">
          <AdminCommandPalette />
        </div>
        <div className="flex-1" />
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium hover:bg-white/10 sm:flex"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Visit storefront
        </Link>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit storefront"
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 sm:hidden"
        >
          <ExternalLink className="h-4.5 w-4.5" />
        </Link>
        <Link
          href="/admin/notifications"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10",
            pathname === "/admin/notifications" && "bg-white/10 text-primary",
          )}
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
        </Link>
        <ThemeToggle className="text-ink-foreground hover:bg-white/10" />
        <SignOutButton />
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col border-r bg-background md:flex">
          <SidebarNav pathname={pathname} />
          <UserFooter userName={userName} userEmail={userEmail} />
        </aside>

        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              key="admin-nav-backdrop"
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
              key="admin-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation"
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

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function UserFooter({ userName, userEmail }: { userName: string; userEmail: string }) {
  const initials =
    userName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="mt-auto flex items-center gap-2.5 border-t p-4">
      <span className="gold-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground">
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{userName || "—"}</p>
        <p className="truncate text-xs text-muted-foreground">{userEmail || "—"}</p>
      </div>
    </div>
  );
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-4 overflow-y-auto p-3">
      {ADMIN_NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-md py-2 pl-4 pr-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {isActive && (
                    <span className="gold-gradient absolute inset-y-1.5 left-0 w-[3px] rounded-full" aria-hidden="true" />
                  )}
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
