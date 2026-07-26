"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, LogOut, Search } from "lucide-react";
import { ADMIN_NAV_GROUPS } from "@/lib/admin/nav";
import { signOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

interface PaletteAction {
  key: string;
  label: string;
  hint: string;
  icon: typeof ExternalLink;
  run: () => void;
}

export function AdminCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isPaletteShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isPaletteShortcut) {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (open) {
      // Wait a tick for the entrance animation to mount the input.
      const id = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  const navItems = useMemo(
    () =>
      ADMIN_NAV_GROUPS.flatMap((group) =>
        group.items.map((item) => ({ ...item, group: group.label, type: "nav" as const })),
      ),
    [],
  );

  const actions: PaletteAction[] = useMemo(
    () => [
      {
        key: "visit-storefront",
        label: "Visit storefront",
        hint: "Opens in a new tab",
        icon: ExternalLink,
        run: () => window.open("/", "_blank", "noopener,noreferrer"),
      },
      {
        key: "sign-out",
        label: "Sign out",
        hint: "End your admin session",
        icon: LogOut,
        run: () => signOutAction(),
      },
    ],
    [],
  );

  const filteredNav = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return navItems;
    return navItems.filter((item) => item.label.toLowerCase().includes(needle));
  }, [navItems, query]);

  const filteredActions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return actions;
    return actions.filter((action) => action.label.toLowerCase().includes(needle));
  }, [actions, query]);

  const flatResults = useMemo(
    () => [...filteredNav.map((item) => ({ type: "nav" as const, item })), ...filteredActions.map((action) => ({ type: "action" as const, action }))],
    [filteredNav, filteredActions],
  );

  useEffect(() => setActiveIndex(0), [query]);

  function activate(index: number) {
    const result = flatResults[index];
    if (!result) return;
    if (result.type === "nav") {
      router.push(result.item.href);
    } else {
      result.action.run();
    }
    close();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      activate(activeIndex);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-white/10 sm:flex"
      >
        <Search className="h-3.5 w-3.5" />
        Search
        <kbd className="ml-2 rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
          {typeof navigator !== "undefined" && navigator.platform?.includes("Mac") ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="flex h-8 w-8 items-center justify-center rounded-md text-ink-foreground hover:bg-white/10 sm:hidden"
      >
        <Search className="h-4.5 w-4.5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[100] bg-black/50"
              onClick={close}
            />
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.97, y: -8, x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, scale: 0.97, y: -8, x: "-50%" }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-[15%] z-[101] w-[min(90vw,32rem)] overflow-hidden rounded-lg border bg-card shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Admin quick search"
            >
              <div className="flex items-center gap-2.5 border-b px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Jump to a page or run a command..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  Esc
                </kbd>
              </div>

              <div className="max-h-80 overflow-y-auto p-1.5">
                {flatResults.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matches.</p>
                ) : (
                  flatResults.map((result, index) => {
                    const isActive = index === activeIndex;
                    if (result.type === "nav") {
                      const Icon = result.item.icon;
                      return (
                        <button
                          key={result.item.href}
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => activate(index)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm",
                            isActive ? "bg-accent text-primary" : "text-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{result.item.label}</span>
                          <span className="text-xs text-muted-foreground">{result.item.group}</span>
                        </button>
                      );
                    }
                    const Icon = result.action.icon;
                    return (
                      <button
                        key={result.action.key}
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => activate(index)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm",
                          isActive ? "bg-accent text-primary" : "text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{result.action.label}</span>
                        <span className="text-xs text-muted-foreground">{result.action.hint}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
